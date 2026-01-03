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
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

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

    const attemptRender = async (url: string) => {
        return await cloudinary.uploader.upload(url, {
            folder: "branded-posts",
            public_id: `post_${Date.now()}`
        })
    }

    try {
        // 1st Attempt: Use Primary Configured URL
        const uploadResponse = await attemptRender(renderUrl.toString())
        logger.info(`✅ Branded Post Rendered & Uploaded: ${uploadResponse.secure_url}`)
        return { id: uploadResponse.public_id, url: uploadResponse.secure_url }
    } catch (error: any) {
        logger.warn(`⚠️ Primary Render Failed: ${error.message}. Attempting Fallback...`)

        try {
            // 2nd Attempt: Use Verified Live Domain Fallback
            const fallbackUrl = renderUrl.toString().replace(appUrl, "https://dream-eta-ruddy.vercel.app")
            const fallbackResponse = await attemptRender(fallbackUrl)
            logger.info(`✅ Fallback Render Success: ${fallbackResponse.secure_url}`)
            return { id: fallbackResponse.public_id, url: fallbackResponse.secure_url }
        } catch (fallbackError: any) {
            logger.error(`❌ Native Render Failure (All Domains): ${fallbackError.message}`)
            throw new Error(`Failed to render native branded post: ${fallbackError.message}`)
        }
    }
}
