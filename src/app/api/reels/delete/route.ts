import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        if (!id) {
            return new NextResponse("Reel ID is required", { status: 400 })
        }

        await prisma.generatedReel.delete({
            where: { id }
        })

        return NextResponse.json({ success: true, message: "Reel deleted successfully" })

    } catch (error) {
        console.error("Delete Reel Error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
