export interface MusicTrack {
    id: string
    name: string
    url: string
    mood: string
}

export const MUSIC_LIBRARY: MusicTrack[] = [
    {
        id: "emotional-piano",
        name: "Emotional Inspiration",
        url: "https://cdn.pixabay.com/audio/2023/10/24/audio_3d1f1f1d1f.mp3",
        mood: "Emotional"
    },
    {
        id: "trendy-upbeat",
        name: "Modern Trendy",
        url: "https://cdn.pixabay.com/audio/2022/10/18/audio_313689f7a7.mp3",
        mood: "Trendy"
    },
    {
        id: "premium-cinematic",
        name: "Luxury Cinematic",
        url: "https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a1b1a1.mp3",
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
