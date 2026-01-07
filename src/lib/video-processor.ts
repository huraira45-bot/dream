import { prisma } from "@/lib/prisma"
import { generateReelMetadata, describeMedia, validatePostVibe } from "@/lib/gemini"
import { findAndConvertAudio } from './audio-finder'
import { getMusicForMood, MUSIC_LIBRARY } from "@/lib/music"
import { generateStitchedVideoUrl } from "@/lib/cloudinary-stitcher"
import cloudinary from "@/lib/cloudinary"
import { postToShotstack } from "./shotstack"
import { renderStaticPost } from "./static-processor"
import { getStyleForVariation } from "./director"
import { processMultiLLMCreativeFlow, recorrectCreativeFlow, generateBrandedPostMetadata } from "./llm-router"
import { logger } from "./logger"
import { extractBrandingFromLogo } from "./branding"
import { getUpcomingEvents } from "./calendar"
import { generateFreeIllustration } from "./illustration-service"
// Canva ignored in favor of Native Brand Engine

/**
 * Core Orchestration Engine (Internal)
 * Handles visual analysis, memory, and metadata generation.
 */
async function processMediaOrchestration(businessId: string, forceType: "REEL" | "POST", campaignGoal?: string) {
    const business = await prisma.business.findUnique({
        where: { id: businessId },
        include: {
            mediaItems: {
                where: { processed: false },
                orderBy: { createdAt: 'asc' }
            }
        }
    }) as any

    if (!business || (business.mediaItems.length === 0 && forceType === "REEL")) {
        logger.warn(`No media items found for business: ${businessId} and type is REEL. Blocking.`)
        return null
    }

    const mediaItems = business.mediaItems || []
    const allMediaIds = mediaItems.map((m: { id: string }) => m.id)
    const isReel = forceType === "REEL"

    // 1. Fetch History for Memory
    const pastReels = await prisma.generatedReel.findMany({
        where: { businessId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { trendingAudioTip: true, title: true }
    })
    const usedSongs = pastReels.map(r => r.trendingAudioTip).filter(Boolean) as string[]
    const usedHooks = pastReels.map(r => r.title).filter(Boolean) as string[]

    // 2. Branding Palette
    let branding = null
    if (business.logoUrl && (!business.primaryColor || !business.secondaryColor)) {
        branding = await extractBrandingFromLogo(business.logoUrl)
        await prisma.business.update({
            where: { id: business.id },
            data: { primaryColor: branding.primary, secondaryColor: branding.secondary, accentColor: branding.accent } as any
        })
    } else {
        branding = { primary: business.primaryColor || "#000000", secondary: business.secondaryColor || "#FFFFFF", accent: business.accentColor || "#FF0000", mood: "Modern" }
    }

    const upcomingEvents = await getUpcomingEvents(7)
    const eventTitles = upcomingEvents.map(e => e.title)

    // 3. AI Creative Flow (Specialized Branching)
    let aiOptions: any[] = [];
    let activeTraceId: string | undefined = undefined;

    if (forceType === "POST") {
        // High-Impact Specialized Generation for Static Posts
        const result = await generateBrandedPostMetadata(
            business.name,
            branding,
            business.styleContext,
            campaignGoal,
            eventTitles
        );
        aiOptions = [result.data];
        activeTraceId = result.traceId;
    } else {
        // Multi-LLM diversity engine for Reels
        const result = await processMultiLLMCreativeFlow(
            business.name,
            mediaItems.map((m: any) => m.url),
            isReel,
            business.region || "Pakistan",
            usedSongs,
            usedHooks,
            undefined,
            branding,
            eventTitles,
            campaignGoal,
            business.styleContext
        );
        aiOptions = result.options;
        activeTraceId = result.traceId;
    }

    // 4. Mark items as processed
    await prisma.mediaItem.updateMany({
        where: { id: { in: allMediaIds } },
        data: { processed: true }
    })

    // 5. Generate Variations
    const variationPromises = aiOptions.map(async (metadata, i) => {
        const style = getStyleForVariation(i)
        const skipIndices = (metadata as any).skipMediaIndices || []
        const filteredMedia = mediaItems.filter((_: any, idx: number) => !skipIndices.includes(idx))
        const finalMediaForRender = (filteredMedia.length > 0 ? filteredMedia : mediaItems).slice(0, 10)

        let musicTrack = { url: "", name: "No Music" }
        if (forceType === "REEL") {
            musicTrack = getMusicForMood(metadata.musicMood)
            if (metadata.trendingAudioTip) {
                const realAudioUrl = await findAndConvertAudio(metadata.trendingAudioTip)
                if (realAudioUrl) musicTrack = { ...musicTrack, url: realAudioUrl, name: metadata.trendingAudioTip }
            }
        }

        const reel = await prisma.generatedReel.create({
            data: {
                businessId: business.id,
                title: metadata.hook,
                caption: metadata.caption,
                url: `pending:init-${Date.now()}-${i}`,
                type: forceType,
                musicUrl: forceType === "REEL" ? musicTrack.url : null,
                trendingAudioTip: forceType === "REEL" ? metadata.trendingAudioTip : null,
                mediaItemIds: finalMediaForRender.map((m: any) => m.id),
                traceId: activeTraceId
            } as any
        })

        let renderId = "pending"
        // brandingData is no longer needed separately, handled by Native Engine logic

        try {
            if (forceType === "REEL") {
                const response = await postToShotstack(finalMediaForRender, musicTrack.url, style, metadata)
                renderId = response.id
            } else {
                // PIVOT: Native Brand Engine (HTML-to-Image)
                let mediaUrl = finalMediaForRender[0]?.url
                const styleDNA = business.styleContext ? JSON.parse(business.styleContext) : null;

                // FORCE: Always generate a mimetic illustration for Static Posts to ensure high-impact backgrounds
                logger.info(`✨ Generating mandatory mimetic illustration for: ${business.name}`)
                const subject = (metadata as any).illustrationSubject || metadata.hook;
                mediaUrl = await generateFreeIllustration(
                    subject,
                    branding?.mood,
                    styleDNA?.visual?.characterStyle
                )

                const nativeBranding = {
                    primaryColor: branding?.primary || "#000000",
                    accentColor: branding?.accent || "#FF4D4D"
                }

                let attempts = 0;
                let finalRenderResponse = null;
                const MAX_ATTEMPTS = 3; // Total tries

                while (attempts < MAX_ATTEMPTS) {
                    attempts++;
                    logger.info(`🚀 [Attempt ${attempts}] Triggering Branded Render...`)

                    const sanitize = (val: any) => {
                        const str = String(val || "");
                        return str.replace(/[^\x00-\x7F]/g, "").trim();
                    };

                    const response = await renderStaticPost(mediaUrl, nativeBranding, {
                        hook: sanitize(metadata.hook),
                        businessName: sanitize(business.name),
                        cta: sanitize(metadata.title || "Learn More"),
                        subheadline: sanitize(metadata.caption || ""),
                        logoUrl: business.logoUrl,
                        layoutStyle: (metadata as any).layoutStyle,
                        geometryType: (metadata as any).geometryType,
                        illustrationSubject: (metadata as any).illustrationSubject,
                        templateHint: (metadata as any).templateHint // Pass the external hint
                    })

                    // --- THE HARSH CRITIC: FINAL VIBE CHECK ---
                    if (business.logoUrl) {
                        const check = await validatePostVibe(
                            business.logoUrl,
                            response.url,
                            business.name,
                            business.referencePosts, // Vibe Check 2.0: Use User Likes
                            activeTraceId
                        );
                        if (check.matches) {
                            finalRenderResponse = response;
                            break;
                        } else {
                            logger.warn(`❌ Vibe Mismatch on Attempt ${attempts}: ${check.reasoning}`);
                            // --- SMART RE-CORRECTION ---
                            if (attempts < MAX_ATTEMPTS) {
                                metadata = await recorrectCreativeFlow(
                                    metadata,
                                    check.reasoning,
                                    (check as any).suggestions || {},
                                    business.name,
                                    activeTraceId
                                );
                                logger.info(`🔄 Retrying with AI-Corrected Plan...`);
                            } else {
                                finalRenderResponse = response; // Fallback to last one
                            }
                        }
                    } else {
                        finalRenderResponse = response;
                        break;
                    }
                }

                renderId = finalRenderResponse?.url || "failed"
            }

            // Sync Update: POST is immediate, REEL is pending
            const finalUrl = (forceType === "POST") ? renderId : `pending:${renderId}`;

            await prisma.generatedReel.update({
                where: { id: reel.id },
                data: { url: finalUrl }
            })
            return reel
        } catch (err: any) {
            logger.error(`Generation Error: ${err.message}`)
            await prisma.generatedReel.update({
                where: { id: reel.id },
                data: { url: `failed:${err.message.substring(0, 100)}` }
            })
            return reel
        }
    })

    return await Promise.all(variationPromises)
}

/**
 * Public API: Generate Video Reels
 */
export async function processVideoReel(businessId: string, campaignGoal?: string) {
    logger.info(`🎬 Triggering Video Reel Generation for: ${businessId}`)
    return await processMediaOrchestration(businessId, "REEL", campaignGoal)
}

/**
 * Public API: Generate Static Posts
 */
export async function processStaticPost(businessId: string, campaignGoal?: string) {
    logger.info(`🖼️ Triggering Static Post Generation for: ${businessId}`)
    return await processMediaOrchestration(businessId, "POST", campaignGoal)
}

/**
 * Legacy Support (Auto-detect based on score)
 */
export async function processReelForBusinessV2(businessId: string, campaignGoal?: string) {
    // For legacy reasons, we check the media and decide, but redirect to new functions
    const business = await prisma.business.findUnique({
        where: { id: businessId },
        include: { mediaItems: { where: { processed: false } } }
    }) as any

    if (!business || business.mediaItems.length === 0) return null

    let score = 0
    business.mediaItems.forEach((m: any) => {
        score += m.type.includes('video') ? 2 : 1
    })

    const type = score > 10 ? "REEL" : "POST"
    return await processMediaOrchestration(businessId, type, campaignGoal)
}
