import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const file = formData.get("file") as File
        const businessId = formData.get("businessId") as string

        if (!file || !businessId) {
            return new NextResponse("File and Business ID required", { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const filename = `${randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`

        // Save to public/uploads
        // Note: In production we use S3. Here simple local storage.
        const uploadDir = path.join(process.cwd(), "public", "uploads", businessId)
        await mkdir(uploadDir, { recursive: true })

        const filePath = path.join(uploadDir, filename)
        await writeFile(filePath, buffer)

        // DB Record
        const mediaItem = await prisma.mediaItem.create({
            data: {
                businessId,
                type: file.type.startsWith("video") ? "VIDEO" : "IMAGE",
                url: `/uploads/${businessId}/${filename}`,
            },
        })

        return NextResponse.json(mediaItem)
    } catch (error) {
        console.error(error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
