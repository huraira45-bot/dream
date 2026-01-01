import { MusicTrack } from "./music"

export type TransitionType = "fade" | "wipeRight" | "wipeLeft" | "slideRight" | "slideLeft"
export type EffectType = "zoomIn" | "zoomOut" | "slideLeft" | "slideRight" | "none"

export interface DirectorStyle {
    id: string
    name: string
    description: string
    minDuration: number // seconds for images
    transition: TransitionType
    effect: EffectType
    musicMood: "emotional" | "high-energy" | "elegant"
    // Director 2.0 Enhancements
    saturation?: number
    brightness?: number
    textOverlay?: boolean
    audioDucking?: boolean
}

export const STYLES_CONFIG = {
    cinematic: {
        name: "Cinematic Story",
        description: "Slow, emotional, and high-end aesthetic.",
        minDuration: 4,
        transitions: ["fade", "slideRight"],
        effects: ["zoomIn", "zoomOut"],
        mood: "emotional",
        saturation: 1.1,
        brightness: 1.05,
        textOverlay: true,
        audioDucking: true,
        preferredFonts: ["Bodoni Moda", "Playfair Display"]
    },
    hype: {
        name: "Fast & Hype",
        description: "Fast-paced, high energy, bold visuals.",
        minDuration: 2.0,
        transitions: ["wipeRight", "wipeLeft"],
        effects: ["zoomOut", "zoomIn"],
        mood: "high-energy",
        saturation: 1.4,
        brightness: 1.15,
        textOverlay: true,
        audioDucking: true,
        preferredFonts: ["Syne", "Anton", "Archivo Black"]
    },
    modern: {
        name: "Modern Clean",
        description: "Minimalist, sleek, and trend-focused.",
        minDuration: 3.5,
        transitions: ["slideRight", "slideLeft"],
        effects: ["slideLeft", "slideRight"],
        mood: "elegant",
        saturation: 1.0,
        brightness: 1.0,
        textOverlay: true,
        audioDucking: true,
        preferredFonts: ["Space Grotesk", "Outfit", "Montserrat"]
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
        musicMood: config.mood as any,
        saturation: (config as any).saturation,
        brightness: (config as any).brightness,
        textOverlay: (config as any).textOverlay,
        audioDucking: (config as any).audioDucking
    }
}
