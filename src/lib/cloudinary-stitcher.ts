import { v2 as cloudinary } from 'cloudinary'

export function generateStitchedVideoUrl(mediaItems: { url: string, type: string }[], musicUrl?: string | null, baseCanvasId?: string): string {
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

    // Default to 'dream_canvas' if provided, otherwise fallback to first item (risky)
    // We assume 'dream_canvas' is a valid VIDEO resource existing in the cloud.
    const effectiveBaseId = baseCanvasId || "dream_canvas"

    // 2. Build the transformation segments
    // Strategy: Universal Base Video.
    // Base is ALWAYS a video. We must use /video/upload endpoint.
    // We splice EVERYTHING onto it.
    const baseTransform = `c_fill,h_1280,w_720,e_volume:mute` // Canvas is silent

    let segments: string[] = []

    // Process ALL items
    mediaItems.forEach((item) => {
        const publicId = getPublicId(item.url)
        const isVideo = item.type.toLowerCase().includes('video')
        const layerId = publicId.replace(/\//g, ':')

        if (isVideo) {
            // Mute video layers
            segments.push(`l_video:${layerId}/c_fill,h_1280,w_720,e_volume:mute/fl_layer_apply/fl_splice`)
        } else {
            // Photos need duration
            segments.push(`l:${layerId}/c_fill,h_1280,w_720,du_5/fl_layer_apply/fl_splice`)
        }
    })

    // 3. Construct the Final URL
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim()

    // MUST use video endpoint for splicing onto a video base
    const baseUrl = `https://res.cloudinary.com/${cloudName}/video/upload`

    // The Base Resource is the Universal Canvas
    // Important: Cloudinary applies transforms left-to-right. 
    // Base -> Transform Base -> Splice Layer 1 -> ...
    // Note on Syntax: "fl_splice" usually works best as a flags:splice param of the layer, 
    // but the URL syntax `l_.../fl_layer_apply/fl_splice` means "Take this layer, apply it, AND THEN splice it to the timeline".
    return `${baseUrl}/${baseTransform}/${segments.join('/')}/${effectiveBaseId}.mp4`
}
