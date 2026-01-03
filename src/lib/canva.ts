import { logger } from "./logger"

const CANVA_API_BASE = "https://api.canva.com/rest/v1"

/**
 * Canva Connect API Integration
 * Note: Requires CANVA_API_KEY (Access Token) from the Canva Developer Portal.
 */
export async function createCanvaDesignFromTemplate(
    templateId: string,
    data: { [key: string]: string },
    title: string = "AI Generated Design",
    accessToken?: string
) {
    const apiKey = accessToken || process.env.CANVA_API_KEY
    if (!apiKey) {
        logger.warn("Canva access token not found. Skipping Canva render.")
        return null
    }

    try {
        // 1. Create a design from template using Autofill API (Spec: /autofills)
        const response = await fetch(`${CANVA_API_BASE}/autofills`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                brand_template_id: templateId,
                title: title,
                data: Object.keys(data).reduce((acc, key) => {
                    // Logic: If it's a URL, treat as image (simplification), else text
                    const isUrl = data[key].startsWith("http");
                    acc[key] = isUrl
                        ? { type: "image", asset_id: data[key] } // Note: Canva requires asset_id, might need upload logic first
                        : { type: "text", text: data[key] };
                    return acc;
                }, {} as any)
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(`Canva API Error: ${JSON.stringify(err)}`);
        }

        const result = await response.json();
        // result.job.id or result.design.url
        return result;
    } catch (err: any) {
        logger.error(`Canva Integration Error: ${err.message}`);
        return null;
    }
}

/**
 * Helper to get a preview URL or Export for the design
 */
export async function exportCanvaDesign(designId: string) {
    const apiKey = process.env.CANVA_API_KEY;
    if (!apiKey) return null;

    try {
        const response = await fetch(`${CANVA_API_BASE}/designs/${designId}/exports`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ format: "jpg" })
        });

        if (!response.ok) throw new Error("Export failed");
        return await response.json();
    } catch (err: any) {
        logger.error(`Canva Export Error: ${err.message}`);
        return null;
    }
}
