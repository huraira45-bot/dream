
/**
 * REGIONAL TRENDING AUDIO DATABASE
 * This map provides real-time trending songs for specific regions.
 * In a production app, this would be fetched from a TikTok/Instagram Trends API.
 */

export const REGIONAL_TRENDS: Record<string, string[]> = {
    "Pakistan": [
        "Asim Azhar - Meri Zindagi Hai Tu",
        "Sabat Batin, Rackstar - Gal Sun",
        "Talha Yunus & Talha Anjum - Dawgs",
        "Talha Anjum - Departure Lane",
        "Amna Riaz - Kya Sach Ho Tum",
        "Naqaabposh - Qabza",
        "Kaifi Khalil - Kahani Suno 2.0",
        "Abdul Hannan - Iraaday",
        "Hasan Raheem - Joona",
        "Ali Sethi - Pasoori"
    ]
}

export function getTrendingSongsForRegion(region: string | null | undefined): string[] {
    // Strictly Pakistan only as per user request
    return REGIONAL_TRENDS["Pakistan"];
}
