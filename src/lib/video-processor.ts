import { prisma } from "@/lib/prisma"
import { generateReelMetadata, describeMedia } from "@/lib/gemini"
import { findAndConvertAudio } from './audio-finder'
import { getMusicForMood, MUSIC_LIBRARY } from "@/lib/music"
import { generateStitchedVideoUrl } from "@/lib/cloudinary-stitcher"
import cloudinary from "@/lib/cloudinary"
import { postToShotstack } from "./shotstack"
import { getStyleForVariation } from "./director"
import { processMultiLLMCreativeFlow } from "./llm-router"
import { logger } from "./logger"

export async function processReelForBusinessV2(businessId: string) {
    // 1. Fetch unprocessed media including business details
    const business = await prisma.business.findUnique({
        where: { id: businessId },
        include: {
            mediaItems: {
                where: { processed: false },
                orderBy: { createdAt: 'asc' } // Ensure chronological sequence
            }
        }
    })

    logger.info(`Orchestration v2.1 started for business: ${businessId}`)
    if (!business || business.mediaItems.length === 0) {
        logger.warn(`No business or media items found for business: ${businessId}`)
        return null
    }

    const mediaItems = business.mediaItems
    const allMediaIds = mediaItems.map((m: { id: string }) => m.id)

    // 2. Calculate Reel Score
    // Video = 2 pts, Image = 1 pt
    let score = 0
    let videoCount = 0

    for (const item of mediaItems) {
        if (item.type.toLowerCase().includes('video')) {
            score += 2
            videoCount++
        } else {
            score += 1
        }
    }

    const isReel = score > 10 || (videoCount > mediaItems.length / 2 && mediaItems.length > 3)

    logger.info(`Detected Mode: ${isReel ? "REEL" : "POST"} for ${business.name} with ${mediaItems.length} items`)

    const mediaTypes = mediaItems.map((m: { type: string }) => m.type)
    const allUrls = mediaItems.map((m: any) => m.url)

    // 3. Fetch Reel History for "Memory" (Unique Assets)
    const pastReels = await prisma.generatedReel.findMany({
        where: { businessId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { trendingAudioTip: true, title: true }
    })

    const usedSongs = pastReels.map(r => r.trendingAudioTip).filter(Boolean) as string[]
    const usedHooks = pastReels.map(r => r.title).filter(Boolean) as string[]

    console.log("--------------------------------------------------")
    console.log("🧠 AGENT: THE MEMORY KEEPER")
    console.log(`Action: Checking history for ${business.name}...`)
    console.log(`Avoid Songs: ${usedSongs.length > 0 ? usedSongs.join(", ") : "None"}`)
    console.log(`Avoid Hooks: ${usedHooks.length > 0 ? usedHooks.join(", ") : "None"}`)
    console.log("--------------------------------------------------")

    logger.info(`Starting Multi-LLM Creative Flow...`)
    const aiOptions = await processMultiLLMCreativeFlow(
        business.name,
        allUrls,
        isReel,
        business.region || "Pakistan",
        usedSongs,
        usedHooks
    )
    logger.info(`Creative flow complete. Variations generated: ${aiOptions.length}`)

    // ... (Canvas self-healing logic remains same) ...

    // 4. Mark items as processed
    await prisma.mediaItem.updateMany({
        where: {
            id: { in: allMediaIds },
        },
        data: {
            processed: true,
        },
    })

    // 5. Generate AI Variations (IN PARALLEL)
    const variationPromises = aiOptions.map(async (metadata, i) => {
        const style = getStyleForVariation(i)

        // FILTER MEDIA (Quality Guard)
        const skipIndices = (metadata as any).skipMediaIndices || []
        const filteredMediaItems = mediaItems.filter((_: any, idx: number) => !skipIndices.includes(idx))

        // Quality Guard: Limit to best 10 items to prevent overcrowding
        const finalMediaForRender = (filteredMediaItems.length > 0 ? filteredMediaItems : mediaItems).slice(0, 10)

        if (mediaItems.length > finalMediaForRender.length) {
            logger.info(`Quality Guard: Culled ${mediaItems.length - finalMediaForRender.length} weaker assets for higher density.`)
        }

        // Intelligent Music Selection
        let musicTrack = getMusicForMood(metadata.musicMood)

        if (metadata.trendingAudioTip) {
            const realAudioUrl = await findAndConvertAudio(metadata.trendingAudioTip)
            if (realAudioUrl) {
                musicTrack = { ...musicTrack, url: realAudioUrl, name: metadata.trendingAudioTip }
            }
        }

        const reel = await prisma.generatedReel.create({
            data: {
                businessId: business.id,
                title: metadata.hook, // Save the actual Hook to avoid repetition in next runs
                caption: metadata.caption,
                url: `pending:init-${Date.now()}-${i}`,
                musicUrl: musicTrack.url,
                trendingAudioTip: metadata.trendingAudioTip,
                mediaItemIds: finalMediaForRender.map((m: any) => m.id)
            }
        })

        // Trigger Shotstack Render
        try {
            const renderResponse = await postToShotstack(finalMediaForRender, musicTrack.url, style, metadata)
            const renderId = renderResponse.id

            await prisma.generatedReel.update({
                where: { id: reel.id },
                data: { url: `pending:${renderId}` }
            })

            console.log(`🎬 Variation ${i + 1}: Render Queued -> ${renderId}`)
            return reel
        } catch (err: any) {
            console.error(`❌ Variation ${i + 1}: Shotstack Error ->`, err.message)
            const msg = err?.message || "Unknown Error"
            await prisma.generatedReel.update({
                where: { id: reel.id },
                data: { url: `failed:${msg.substring(0, 100)}` }
            })
            return reel
        }
    })

    try {
        const variations = await Promise.all(variationPromises)
        logger.info(`Successfully triggered ${variations.length} variations for ${business.name}`)
        return variations
    } catch (err: any) {
        logger.error(`Fatal variation generation error: ${err.message}`)
        throw err
    }
}
