import { v2 as cloudinary } from 'cloudinary'

export function generateStitchedVideoUrl(mediaItems: { url: string, type: string }[], musicUrl?: string | null): string {
    if (!mediaItems || mediaItems.length === 0) return ""

    // 1. Extract Public IDs from Cloudinary URLs safely
    const getPublicId = (url: string) => {
        const uploadIndex = url.indexOf('/upload/')
        if (uploadIndex === -1) return ""

        const pathAfterUpload = url.substring(uploadIndex + 8)
        const parts = pathAfterUpload.split('/')

        // Remove version if present (v123456)
        if (parts[0].startsWith('v') && !isNaN(Number(parts[0].substring(1)))) {
            parts.shift()
        }

        // Rejoin and remove extension
        return parts.join('/').split('.')[0]
    }

    // 2. Build the transformation segments
    // Strategy: Use a "Blank Canvas" (color:black) as the base video.
    // This avoids "Resource Not Found" errors when the first item is an image.
    const baseTransform = `c_fill,h_1280,w_720,du_0.1,e_volume:mute`

    let segments: string[] = []

    // Process ALL items (no slice)
    mediaItems.forEach((item) => {
        const publicId = getPublicId(item.url)
        const isVideo = item.type.toLowerCase().includes('video')
        const layerId = publicId.replace(/\//g, ':')

        if (isVideo) {
            // Correct Syntax: fl_layer_apply,fl_splice (Apply layer, THEN splice it)
            segments.push(`l_video:${layerId}/c_fill,h_1280,w_720,e_volume:mute/fl_layer_apply,fl_splice`)
        } else {
            // Correct Syntax: fl_layer_apply,fl_splice
            segments.push(`l:${layerId}/c_fill,h_1280,w_720,du_4/fl_layer_apply,fl_splice`)
        }
    })

    // 3. Construct the Final URL
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim()
    const baseUrl = `https://res.cloudinary.com/${cloudName}/video/upload`

    // We use 'color:black' as the generated base resource
    return `${baseUrl}/${baseTransform}/${segments.join('/')}/color:black.mp4`
}
