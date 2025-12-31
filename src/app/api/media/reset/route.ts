import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const { businessId } = await req.json()

        if (!businessId) {
            return new NextResponse("Business ID is required", { status: 400 })
        }

        // Reset all media items for this business to not processed
        const result = await prisma.mediaItem.updateMany({
            where: {
                businessId: businessId,
                processed: true
            },
            data: {
                processed: false
            }
        })

        return NextResponse.json({
            success: true,
            count: result.count,
            message: `Successfully reset ${result.count} media items.`
        })

    } catch (error) {
        console.error("Reset Media Error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
