import { GoogleGenerativeAI } from "@google/generative-ai"
import { getTrendingSongsForRegion } from "./trends"

const apiKey = process.env.GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null

interface AIReelData {
    hook: string
    title: string
    caption: string
    musicMood: string
    trendingAudioTip: string
    visualStyle: string
    narrative: string
}

// Trending songs helper moved to ./trends.ts

export async function describeMedia(imageUrls: string[]): Promise<string> {
    if (!model) return "No visual data available."

    try {
        const mediaParts = await Promise.all(
            imageUrls.slice(0, 3).map(async (url) => {
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

        const prompt = "Briefly describe what is visible in these images for a social media video. Focus on specific objects, vibe, and colors. 1 sentence total."
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
    const trendingSongs = getTrendingSongsForRegion(region).join(", ")

    const prompt = `You are an expert Social Media Director specializing in the Pakistan market. 
    Create 3 DISTINCT and CREATIVE storytelling options for a ${format} for a business named "${businessName}" in Pakistan.
    
    Context:
    - Business: ${businessName}
    - Market: Pakistan 🇵🇰
    - Visual Content: ${visualContext || "General business content"}
    - Format: ${isReel ? "Vertical Video Reel" : "Carousel Post"}
    - Media Available: ${mediaCount} items (${mediaTypes.join(", ")})
    
    CRITICAL: Analyze the visual content and business type to pick the perfect "Viral Audio Category".
    - Gym / Cars / Sports -> Suggest "Phonk" or "High Energy"
    - Cafe / Morning / Nature -> Suggest "Lo-Fi" or "Acoustic"
    - Real Estate / Fashion / Art -> Suggest "Luxury" or "Deep House"
    - General / Fun -> Suggest "Pop" or "Trending"
    - Food / Restaurant -> Suggest "Pop" or "Acoustic"

    MUST USE PAKISTANI TRENDS: Select one from this EXACT list of viral songs in Pakistan for the trendingAudioTip field. DO NOT use generic or western songs.
    [${trendingSongs}]

    Return ONLY a JSON array containing exactly 3 objects with these fields:
    - hook: A viral "Hook" sentence that stops the scroll (e.g., "Wait for the ending...", "The best deal in Lahore", "Why everyone is talking about..."). Max 6 words.
    - title: A catchy, short title (max 5 words)
    - caption: A trending, engaging caption with hashtags (max 280 chars)
    - musicMood: ONE of these exact values: "Phonk", "Lo-Fi", "Luxury", "Pop", "Cinematic", "High Energy"
    - trendingAudioTip: EXACT name of the song from the PAKISTANI TRENDS list above.
    - visualStyle: Description of the editing style
    - narrative: A 1-sentence narrative arc why this option is unique.

    Direction for the 3 options:
    Option 1: The "Vibe" (Focus on atmosphere).
    Option 2: The "Hype" (Focus on energy/viral potential).
    Option 3: The "Story" (Focus on narrative/value).

    Return the final result as a raw JSON array. Do not include markdown formatting like \`\`\`json.
    `

    try {
        if (!model) {
            console.warn("Gemini API Key missing, using fallback metadata")
            throw new Error("Gemini API Key missing")
        }
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim()

        const parsed = JSON.parse(text)
        return Array.isArray(parsed) ? parsed.slice(0, 3) : [parsed]
    } catch (error) {
        console.error("Gemini Error:", error)
        const fallbackSongs = getTrendingSongsForRegion(region)
        // Fallback data (3 options) using regional hits
        const base = {
            hook: `Wait for this!`,
            title: `Moments at ${businessName}`,
            caption: `Check out the latest vibes at ${businessName}! ✨ #DreamApp #${businessName.replace(/\s/g, "")}`,
            musicMood: "Trending Audio",
            trendingAudioTip: fallbackSongs[0],
            visualStyle: "Clean and Modern",
            narrative: "A glimpse into the daily atmosphere."
        }
        return [
            { ...base, hook: "DON'T SCROLL!", title: `The Heart of ${businessName}`, narrative: "Emotional journey through your space.", trendingAudioTip: fallbackSongs[1] || fallbackSongs[0] },
            { ...base, hook: "YOU NEED THIS", title: `${businessName} Energy`, narrative: "High-octane buzz of the business.", trendingAudioTip: fallbackSongs[2] || fallbackSongs[0] },
            { ...base, hook: "PREMIUM ONLY", title: `A Touch of Class: ${businessName}`, narrative: "Highlighting the premium details.", trendingAudioTip: fallbackSongs[3] || fallbackSongs[0] },
        ]
    }
}
