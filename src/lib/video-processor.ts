import { prisma } from "@/lib/prisma"
import { generateReelMetadata, describeMedia } from "@/lib/gemini"
import { findAndConvertAudio } from './audio-finder'
import { getMusicForMood, MUSIC_LIBRARY } from "@/lib/music"
import { generateStitchedVideoUrl } from "@/lib/cloudinary-stitcher"
import cloudinary from "@/lib/cloudinary"
import { postToShotstack } from "./shotstack"
import { renderStaticPost } from "./static-processor"
import { getStyleForVariation } from "./director"
import { processMultiLLMCreativeFlow } from "./llm-router"
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

    // 3. AI Creative Flow
    const aiOptions = await processMultiLLMCreativeFlow(
        business.name,
        mediaItems.map((m: any) => m.url),
        isReel,
        business.region || "Pakistan",
        usedSongs,
        usedHooks,
        undefined,
        branding,
        eventTitles,
        campaignGoal
    )

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

        let musicTrack = getMusicForMood(metadata.musicMood)
        if (metadata.trendingAudioTip) {
            const realAudioUrl = await findAndConvertAudio(metadata.trendingAudioTip)
            if (realAudioUrl) musicTrack = { ...musicTrack, url: realAudioUrl, name: metadata.trendingAudioTip }
        }

        const reel = await prisma.generatedReel.create({
            data: {
                businessId: business.id,
                title: metadata.hook,
                caption: metadata.caption,
                url: `pending:init-${Date.now()}-${i}`,
                type: forceType,
                musicUrl: musicTrack.url,
                trendingAudioTip: metadata.trendingAudioTip,
                mediaItemIds: finalMediaForRender.map((m: any) => m.id)
            }
        })

        let renderId = "pending"
        // brandingData is no longer needed separately, handled by Native Engine logic

        try {
            if (forceType === "REEL") {
                const response = await postToShotstack(finalMediaForRender, musicTrack.url, style, metadata)
                renderId = response.id
            } else {
                // PIVOT: Native Brand Engine (HTML-to-Image)
                // This replaces the complex Canva/Shotstack flow with a robust, free, and branded local generator.
                let mediaUrl = finalMediaForRender[0]?.url

                // FALLBACK: If no media, generate a free 3D illustration
                if (!mediaUrl) {
                    logger.info(`✨ No media found for post, generating free illustration for: ${business.name}`)
                    mediaUrl = await generateFreeIllustration(metadata.hook, branding?.mood)
                }

                const nativeBranding = {
                    primaryColor: branding?.primary || "#000000",
                    accentColor: branding?.accent || "#FF4D4D"
                }

                logger.info(`🚀 Routing to Native Brand Engine...`)
                const response = await renderStaticPost(mediaUrl, nativeBranding, {
                    hook: metadata.hook,
                    businessName: business.name,
                    cta: metadata.title || "Learn More",
                    subheadline: metadata.caption // Passing caption as subheadline for the Premium Ad Layout
                })

                renderId = response.url // Native engine returns a Cloudinary URL directly
            }

            await prisma.generatedReel.update({
                where: { id: reel.id },
                data: { url: `pending:${renderId}` }
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
