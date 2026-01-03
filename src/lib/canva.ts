import { logger } from "./logger"

const CANVA_API_BASE = "https://api.canva.com/rest/v1"

/**
 * Uploads an image from a URL to Canva and returns the asset_id.
 * Note: This is an asynchronous job that we poll for completion.
 */
async function uploadAssetFromUrl(url: string, apiKey: string): Promise<string | null> {
    try {
        logger.info(`Canva: Starting upload for URL: ${url}`);
        const response = await fetch(`${CANVA_API_BASE}/url-asset-uploads`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: `Asset-${Date.now()}`,
                url: url
            })
        });

        if (!response.ok) {
            const err = await response.json();
            logger.error(`Canva Upload Init Error: ${JSON.stringify(err)}`);
            return null;
        }

        const { job } = await response.json();
        const jobId = job.id;

        // Poll for completion (max 15 seconds)
        let attempts = 0;
        while (attempts < 15) {
            const pollResponse = await fetch(`${CANVA_API_BASE}/url-asset-uploads/${jobId}`, {
                headers: { "Authorization": `Bearer ${apiKey}` }
            });

            if (!pollResponse.ok) break;

            const statusData = await pollResponse.json();
            if (statusData.job.status === "success") {
                logger.info(`Canva: Asset uploaded successfully: ${statusData.asset.id}`);
                return statusData.asset.id;
            } else if (statusData.job.status === "failed") {
                logger.error(`Canva: Upload job failed: ${JSON.stringify(statusData.job.error)}`);
                return null;
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
        }
        logger.warn("Canva: Upload job timed out.");
        return null;
    } catch (err: any) {
        logger.error(`Canva Upload Helper Error: ${err.message}`);
        return null;
    }
}

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
        // 1. Pre-upload any image URLs to Canva to get asset_ids
        const autofillData: { [key: string]: any } = {};

        for (const [key, value] of Object.entries(data)) {
            if (value.startsWith("http")) {
                const assetId = await uploadAssetFromUrl(value, apiKey);
                if (assetId) {
                    autofillData[key] = { type: "image", asset_id: assetId };
                } else {
                    logger.warn(`Canva: Failed to upload image for key ${key}. Skipping this image.`);
                }
            } else {
                autofillData[key] = { type: "text", text: value };
            }
        }

        // 2. Create a design from template using Autofill API
        const response = await fetch(`${CANVA_API_BASE}/autofills`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                brand_template_id: templateId,
                title: title,
                data: autofillData
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(`Canva API Error: ${JSON.stringify(err)}`);
        }

        const result = await response.json();
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
