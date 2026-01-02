import { generateReelMetadata, describeMedia } from "./gemini";
import { generateJSONWithGPT4o } from "./openai";
import { getTrendingSongsForRegion } from "./trends";
import { logger } from "./logger";

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
    transitionType: "fade" | "wipeRight" | "wipeLeft" | "slideRight" | "slideLeft" | "zoom"
    effectType: "zoomIn" | "zoomOut" | "slideLeft" | "slideRight" | "none"
}

export async function processMultiLLMCreativeFlow(
    businessName: string,
    mediaUrls: string[],
    isReel: boolean,
    region: string = "Pakistan",
    usedSongs: string[] = [],
    usedHooks: string[] = []
): Promise<AIReelDataV3[]> {
    logger.info(`Analyzing ${mediaUrls.length} media items with Gemini v2.1...`)
    const visualReport = await describeMedia(mediaUrls);
    logger.info(`Visual report generated successfully.`)

    // Step 2: GPT-4o - Creative Production & Gen Z SMM Review
    console.log("--------------------------------------------------")
    console.log("🤖 AGENT: THE DYNAMIC DJ")
    console.log(`Action: Fetching real-time trending music for ${region}...`)
    const trendingHits = await getTrendingSongsForRegion(region);
    const trendingSongs = trendingHits.join(", ");
    console.log(`🎵 DJ PICKED: ${trendingHits.length} viral tracks found.`)

    console.log("--------------------------------------------------")
    console.log("🤖 AGENT: CREATIVE DIRECTOR (GPT-4o)")
    console.log("Action: Brainstorming concepts with Stylist & SMM...")

    const prompt = `You are an AI Creative Production Team consisting of:
    - THE STYLIST: Expert in typography and minimal/aesthetic vibes.
    - THE DJ: Selector of trending Pakistani audio.
    - THE GEN Z SMM: A trend-aware boss who reviews everything for "Aura" and "Aesthetics". 
    
    Project Context:
    - Business: ${businessName}
    - Visual Observation Report from Gemini: ${visualReport}
    - Media Count: ${mediaUrls.length}
    - Trending Songs (Pakistan): [${trendingSongs}]
    - MEMORY (AVOID THESE):
      - Songs Used Recently: [${usedSongs.join(", ")}]
      - Hooks Used Recently: [${usedHooks.join(", ")}]

    YOUR TASK: Generate EXACTLY 3 UNIQUE production options. 
    Each option must be distinct in vibe, text, and music.

    VARIATION SEEDS (Strict Enforcement):
    - Option 1 [DRAMATIC/CINEMATIC]: High contrast, bold serif fonts, epic hook, intense music. 
    - Option 2 [POV/VLOG]: Hand-written fonts, relatable/funny hook, "Day in life" vibe, chill/lofi music.
    - Option 3 [HYPE/TREND]: Bright colors, bold rounded fonts, fast-paced hook, high-energy viral music.

    AESTHETIC RULES (The Stylist):
    - Fonts: Pick EXACTLY one from these sets per variation:
        - Handwritten: [Permanent Marker, Gloria Hallelujah]
        - Bold: [Fredoka One, Titan One]
        - Editorial: [Abril Fatface, Ultra]
    - Styling: Match Font Color to the mood (e.g., Dramatic = Gold/White, Hype = Neon).

    MUSIC RULES (The Dynamic DJ):
    - Select EXACTLY from these hits: [${trendingSongs}]
    - NEGATIVE CONSTRAINT: DO NOT use any song listed in "Songs Used Recently".
    - UNIFORMITY FORBIDDEN: Variations 1, 2, and 3 MUST use different songs.

    DIRECTOR RULES:
    - NEGATIVE CONSTRAINT: DO NOT reuse hooks from "Hooks Used Recently".
    - CAPTION DIVERSITY: Captions must be completely different. No "Yum!" in every one. Write specific marketing copy for each mood.

    EDITING RULES:
    - Variation 1: Slow transitions (fade), ZoomIn on food.
    - Variation 3: Fast transitions (wipe), Glitch/Slide effects.

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
    - visualStyle, narrative, transitionType, effectType
    `;

    try {
        const result = await generateJSONWithGPT4o<{ options: AIReelDataV3[] }>(prompt, {});
        logger.info("Creative Team: Generated 3 unique production options via GPT-4o.")
        return result.options;
    } catch (openaiError: any) {
        logger.warn(`OpenAI Failed: ${openaiError.message}. Falling back to Gemini...`);

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
            smmGimmick: "Classic storytelling",
            transitionType: (opt as any).transitionType || "fade",
            effectType: (opt as any).effectType || "zoomIn"
        })) as AIReelDataV3[];
    }
}
