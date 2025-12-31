import { prisma } from "@/lib/prisma"
import { generateReelMetadata } from "@/lib/gemini"

export async function processReelForBusiness(businessId: string) {
    // 1. Fetch unprocessed media including business details
    const business = await prisma.business.findUnique({
        where: { id: businessId },
        include: {
            mediaItems: {
                where: { processed: false }
            }
        }
    })

    if (!business || business.mediaItems.length === 0) {
        return null
    }

    const mediaItems = business.mediaItems

    // 2. Calculate Reel Score
    // Video = 2 pts, Image = 1 pt
    let score = 0
    let videoCount = 0

    for (const item of mediaItems) {
        if (item.type.startsWith('video')) {
            score += 2
            videoCount++
        } else {
            score += 1
        }
    }

    // Decision Logic: > 10 points OR > 50% videos = REEL, else POST
    const isReel = score > 10 || (videoCount > mediaItems.length / 2 && mediaItems.length > 3)

    console.log(`Processing for ${business.name}: ${mediaItems.length} items. Score: ${score}. Type: ${isReel ? "REEL" : "POST"}`)

    const mediaTypes = mediaItems.map((m: { type: string }) => m.type)

    // 3. Generate 3 Metadata Options with Gemini
    const aiOptions = await generateReelMetadata(business.name, mediaItems.length, isReel, mediaTypes)

    // 4. Mark items as processed
    await prisma.mediaItem.updateMany({
        where: {
            id: { in: mediaItems.map((m: { id: string }) => m.id) },
        },
        data: {
            processed: true,
        },
    })

    // 5. Create 3 GeneratedReel records (one for each creative direction)
    const reels = await Promise.all(aiOptions.map(async (option, index) => {
        // For now, we use the first item as the "anchor" but in a real app,
        // different themes might pick different primary media items.
        // We ensure we don't crash if there's only 1 item.
        const targetMediaIndex = Math.min(index, mediaItems.length - 1)
        const functionalUrl = mediaItems[targetMediaIndex].url

        return prisma.generatedReel.create({
            data: {
                businessId,
                url: functionalUrl,
                type: isReel ? "REEL" : "POST",
                title: option.title,
                caption: option.caption,
            },
        })
    }))

    // Return the list of created reels merged with their specific AI metadata
    return reels.map((reel, i) => ({ ...reel, ...aiOptions[i] }))
}
