import { prisma } from "@/lib/prisma"
import { generateReelMetadata } from "@/lib/gemini"
import { getMusicForMood } from "@/lib/music"

export async function processReelForBusiness(businessId: string) {
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
        // High-end: Every option gets the FULL sequence of media to play with
        // In the future, the UI will transition between these.
        const music = getMusicForMood(option.musicMood)

        return prisma.generatedReel.create({
            data: {
                businessId,
                url: mediaItems[0].url, // Primary cover URL
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
