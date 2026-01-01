import { getTrendingMusicFromDatabase } from "./trends-service";

export const REGIONAL_TRENDS: Record<string, string[]> = {
    "Pakistan": [
        "Maanu & Annural Khalid - Jhol",
        "Afusic & Ali Soomro - Pal Pal",
        "Asim Azhar - Meri Zindagi Hai Tu",
        "Zain Zohaib - Ranjheya Ve",
        "Ali & Shjr - Heer",
        "Hasan Raheem, Umair & Talwiinder - Wishes",
        "Talha Anjum & Umair - Departure Lane",
        "Faheem Abdullah - Ishq",
        "Bayaan & Hasan Raheem - Maand",
        "Abdul Hannan - Bikhra",
        "Asim Azhar - Baat",
        "Kaifi Khalil - Kahani Suno 2.0"
    ]
}

export async function getTrendingSongsForRegion(region: string | null | undefined): Promise<string[]> {
    const targetRegion = region || "Pakistan";
    return await getTrendingMusicFromDatabase(targetRegion);
}
