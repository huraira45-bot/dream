import { NextResponse } from "next/server"
import cloudinary from "@/lib/cloudinary"
import path from "path"
import fs from "fs"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const musicDir = path.join(process.cwd(), 'public', 'music')
        const files = fs.readdirSync(musicDir).filter(f => f.endsWith('.mp3'))

        const results = {}

        for (const file of files) {
            const filePath = path.join(musicDir, file)
            // Upload
            const res = await cloudinary.uploader.upload(filePath, {
                resource_type: 'video', // audio is treated as video/raw in some contexts, video is safest for mp3
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
