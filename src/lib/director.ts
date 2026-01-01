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

export const STYLES_CONFIG = {
    cinematic: {
        name: "Cinematic Story",
        description: "Slow, emotional, and dramatic.",
        minDuration: 4,
        transitions: ["fade", "zoom"],
        effects: ["zoomIn", "zoomOut"],
        mood: "emotional"
    },
    hype: {
        name: "Fast & Hype",
        description: "Fast-paced, high energy.",
        minDuration: 1.5,
        transitions: ["wipeRight", "wipe", "zoom"],
        effects: ["zoomOut", "zoomIn"],
        mood: "high-energy"
    },
    modern: {
        name: "Modern Clean",
        description: "Balanced pacing with stylish slides.",
        minDuration: 3,
        transitions: ["slideRight", "wipeRight"],
        effects: ["slideLeft", "slideRight"],
        mood: "elegant"
    }
}

export function getStyleForVariation(index: number): DirectorStyle {
    const keys = Object.keys(STYLES_CONFIG) as Array<keyof typeof STYLES_CONFIG>
    const key = keys[index % keys.length]
    const config = STYLES_CONFIG[key]

    // "Intelligent Agent" -> Randomize the specific transition/effect for this run
    return {
        id: key,
        name: config.name,
        description: config.description,
        minDuration: config.minDuration,
        transition: config.transitions[Math.floor(Math.random() * config.transitions.length)] as TransitionType,
        effect: config.effects[Math.floor(Math.random() * config.effects.length)] as EffectType,
        musicMood: config.mood as any
    }
}
