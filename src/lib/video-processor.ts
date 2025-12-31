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

    // 3. Generate Metadata with Gemini
    const aiMetadata = await generateReelMetadata(business.name, mediaItems.length, isReel)

    // Use the first item's URL as the output for now (placeholder for stitched media)
    const functionalUrl = mediaItems[0].url

    // 4. Mark items as processed
    await prisma.mediaItem.updateMany({
        where: {
            id: { in: mediaItems.map((m: { id: string }) => m.id) },
        },
        data: {
            processed: true,
        },
    })

    // 5. Create GeneratedReel record
    const reel = await prisma.generatedReel.create({
        data: {
            businessId,
            url: functionalUrl,
            type: isReel ? "REEL" : "POST",
            title: aiMetadata.title,
            caption: aiMetadata.caption,
        },
    })

    return { ...reel, ...aiMetadata }
}
