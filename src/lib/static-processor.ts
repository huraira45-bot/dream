import cloudinary from "./cloudinary"
import { logger } from "./logger"

export interface MediaItem {
    id: string
    url: string
    type: string
}

/**
 * Renders a static post using the native HTML-to-Image engine and uploads to Cloudinary.
 */
export async function renderStaticPost(
    mediaUrl: string,
    branding: { primaryColor: string, accentColor: string },
    metadata: { hook: string, businessName: string, cta?: string, subheadline?: string }
) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    // 1. Construct the Native Renderer URL
    const renderUrl = new URL(`${appUrl}/api/render/post`)
    renderUrl.searchParams.append("headline", metadata.hook)
    renderUrl.searchParams.append("subheadline", metadata.subheadline || "")
    renderUrl.searchParams.append("cta", metadata.cta || "Check it out")
    renderUrl.searchParams.append("imgUrl", mediaUrl)
    renderUrl.searchParams.append("primaryColor", branding.primaryColor)
    renderUrl.searchParams.append("accentColor", branding.accentColor)
    renderUrl.searchParams.append("businessName", metadata.businessName)

    logger.info(`🎨 Generating Native Branded Post: ${renderUrl.toString()}`)

    try {
        // 2. Upload the dynamically generated image to Cloudinary
        // Cloudinary will fetch the URL, Satori will render the HTML, and Cloudinary stores the result.
        const uploadResponse = await cloudinary.uploader.upload(renderUrl.toString(), {
            folder: "branded-posts",
            public_id: `post_${Date.now()}`
        })

        logger.info(`✅ Branded Post Rendered & Uploaded: ${uploadResponse.secure_url}`)

        return {
            id: uploadResponse.public_id,
            url: uploadResponse.secure_url
        }
    } catch (error: any) {
        logger.error(`❌ Native Render Failure: ${error.message}`)
        throw new Error(`Failed to render native branded post: ${error.message}`)
    }
}
