import { GoogleGenerativeAI } from "@google/generative-ai"
import { getTrendingSongsForRegion } from "./trends"

const apiKey = process.env.GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" }) : null

interface AIReelData {
    // 1. The Hook Maker & Stylist
    hook: string
    title: string
    caption: string
    fontFamily: string // e.g., "Montserrat", "Bebas Neue", "Playfair Display"
    fontColor: string // Hex code
    textBackgroundColor: string // Hex code
    textPosition: "top" | "center" | "bottom"

    // 2. The DJ
    musicMood: string
    trendingAudioTip: string
    musicRationale: string // Why this song?

    // 3. The Critic
    vibeScore: number // 1-10
    energyLevel: "chill" | "moderate" | "high" | "extreme"

    // 4. The Director
    visualStyle: string
    narrative: string
    transitionType: "fade" | "wipeRight" | "wipeLeft" | "slideRight" | "slideLeft" | "zoom"
    effectType: "zoomIn" | "zoomOut" | "slideLeft" | "slideRight" | "none"
}

export async function describeMedia(imageUrls: string[]): Promise<string> {
    if (!model) return "No visual data available."

    try {
        // Analyze up to 10 media items for quality filtering
        const mediaParts = await Promise.all(
            imageUrls.slice(0, 10).map(async (url) => {
                const response = await (fetch as any)(url)
                const buffer = await response.arrayBuffer()
                return {
                    inlineData: {
                        data: Buffer.from(buffer).toString("base64"),
                        mimeType: "image/jpeg"
                    }
                }
            })
        )

        const prompt = `You are THE HARSH CRITIC (Chief Creative Officer). Analyze these ${imageUrls.length} media items with zero tolerance for "mid" content.
        
        CRITIQUE CRITERIA:
        - Composition: Is it amateurish? (e.g., cut off heads, bad framing).
        - Technical: Is it blurry, grainy, or under-exposed? 
        - Vibe: Does it look premium? Throw out anything that looks like a "bad WhatsApp photo".
        
        YOUR TASK:
        1. Identify exactly which indices (0 to ${imageUrls.length - 1}) are SUB-PAR and MUST be SKIPPED.
        2. For the high-quality items, provide a technical visual summary using terms like: "High dynamic range", "Deep bokeh", "Vibrant saturation", "Symmetry", "Product-focused".
        
        Format: [SKIP: indices]
        Summary: (Detailed, technical, professional).`

        const result = await model.generateContent([prompt, ...mediaParts])
        return result.response.text()
    } catch (e) {
        console.error("Vision Error:", e)
        return "Visual analysis failed."
    }
}


export async function generateReelMetadata(
    businessName: string,
    mediaCount: number,
    isReel: boolean,
    mediaTypes: string[],
    region: string = "Pakistan",
    visualContext: string = ""
): Promise<AIReelData[]> {
    const format = isReel ? "high-energy dynamic video reel" : "sleek, curated carousel post"
    const trendingHits = await getTrendingSongsForRegion(region)
    const trendingSongs = trendingHits.join(", ")

    const prompt = `You are an AI Creative Production Team (Critic, DJ, Stylist, Director).
    Your goal is to create 3 UNIQUE video production scripts for "${businessName}" that are EXCLUSIVELY derived from the visual content provided.
    
    CRITICAL: DO NOT use generic templates. Every hook, color, and music choice must be a direct reaction to the "Visual Observation Report".

    Project Data:
    - Business: ${businessName} (Pakistan Market)
    - Visual Observation Report: ${visualContext}
    - Media Specs: ${mediaCount} files (${mediaTypes.join(", ")})

    STYLING RULES (Agent: The Stylist):
    - Fonts: Pick ONE (Luxury: "Playfair Display", "Cinzel" | Hype: "Bebas Neue", "Anton" | Modern: "Montserrat", "Outfit").
    - Colors: Pick high-contrast Hex codes that match or compliment the visual atmosphere.
    - Positioning: "top", "center", or "bottom" (Decide based on the video subjects).

    MUSIC RULES (Agent: THE DJ):
    - Select EXACTLY from these hits: [${trendingSongs}]
    - Match the energy of the "Visual Observation Report".

    DIVERSITY CHECK:
    - All 3 variations MUST have completely different Hooks, Fonts, Colors, and Positioning.
    - Variation 1 should be the most literal and atmospheric.
    - Variation 2 should be the most aggressive and high-energy version of the visuals.
    - Variation 3 should be a creative "out-of-the-box" storytelling angle.

    EDITING RULES (Agent: THE DIRECTOR):
    - Choose a transitionType from ["fade", "wipeRight", "wipeLeft", "slideRight", "slideLeft", "zoom"].
    - Choose an effectType from ["zoomIn", "zoomOut", "slideLeft", "slideRight", "none"].
    - Match the editing speed and style to the visual atmosphere.

    Return ONLY a JSON array of 3 AIReelData objects:
    - hook (max 6 words)
    - title (max 5 words)
    - caption (max 280 chars)
    - fontFamily, fontColor, textBackgroundColor, textPosition
    - musicMood, trendingAudioTip, musicRationale
    - vibeScore (1-10), energyLevel ("chill", "moderate", "high", "extreme")
    - visualStyle, narrative, transitionType, effectType

    Return raw JSON array.
    `

    try {
        if (!model) throw new Error("Gemini API Key missing")
        const result = await model.generateContent(prompt)
        const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim()
        const parsed = JSON.parse(text)
        return Array.isArray(parsed) ? parsed.slice(0, 3) : [parsed]
    } catch (error) {
        console.error("Gemini Error:", error)
        // Fallback with limited but safe data
        const fallback = {
            hook: "YOU NEED TO SEE THIS",
            title: `Discover ${businessName}`,
            caption: `The best vibe in town! ✨ #Dream #${businessName.replace(/\s/g, "")}`,
            fontFamily: "Bebas Neue",
            fontColor: "#FFFFFF",
            textBackgroundColor: "#FF0000",
            textPosition: "center" as const,
            musicMood: "Pop",
            trendingAudioTip: getTrendingSongsForRegion(region)[0],
            musicRationale: "High energy fallback",
            vibeScore: 8,
            energyLevel: "high" as const,
            visualStyle: "Fast and Dynamic",
            narrative: "An energetic look at the business.",
            transitionType: "fade" as const,
            effectType: "zoomIn" as const
        }
        return [fallback, fallback, fallback]
    }
}
