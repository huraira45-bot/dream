import { generateReelMetadata, describeMedia } from "./gemini";
import { generateJSONWithLLM } from "./openai";
import { getTrendingSongsForRegion } from "./trends";
import { logger } from "./logger";
import { LightningLogger } from "./lightning";
import { RECOMMENDED_TEMPLATES } from "./apitemplate";

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
    layoutStyle: "magazine" | "poster" | "advertisement" // Native Image Builder Layout
    geometryType: "ribbons" | "cards" | "floating" // Layout geometry style
    illustrationSubject: string // Subject for Pollinations AI (e.g. "Delivery guy on scooter")
    templateHint?: string // Hint for external renderers (APITemplate/Bannerbear)
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
    upcomingEvents: string[] = [],
    campaignGoal?: string,
    styleDNA?: string,
    traceId?: string
): Promise<{ options: AIReelDataV3[], traceId: string }> {
    const lightning = new LightningLogger(traceId);
    const currentTraceId = lightning.getTraceId();
    logger.info(`Analyzing ${mediaUrls.length} media items with Gemini v2.1... (Trace: ${currentTraceId})`)
    const visualReport = await describeMedia(mediaUrls, currentTraceId);

    const parsedStyleDNA = styleDNA ? JSON.parse(styleDNA) : null;

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
    let pickedSpice = creativeSpice[Math.floor(Math.random() * creativeSpice.length)];

    // CRITICAL FIX: If Style DNA is present, it MUST override the random spice
    if (parsedStyleDNA) {
        pickedSpice = "MIMETIC BRAND DNA (Follow User References)";
    }

    let variationMix = [
        { type: "DRAMATIC/CINEMATIC", style: parsedStyleDNA ? "Epic hook, intense music, follow Style DNA for visual" : "High contrast, bold serif fonts, epic hook, intense music" },
        { type: "POV/VLOG", style: parsedStyleDNA ? "Relatable/funny hook, 'Day in life' vibe, follow Style DNA for visual" : "Hand-written fonts, relatable/funny hook, 'Day in life' vibe, chill/lofi music" },
        { type: "HYPE/TREND", style: parsedStyleDNA ? "Fast-paced hook, high-energy viral music, follow Style DNA for visual" : "Bright colors, bold rounded fonts, fast-paced hook, high-energy viral music" },
        { type: "MINIMALIST/AESTHETIC", style: parsedStyleDNA ? "Quiet hooks, atmospheric sounds, follow Style DNA for visual" : "Clean typography, soft lighting, quiet hooks, atmospheric sounds" },
        { type: "CHAOTIC/FAST", style: parsedStyleDNA ? "Aggressive hooks, hard-hitting bass, follow Style DNA for visual" : "Glitches, neon colors, aggressive hooks, hard-hitting bass" }
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

    const prompt = `You are a ELITE AI CREATIVE STRATEGIST and Social Media Viral Expert. 
    Your goal is to instruct the Native Image Builder on how to create the most EXTREMELY CATCHY and ATTRACTIVE visual content.
    
    You understand:
    - High-conversion psychology (stopping the scroll).
    - Social media aesthetics (Magazine layouts, Bold Posters, Minimalist clean vibes).
    - Tone and "Aura" that makes people want to share.
    
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
    
    NATIVE IMAGE BUILDER INSTRUCTIONS (The Strategist):
    - You must choose a "layoutStyle":
        - "magazine": Best for storytelling, lots of text, clean editorial look.
        - "poster": Best for bold, high-impact visuals, big headlines, aggressive vibes.
    
    HIGH-QUALITY SELECTION RULE (The Strategist):
    - Identify the "best" media items. Do NOT use generic or low-quality items.
    - TARGET DENSITY: 5-10 BEST items. 
    - RETURN: List all indices to IGNORE in "skipMediaIndices".
    
    ${mode === CreativeMode.NO_VISION ? `
    🚨 NO_VISION CRITICAL RULE:
    - You are BLIND. Do NOT use generic hooks like "Discover...", "Welcome to...", or "See the magic...". Focus on abstracts and storytelling.
    ` : ""}

    ${branding ? `
    BRAND GUIDELINES (The Strategist):
    - Primary: ${branding.primary}, Secondary: ${branding.secondary}, Accent: ${branding.accent}
    - Vibe: ${branding.mood}
    - Use these colors for "fontColor" and "textBackgroundColor".
    ` : ""}

    ${upcomingEvents.length > 0 ? `
    CALENDAR CONTEXT: [${upcomingEvents.join(", ")}]
    - Pivot your hooks/vibes if an event is relevant.
    ` : ""}

    ${campaignGoal ? `
    STRATEGIC DIRECTIVE: ${campaignGoal}
    - TOP PRIORITY. All content MUST center around this goal.
    ` : ""}

    - You must choose a "layoutStyle":
        - "magazine": Minimal, editorial, split screen.
        - "poster": Big typography, background-focused.
        - "advertisement": High-impact card layout, background ribbons, 3D character focus.
    
    - EXTERNAL RENDERING HINT:
        - If you think this content would look better on a premium external template (e.g., APITemplate.io), provide a "templateHint".
        - KNOWN TEMPLATES YOU CAN USE: ${RECOMMENDED_TEMPLATES.map(t => t.id).join(", ")}
        - VERY IMPORTANT: APITemplate field names must match the template's element names (e.g., "text_quote", "text_headline", "image_1", "logo_1"). 
        - You can suggest these in the "caption" or as part of the creative strategy if you want to override specific elements.
    - You must choose a "geometryType":
        - "ribbons": Sharp diagonal background stripes/ribbons (like the user reference).
        - "cards": Central content cards with shadows.
        - "floating": Floating badges and stickers for features/discounts.

    ILLUSTRATION DIRECTIVE (For Pollinations AI):
    - If no media is available, you MUST provide an "illustrationSubject".
    - If the Style DNA mentions "3D Character", the subject should be descriptive: e.g., "Professional delivery guy on a yellow 3D scooter".

    ${parsedStyleDNA ? `
    MIMETIC STYLE DNA DIRECTIVE (MANDATORY):
    - You MUST mimic the typography and layout from these user-liked references:
    - Typography Category: ${parsedStyleDNA.typography?.category}
    - Layout Geometry: ${parsedStyleDNA.layout?.geometry}
    - Character Style: ${parsedStyleDNA.visual?.characterStyle}
    - Aesthetic Density: ${parsedStyleDNA.visual?.aestheticDensity || parsedStyleDNA.layout?.density}
    - Color Vibrancy: ${parsedStyleDNA.visual?.vibrancy}
    - Rule: If Aesthetic Density is "High", you MUST pick a visually rich layout (e.g., "advertisement").
    - Rule: If Vibrancy is "High", you MUST use background color splashes (secondary/accent colors).
    - Rule: If the user liked 3D Characters and Ribbons, you MUST set layoutStyle to "advertisement" and geometryType to "ribbons". 
    - Rule: ALWAYS ensure the primary brand colors (from the logo) are utilized in the background or main elements.
    ` : ""}

    YOUR TASK: Generate EXACTLY ${variationMix.length} UNIQUE production options. 
    Each MUST be extremely attractive and divert from the norm.
    
    Return ONLY a JSON object with a key "options" containing an array of AIReelDataV3 objects.
    Fields: hook, title, caption, fontFamily, fontColor, textBackgroundColor, textPosition, musicMood, trendingAudioTip, musicRationale, vibeScore, energyLevel, skipMediaIndices, smmAura, smmGimmick, visualStyle, narrative, transitionType, effectType, layoutStyle.
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
                usedHooks.some(used => {
                    const uWords = used.toLowerCase().split(/\s+/).filter(w => w.length > 3);
                    const oWords = opt.hook.toLowerCase().split(/\s+/).filter(w => w.length > 3);
                    if (uWords.length === 0 || oWords.length === 0) return false;
                    const overlap = uWords.filter(w => oWords.includes(w)).length / Math.max(uWords.length, oWords.length);
                    return overlap > 0.8; // Reject only if 80% overlap of significant words
                })
            );
            const hasForbiddenSong = result.options.some(opt =>
                usedSongs.includes(opt.trendingAudioTip)
            );
            const isGeneric = result.options.some(opt =>
                opt.hook.toLowerCase().includes("discover") ||
                opt.hook.toLowerCase().includes("welcome")
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

        result.options.forEach((opt, idx) => {
            // ... same logging ...
        });

        await lightning.logDecision("Production Team (Reels)", { businessName, isReel, mode }, result.options, prompt);

        return { options: result.options, traceId: currentTraceId };
    } catch (openaiError: any) {
        logger.warn(`LLM Pipeline Failed: ${openaiError.message}. Falling back to Gemini...`);

        // Fallback to Gemini
        const geminiRes = await generateReelMetadata(
            businessName,
            mediaUrls.length,
            isReel,
            [],
            region,
            visualReport,
            currentTraceId
        );

        const shuffledGemini = geminiRes.data.sort(() => Math.random() - 0.5);
        const options = (shuffledGemini.map((opt, i) => ({
            ...opt,
            skipMediaIndices: [],
            smmAura: "Vibe checked by Gemini",
            smmGimmick: "Classic storytelling",
            transitionType: (opt as any).transitionType || "fade",
            effectType: (opt as any).effectType || "zoomIn",
            layoutStyle: "magazine"
        })) as unknown) as AIReelDataV3[];

        return { options, traceId: currentTraceId };
    }
}

/**
 * THE RE-CORRECTOR: AI-Driven Self-Correction Flow
 * Takes a failed creative plan and fixes it based on Harsh Critic feedback.
 */
export async function recorrectCreativeFlow(
    current: AIReelDataV3,
    criticFeedback: string,
    criticSuggestions: Record<string, string>,
    businessName: string,
    traceId?: string
): Promise<AIReelDataV3> {
    const lightning = new LightningLogger(traceId);
    logger.info(`🛠️  AI RE-CORRECTOR: Fixing creative based on feedback for ${businessName}...`);

    const correctionPrompt = `You are a MASTER CORRECTOR. A previous creative post for "${businessName}" was REJECTED by THE HARSH CRITIC.
    
    PREVIOUS PLAN:
    - Hook: ${current.hook}
    - Layout: ${current.layoutStyle}
    - Geometry: ${current.geometryType}
    - Colors: ${current.fontColor} on ${current.textBackgroundColor}
    
    CRITIC FEEDBACK (Why it failed):
    ${criticFeedback}
    
    ACTIONABLE SUGGESTIONS TO FIX IT:
    - Color Fix: ${criticSuggestions.colorFix}
    - Typography Fix: ${criticSuggestions.typographyFix}
    - Layout Fix: ${criticSuggestions.layoutFix}
    - Vibe Fix: ${criticSuggestions.vibeFix}
    
    TASK:
    Generate a NEW, FIXED AIReelDataV3 object that addresses all critic concerns.
    
    STRICT ENUM CONSTRAINTS:
    - layoutStyle: "magazine" | "poster" | "advertisement"
    - geometryType: "ribbons" | "cards"
    - fontFamily: "Montserrat" | "Playfair Display" | "Bebas Neue" | "Outfit" | "Inter"
    
    Ensure "layoutStyle" and "geometryType" are updated if needed. For "Red and Yellow" bold brands, use "advertisement" + "ribbons".
    
    Return ONLY a JSON object of AIReelDataV3. No preamble.`;

    try {
        const result = await generateJSONWithLLM<AIReelDataV3>(correctionPrompt, {}, { temperature: 0.7 });
        logger.info(`✅ AI RE-CORRECTOR: Applied fixes for ${businessName}. Ready for retry.`);

        await lightning.logDecision("The Re-Corrector", { businessName, feedback: criticFeedback }, result, correctionPrompt);

        return result;
    } catch (err: any) {
        logger.warn(`Correction AI failed: ${err.message}. Using last known state.`);
        return current;
    }
}

/**
 * THE POST CREATOR: Specialized workflow for static branded posts.
 * Focuses on Logo Analysis, Style DNA Mimicry, and Festive/Offer creativity.
 */
export async function generateBrandedPostMetadata(
    businessName: string,
    branding?: { primary: string, secondary: string, accent: string, mood: string },
    styleDNA?: string,
    campaignGoal?: string,
    upcomingEvents: string[] = [],
    traceId?: string
): Promise<{ data: AIReelDataV3, traceId: string }> {
    const lightning = new LightningLogger(traceId);
    const currentTraceId = lightning.getTraceId();
    logger.info(`🎨 AGENT: THE POST CREATOR (Creative Branch) for ${businessName} (Trace: ${currentTraceId})`);
    const parsedStyleDNA = styleDNA ? JSON.parse(styleDNA) : null;

    const prompt = `You are an ELITE BRAND DESIGNER. Your goal is to design a high-converting static social media post for ${businessName}.
    
    BRAND CONTEXT:
    - Logo Colors: Primary(${branding?.primary}), Secondary(${branding?.secondary}), Accent(${branding?.accent})
    - Mood: ${branding?.mood}
    - Upcoming Events: [${upcomingEvents.join(", ") || "None"}]
    - Campaign Goal: ${campaignGoal || "General Brand Awareness"}
    
    MIMETIC STYLE DNA (MANDATORY):
    ${parsedStyleDNA ? `
    - Typography: ${parsedStyleDNA.typography?.category}
    - Layout: ${parsedStyleDNA.layout?.geometry}
    - Character Style: ${parsedStyleDNA.visual?.characterStyle}
    - Color Vibrancy: ${parsedStyleDNA.visual?.vibrancy}
    ` : "No DNA found. Use high-impact professional design."}
    
    TASK:
    1. Hook & Headline: Create something scroll-stopping and HIGH CONVERSION.
       - OFFER RULE: You MUST emphasize specific offers. Use percentages (e.g., "50% OFF", "BUY 1 GET 1") or "FREE" deals (e.g., "FREE DELIVERY", "FREE GIFT") in the headline. 
       - CONTEXTUAL RULE: If "Upcoming Events" contains something like "PSL", "Eid", or a "Sale", you MUST incorporate that excitement directly into the Hook or Headline. E.g., "PSL FLASH SALE: 30% OFF!".
    2. Design (STRICT ENUMS): 
       - layoutStyle: "magazine" | "poster" | "advertisement"
       - geometryType: "ribbons" | "cards"
       - fontFamily: "Montserrat" | "Playfair Display" | "Bebas Neue" | "Outfit" | "Inter"
    3. Creative Freedom: You are NOT restricted just to the logo colors. If there is a festive event (Eid, New Year) or an offer (Flash Sale), you MUST use appropriate festive colors (Eid=Gold/Green, Sale=Bold Red/Yellow) to enhance the "Vibe". 
    4. Visual Depth: Describe an "illustrationSubject" for Pollinations AI. Include characters and descriptive backgrounds (e.g., "A happy professional holding a gift with festive tea lights in the background").
    
    Return ONLY a JSON object of AIReelDataV3. 
    Fields musicMood, trendingAudioTip, and musicRationale should be "N/A" as this is a static post.
    `;

    try {
        const result = await generateJSONWithLLM<any>(prompt, {}, { temperature: 0.9 });

        // --- ROBUST FIELD MAPPING & DEFAULTING ---
        const finalMetadata: AIReelDataV3 = {
            hook: result.hook || result.headline || result.main_hook || "Special Offer Just For You!",
            title: result.title || result.cta || result.button_text || "Order Now",
            caption: result.caption || result.subheadline || result.description || "Limited time offer. Follow us for more updates.",
            fontFamily: result.fontFamily || "Montserrat",
            fontColor: result.fontColor || branding?.primary || "#000000",
            textBackgroundColor: result.textBackgroundColor || branding?.accent || "#FFFFFF",
            textPosition: result.textPosition || "bottom",
            musicMood: "N/A",
            trendingAudioTip: "N/A",
            musicRationale: "Static Post Branch",
            vibeScore: result.vibeScore || 8,
            energyLevel: result.energyLevel || "moderate",
            skipMediaIndices: [],
            smmAura: result.smmAura || result.aura || "Professional & Clean",
            smmGimmick: result.smmGimmick || "Direct Value Proposition",
            visualStyle: result.visualStyle || "Modern Branded",
            narrative: result.narrative || "Showcasing brand value.",
            transitionType: "fade",
            effectType: "none",
            layoutStyle: result.layoutStyle || "magazine",
            geometryType: result.geometryType || "cards",
            illustrationSubject: result.illustrationSubject || result.hook || result.headline || "Branded lifestyle illustration",
            templateHint: result.templateHint
        };

        logger.info(`✅ POST CREATOR: Designed Branded Post [Hook: ${finalMetadata.hook}]`);
        await lightning.logDecision("Post Creator", { businessName, campaignGoal }, finalMetadata, prompt);
        return { data: finalMetadata, traceId: currentTraceId };
    } catch (err: any) {
        logger.error(`Post Creator failed: ${err.message}`);
        throw err;
    }
}
