import { MusicTrack } from "./music"

export type TransitionType = "fade" | "wipeRight" | "slideRight" | "wipe" | "orbit" | "zoom"
export type EffectType = "zoomIn" | "zoomOut" | "slideLeft" | "slideRight" | "none"

export interface DirectorStyle {
    id: string
    name: string
    description: string
    minDuration: number // seconds for images
    transition: TransitionType
    effect: EffectType
    musicMood: "emotional" | "high-energy" | "elegant"
}

export const DIRECTOR_STYLES: DirectorStyle[] = [
    {
        id: "cinematic",
        name: "Cinematic Story",
        description: "Slow, emotional, and dramatic with smooth crossfades.",
        minDuration: 4,
        transition: "fade",
        effect: "zoomIn",
        musicMood: "emotional"
    },
    {
        id: "hype",
        name: "Fast & Hype",
        description: "Fast-paced, high energy, quick cuts.",
        minDuration: 1.5,
        transition: "wipeRight",
        effect: "zoomOut",
        musicMood: "high-energy"
    },
    {
        id: "modern",
        name: "Modern Clean",
        description: "Balanced pacing with stylish slides.",
        minDuration: 3,
        transition: "slideRight",
        effect: "slideLeft",
        musicMood: "elegant"
    }
]

export function getStyleForVariation(index: number): DirectorStyle {
    // Round-robin selection based on index (0, 1, 2)
    return DIRECTOR_STYLES[index % DIRECTOR_STYLES.length]
}
