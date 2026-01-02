import { GoogleGenerativeAI } from "@google/generative-ai"
import { getTrendingSongsForRegion } from "./trends"
import { logger } from "./logger"

const apiKey = process.env.GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-pro" }) : null

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
        console.log("--------------------------------------------------")
        console.log("🤖 AGENT: THE HARSH CRITIC (Gemini Vision)")
        console.log(`Action: Analyzing first ${Math.min(imageUrls.length, 6)} media items (out of ${imageUrls.length})...`)

        // Shuffle and analyze up to 6 media items for quality filtering
        const shuffledUrls = [...imageUrls].sort(() => Math.random() - 0.5);
        const mediaParts = await Promise.all(
            shuffledUrls.slice(0, 6).map(async (url) => {
                try {
                    const controller = new AbortController();
                    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

                    // 1. Head Check for size and type
                    const headRes = await fetch(url, { method: 'HEAD', signal: controller.signal });
                    clearTimeout(timeout);

                    const size = parseInt(headRes.headers.get('content-length') || '0');
                    const type = headRes.headers.get('content-type') || '';

                    if (size > 5 * 1024 * 1024) {
                        logger.warn(`Skipping Gemini analysis for large file (${(size / 1024 / 1024).toFixed(1)}MB): ${url}`);
                        return null;
                    }

                    if (type.includes('video')) {
                        logger.info(`Skipping direct video download for Gemini, will rely on metadata: ${url}`);
                        return null;
                    }

                    // 2. Actual Download with timeout
                    const downloadController = new AbortController();
                    const downloadTimeout = setTimeout(() => downloadController.abort(), 30000); // 30s timeout

                    const response = await fetch(url, { signal: downloadController.signal });
                    const buffer = await response.arrayBuffer();
                    clearTimeout(downloadTimeout);

                    return {
                        inlineData: {
                            data: Buffer.from(buffer).toString("base64"),
                            mimeType: "image/jpeg"
                        }
                    };
                } catch (err: any) {
                    logger.error(`Failed to fetch media for Gemini (${url}): ${err.message}`);
                    return null;
                }
            })
        )

        // Filter out nulls (skipped or failed files)
        const validParts = mediaParts.filter(Boolean) as any[];

        if (validParts.length === 0) {
            logger.warn("No valid media items to analyze for Gemini Vision.");
            return "No visual data available (items skipped due to size/type)."
        }

        const prompt = `You are THE HARSH CRITIC (Chief Creative Officer). Analyze these ${validParts.length} media items.
        
        CRITIQUE CRITERIA:
        - Technical: Cull blurry, grainy, or under-exposed items.
        - Atmosphere: What is the vibe? (e.g., "Moody speakeasy", "Sun-drenched morning", "High-octane street", "Cozy minimalist").
        - Subject Specifics: What is ACTUALLY in the shot? (e.g., "Latte art with a swan", "Steam rising from spicy noodles", "Close-up of leather stitching").
        
        YOUR TASK:
        1. Identify indices (0 to ${validParts.length - 1}) to [SKIP].
        2. Provide a technically rich and VIBE-FOCUSED summary. Mention specific colors, lighting styles, and the "main character" of the media.
        
        Format: [SKIP: indices]
        Summary: (Evocative, descriptive, professional).`

        logger.info(`Sending ${validParts.length} parts to Gemini for analysis...`)
        const result = await model.generateContent([prompt, ...validParts])
        const analysis = result.response.text()
        logger.info("Critic Report: Analysis complete.")
        return analysis
    } catch (e: any) {
        logger.error(`Vision Error: ${e.message}`)
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

    HOOK RULES (Agent: Opus Expert):
    You MUST use one of these Scroll-Stop formulas:
    1. THE CONTRARIAN: Challenge a common belief.
    2. THE MISTAKE: Warn against a common pitfall.
    3. THE NUMBERED LIST: "3 Secrets to..." or "5 Ways to...".
    4. THE TIME-BASED: "How I [Result] in [Time]".
    5. THE QUESTION: Pose a provocative question.

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
    } catch (error: any) {
        logger.error(`Gemini Metadata Error: ${error.message}`)
        // Fallback with limited but safe data (Shuffled for diversity)
        const shuffledHits = [...trendingHits].sort(() => Math.random() - 0.5);

        return Array.from({ length: 3 }).map((_, i) => ({
            hook: i === 0 ? "YOU NEED TO SEE THIS" : (i === 1 ? "POV: BEST VIBES" : "DON'T MISS OUT"),
            title: `Discover ${businessName}`,
            caption: `The best vibe in town! ✨ #Dream #${businessName.replace(/\s/g, "")}`,
            fontFamily: i === 0 ? "Bungee" : (i === 1 ? "Permanent Marker" : "Bebas Neue"),
            fontColor: "#FFFFFF",
            textBackgroundColor: i === 0 ? "#FF0000" : (i === 1 ? "#00FF00" : "#0000FF"),
            textPosition: "center" as const,
            musicMood: "Trendy",
            trendingAudioTip: shuffledHits[i % shuffledHits.length] || "Asim Azhar - Meri Zindagi Hai Tu",
            musicRationale: "Randomized fallback strategy",
            vibeScore: 8,
            energyLevel: "high" as const,
            visualStyle: "Fast and Dynamic",
            narrative: "An energetic look at the business.",
            transitionType: "fade" as const,
            effectType: "zoomIn" as const
        }))
    }
}
