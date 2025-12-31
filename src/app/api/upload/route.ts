
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { businessId, url, type } = await req.json()

        if (!url || !businessId) {
            return NextResponse.json(
                { error: "URL and Business ID required" },
                { status: 400 }
            )
        }

        // DB Record
        const mediaItem = await prisma.mediaItem.create({
            data: {
                businessId,
                type: type || (url.includes("/video/") ? "VIDEO" : "IMAGE"),
                url,
            },
        })

        return NextResponse.json(mediaItem)
    } catch (error: any) {
        console.error("DB Save Error:", error)
        return NextResponse.json(
            { error: error.message || "Failed to save record", details: error },
            { status: 500 }
        )
    }
}

