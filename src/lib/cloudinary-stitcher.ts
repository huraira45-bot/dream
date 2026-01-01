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
    // CRITICAL FIX: If base is image, we MUST add duration (du_5) to make it a video container.
    // If base is video, we MUST mute it (e_volume:mute) to match silent images.
    const baseTransform = `c_fill,h_1280,w_720${isBaseVideo ? ',e_volume:mute' : ',du_5'}`

    let segments: string[] = []

    // Process items starting from the SECOND one (slice 1)
    mediaItems.slice(1).forEach((item) => {
        const publicId = getPublicId(item.url)
        const isVideo = item.type.toLowerCase().includes('video')
        const layerId = publicId.replace(/\//g, ':')

        if (isVideo) {
            // Video: Mute it, Apply, Splice
            segments.push(`l_video:${layerId}/c_fill,h_1280,w_720,e_volume:mute/fl_layer_apply,fl_splice`)
        } else {
            // Image: Set duration, Apply, Splice
            segments.push(`l:${layerId}/c_fill,h_1280,w_720,du_5/fl_layer_apply,fl_splice`)
        }
    })

    // 3. Construct the Final URL
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim()

    // CRITICAL FIX: Use the correct endpoint for the Base Resource Type
    // If the base is an image, we MUST use /image/upload so Cloudinary finds it.
    // The .mp4 extension and du_5 flag will then handle the conversion.
    const resourceTypeEndpoint = isBaseVideo ? 'video' : 'image'
    const baseUrl = `https://res.cloudinary.com/${cloudName}/${resourceTypeEndpoint}/upload`

    // The Base Resource is the first item's Public ID
    return `${baseUrl}/${baseTransform}/${segments.join('/')}/${basePublicId}.mp4`
}
