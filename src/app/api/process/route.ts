import { NextResponse } from "next/server"
import { processReelForBusiness } from "@/lib/video-processor"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const { businessId } = await req.json()
        if (!businessId) {
            // Process ALL businesses if no ID provided (Cron job style)
            const businesses = await prisma.business.findMany()
            const results = []
            for (const b of businesses) {
                const reel = await processReelForBusiness(b.id)
                if (reel) results.push(reel)
            }
            return NextResponse.json({ processed: results.length, reels: results })
        }

        const reel = await processReelForBusiness(businessId)
        return NextResponse.json(reel || { message: "No media to process" })

    } catch (error) {
        console.error(error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
