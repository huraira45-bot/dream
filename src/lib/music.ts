export interface MusicTrack {
    id: string
    name: string
    url: string
    mood: string
}

export const MUSIC_LIBRARY: MusicTrack[] = [
    {
        id: "emotional-piano",
        name: "Heartfelt Story",
        url: "https://www.chosic.com/wp-content/uploads/2021/04/Emotional-Piano-Music.mp3", // Demo link, should be replaced with stable CDN in prod
        mood: "Emotional"
    },
    {
        id: "trendy-pop",
        name: "Viral Energy",
        url: "https://www.chosic.com/wp-content/uploads/2021/07/Upbeat-Pop.mp3",
        mood: "Trendy"
    },
    {
        id: "premium-lounge",
        name: "Luxury Living",
        url: "https://www.chosic.com/wp-content/uploads/2021/09/Cinematic-Luxury.mp3",
        mood: "Premium"
    }
]

export function getMusicForMood(mood: string): MusicTrack {
    const moodLower = mood.toLowerCase()
    if (moodLower.includes('emotional') || moodLower.includes('story')) return MUSIC_LIBRARY[0]
    if (moodLower.includes('energy') || moodLower.includes('trend')) return MUSIC_LIBRARY[1]
    if (moodLower.includes('premium') || moodLower.includes('elegant') || moodLower.includes('class')) return MUSIC_LIBRARY[2]

    // Default to trendy
    return MUSIC_LIBRARY[1]
}
