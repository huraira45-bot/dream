import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import cloudinary from "@/lib/cloudinary"

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const file = formData.get("file") as File
        const businessId = formData.get("businessId") as string

        if (!file || !businessId) {
            return new NextResponse("File and Business ID required", { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())

        // Upload to Cloudinary using a Promise wrapper around the stream
        const uploadResult = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: `dream-app/${businessId}`,
                    resource_type: "auto", // Auto-detect image or video
                },
                (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                }
            ).end(buffer)
        })

        // DB Record
        const mediaItem = await prisma.mediaItem.create({
            data: {
                businessId,
                type: file.type.startsWith("video") ? "VIDEO" : "IMAGE",
                url: uploadResult.secure_url,
            },
        })

        return NextResponse.json(mediaItem)
    } catch (error) {
        console.error("Upload Error:", error)
        return new NextResponse("Upload Failed", { status: 500 })
    }
}
