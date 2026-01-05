import { GoogleGenerativeAI } from "@google/generative-ai"
import { getTrendingSongsForRegion } from "./trends"
import { logger } from "./logger"

const apiKey = process.env.GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.5-flash" }, { apiVersion: "v1" }) : null

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

    console.log("--------------------------------------------------")
    console.log("🤖 AGENT: THE HARSH CRITIC (Gemini Vision)")
    console.log(`Action: Sampling ${Math.min(imageUrls.length, 12)} media items (out of ${imageUrls.length}) for quality check...`)

    // Create indexed items for correct mapping
    const indexedItems = imageUrls.map((url, index) => ({ url, index }));

    // Sample a diverse set (first, middle, last, and randoms)
    const sampledItems = [
        indexedItems[0], // First
        indexedItems[Math.floor(indexedItems.length / 2)], // Middle
        indexedItems[indexedItems.length - 1], // Last
        ...indexedItems.sort(() => Math.random() - 0.5)
    ].filter((item, i, self) => item && self.findIndex(t => t.index === item.index) === i).slice(0, 12);

    const mediaParts = await Promise.all(
        sampledItems.map(async (item) => {
            const { url, index } = item;
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 15000);

                const headRes = await fetch(url, { method: 'HEAD', signal: controller.signal });
                clearTimeout(timeout);

                const size = parseInt(headRes.headers.get('content-length') || '0');
                if (size > 10 * 1024 * 1024) return null;

                const response = await fetch(url);
                const buffer = await response.arrayBuffer();
                const contentType = response.headers.get('content-type') || 'image/jpeg';

                return {
                    originalIndex: index,
                    inlineData: {
                        data: Buffer.from(buffer).toString("base64"),
                        mimeType: contentType
                    }
                };
            } catch (err) {
                return null;
            }
        })
    )

    const validParts = mediaParts.filter(Boolean) as any[];

    try {
        if (validParts.length === 0) {
            logger.warn("No valid media items to analyze for Gemini Vision.");
            return "No visual data available."
        }

        const prompt = `You are THE HARSH CRITIC (Chief Creative Officer). Analyze these ${validParts.length} media items.
        
        Indices provided: [${validParts.map(p => p.originalIndex).join(", ")}]
        
        CRITIQUE CRITERIA:
        - Technical: Cull blurry, grainy, or under-exposed items.
        - Atmosphere: What is the vibe?
        - Subject Specifics: What is ACTUALLY in the shot?
        
        YOUR TASK:
        1. Identify any original indices to [SKIP] due to low quality or off-brand vibe.
        2. Identify 3-5 original indices as [TOP_PICKS] for the main story.
        3. Provide a technically rich summary.
        
        Format:
        [SKIP: original_indices]
        [TOP_PICKS: original_indices]
        Summary: (Evocative description).`

        logger.info(`Sending ${validParts.length} samples to Gemini...`)
        const result = await model.generateContent([prompt, ...validParts.map(p => ({ inlineData: p.inlineData }))])
        const analysis = result.response.text()
        logger.info("Critic Report: Analysis complete.")
        return analysis
    } catch (e: any) {
        logger.error(`Gemini Vision Error: ${e.message}. Attempting SambaNova Llama-4 fallback...`)

        const sambaKey = process.env.SAMBANOVA_API_KEY;
        if (!sambaKey) {
            logger.warn("SAMBANOVA_API_KEY missing, skipping fallback.");
            return "Visual analysis failed."
        }

        try {
            console.log("--------------------------------------------------")
            console.log("🤖 AGENT: THE SECONDARY CRITIC (SambaNova Llama-4)")
            console.log("Action: Running fallback analysis with Llama-4-Maverick-17B-128E-Instruct (1 Sample)...")

            const promptText = `You are THE HARSH CRITIC (Chief Creative Officer). Describe this media item.
            Focus on mood, lighting, and main subjects. Extremely short summary.`;

            // Extreme reduction for stability on preview model
            const limitedParts = validParts.slice(0, 1);

            const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${sambaKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "Llama-4-Maverick-17B-128E-Instruct",
                    messages: [
                        {
                            role: "user",
                            content: [
                                { type: "text", text: promptText },
                                ...limitedParts.map(p => ({
                                    type: "image_url",
                                    image_url: {
                                        url: `data:${p.inlineData.mimeType};base64,${p.inlineData.data}`
                                    }
                                }))
                            ]
                        }
                    ],
                    temperature: 0.1,
                    max_tokens: 512
                })
            });

            const responseText = await response.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseErr) {
                throw new Error(`Non-JSON response from SambaNova: ${responseText.substring(0, 100)}...`);
            }

            if (!response.ok) throw new Error(data.error?.message || "SambaNova API error");

            const analysis = data.choices[0].message.content;
            logger.info("SambaNova Critic Report: Llama-4 analysis complete.");
            return analysis;
        } catch (sambaErr: any) {
            logger.error(`SambaNova Vision Error: ${sambaErr.message}`);
            return "Visual analysis failed."
        }
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
        if (!model) throw new Error("Gemini model not initialized")
        const result = await model.generateContent(prompt)
        const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim()
        const parsed = JSON.parse(text)
        return Array.isArray(parsed) ? parsed.slice(0, 3) : [parsed]
    } catch (error: any) {
        logger.error(`Gemini Metadata Error: ${error.message}. Attempting Groq fallback...`)

        const groqKey = process.env.GROQ_API_KEY;
        if (groqKey) {
            try {
                const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${groqKey}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile",
                        messages: [
                            {
                                role: "user",
                                content: prompt
                            }
                        ],
                        response_format: { type: "json_object" },
                        temperature: 1.0
                    })
                });

                const data = await response.json();
                if (response.ok) {
                    const content = data.choices[0].message.content;
                    const parsed = JSON.parse(content);
                    // Handle wrap-around if LLM returns an object with 'options' key instead of raw array
                    const finalArray = Array.isArray(parsed) ? parsed : (parsed.options || [parsed]);
                    return finalArray.slice(0, 3);
                }
            } catch (groqErr: any) {
                logger.error(`Groq Metadata Error: ${groqErr.message}`);
            }
        }

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

/**
 * THE HARSH CRITIC: Final Branded Vibe Check
 * Compares the generated post against the logo to ensure perfect branding alignment.
 */
export async function validatePostVibe(
    logoUrl: string,
    postImageUrl: string,
    businessName: string,
    referenceUrls: string[] = []
): Promise<{ matches: boolean; reasoning: string }> {
    if (!model) return { matches: true, reasoning: "Critic Offline (Model Missing)" }

    console.log("--------------------------------------------------")
    console.log("🔍 AGENT: THE HARSH CRITIC (Vibe Check 2.0)")
    console.log(`Action: Validating Post against Logo & ${referenceUrls.length} Style References for: ${businessName}`)

    try {
        const fetchImage = async (url: string) => {
            const res = await fetch(url);
            return await res.arrayBuffer();
        };

        const [logoRes, postRes, ...refRes] = await Promise.all([
            fetchImage(logoUrl),
            fetchImage(postImageUrl),
            ...referenceUrls.map(url => fetchImage(url))
        ]);

        const prompt = `You are THE HARSH CRITIC. You are reviewing a final generated post for ${businessName}.
        
        INPUTS:
        1. The Business Logo (First Image)
        2. The Style References / User Likes (Next ${refRes.length} Images)
        3. The Generated Post (Final Image)
        
        CRITERIA:
        - MIMICRY ACCURACY: Does the final post look like it belongs in the same "collection" as the Style References?
        - TYPOGRAPHY CHECK: Is the font weight and category consistent with the user's likes?
        - COLOR HARMONY: Does it respect the logo's palette while following the reference's composition?
        
        TASK:
        The user has explicitly shared the "Style References" as their preferred aesthetic. 
        If the Generated Post feels generic, cluttery, or differs significantly in vibe from the references, FAIL it.
        
        JSON RESPONSE FORMAT:
        {
          "matches": boolean,
          "reasoning": "Be specific about why it fails the style match"
        }`;

        const mediaParts = [
            { inlineData: { data: Buffer.from(logoRes).toString("base64"), mimeType: "image/png" } },
            ...refRes.map(buffer => ({ inlineData: { data: Buffer.from(buffer).toString("base64"), mimeType: "image/png" } })),
            { inlineData: { data: Buffer.from(postRes).toString("base64"), mimeType: "image/png" } }
        ];

        const result = await model.generateContent([prompt, ...mediaParts]);
        const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();

        console.log("--------------------------------------------------")
        console.log("🤖 Agent: THE HARSH CRITIC (RAW_RESPONSE):", text)

        try {
            const parsed = JSON.parse(text);
            console.log(`⚖️  CRITIC VERDICT for ${businessName}: ${parsed.matches ? "✅ VIBE MATCHED" : "❌ VIBE MISMATCH"}`)
            console.log(`📝 Reason: ${parsed.reasoning}`)
            console.log("--------------------------------------------------")
            return parsed;
        } catch (e) {
            return { matches: true, reasoning: "Critic returned non-JSON response, assuming match to avoid stall." };
        }
    } catch (err: any) {
        if (err.message?.includes("429") || err.message?.includes("quota")) {
            console.warn("⚠️  Gemini Quota Exceeded for Critic. Falling back to SambaNova Llama-4...");
            return await validatePostVibeWithSambaNova(logoUrl, postImageUrl, businessName, referenceUrls);
        }
        console.error(`Vibe Check Failure: ${err.message}`);
        return { matches: true, reasoning: "Critic Error, bypassing to avoid stall." };
    }
}

/**
 * SambaNova Failover for Vision Tasks
 */
async function validatePostVibeWithSambaNova(
    logoUrl: string,
    postImageUrl: string,
    businessName: string,
    referenceUrls: string[]
): Promise<{ matches: boolean; reasoning: string }> {
    try {
        const apiKey = process.env.SAMBANOVA_API_KEY;
        if (!apiKey) throw new Error("SAMBANOVA_API_KEY missing");

        const prompt = `You are THE HARSH CRITIC. Validate if the last image (Generated Post) matches the first image (Logo) and intermediate images (Style References) for ${businessName}.
        Check: Mimicry Accuracy, Typography consistency, and Color Harmony.
        If it feels generic or lacks brand elements (like footers or specific colors), return matches: false.
        OUTPUT STRICT JSON: {"matches": boolean, "reasoning": "string"}`;

        // Simplified for SambaNova (usually takes 2 images at a time or specific format)
        // We'll just compare Logo and Post to keep it lean for fallback
        const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "Llama-3.2-11B-Vision-Instruct",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            { type: "image_url", image_url: { url: logoUrl } },
                            { type: "image_url", image_url: { url: postImageUrl } }
                        ]
                    }
                ],
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) throw new Error(`SambaNova Error: ${response.statusText}`);
        const data = await response.json();
        return JSON.parse(data.choices[0].message.content);
    } catch (err: any) {
        console.error("SambaNova Failover Error:", err.message);
        return { matches: true, reasoning: "All Vision Critics Failed. Safe Mode Active." };
    }
}

/**
 * THE STYLE PROFILER: DNA Extraction
 * Analyzes 3 reference posts to create a "Style DNA" for the brand.
 */
export async function extractStyleDNA(imageUrls: string[]): Promise<string> {
    if (!model) return "Standard editorial layout.";

    console.log("--------------------------------------------------")
    console.log("🧬 AGENT: THE STYLE PROFILER (Gemini Vision)")
    console.log(`Action: Extracting DNA from ${imageUrls.length} reference posts...`)

    try {
        const mediaParts = await Promise.all(
            imageUrls.map(async (url) => {
                const response = await fetch(url);
                const buffer = await response.arrayBuffer();
                return {
                    inlineData: {
                        data: Buffer.from(buffer).toString("base64"),
                        mimeType: "image/png"
                    }
                };
            })
        );

        const prompt = `You are a MASTER BRAND STRATEGIST and PRE-VISUALIZATION EXPERT.
        Analyze these reference posts which the user LIKES. 
        Extract a "Style DNA" JSON that I can use to direct an AI to replicate this vibe.
        
        EXTRACT THE FOLLOWING DNA:
        1. Typography DNA: (Font category: Serif/Sans/Bold/Elegant, Weight, Case: All-Caps/Mixed).
        2. Layout DNA: (Density: High/Low, Alignment: Central/Left/Asymmetric, Geometry: "Geometric Ribbons", "Clean Cards", "Floating Badges").
        3. Visual DNA: (Character Style: "3D Character Illustration", "Photorealistic", "Minimalist Clay", Colors, Vibes).
        4. Aesthetic DNA: (Background: "Solid with Ribbons", "Gradient", "Textured/Patterned", Vibrancy: High/Low, Aesthetic Density: High/Moderate/Low).
        
        OUTPUT FORMAT (Strict JSON):
        {
          "typography": { "category": string, "weight": string, "case": string },
          "layout": { "density": string, "alignment": string, "geometry": string, "specialElements": string[] },
          "visual": { "characterStyle": string, "colors": string[], "vibes": string[], "vibrancy": string, "aestheticDensity": string },
          "copy": { "tone": string, "length": string }
        }
        
        If you see 3D characters or delivery scooters like in the reference, make sure to mark characterStyle as "3D Character Illustration".`;

        const result = await model.generateContent([prompt, ...mediaParts.map(p => ({ inlineData: p.inlineData }))]);
        const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();

        console.log("🧬 STYLE DNA EXTRACTED successfully.");
        console.log("--------------------------------------------------")

        return text;
    } catch (err: any) {
        logger.error(`Style DNA Extraction Error: ${err.message}`);
        return JSON.stringify({
            typography: { category: "Modern Sans", weight: "Bold", case: "Mixed" },
            layout: { density: "Balanced", alignment: "Left", geometry: "Clean Cards", specialElements: [] },
            visual: { characterStyle: "Minimalist Clay", colors: ["#000000", "#FFFFFF"], vibes: ["Clean"] },
            copy: { tone: "Professional", length: "Short" }
        });
    }
}
