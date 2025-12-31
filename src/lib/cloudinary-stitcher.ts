import { v2 as cloudinary } from 'cloudinary'

export function generateStitchedVideoUrl(mediaItems: { url: string, type: string }[], musicUrl?: string | null): string {
    if (!mediaItems || mediaItems.length === 0) return ""

    // 1. Extract Public IDs from Cloudinary URLs
    // Example URL: https://res.cloudinary.com/demo/video/upload/v12345/business/abc.mp4
    const getPublicId = (url: string) => {
        const parts = url.split('/')
        const fileName = parts.pop() || ""
        const folder = parts.pop() || ""
        return `${folder}/${fileName.split('.')[0]}`
    }

    const baseItem = mediaItems[0]
    const basePublicId = getPublicId(baseItem.url)
    const isBaseVideo = baseItem.type.toLowerCase().includes('video')

    // 2. Build the transformation segments
    // We resize everything to 720x1280 (9:16) for consistency
    const baseTransform = `c_fill,h_1280,w_720`

    let segments: string[] = []

    // Add subsequent items as spliced layers
    mediaItems.slice(1).forEach((item) => {
        const publicId = getPublicId(item.url)
        const isVideo = item.type.toLowerCase().includes('video')

        // fl_splice concatenates instead of overlaying
        if (isVideo) {
            segments.push(`fl_splice,l_video:${publicId.replace(/\//g, ':')},c_fill,h_1280,w_720/fl_layer_apply`)
        } else {
            // images need a duration (e.g., 3 seconds)
            segments.push(`du_3,fl_splice,l:${publicId.replace(/\//g, ':')},c_fill,h_1280,w_720/fl_layer_apply`)
        }
    })

    // 3. Add background music if available
    // Note: Cloudinary audio overlay requires special syntax or using 'so_0'
    if (musicUrl) {
        // This is a simplified approach, real-world might need 'fl_attachment' or pre-uploaded audio
        // For now, we focus on the visual stitch as per user request
    }

    // 4. Construct the Final URL
    // Format: .../video/upload/<transforms>/<base_id>.mp4
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim()
    const baseUrl = `https://res.cloudinary.com/${cloudName}/video/upload`

    return `${baseUrl}/${baseTransform}/${segments.join('/')}/${basePublicId}.mp4`
}
