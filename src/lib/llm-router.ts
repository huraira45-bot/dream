import { generateReelMetadata, describeMedia } from "./gemini";
import { generateJSONWithGPT4o } from "./openai";
import { getTrendingSongsForRegion } from "./trends";

export interface AIReelDataV3 {
    // 1. The Hook Maker & Stylist (GPT-4o)
    hook: string
    title: string
    caption: string
    fontFamily: string
    fontColor: string
    textBackgroundColor: string
    textPosition: "top" | "center" | "bottom"

    // 2. The DJ (GPT-4o)
    musicMood: string
    trendingAudioTip: string
    musicRationale: string

    // 3. The Critic (Gemini 1.5 Pro via Vision)
    vibeScore: number
    energyLevel: "chill" | "moderate" | "high" | "extreme"
    skipMediaIndices: number[] // Indices of low quality or off-vibe media

    // 4. The SMM (GPT-4o - Gen Z Reviewer)
    smmAura: string // The Gen Z vibe check
    smmGimmick: string // A creative "trick" or hook detail

    // 5. The Director
    visualStyle: string
    narrative: string
}

export async function processMultiLLMCreativeFlow(
    businessName: string,
    mediaUrls: string[],
    isReel: boolean,
    region: string = "Pakistan"
): Promise<AIReelDataV3[]> {
    // Step 1: Gemini 1.5 Pro - Visual Analysis & Filtering
    const visualReport = await describeMedia(mediaUrls);

    // Step 2: GPT-4o - Creative Production & Gen Z SMM Review
    const trendingSongs = getTrendingSongsForRegion(region).join(", ");

    const prompt = `You are an AI Creative Production Team consisting of:
    - THE STYLIST: Expert in typography and minimal/aesthetic vibes.
    - THE DJ: Selector of trending Pakistani audio.
    - THE GEN Z SMM: A trend-aware boss who reviews everything for "Aura" and "Aesthetics". 
    
    Project Context:
    - Business: ${businessName}
    - Visual Observation Report from Gemini: ${visualReport}
    - Media Count: ${mediaUrls.length}
    - Trending Songs (Pakistan): [${trendingSongs}]

    YOUR TASK: Generate 3 UNIQUE production options. 
    Each option must be distinct in font, music, and angle.

    AESTHETIC RULES:
    - Fonts: Pick from [Bodoni Moda, Space Grotesk, Syne, Montserrat, Bebas Neue, Anton].
    - Gen Z SMM: Make the hooks and captions hit different. Use trend-aware language without being cringey.
    - Diversity Check: Ensure Variation 1, 2, and 3 are completely unique.

    CRITICAL RULES:
    - Identify any media that should be SKIPPED based on the visual report (e.g., if there's a blurry or low-quality index mentioned). 
      (Note: indices are 0 to ${mediaUrls.length - 1}).

    Return ONLY a JSON object with a key "options" containing an array of 3 AIReelDataV3 objects.
    Fields per object:
    - hook (viral, max 6 words)
    - title, caption
    - fontFamily, fontColor, textBackgroundColor, textPosition
    - musicMood, trendingAudioTip, musicRationale
    - vibeScore (1-10), energyLevel, skipMediaIndices (array of numbers)
    - smmAura (Gen Z vibe summary), smmGimmick (creative gimmick)
    - visualStyle, narrative
    `;

    try {
        const result = await generateJSONWithGPT4o<{ options: AIReelDataV3[] }>(prompt, {});
        return result.options;
    } catch (openaiError: any) {
        console.warn("OpenAI Failed (Quota/Error), falling back to Gemini for Creative:", openaiError.message);

        // Fallback to Gemini 1.5 Pro/Flash for the creative part
        const geminiOptions = await generateReelMetadata(
            businessName,
            mediaUrls.length,
            isReel,
            [], // types not critical here
            region,
            visualReport
        );

        // Map AIReelData to AIReelDataV3
        return geminiOptions.map(opt => ({
            ...opt,
            skipMediaIndices: [], // Gemini's metadata generator doesn't do this yet
            smmAura: "Vibe checked by Gemini",
            smmGimmick: "Classic storytelling"
        })) as AIReelDataV3[];
    }
}
