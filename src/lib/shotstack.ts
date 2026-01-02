export interface MediaItem {
    id: string
    url: string
    type: string
}

import { DirectorStyle } from "./director"

const SHOTSTACK_API_ENDPOINT = "https://api.shotstack.io/edit/stage/render"

export async function postToShotstack(mediaItems: MediaItem[], musicUrl: string | null, style: DirectorStyle, metadata?: any) {
    const apiKey = process.env.SHOTSTACK_API_KEY
    if (!apiKey) {
        throw new Error("SHOTSTACK_API_KEY is not configured")
    }

    console.log("--------------------------------------------------")
    console.log("🤖 AGENT: THE EDITOR (Shotstack)")
    console.log(`Action: Rendering "${metadata?.title || 'Untitled'}" with style "${style.name}"...`)

    // 1. Build the Video Tracks (Background & Foreground)
    let currentTime = 0
    const bgClips: any[] = []
    const fgClips: any[] = []
    const textClips: any[] = []

    // 0. Viral Hook (Attention Grabber - Stylist Upgrade)
    if (metadata?.hook) {
        const fontMapping: { [key: string]: string } = {
            "montserrat": "montserrat",
            "bebas neue": "bebas-neue",
            "permanent marker": "permanent-marker",
            "playfair display": "playfair-display",
            "roboto": "roboto",
            "anton": "anton",
            "fredoka one": "fredoka-one",
            "outfit": "outfit"
        }
        const requestedFont = (metadata.fontFamily || "montserrat").toLowerCase().trim();
        const fontFamily = fontMapping[requestedFont] || "montserrat";

        textClips.push({
            asset: {
                type: "text",
                text: metadata.hook.toUpperCase(),
                font: {
                    family: fontFamily,
                    size: 42,
                    color: metadata.fontColor || "#ffffff"
                },
                alignment: {
                    horizontal: "center",
                    vertical: "center"
                }
            },
            start: 0,
            length: 3.0,
            transition: { in: "zoom", out: "fade" }
        })
    }

    mediaItems.forEach((item, index) => {
        const isVideo = item.type.toLowerCase().includes('video')
        const duration = isVideo ? Math.min(6, style.minDuration * 1.5) : style.minDuration

        // Background Clip (Premium Blurred Backdrop)
        bgClips.push({
            asset: {
                type: isVideo ? "video" : "image",
                src: item.url,
                ...(isVideo && { volume: 0 })
            },
            start: currentTime,
            length: duration,
            fit: "cover",
            scale: 4.5, // Extreme zoom for bokeh effect
            filter: "blur", // Shotstack built-in blur
            opacity: 0.2, // Darken even more to make foreground pop
            transition: { in: "fade", out: "fade" }
        })

        // Foreground Clip
        const transitionType = metadata?.transitionType || style.transition
        const fgClip: any = {
            asset: {
                type: isVideo ? "video" : "image",
                src: item.url,
                ...(isVideo && { volume: (style.audioDucking ? 1 : 0) })
            },
            start: currentTime,
            length: duration,
            fit: "contain",
            transition: { in: transitionType, out: transitionType }
        }

        const effectType = metadata?.effectType || style.effect
        if (!isVideo && effectType && effectType !== "none") {
            fgClip.effect = effectType
        }

        if (style.saturation && style.saturation > 1.2) {
            fgClip.filter = "boost"
        }

        fgClips.push(fgClip)

        // TEXT OVERLAYS (Stylist & Director Upgrade)
        if (style.textOverlay && index % 2 === 0) {
            const displayText = (index === 0 && metadata?.title) ? metadata.title : `#${index + 1}`
            textClips.push({
                asset: {
                    type: "text",
                    text: displayText,
                    font: {
                        family: "montserrat",
                        size: 30,
                        color: metadata.fontColor || "#ffffff"
                    },
                    alignment: {
                        horizontal: "center",
                        vertical: (metadata.textPosition === "center" || metadata.textPosition === "top" || metadata.textPosition === "bottom") ? metadata.textPosition : "bottom"
                    }
                },
                start: currentTime + (duration / 4),
                length: duration / 2,
                position: (metadata.textPosition === "bottom" || metadata.textPosition === "top" || metadata.textPosition === "center") ? metadata.textPosition : "bottom",
                offset: metadata.textPosition === "center" ? { y: 0 } : (metadata.textPosition === "top" ? { y: -0.3 } : { y: 0.15 }),
                transition: { in: "fade", out: "fade" }
            })
        }

        currentTime += duration
    })

    const lastClip = fgClips[fgClips.length - 1]
    const totalDuration = lastClip ? lastClip.start + lastClip.length : 10

    // 2. Global Soundtrack (Cleaner than a track)
    const soundtrack = {
        src: musicUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        effect: "fadeInFadeOut"
    }

    // 3. Construct Payload
    const tracks = [
        { clips: textClips },
        { clips: fgClips },
        { clips: bgClips }
    ].filter(track => track.clips.length > 0)

    const timeline = {
        background: "#000000",
        soundtrack,
        tracks
    }

    const output = {
        format: "mp4",
        size: {
            width: 1080,
            height: 1920
        }
    }

    const payload = {
        timeline,
        output
    }

    // 4. Send to API
    const res = await fetch(SHOTSTACK_API_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey
        },
        body: JSON.stringify(payload)
    })

    if (!res.ok) {
        const err = await res.json()
        throw new Error(`Shotstack API Error: ${JSON.stringify(err)}`)
    }

    const data = await res.json()
    // data.response.id is the render ID.
    // data.response.message is "Render Successfully Queued"
    return data.response
}

export async function getRenderStatus(renderId: string) {
    const apiKey = process.env.SHOTSTACK_API_KEY
    if (!apiKey) throw new Error("No API Key")

    const res = await fetch(`${SHOTSTACK_API_ENDPOINT}/${renderId}`, {
        headers: {
            "x-api-key": apiKey
        }
    })

    if (!res.ok) {
        throw new Error("Failed to check status")
    }

    const data = await res.json()
    return data.response
}
