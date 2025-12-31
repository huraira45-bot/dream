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
    isReel: boolean
): Promise<AIReelData> {
    const format = isReel ? "high-energy dynamic video reel" : "sleek, curated carousel post"

    const prompt = `You are an expert Social Media Director. 
    Create metadata for a ${format} for a business named "${businessName}".
    
    Context:
    - Business: ${businessName}
    - Format: ${isReel ? "Vertical Video Reel" : "Carousel Post"}
    - Media Count: ${mediaCount} items
    
    Return ONLY a JSON object with these fields:
    - title: A catchy, short title (max 5 words)
    - caption: A trending, engaging caption with hashtags (max 280 chars)
    - musicMood: Suggested music genre/vibe (e.g., "Lo-fi Chill", "Upbeat Pop", "Dark Techno")
    - visualStyle: Description of the editing style (e.g., "Fast cuts", "Smooth transitions", "Minimalist")
    - narrative: A 1-sentence narrative arc for the content.

    Do not include markdown formatting like \`\`\`json. Just the raw JSON.
    `

    try {
        if (!model) {
            console.warn("Gemini API Key missing, using fallback metadata")
            throw new Error("Gemini API Key missing")
        }
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim()

        return JSON.parse(text) as AIReelData
    } catch (error) {
        console.error("Gemini Error:", error)
        // Fallback data
        return {
            title: `Moments at ${businessName}`,
            caption: `Check out the latest vibes at ${businessName}! ✨ #DreamApp #${businessName.replace(/\s/g, "")}`,
            musicMood: "Trending Audio",
            visualStyle: "Clean and Modern",
            narrative: "A glimpse into the daily atmosphere."
        }
    }
}
