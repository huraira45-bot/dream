import { prisma } from "@/lib/prisma"
import { generateReelMetadata } from "@/lib/gemini"
import { getMusicForMood } from "@/lib/music"
import { generateStitchedVideoUrl } from "@/lib/cloudinary-stitcher"
import cloudinary from "@/lib/cloudinary"
import { postToShotstack } from "@/lib/shotstack"

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

    // 3. Generate 3 Metadata Options with Gemini
    const aiOptions = await generateReelMetadata(business.name, mediaItems.length, isReel, mediaTypes)

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

    // 5. Create 3 GeneratedReel records (one for each creative direction)
    const reels = await Promise.all(aiOptions.map(async (option, index) => {
        const music = getMusicForMood(option.musicMood)

        let finalUrl = mediaItems[0].url // Fallback to first item

        // Try Shotstack Rendering
        try {
            // We only try this if we have a key, logic inside lib handles throw
            const shotstackResponse = await postToShotstack(mediaItems, music.url)
            // Store pending ID. Ideally we'd have a status field.
            // We'll use a specific format: "pending:RENDER_ID"
            if (shotstackResponse && shotstackResponse.id) {
                finalUrl = `pending:${shotstackResponse.id}`
                console.log(`Shotstack Render Queued: ${shotstackResponse.id}`)
            }
        } catch (e) {
            console.error("Shotstack generation failed (fallback to client player):", e)
            // If Shotstack fails (e.g. no key), we essentially just want the Client Player to work.
            // The URL field is less critical for the Client Player since it uses mediaItemIds.
            // We can fallback to the Cloudinary stitch (which is broken) or just the first item.
            // Let's use the first item as the "URL" so it's not empty.
        }

        return prisma.generatedReel.create({
            data: {
                businessId,
                url: finalUrl,
                type: isReel ? "REEL" : "POST",
                title: option.title,
                caption: option.caption,
                musicUrl: music.url,
                mediaItemIds: allMediaIds,
            },
        })
    }))

    // Return current created reels
    return reels.map((reel, i) => ({ ...reel, ...aiOptions[i] }))
}
