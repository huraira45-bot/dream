import { NextResponse } from "next/server"
import cloudinary, { configCloudinary } from "@/lib/cloudinary"

configCloudinary();

export async function GET() {
    try {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME
        if (!cloudName) {
            return NextResponse.json({ error: "Cloudinary not configured" }, { status: 500 })
        }

        const publicId = "dream_canvas"

        // 1. Check if it already exists
        try {
            await cloudinary.api.resource(publicId, { resource_type: "video" })
            return NextResponse.json({ status: "exists", message: "Canvas already exists", publicId })
        } catch (e) {
            // Not found, proceed to upload
            console.log("Canvas not found, uploading...")
        }

        // 2. Upload a reliable black video base (small, silent)
        // Using a reliable 1-sec black video from a public repo
        const BLACK_VIDEO_URL = "https://raw.githubusercontent.com/mathiasbynens/small/master/black.mp4"

        const result = await cloudinary.uploader.upload(BLACK_VIDEO_URL, {
            public_id: publicId,
            resource_type: "video",
            overwrite: true
        })

        return NextResponse.json({
            status: "created",
            message: "Successfully created dream_canvas",
            url: result.secure_url
        })

    } catch (error) {
        console.error("Setup failed:", error)
        return NextResponse.json({ error: "Setup failed", details: String(error) }, { status: 500 })
    }
}
