import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getRenderStatus } from "@/lib/shotstack"

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const { reelId, renderId } = await req.json()

        if (!reelId || !renderId) {
            return new NextResponse("Missing fields", { status: 400 })
        }

        const statusResponse = await getRenderStatus(renderId)
        const status = statusResponse.status // "queued", "fetching", "rendering", "done", "failed"

        if (status === "done") {
            const finalUrl = statusResponse.url

            // Update Database
            await prisma.generatedReel.update({
                where: { id: reelId },
                data: { url: finalUrl }
            })

            return NextResponse.json({ status: "done", url: finalUrl })
        } else if (status === "failed") {
            return NextResponse.json({ status: "failed", error: statusResponse.error })
        }

        return NextResponse.json({ status: "processing" })

    } catch (error: any) {
        console.error("Status Check Error:", error)
        return NextResponse.json({ status: "failed", error: error.message || "Internal Error" }, { status: 500 })
    }
}
