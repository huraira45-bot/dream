```typescript
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
    // We resize everything to 720x1280 (9:16)
    const baseTransform = `c_fill, h_1280, w_720, e_improve, e_vignette: 20`
    
    let segments: string[] = []
    
    mediaItems.slice(1).forEach((item) => {
        const publicId = getPublicId(item.url)
        const isVideo = item.type.toLowerCase().includes('video')
        
        // Sequential concatenation using layers + fl_splice
        const layerId = publicId.replace(/\//g, ':')
        
        if (isVideo) {
            segments.push(`l_video:${ layerId }, c_fill, h_1280, w_720 / fl_layer_apply, fl_splice`)
        } else {
            // Fixed duration for images (4s)
            segments.push(`l:${ layerId }, c_fill, h_1280, w_720, du_4 / fl_layer_apply, fl_splice`)
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
