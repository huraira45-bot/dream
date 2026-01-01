
/**
 * AUDIO FINDER SERVICE
 * Logic:
 * 1. Search for a song title on YouTube.
 * 2. Convert to MP3 using a RapidAPI service.
 * 3. Return a direct URL for Shotstack to consume.
 */

interface SearchResult {
    id: string;
    title: string;
    duration: string;
}

import { scrapeAndUploadAudio } from './scraper'

export async function findAndConvertAudio(query: string): Promise<string | null> {
    try {
        console.log(`[AudioFinder] Searching for: ${query}`);

        // Use our own custom scraper
        const url = await scrapeAndUploadAudio(query);

        if (url) {
            console.log(`[AudioFinder] Successfully extracted: ${url}`);
            return url;
        }

        return null;
    } catch (error) {
        console.error("[AudioFinder] Error:", error);
        return null;
    }
}
