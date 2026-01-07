import cloudinary, { configCloudinary } from "./cloudinary"
import { logger } from "./logger"
import { renderWithAPITemplate, getAPITemplateMock } from "./apitemplate";

export interface MediaItem {
    id: string
    url: string
    type: string
}

/**
 * Renders a static post using either Native or External Engines (APITemplate.io).
 */
export async function renderStaticPost(
    mediaUrl: string,
    branding: { primaryColor: string, accentColor: string },
    metadata: {
        hook: string,
        businessName: string,
        cta?: string,
        subheadline?: string,
        logoUrl?: string,
        layoutStyle?: string,
        geometryType?: string,
        illustrationSubject?: string,
        fontFamily?: string,
        templateHint?: string // Hint for external engines
    }
) {
    configCloudinary(); // Ensure Cloudinary is ready

    // 1. Check for External Engine Hint
    if (metadata.templateHint) {
        logger.info(`🔌 Routing to EXTERNAL Engine (APITemplate.io): ${metadata.templateHint}`);
        try {
            const apiData = {
                hook: metadata.hook,
                title: metadata.businessName,
                caption: metadata.subheadline || "",
                fontColor: branding.primaryColor,
                textBackgroundColor: branding.accentColor,
                smmAura: "Premium Build"
            } as any;

            // We use the mock if the key is missing or for rapid testing, but the user provided a key.
            // If the key is in env, this will work.
            if (process.env.APITEMPLATE_API_KEY) {
                const externalRes = await renderWithAPITemplate(apiData, metadata.templateHint, {
                    "image_url": mediaUrl,
                    "logo_url": metadata.logoUrl
                });
                return { id: externalRes.transaction_id, url: externalRes.download_url };
            } else {
                logger.warn("APITEMPLATE_API_KEY missing. Falling back to Mock for Demo.");
                const mock = getAPITemplateMock(apiData);
                return { id: mock.transaction_id, url: mock.download_url };
            }
        } catch (err: any) {
            logger.warn(`⚠️ External Render Failed: ${err.message}. Falling back to Native...`);
        }
    }

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost"))
        ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
        : "https://dream-eta-ruddy.vercel.app";

    // 1. Construct the Native Renderer URL with Strict Truncation
    const renderUrl = new URL(`${appUrl}/api/render/post`)

    // Limits: Headline 80, Subheadline 160, CTA 25 (Prevent URL bloat & UI overflow)
    const truncate = (text: string, limit: number) => text.length > limit ? text.substring(0, limit - 3) + "..." : text;

    renderUrl.searchParams.append("headline", truncate(metadata.hook, 80))
    renderUrl.searchParams.append("subheadline", truncate(metadata.subheadline || "", 160))
    renderUrl.searchParams.append("cta", truncate(metadata.cta || "Check it out", 25))
    renderUrl.searchParams.append("imgUrl", mediaUrl)
    renderUrl.searchParams.append("primaryColor", branding.primaryColor)
    renderUrl.searchParams.append("accentColor", branding.accentColor)
    renderUrl.searchParams.append("businessName", metadata.businessName)
    if (metadata.logoUrl) {
        renderUrl.searchParams.append("logoUrl", metadata.logoUrl)
    }
    if (metadata.layoutStyle) {
        renderUrl.searchParams.append("layout", metadata.layoutStyle)
    }
    if (metadata.geometryType) {
        renderUrl.searchParams.append("geometry", metadata.geometryType)
    }
    if (metadata.fontFamily) {
        renderUrl.searchParams.append("fontFamily", metadata.fontFamily)
    }

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
