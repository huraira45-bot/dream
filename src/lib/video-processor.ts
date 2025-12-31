import { prisma } from "@/lib/prisma"

export async function processReelForBusiness(businessId: string) {
    // 1. Fetch unprocessed media
    const mediaItems = await prisma.mediaItem.findMany({
        where: {
            businessId,
            processed: false,
        },
    })

    if (mediaItems.length === 0) {
        return null
    }

    // 2. (Mock) AI Processing / Stitching
    // In a real app, we would send these URLs to a python service or use FFmpeg here.
    // For now, we just pretend we made a video.

    console.log(`Processing ${mediaItems.length} items for business ${businessId}...`)

    // Simulate delay
    await new Promise(r => setTimeout(r, 2000))

    const mockVideoUrl = "/uploads/demo-reel.mp4" // Placeholder

    // 3. Mark items as processed
    await prisma.mediaItem.updateMany({
        where: {
            id: { in: mediaItems.map(m => m.id) },
        },
        data: {
            processed: true,
        },
    })

    // 4. Create GeneratedReel record
    const reel = await prisma.generatedReel.create({
        data: {
            businessId,
            url: mockVideoUrl,
        },
    })

    return reel
}
