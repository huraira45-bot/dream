export interface MusicTrack {
    id: string
    name: string
    url: string
    mood: string
}

export const MUSIC_LIBRARY: MusicTrack[] = [
    {
        id: "emotional-1",
        name: "Emotional Inspiration",
        url: "/music/emotional-1.mp3",
        mood: "emotional"
    },
    {
        id: "high-energy-1",
        name: "High Energy Vibes",
        url: "/music/high-energy-1.mp3",
        mood: "high-energy"
    },
    {
        id: "elegant-1",
        name: "Elegant Flow",
        url: "/music/elegant-1.mp3",
        mood: "elegant"
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
