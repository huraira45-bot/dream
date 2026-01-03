import { NextResponse } from "next/server"
import cloudinary, { configCloudinary } from "@/lib/cloudinary"

configCloudinary();

export async function POST(req: Request) {
    try {
        const { folder } = await req.json()

        const timestamp = Math.round((new Date).getTime() / 1000)

        // Generate signature
        const signature = cloudinary.utils.api_sign_request({
            timestamp: timestamp,
            folder: folder || 'dream-app/uploads',
        }, process.env.CLOUDINARY_API_SECRET?.trim()!)

        return NextResponse.json({
            signature,
            timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
            apiKey: process.env.CLOUDINARY_API_KEY?.trim()
        })
    } catch (error) {
        console.error("Signature Error:", error)
        return new NextResponse("Signature Failed", { status: 500 })
    }
}
