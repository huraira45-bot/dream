import { AIReelDataV3 } from "./llm-router";
import { logger } from "./logger";

const API_KEY = process.env.APITEMPLATE_API_KEY;
const API_URL = "https://api.apitemplate.io/v1/create";

export interface APITemplateResponse {
    status: string;
    download_url: string;
    primary_url: string;
    transaction_id: string;
    template_id: string;
}

/**
 * APITemplate.io Integration Service
 * Connects the "Brain" (Llama 3.3/Gemini) to external visual templates.
 */
export async function renderWithAPITemplate(
    data: AIReelDataV3,
    templateId: string,
    overrides: Record<string, any> = {}
): Promise<APITemplateResponse> {
    if (!API_KEY) {
        throw new Error("APITEMPLATE_API_KEY is missing in environment variables.");
    }

    logger.info(`Routing brain output to APITemplate.io [Template: ${templateId}]`);

    // Mapping Brain (AIReelDataV3) -> APITemplate JSON Properties
    // Based on documentation: field names must match the element names in the template editor
    const payload = {
        template_id: templateId,
        data: {
            // General naming conventions found in standard APITemplate samples
            "headline": data.hook,
            "text_headline": data.hook,
            "subheadline": data.title,
            "text_subheadline": data.title,
            "cta": data.caption.substring(0, 50),
            "text_cta": data.caption.substring(0, 50),
            "footer_text": data.smmAura,
            "text_footer": data.smmAura,
            "primary_color": data.fontColor || "#000000",
            "accent_color": data.textBackgroundColor || "#FF4D4D",
            "text_quote": data.hook, // Found in the documentation sample
            ...overrides
        },
        metadata: {
            "business_name": "Dream AI",
            "variation_hook": data.hook
        },
        export_type: "jpeg",
        expiration: 60 // Minutes
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "X-API-KEY": API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`APITemplate API Error: ${errorData.message || response.statusText}`);
        }

        const result = await response.json();
        logger.info(`Successfully rendered image via APITemplate.io: ${result.download_url}`);
        return result;
    } catch (error: any) {
        logger.error(`Failed to connect APITemplate.io: ${error.message}`);
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
        primary_url: "https://dream-app.com/mock-render",
        transaction_id: "mock_" + Date.now(),
        template_id: "temp_default_1"
    };
}
