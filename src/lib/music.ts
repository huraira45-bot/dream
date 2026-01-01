export interface MusicTrack {
    id: string
    name: string
    url: string
    mood: string
}

export const MUSIC_LIBRARY: MusicTrack[] = [
    {
        id: "phonk-1",
        name: "Viral Phonk (Gym/Cars)",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", // Placeholder for High Energy
        mood: "phonk"
    },
    {
        id: "lofi-1",
        name: "Morning Coffee (Lo-Fi)",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3", // Placeholder for Chill
        mood: "lofi"
    },
    {
        id: "luxury-1",
        name: "Real Estate Luxury",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", // Placeholder for Elegant
        mood: "luxury"
    },
    {
        id: "pop-1",
        name: "Summer Pop",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        mood: "pop"
    }
]

export function getMusicForMood(mood: string): MusicTrack {
    const moodLower = mood.toLowerCase()

    // Exact Viral Matches
    if (moodLower.includes('phonk') || moodLower.includes('gym') || moodLower.includes('car')) return MUSIC_LIBRARY.find(t => t.mood === 'phonk') || MUSIC_LIBRARY[1]
    if (moodLower.includes('lofi') || moodLower.includes('cafe') || moodLower.includes('relax')) return MUSIC_LIBRARY.find(t => t.mood === 'lofi') || MUSIC_LIBRARY[0]
    if (moodLower.includes('luxury') || moodLower.includes('estate') || moodLower.includes('fashion')) return MUSIC_LIBRARY.find(t => t.mood === 'luxury') || MUSIC_LIBRARY[2]

    // Legacy Fallbacks
    if (moodLower.includes('emotional') || moodLower.includes('story')) return MUSIC_LIBRARY.find(t => t.mood === 'pop') || MUSIC_LIBRARY[0]
    if (moodLower.includes('energy') || moodLower.includes('trend')) return MUSIC_LIBRARY.find(t => t.mood === 'phonk') || MUSIC_LIBRARY[1]

    // Default to trendy Phonk/Pop
    return MUSIC_LIBRARY[0]
}
