import { configCloudinary } from './cloudinary'

/**
 * CUSTOM AUDIO SCRAPER (ITUNES ENGINE)
 * Logic:
 * 1. Search the official iTunes Public API for the track.
 * 2. Get the high-quality 30s preview URL (Ideal for Reels).
 * 3. Persist to Cloudinary for a stable render URL.
 * 4. Return the secure URL.
 */

export async function scrapeAndUploadAudio(query: string): Promise<string | null> {
    try {
        console.log(`[Scraper] Searching for: ${query}`)

        // 1. Search iTunes (Fast, legal, stable, no keys)
        const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&limit=1&entity=song`;
        const response = await fetch(searchUrl);
        const data = await response.json() as any;

        const track = data.results[0];

        if (!track || !track.previewUrl) {
            console.warn(`[Scraper] No iTunes results found for: ${query}`)
            return null
        }

        console.log(`[Scraper] Found matching track: ${track.trackName} by ${track.artistName}`)

        // 2. Upload to Cloudinary (Persistence)
        const cloud = configCloudinary();

        return new Promise((resolve, reject) => {
            cloud.uploader.upload(track.previewUrl, {
                resource_type: 'video',
                folder: 'dream_audio_trends',
                public_id: `trend_${Date.now()}`,
                format: 'mp3' // Cloudinary will transcode to mp3 for max compatibility
            }, (error: any, result: any) => {
                if (error) {
                    console.error("[Scraper] Cloudinary Error:", error)
                    reject(error)
                } else {
                    console.log("[Scraper] Audio persisted to Cloudinary:", result?.secure_url)
                    resolve(result?.secure_url || null)
                }
            })
        })

    } catch (error) {
        console.error("[Scraper] Global Error:", error)
        return null
    }
}
