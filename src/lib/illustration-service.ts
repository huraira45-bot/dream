import { logger } from "./logger"

/**
 * Generates a free 3D illustration using Pollinations AI (Flux model).
 * Does not require an API key. Returns a URL that can be used directly.
 */
export async function generateFreeIllustration(
    subject: string,
    mood: string = "Modern",
    characterStyle: string = "3D character illustration"
): Promise<string> {
    // 1. Build a high-quality prompt for the 3D Illustration style
    // We emphasize the "characterStyle" requested by the DNA Profiler
    const baseStyle = `${characterStyle}, clean professional 3D render, Disney/Pixar style quality, studio lighting, vibrant colors, centered composition, soft shadows, solid minimalist background, 1080x1080 square format`;

    // Specifically handle the "delivery" or "scooter" context if hinted
    let refinedSubject = subject || "Modern professional brand illustration";
    if (refinedSubject.toLowerCase().includes("delivery")) {
        refinedSubject = `${refinedSubject} on a yellow 3D scooter, happy professional pose`;
    }

    const prompt = `${refinedSubject}, ${mood} theme, ${baseStyle}`;

    // 2. Pollinations AI URL format
    const encodedPrompt = encodeURIComponent(prompt);
    const seed = Math.floor(Math.random() * 1000000);
    const pollinationsUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1080&height=1080&model=flux&seed=${seed}`;

    logger.info(`🎨 Generated Mimetic Illustration URL: ${pollinationsUrl}`);

    // Note: We don't necessarily need to fetch/upload here because the Native Brand Engine 
    // will fetch it during the ImageResponse render.
    return pollinationsUrl;
}
