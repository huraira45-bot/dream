import { GoogleGenerativeAI } from "@google/generative-ai"
import { logger } from "./logger"

const apiKey = process.env.GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.5-flash" }, { apiVersion: "v1" }) : null

export interface BrandPalette {
    primary: string
    secondary: string
    accent: string
    mood: string
}

export async function extractBrandingFromLogo(logoUrl: string): Promise<BrandPalette> {
    if (!model) {
        return { primary: "#000000", secondary: "#FFFFFF", accent: "#FF0000", mood: "Modern" }
    }

    try {
        const response = await fetch(logoUrl);
        const buffer = await response.arrayBuffer();
        const mimeType = response.headers.get("content-type") || "image/png";

        const prompt = `Analyze this business logo and extract a premium brand palette.
        Return ONLY a JSON object:
        {
            "primary": "Hex color that represents the main brand identify",
            "secondary": "Complementary neutral or subtle color for backgrounds",
            "accent": "High-contrast action color for buttons or highlights",
            "mood": "Single word describing the brand vibe (e.g., Luxury, Playful, Industrial, Elegant)"
        }`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: Buffer.from(buffer).toString("base64"),
                    mimeType: mimeType
                }
            }
        ]);

        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Could not parse branding JSON from Gemini");

        return JSON.parse(jsonMatch[0]);
    } catch (err: any) {
        logger.error(`Branding Agent Error: ${err.message}`);
        // Safe defaults
        return { primary: "#1E1E1E", secondary: "#F5F5F5", accent: "#FF4D4D", mood: "Modern" }
    }
}
