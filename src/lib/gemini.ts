import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null

interface AIReelData {
    title: string
    caption: string
    musicMood: string
    visualStyle: string
    narrative: string
}

export async function generateReelMetadata(
    businessName: string,
    mediaCount: number,
    isReel: boolean,
    mediaTypes: string[]
): Promise<AIReelData[]> {
    const format = isReel ? "high-energy dynamic video reel" : "sleek, curated carousel post"

    const prompt = `You are an expert Social Media Director. 
    Create 3 DISTINCT and CREATIVE storytelling options for a ${format} for a business named "${businessName}".
    
    Context:
    - Business: ${businessName}
    - Format: ${isReel ? "Vertical Video Reel" : "Carousel Post"}
    - Media Available: ${mediaCount} items (${mediaTypes.join(", ")})
    
    CRITICAL: Use the mix of media to create a narrative.
    - If there are videos, make them the "hooks".
    - If there are images, use them for detail and "vibe".
    
    Return ONLY a JSON array containing exactly 3 objects with these fields:
    - title: A catchy, short title (max 5 words)
    - caption: A trending, engaging caption with hashtags (max 280 chars)
    - musicMood: Suggested music genre/vibe (e.g., "Lo-fi Chill", "Upbeat Pop", "Dark Techno")
    - visualStyle: Description of the editing style (e.g., "Fast cuts", "Smooth transitions", "Minimalist")
    - narrative: A 1-sentence narrative arc why this option is unique.

    Direction for the 3 options:
    Option 1: Emotional/Story-driven.
    Option 2: High-energy/Trendy/Fast-paced.
    Option 3: Elegant/Premium/Cinematic.

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
        // Fallback data (3 options)
        const base = {
            title: `Moments at ${businessName}`,
            caption: `Check out the latest vibes at ${businessName}! ✨ #DreamApp #${businessName.replace(/\s/g, "")}`,
            musicMood: "Trending Audio",
            visualStyle: "Clean and Modern",
            narrative: "A glimpse into the daily atmosphere."
        }
        return [
            { ...base, title: `The Heart of ${businessName}`, narrative: "Emotional journey through your space." },
            { ...base, title: `${businessName} Energy`, narrative: "High-octane buzz of the business." },
            { ...base, title: `A Touch of Class: ${businessName}`, narrative: "Highlighting the premium details." },
        ]
    }
}
