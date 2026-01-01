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

        let activeRenderId = renderId

        // BRIDGE: If the client sends an 'init' ID, check DB for the real renderId
        if (renderId.startsWith('init')) {
            const currentReel = await prisma.generatedReel.findUnique({
                where: { id: reelId },
                select: { url: true }
            })

            if (currentReel?.url.includes('pending:') && !currentReel.url.includes('init-')) {
                // Background process assigned a real Shotstack ID!
                activeRenderId = currentReel.url.split(':')[1]
            } else if (currentReel?.url && !currentReel.url.startsWith('pending:')) {
                // Background process already finished entirely!
                return NextResponse.json({ status: "done", url: currentReel.url })
            } else {
                // Still in early init phase
                return NextResponse.json({ status: "processing", message: "Preparing production..." })
            }
        }

        const statusResponse = await getRenderStatus(activeRenderId)
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
