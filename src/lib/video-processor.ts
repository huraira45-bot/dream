import { prisma } from "@/lib/prisma"
import { generateReelMetadata, describeMedia } from "@/lib/gemini"
import { findAndConvertAudio } from './audio-finder'
import { getMusicForMood, MUSIC_LIBRARY } from "@/lib/music"
import { generateStitchedVideoUrl } from "@/lib/cloudinary-stitcher"
import cloudinary from "@/lib/cloudinary"
import { postToShotstack } from "./shotstack"
import { getStyleForVariation } from "./director"

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

    console.log(`Cinematic Processing for ${business.name}: ${mediaItems.length} items. Score: ${score}. Type: ${isReel ? "REEL" : "POST"}`)

    const mediaTypes = mediaItems.map((m: { type: string }) => m.type)
    const sampleUrls = mediaItems.slice(0, 5).map((m: { url: string }) => m.url)

    // 3. Deep Multimodal Analysis (The AI Creative Team "Sees" the collection)
    const visualContext = await describeMedia(sampleUrls)
    console.log(`Visual Report for ${business.name}: ${visualContext}`)

    // 4. Generate 3 Metadata Options with Gemini (Using Visual Context)
    const aiOptions = await generateReelMetadata(
        business.name,
        mediaItems.length,
        isReel,
        mediaTypes,
        (business as any).region || "Pakistan",
        visualContext
    )

    // Ensure Base Canvas exists (Self-Healing)
    const baseCanvasId = "dream_canvas"
    try {
        // Attempt to verify/upload canvas, but DO NOT block generation if it fails.
        // We prioritize creating the Reel record for the Client Player.
        try {
            await cloudinary.api.resource(baseCanvasId, { resource_type: "video" })
        } catch (resourceError) {
            console.log("Canvas missing, self-healing upload...")
            const BLACK_VIDEO_URL = "https://raw.githubusercontent.com/mathiasbynens/small/master/black.mp4"
            await cloudinary.uploader.upload(BLACK_VIDEO_URL, {
                public_id: baseCanvasId,
                resource_type: "video",
                overwrite: true
            })
        }
    } catch (e) {
        console.error("Non-fatal error in canvas setup:", e)
    }

    // 4. Mark items as processed
    await prisma.mediaItem.updateMany({
        where: {
            id: { in: allMediaIds },
        },
        data: {
            processed: true,
        },
    })

    // 3. Generate 3 AI Variations with "Director" logic
    const variations = []
    for (let i = 0; i < 3; i++) {
        const style = getStyleForVariation(i)
        const metadata = aiOptions[i] || aiOptions[0]

        // Intelligent Music Selection: Use Gemini's Content Analysis > Style Default
        let musicTrack = getMusicForMood(metadata.musicMood)

        // REAL TRENDING UPGRADE: Try to find and use the exact song suggested by AI
        if (metadata.trendingAudioTip) {
            const realAudioUrl = await findAndConvertAudio(metadata.trendingAudioTip)
            if (realAudioUrl) {
                // Swap the royalty-free track with the real trending one
                musicTrack = { ...musicTrack, url: realAudioUrl, name: metadata.trendingAudioTip }
            }
        }

        const reel = await (prisma.generatedReel as any).create({
            data: {
                businessId: business.id,
                title: metadata.title, // Use AI Title
                caption: metadata.caption, // Use AI Caption
                url: `pending:init-${Date.now()}-${i}`,
                musicUrl: musicTrack.url,
                trendingAudioTip: metadata.trendingAudioTip, // Add trending audio tip
                mediaItemIds: allMediaIds
            }
        })

        // Trigger Shotstack Render
        try {
            // Post to Shotstack with specific style and metadata for text
            const renderResponse = await postToShotstack(mediaItems, musicTrack.url, style, metadata)
            const renderId = renderResponse.id

            // Update URL to pending:RENDER_ID for polling
            await prisma.generatedReel.update({
                where: { id: reel.id },
                data: { url: `pending:${renderId}` }
            })

            variations.push(reel)
        } catch (err: any) {
            console.error("Shotstack Error:", err)
            // Update to failed state so UI knows not to wait
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
