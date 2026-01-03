import { logger } from "./logger"

/**
 * Generates a free 3D illustration using Pollinations AI (Flux model).
 * Does not require an API key. Returns a URL that can be used directly.
 */
export async function generateFreeIllustration(
    subject: string,
    mood: string = "Modern"
): Promise<string> {
    // 1. Build a high-quality prompt for the 3D Illustration style
    const baseStyle = "3D character, clean clay illustration style, professional studio lighting, vibrant colors, centered composition, high resolution, soft shadows, minimalist background, 1080x1080 square format";
    const prompt = `${subject}, ${mood} theme, ${baseStyle}`;

    // 2. Pollinations AI URL format: https://pollinations.ai/p/[PROMPT]?width=1080&height=1080&model=flux&seed=[RANDOM]
    const encodedPrompt = encodeURIComponent(prompt);
    const seed = Math.floor(Math.random() * 1000000);
    const pollinationsUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1080&height=1080&model=flux&seed=${seed}`;

    logger.info(`🎨 Generated Illustration URL: ${pollinationsUrl}`);

    // Note: We don't necessarily need to fetch/upload here because the Native Brand Engine 
    // will fetch it during the ImageResponse render.
    return pollinationsUrl;
}
