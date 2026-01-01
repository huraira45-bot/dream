import { prisma } from "@/lib/prisma"

/**
 * schedules a specific reel and discards its siblings (other drafts from same batch).
 * @param reelId - The ID of the reel to save/schedule
 * @param scheduleDate - Optional ISO string for when to post
 */
export async function scheduleReel(reelId: string, scheduleDate?: string) {
    // 1. Get the reel to identify its batch (approx time) and business
    const reel = await prisma.generatedReel.findUnique({
        where: { id: reelId }
    })

    if (!reel) throw new Error("Reel not found")

    // 2. Update status to SCHEDULED
    await prisma.generatedReel.update({
        where: { id: reelId },
        data: {
            status: "SCHEDULED",
            scheduledAt: scheduleDate ? new Date(scheduleDate) : new Date()
        }
    })

    console.log(`✅ [Scheduler] Reel ${reelId} marked as SCHEDULED for ${scheduleDate || "NOW"}`)

    // 3. Find siblings (created within 5 mins of this reel for the same business)
    // We assume drafts from the same "generation batch" happen close together.
    const timeBuffer = 5 * 60 * 1000 // 5 minutes
    const minTime = new Date(reel.createdAt.getTime() - timeBuffer)
    const maxTime = new Date(reel.createdAt.getTime() + timeBuffer)

    const siblings = await prisma.generatedReel.findMany({
        where: {
            businessId: reel.businessId,
            id: { not: reelId }, // Don't delete self
            status: "DRAFT", // Only delete drafts
            createdAt: {
                gte: minTime,
                lte: maxTime
            }
        }
    })

    // 4. Mark siblings as DISCARDED (Soft Delete) or Delete them
    // Sticking to "soft delete" or "discarded" status for safety
    if (siblings.length > 0) {
        await prisma.generatedReel.updateMany({
            where: {
                id: { in: siblings.map(s => s.id) }
            },
            data: { status: "DISCARDED" }
        })
        console.log(`🗑️ [Scheduler] Discarded ${siblings.length} alternative drafts.`)
    }

    return { success: true, message: `Scheduled reel ${reelId} and discarded ${siblings.length} others.` }
}

/**
 * Get all scheduled reels for a calendar view
 */
export async function getCalendarEvents(businessId: string) {
    return await prisma.generatedReel.findMany({
        where: {
            businessId,
            status: "SCHEDULED"
        },
        orderBy: { scheduledAt: 'asc' },
        select: {
            id: true,
            title: true,
            scheduledAt: true,
            url: true
        }
    })
}
