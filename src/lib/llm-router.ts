import { generateReelMetadata, describeMedia } from "./gemini";
import { generateJSONWithLLM } from "./openai";
import { getTrendingSongsForRegion } from "./trends";
import { logger } from "./logger";

enum CreativeMode {
    FULL_VISION = "FULL_VISION",
    PARTIAL_VISION = "PARTIAL_VISION",
    NO_VISION = "NO_VISION"
}

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
    usedHooks: string[] = [],
    mode: CreativeMode = CreativeMode.FULL_VISION,
    branding?: { primary: string, secondary: string, accent: string, mood: string },
    upcomingEvents: string[] = []
): Promise<AIReelDataV3[]> {
    logger.info(`Analyzing ${mediaUrls.length} media items with Gemini v2.1...`)
    const visualReport = await describeMedia(mediaUrls);

    if (visualReport.includes("Visual analysis failed")) {
        mode = CreativeMode.NO_VISION;
        console.log("--------------------------------------------------")
        console.log("⚠️  AGENT: THE HARSH CRITIC (FAILED)")
        console.log("Action: Entering NO_VISION mode. Generic hooks and viral clichés are now FORBIDDEN.")
        console.log("--------------------------------------------------")
    } else if (visualReport.length < 100) {
        mode = CreativeMode.PARTIAL_VISION;
    }

    // Step 2: GPT-4o - Creative Production & Gen Z SMM Review
    console.log("--------------------------------------------------")
    console.log("🤖 AGENT: THE DYNAMIC DJ")
    console.log(`Action: Fetching real-time trending music for ${region}...`)
    const allHits = await getTrendingSongsForRegion(region);
    const unusedHits = allHits.filter(s => !usedSongs.includes(s)).sort(() => Math.random() - 0.5);
    const recentlyUsedHits = allHits.filter(s => usedSongs.includes(s)).sort(() => Math.random() - 0.5);

    // Trend Cooldown: Prioritize fresh tracks, use previously seen ones only as backup
    let trendingHits = [...unusedHits, ...recentlyUsedHits];

    if (mode === CreativeMode.NO_VISION) {
        // Forbid the top 50% of trending hits to avoid the "Safety Bias" of picking rank #1
        trendingHits = trendingHits.slice(Math.floor(trendingHits.length / 2));
    }

    const trendingSongs = trendingHits.join(", ");
    console.log(`🎵 DJ PICKED: ${trendingHits.length} viral tracks found (Post-Safety Filter).`)

    const creativeSpice = [
        "Cyberpunk Neon", "Vintage Film Noir", "Vibrant Pop Art", "Dreamy Pastel",
        "Minimalist Zen", "Aggressive Street Style", "Luxury Gold & Velvet", "Retro 90s Vibe",
        "Ethereal Glow", "Industrial Grunge", "Playful Kawaii", "Sophisticated Editorial"
    ];
    const pickedSpice = creativeSpice[Math.floor(Math.random() * creativeSpice.length)];

    let variationMix = [
        { type: "DRAMATIC/CINEMATIC", style: "High contrast, bold serif fonts, epic hook, intense music" },
        { type: "POV/VLOG", style: "Hand-written fonts, relatable/funny hook, 'Day in life' vibe, chill/lofi music" },
        { type: "HYPE/TREND", style: "Bright colors, bold rounded fonts, fast-paced hook, high-energy viral music" },
        { type: "MINIMALIST/AESTHETIC", style: "Clean typography, soft lighting, quiet hooks, atmospheric sounds" },
        { type: "CHAOTIC/FAST", style: "Glitches, neon colors, aggressive hooks, hard-hitting bass" }
    ].sort(() => 0.5 - Math.random()).slice(0, 3);

    if (mode === CreativeMode.NO_VISION) {
        variationMix = variationMix.slice(0, 1); // Only 1 variation in Blind Mode
    }

    console.log("--------------------------------------------------")
    console.log("🗣️  AGENT: THE HARSH CRITIC (Gemini Vision)")
    console.log(`Report: ${visualReport.substring(0, 150)}...`)
    console.log("--------------------------------------------------")
    console.log("🤖 AGENT: CREATIVE DIRECTOR (Llama 3.3 via Groq)")
    console.log(`Action: Brainstorming concepts (Spice: ${pickedSpice})`)
    console.log(`Variation Mix: ${variationMix.map(m => m.type).join(", ")}`)

    const prompt = `You are an AI Creative Production Team consisting of:
    - THE STYLIST: Expert in typography and minimal/aesthetic vibes.
    - THE DJ: Selector of trending Pakistani audio.
    - THE GEN Z SMM: A trend-aware boss who reviews everything for "Aura" and "Aesthetics". 
    
    CRITICAL THEME (Creative Spice): ${pickedSpice}
    
    Project Context:
    - Business: ${businessName}
    - Visual Observation Report from Gemini Critic: ${visualReport}
    - Total Media Available: ${mediaUrls.length} items.
    - Trending Songs (Pakistan): [${trendingSongs}]
    - MEMORY (AVOID THESE):
    - Songs Used Recently: [${usedSongs.join(", ")}]
    - Hooks Used Recently: [${usedHooks.join(", ")}]
    - CURRENT MODE: ${mode}
    
    HIGH-QUALITY SELECTION RULE (The SMM):
    - You MUST identify the "best" media items to include in this ${isReel ? "Reel" : "Post"}.
    - Do NOT use low-quality or irrelevant items mentioned as SKIP in the report.
    - PRIORITIZE items marked as [TOP_PICKS] in the visual report.
    - TARGET DENSITY: A selection of 5-10 BEST items is much better than using all ${mediaUrls.length} items. 
    - CRITICAL: If the user uploaded too many items, CULL the weaker ones. 
    - RETURN: List all indices to IGNORE in "skipMediaIndices".
    
    ${mode === CreativeMode.NO_VISION ? `
    🚨 NO_VISION CRITICAL RULE:
    - You are BLIND. Do NOT use generic hooks like "Discover...", "Welcome to...", or "See the magic...".
    - Avoid literal descriptions of the business name.
    - Focus on abstracts, curiosity, and high-entropy storytelling.
    ` : ""}

    ${branding ? `
    BRAND GUIDELINES (The Stylist):
    - Primary Color: ${branding.primary}
    - Secondary Color: ${branding.secondary}
    - Accent Color: ${branding.accent}
    - Brand Mood: ${branding.mood}
    - RULE: You MUST prioritize these colors for "fontColor" and "textBackgroundColor".
    ` : ""}

    ${upcomingEvents.length > 0 ? `
    CALENDAR CONTEXT (Occasional Post Logic):
    - Upcoming Events in Pakistan: [${upcomingEvents.join(", ")}]
    - RULE: If an event is relevant, use it to pivot your hooks and visual style.
    ` : ""}

    YOUR TASK: Generate EXACTLY ${variationMix.length} UNIQUE production options. 
    Each option must be distinct in vibe, text, and music.

    VARIATION SEEDS (Strict Enforcement):
${variationMix.map((v, i) => `    - Option ${i + 1} [${v.type}]: ${v.style}.`).join("\n")}

    AESTHETIC RULES (The Stylist):
    - Tone: Incorporate the "${pickedSpice}" theme into your color choices and copywriting.
    - Fonts: Pick EXACTLY one from these sets per variation:
        - Handwritten: [Permanent Marker, Gloria Hallelujah]
        - Bold: [Fredoka One, Titan One]
        - Editorial: [Abril Fatface, Ultra]
        - Funky: [Bungee, Monoton, Creepster]
    - Styling: Match Font Color to the mood and the theme. Use vibrant, unexpected combinations.

    FORBIDDEN_BLOCKLIST (CONTRACT VIOLATION IF USED):
    - RECENT_SONGS: [${usedSongs.join(", ")}]
    - RECENT_HOOKS: [${usedHooks.join(", ")}]
    - OVERLAP: Using any song or hook from this list will result in the entire batch being REJECTED.

    VARIATION DIVERGENCE CONTRACT:
    You are generating 3 "Reel archetypes". They MUST fundamentally diverge:
    
    1. ARYCHETYPE: THE VIRAL SAFE-BET (Var 1)
       - Style: Follows the "${pickedSpice}" theme religiously.
       - Vibe: High energy, safe, viral potential.
       - Creative Risk: Low.
    
    2. ARCHETYPE: THE EXPERIMENTAL TRENDSETTER (Var 2)
       - Style: Challenges the theme with a twist.
       - Vibe: Edgy, unconventional, pattern-interrupting.
       - Creative Risk: Medium.
    
    3. ARCHETYPE: THE "WEIRD" BOLD MOVE (Var 3)
       - Style: Permission to be unusual. If it's for ${businessName}, think "What would a Gen Z creator do if they didn't care about rules?".
       - Vibe: Abstract, aggressive transitions, "Post-ironic" or highly emotive.
       - Creative Risk: MAXIMUM.

    DIVERGENCE RULES:
    - [SONG]: EVERY variation MUST use a DIFFERENT song from the trending list.
    - [HOOK]: EVERY variation MUST use a DIFFERENT Opus.pro formula.
    - [STYLE]: EVERY variation MUST use a DIFFERENT font and color palette.
    - If Var 1 is "Cinematic", Var 2 CANNOT be "Cinematic".

    AESTHETIC RULES (The Stylist):
    - Tone: Incorporate the "${pickedSpice}" theme into your color choices and copywriting.
    - Fonts: Pick EXACTLY one from these per variation (NO REUSE across the 3):
        - Handwritten: [Permanent Marker, Gloria Hallelujah]
        - Bold: [Fredoka One, Titan One]
        - Editorial: [Abril Fatface, Ultra]
        - Funky: [Bungee, Monoton, Creepster]

    MUSIC RULES (The Dynamic DJ):
    - Select EXACTLY from these hits: [${trendingSongs}]
    - CRITICAL: NO REPETITION. Variation 1, 2, and 3 MUST each have a UNIQUE song from the list.
    - NEGATIVE CONSTRAINT: DO NOT use any song listed in "Songs Used Recently".
    - If you repeat a song, the entire batch is invalid.

    DIRECTOR RULES:
    - COLD OPEN: Prioritize starting the narrative with the "Big Result" or "Peak Vibe" before context.
    - NEGATIVE CONSTRAINT: DO NOT reuse hooks from "Hooks Used Recently".
    - CAPTION DIVERSITY: Captions must be completely different. No "Yum!" in every one. Write specific marketing copy for each mood. Use emojis liberally for HYPE, but be sober for DRAMATIC.

    HOOK FORMULAS (Opus.pro Standard):
    You MUST use a UNIQUE formula for EACH variation:
    1. THE CONTRARIAN: "Everyone says [X], but [Y]"
    2. THE MISTAKE: "Don't make the mistake I made with [Topic]"
    3. THE NUMBERED LIST: "[3-7] [Things] that [Outcome]"
    4. THE TIME-BASED: "How I [Result] in [Short Time]"
    5. THE QUESTION: "Are you [Doing Something Wrong]?"

    Return ONLY a JSON object with a key "options" containing an array of ${variationMix.length} AIReelDataV3 objects.
    Fields: hook, title, caption, fontFamily, fontColor, textBackgroundColor, textPosition, musicMood, trendingAudioTip (UNIQUE), musicRationale, vibeScore, energyLevel, skipMediaIndices (CRITICAL: indices to IGNORE/CULL), smmAura, smmGimmick, visualStyle, narrative, transitionType, effectType.
    `;

    try {
        let attempts = 0;
        // The original `isReel` parameter is already available.
        // The line `const isReel = variationMix[0]?.type === ReelType.REEL;` is not needed here
        // as `isReel` is already a function parameter.
        let result = await generateJSONWithLLM<{ options: AIReelDataV3[] }>(prompt, {}, { temperature: 1.0 });

        // SIMILARITY CHECK (The Diversity Engine)
        while (attempts < 2) {
            // Only perform similarity check if there are at least 2 options
            if (result.options.length < 2) {
                break; // Not enough options to check for similarity between multiple variations
            }

            let overlap12 = 0;
            let overlap23 = 0;
            let diff12 = 0;
            let diff23 = 0;

            const h1 = result.options[0].hook.toLowerCase();
            const h2 = result.options[1].hook.toLowerCase();
            const s1 = result.options[0].trendingAudioTip;
            const s2 = result.options[1].trendingAudioTip;
            const v1 = result.options[0].visualStyle.toLowerCase();
            const v2 = result.options[1].visualStyle.toLowerCase();

            // Dimensional Divergence Check
            if (h1 !== h2) diff12++;
            if (s1 !== s2) diff12++;
            if (v1 !== v2) diff12++;

            if (h1.split(" ").length > 0 && h2.split(" ").length > 0) {
                overlap12 = h1.split(" ").filter(w => h2.includes(w)).length / Math.max(h1.split(" ").length, h2.split(" ").length);
            }

            if (result.options.length > 2) {
                const h3 = result.options[2].hook.toLowerCase();
                const s3 = result.options[2].trendingAudioTip;
                const v3 = result.options[2].visualStyle.toLowerCase();

                if (h2 !== h3) diff23++;
                if (s2 !== s3) diff23++;
                if (v2 !== v3) diff23++;

                if (h2.split(" ").length > 0 && h3.split(" ").length > 0) {
                    overlap23 = h2.split(" ").filter(w => h3.includes(w)).length / Math.max(h2.split(" ").length, h3.split(" ").length);
                }
            }

            const songs = result.options.map(o => o.trendingAudioTip);
            const uniqueSongs = new Set(songs).size === songs.length;

            // HARD REJECTION LOGIC (The Bad Cop)
            const hasForbiddenHook = result.options.some(opt =>
                usedHooks.some(used => opt.hook.toLowerCase().includes(used.toLowerCase()))
            );
            const hasForbiddenSong = result.options.some(opt =>
                usedSongs.includes(opt.trendingAudioTip)
            );
            const isGeneric = result.options.some(opt =>
                opt.hook.toLowerCase().includes("discover") ||
                opt.hook.toLowerCase().includes("welcome") ||
                opt.hook.toLowerCase().includes(businessName.toLowerCase())
            );

            const lowDivergence = (result.options.length > 1 && diff12 < 2) || (result.options.length > 2 && diff23 < 2);

            if ((overlap12 > 0.6 || overlap23 > 0.6) || !uniqueSongs || hasForbiddenHook || hasForbiddenSong || (mode === CreativeMode.NO_VISION && isGeneric) || lowDivergence) {
                console.log(`⚠️  HARD REJECTION (Attempt ${attempts + 1}). Reasons: ${!uniqueSongs ? 'Non-unique songs ' : ''}${hasForbiddenHook ? 'Forbidden hook ' : ''}${hasForbiddenSong ? 'Forbidden song ' : ''}${isGeneric ? 'Generic hook detected ' : ''}${lowDivergence ? 'Low divergence ' : ''}${overlap12 > 0.6 ? 'Similarity overlap ' : ''}`);
                result = await generateJSONWithLLM<{ options: AIReelDataV3[] }>(prompt + "\n\nCRITICAL: YOUR PREVIOUS OUTPUT WAS REJECTED. IT WAS TOO SIMILAR TO HISTORY, TOO GENERIC, OR HAD LOW DIVERGENCE (dimensions must differ). BE BOLDER.", {}, { temperature: 1.2 });
                attempts++;
            } else {
                break;
            }
        }

        console.log("--------------------------------------------------")
        console.log("✅ PRODUCTION PLAN COMPLETE (Diversity Secured)")
        result.options.forEach((opt, idx) => {
            // SHOTSTACK SANITIZATION (The Safety Guard)
            const validTransitions = ["fade", "wipeRight", "wipeLeft", "slideRight", "slideLeft", "zoom", "none"];
            if (!validTransitions.includes(opt.transitionType)) opt.transitionType = "fade";

            const validEffects = ["zoomIn", "zoomOut", "slideLeft", "slideRight", "none"];
            if (!validEffects.includes(opt.effectType)) opt.effectType = "none";

            console.log(`🎬 Variation ${idx + 1}: [${opt.visualStyle}]`)
            console.log(`   🪝 Hook: "${opt.hook}"`)
            console.log(`   🎨 Style: Font=${opt.fontFamily}, Color=${opt.fontColor}`)
            console.log(`   🎵 DJ: ${opt.trendingAudioTip} (${opt.musicMood})`)
            console.log(`   ✨ Aura: ${opt.smmAura}`)
        });
        console.log("--------------------------------------------------")

        logger.info("Creative Team: Generated unique production options via Llama 3.3.")
        return result.options;
    } catch (openaiError: any) {
        logger.warn(`LLM Pipeline Failed: ${openaiError.message}. Falling back to Gemini...`);

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
        const shuffledGemini = geminiOptions.sort(() => Math.random() - 0.5);
        return shuffledGemini.map((opt, i) => ({
            ...opt,
            skipMediaIndices: [], // Gemini's metadata generator doesn't do this yet
            smmAura: "Vibe checked by Gemini",
            smmGimmick: "Classic storytelling",
            transitionType: (opt as any).transitionType || "fade",
            effectType: (opt as any).effectType || "zoomIn"
        })) as AIReelDataV3[];
    }
}
