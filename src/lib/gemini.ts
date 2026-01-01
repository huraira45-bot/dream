import { GoogleGenerativeAI } from "@google/generative-ai"
import { getTrendingSongsForRegion } from "./trends"

const apiKey = process.env.GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null

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
}

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

    const prompt = `You are an AI Creative Production Team consisting of 4 specialist agents:
    1. THE CRITIC: Analyzes the visual vibe and sets the quality bar.
    2. THE DJ: Matches the energy with the perfect Pakistani trending audio.
    3. THE STYLIST: Chooses high-impact typography, colors, and the viral hook.
    4. THE DIRECTOR: Orchestrates the story and ensures everything is "Viral Ready".

    Project Context:
    - Business: ${businessName} (Market: Pakistan 🇵🇰)
    - Visual Analysis: ${visualContext || "General business content"}
    - Media: ${mediaCount} items (${mediaTypes.join(", ")})

    YOUR TASK: Generate 3 DISTINCT production options. 

    STYLING RULES (For the Stylist):
    - Font Selection: 
        * LUXURY: "Playfair Display", "Cinzel"
        * HYPE: "Bebas Neue", "Anton"
        * MODERN: "Montserrat", "Outfit"
    - Color Selection: Use bold, high-contrast combinations (e.g., Red/White, Gold/Black, Neon Green/Black).
    - Text Position: "top", "center", or "bottom" based on where it best fits the vibe.

    MUSIC RULES (For the DJ):
    - Select from these EXACT Pakistani Trending Songs: [${trendingSongs}]

    Return ONLY a JSON array containing exactly 3 "AIReelData" objects with these fields:
    - hook: Viral, high-impact hook (max 6 words).
    - title: Catchy title (max 5 words).
    - caption: Engaging caption with hashtags (max 280 chars).
    - fontFamily: One from the Font Selection list.
    - fontColor: Hex code for the text.
    - textBackgroundColor: Hex code for the box behind text.
    - textPosition: "top", "center", or "bottom".
    - musicMood: ONE of: "Phonk", "Lo-Fi", "Luxury", "Pop", "Cinematic", "High Energy".
    - trendingAudioTip: EXACT name from the Pakistani list.
    - musicRationale: 1-sentence why the DJ picked this.
    - vibeScore: 1-10 based on visual quality perception.
    - energyLevel: "chill", "moderate", "high", or "extreme".
    - visualStyle: Editing style description.
    - narrative: 1-sentence core story.

    Options:
    1. THE TREND-SETTER (Hype, Fast, Viral Hooks)
    2. THE LUXE-VIBE (Cinematic, Slow, Elegant)
    3. THE STORY-TELLER (Narrative-focused, Authentic)

    Return raw JSON. No markdown. No explanations.
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
            narrative: "An energetic look at the business."
        }
        return [fallback, fallback, fallback]
    }
}
