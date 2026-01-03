import { NextResponse } from "next/server"
import { processReelForBusinessV2, processVideoReel, processStaticPost } from "@/lib/video-processor"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const { businessId, campaignGoal, type } = await req.json()
        if (!businessId) {
            // Process ALL businesses if no ID provided (Cron job style)
            const businesses = await prisma.business.findMany()
            const results = []
            for (const b of businesses) {
                const reel = await processReelForBusinessV2(b.id) // Fallback for cron
                if (reel) results.push(reel)
            }
            return NextResponse.json({ processed: results.length, reels: results })
        }

        let result;
        if (type === "REEL") {
            result = await processVideoReel(businessId, campaignGoal)
        } else if (type === "POST") {
            result = await processStaticPost(businessId, campaignGoal)
        } else {
            // Fallback for older interface calls
            result = await processReelForBusinessV2(businessId, campaignGoal)
        }

        return NextResponse.json(result || { message: "No media to process" })

    } catch (error) {
        console.error("API Error:", error)
        return NextResponse.json(
            { error: "Internal Server Error", details: String(error) },
            { status: 500 }
        )
    }
}
