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

    const baseItem = mediaItems[0]
    const basePublicId = getPublicId(baseItem.url)

    const isBaseVideo = baseItem.type.toLowerCase().includes('video')

    // 2. Build the transformation segments
    // Start with a clean base transform.
    // If base is image, MUST have duration. If video, MUTE it to match images (and we use bg music).
    const baseTransform = `c_fill,h_1280,w_720${isBaseVideo ? ',e_volume:mute' : ',du_4'}`

    let segments: string[] = []

    mediaItems.slice(1).forEach((item) => {
        const publicId = getPublicId(item.url)
        const isVideo = item.type.toLowerCase().includes('video')
        const layerId = publicId.replace(/\//g, ':')

        // Simplified splicing: joining only
        if (isVideo) {
            // Splicing a video segment - MUTE it to prevent audio stream mismatch with images
            segments.push(`l_video:${layerId}/c_fill,h_1280,w_720,e_volume:mute/fl_layer_apply,fl_splice`)
        } else {
            // Splicing an image segment (fixed 4s duration)
            segments.push(`l:${layerId}/c_fill,h_1280,w_720,du_4/fl_layer_apply,fl_splice`)
        }
    })

    // 3. Construct the Final URL
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim()
    const baseUrl = `https://res.cloudinary.com/${cloudName}/video/upload`

    // We join segments with a slash. Note: Cloudinary processes transformations in the URL from left to right.
    return `${baseUrl}/${baseTransform}/${segments.join('/')}/${basePublicId}.mp4`
}
