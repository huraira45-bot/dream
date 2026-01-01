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
        textClips.push({
            asset: {
                type: "text",
                text: metadata.hook.toUpperCase(),
                font: {
                    family: (metadata.fontFamily || "montserrat").toLowerCase().trim().replace(/\s+/g, '-'),
                    size: 42,
                    color: metadata.fontColor || "#ffffff"
                },
                alignment: {
                    horizontal: "center",
                    vertical: "center"
                },
                background: {
                    color: metadata.textBackgroundColor || "#ff0000",
                    padding: 0.1,
                    opacity: 1
                }
            },
            start: 0,
            length: 3.0, // Increased duration for readability
            transition: { in: "zoom", out: "fade" }
        })
    }

    mediaItems.forEach((item, index) => {
        const isVideo = item.type.toLowerCase().includes('video')
        const duration = isVideo ? Math.min(6, style.minDuration * 1.5) : style.minDuration

        // Background Clip
        // Background Clip (Blurred & Dynamic)
        bgClips.push({
            asset: {
                type: isVideo ? "video" : "image",
                src: item.url,
                ...(isVideo && { volume: 0 })
            },
            start: currentTime,
            length: duration,
            fit: "cover",
            scale: 1.5, // Zoom in more to lose edges
            filter: "blur", // Corrected from 'effect: blurLight'
            opacity: 1.0, // Full visibility for the blur to work
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
                        family: metadata.fontFamily?.toLowerCase() || "montserrat",
                        size: 30,
                        color: metadata.fontColor || "#ffffff"
                    },
                    background: {
                        color: metadata.textBackgroundColor || "#000000",
                        padding: 0.05,
                        opacity: 0.8
                    }
                },
                start: currentTime + (duration / 4),
                length: duration / 2,
                position: metadata.textPosition || "bottom",
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
        resolution: "sd"
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
