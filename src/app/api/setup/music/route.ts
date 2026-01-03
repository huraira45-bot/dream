import { NextResponse } from "next/server"
import cloudinary, { configCloudinary } from "@/lib/cloudinary"

configCloudinary();
import path from "path"
import fs from "fs"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const musicDir = path.join(process.cwd(), 'public', 'music')
        const files = fs.readdirSync(musicDir).filter(f => f.endsWith('.mp3'))

        const results: Record<string, string> = {}

        for (const file of files) {
            const filePath = path.join(musicDir, file)
            // Upload
            const res = await cloudinary.uploader.upload(filePath, {
                resource_type: 'video',
                folder: 'dream_music',
                public_id: file.replace('.mp3', ''),
                overwrite: true
            })
            results[file] = res.secure_url
        }

        return NextResponse.json(results)
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: JSON.stringify(error, Object.getOwnPropertyNames(error)) }, { status: 500 })
    }
}
