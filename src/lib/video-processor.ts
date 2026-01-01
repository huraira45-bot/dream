import { prisma } from "@/lib/prisma"
import { generateReelMetadata, describeMedia } from "@/lib/gemini"
import { findAndConvertAudio } from './audio-finder'
import { getMusicForMood, MUSIC_LIBRARY } from "@/lib/music"
import { generateStitchedVideoUrl } from "@/lib/cloudinary-stitcher"
import cloudinary from "@/lib/cloudinary"
import { postToShotstack } from "./shotstack"
import { getStyleForVariation } from "./director"
import { processMultiLLMCreativeFlow } from "./llm-router"

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

    if (!business || business.mediaItems.length === 0) {
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

    console.log("\n==================================================")
    console.log(`🎬 STARTING AI ORCHESTRATION: ${business.name}`)
    console.log(`📂 Input: ${mediaItems.length} media files. Detected Mode: ${isReel ? "REEL" : "POST"}`)

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

    console.log(`🧠 MEMORY: Found ${usedSongs.length} past songs and ${usedHooks.length} past hooks to avoid.`)

    // 4. Multi-LLM Creative Flow: Gemini (Vision) -> GPT-4o (Aesthetic + Gen Z SMM)
    const aiOptions = await processMultiLLMCreativeFlow(
        business.name,
        allUrls,
        isReel,
        (business as any).region || "Pakistan",
        usedSongs,
        usedHooks
    )

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

    // 5. Generate 3 AI Variations
    const variations = []
    for (let i = 0; i < 3; i++) {
        const style = getStyleForVariation(i)
        const metadata = aiOptions[i] || aiOptions[0]

        // FILTER MEDIA: Remove items flagged for skipping by the Critic
        const skipIndices = (metadata as any).skipMediaIndices || []
        const filteredMediaItems = mediaItems.filter((_: any, idx: number) => !skipIndices.includes(idx))
        const finalMediaForRender = filteredMediaItems.length > 0 ? filteredMediaItems : mediaItems

        // Intelligent Music Selection
        let musicTrack = getMusicForMood(metadata.musicMood)

        if (metadata.trendingAudioTip) {
            const realAudioUrl = await findAndConvertAudio(metadata.trendingAudioTip)
            if (realAudioUrl) {
                musicTrack = { ...musicTrack, url: realAudioUrl, name: metadata.trendingAudioTip }
            }
        }

        const reel = await (prisma.generatedReel as any).create({
            data: {
                businessId: business.id,
                title: metadata.title,
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

            variations.push(reel)
        } catch (err: any) {
            console.error("Shotstack Error:", err)
            const msg = err?.message || "Unknown Error"
            await prisma.generatedReel.update({
                where: { id: reel.id },
                data: { url: `failed:${msg.substring(0, 100)}` }
            })
            variations.push(reel)
        }
    }

    return variations
}
