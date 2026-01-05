import { AIReelDataV3 } from "./llm-router";
import { logger } from "./logger";

const API_KEY = process.env.APITEMPLATE_API_KEY;
const API_URL = "https://rest.apitemplate.io/v2/create-image";

export const RECOMMENDED_TEMPLATES = [
    { id: "instagram-positive-quote-white", name: "Modern Quote (White)" },
    { id: "bold_sale_announcement", name: "Bold Sale Announcement" },
    { id: "minimalist_instagram_1", name: "Minimalist Aesthetic" },
    { id: "premium_lifestyle_post", name: "Premium Lifestyle" }
];

export interface APITemplateResponse {
    status: string;
    download_url: string;
    transaction_id: string;
    template_id: string;
}

interface APITemplateOverride {
    name: string;
    text?: string;
    src?: string;
    [key: string]: any;
}

/**
 * APITemplate.io Integration Service (v2 Upgrade)
 * Connects the "Brain" to external visual templates.
 */
export async function renderWithAPITemplate(
    data: AIReelDataV3,
    templateId: string,
    overrides: Record<string, any> = {}
): Promise<APITemplateResponse> {
    if (!API_KEY) {
        throw new Error("APITEMPLATE_API_KEY is missing in environment variables.");
    }

    logger.info(`🔌 Routing to APITemplate.io v2 [Template: ${templateId}]`);

    // Standard v2 Payload Construction
    // We Map high-level data keys to potential element names in the template
    const overrideList: APITemplateOverride[] = [
        { name: "headline", text: data.hook },
        { name: "subheadline", text: data.title },
        { name: "cta_text", text: data.caption.substring(0, 50) },
        { name: "business_name", text: data.smmAura }
    ];

    // Merge in programmatic overrides (images, logos)
    if (overrides.image_url) {
        overrideList.push({ name: "main_image", src: overrides.image_url });
        overrideList.push({ name: "image_1", src: overrides.image_url });
    }
    if (overrides.logo_url) {
        overrideList.push({ name: "logo", src: overrides.logo_url });
    }

    const payload = {
        template_id: templateId,
        overrides: overrideList,
        output_format: "jpeg",
        expiration: 60
    };

    try {
        logger.info(`📤 APITemplate Request: ${JSON.stringify(payload, null, 2)}`);

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "X-API-KEY": API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const responseText = await response.text();
        logger.info(`📥 APITemplate Raw Response: ${responseText}`);

        if (!response.ok) {
            throw new Error(`APITemplate API Error (${response.status}): ${responseText}`);
        }

        const result = JSON.parse(responseText);
        logger.info(`✅ APITemplate Success: ${result.download_url}`);
        return result;
    } catch (error: any) {
        logger.error(`❌ APITemplate Failure: ${error.message}`);
        throw error;
    }
}

/**
 * Mock Mapper for testing without a real API key
 */
export function getAPITemplateMock(data: AIReelDataV3): APITemplateResponse {
    return {
        status: "success",
        download_url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1080&q=80",
        transaction_id: "mock_" + Date.now(),
        template_id: "temp_default_1"
    };
}
