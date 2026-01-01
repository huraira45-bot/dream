import { prisma } from "./prisma";
import { REGIONAL_TRENDS } from "./trends";

export async function getTrendingMusicFromDatabase(region: string = "Pakistan"): Promise<string[]> {
    try {
        // 1. Check if we have trends in the DB
        const trends = await prisma.musicTrend.findMany({
            where: { region },
            orderBy: { updatedAt: 'desc' }
        });

        // 2. Check the age of the latest trend
        const now = new Date();
        const staleThreshold = 24 * 60 * 60 * 1000; // 24 hours

        const isStale = trends.length === 0 ||
            (now.getTime() - trends[0].updatedAt.getTime() > staleThreshold);

        if (isStale) {
            console.log(`[TrendsService] Trends for ${region} are stale or missing. Refreshing...`);
            // This is where you'd call a scraper or intensive search
            // For now we'll simulate the "auto-update" by ensuring the DB matches our researched list
            // In a real production environment, this would hit a TikTok/Spotify Scraper API
            await refreshRegionalTrends(region);

            // Re-fetch after refresh
            const updatedTrends = await prisma.musicTrend.findMany({
                where: { region },
                orderBy: { updatedAt: 'desc' }
            });
            return updatedTrends.map(t => t.songTitle);
        }

        return trends.map(t => t.songTitle);
    } catch (error) {
        console.error("[TrendsService] Error fetching trends:", error);
        return REGIONAL_TRENDS[region] || [];
    }
}

async function refreshRegionalTrends(region: string) {
    // These would ideally come from a real-time scraping service
    const currentHits = REGIONAL_TRENDS[region] || [];

    for (const song of currentHits) {
        await prisma.musicTrend.upsert({
            where: {
                region_songTitle: {
                    region,
                    songTitle: song
                }
            },
            update: { updatedAt: new Date() },
            create: {
                region,
                songTitle: song
            }
        });
    }

    console.log(`[TrendsService] Successfully refreshed ${currentHits.length} trends for ${region}`);
}
