export interface MediaItem {
    id: string
    url: string
    type: string
}

import { DirectorStyle } from "./director"

const SHOTSTACK_API_ENDPOINT = "https://api.shotstack.io/edit/stage/render"

export async function postToShotstack(mediaItems: MediaItem[], musicUrl: string | null, style: DirectorStyle) {
    const apiKey = process.env.SHOTSTACK_API_KEY
    if (!apiKey) {
        throw new Error("SHOTSTACK_API_KEY is not configured")
    }

    // 1. Build the Video Tracks (Background & Foreground)
    let currentTime = 0
    const bgClips: any[] = []
    const fgClips: any[] = []

    mediaItems.forEach((item) => {
        const isVideo = item.type.toLowerCase().includes('video')
        // Cap video duration to safeguard pacing
        const duration = isVideo ? Math.min(10, style.minDuration * 2) : style.minDuration

        // Background Clip (Fill the screen, dimmed)
        bgClips.push({
            asset: {
                type: isVideo ? "video" : "image",
                src: item.url,
                ...(isVideo && { volume: 0 }) // Only add volume for videos
            },
            start: currentTime,
            length: duration,
            fit: "cover",
            opacity: 0.3, // Dimmed background
            scale: 1.2, // Slight zoom to avoid edge artifacts
            transition: {
                in: "fade",
                out: "fade"
            }
        })

        // Foreground Clip (The actual content)
        fgClips.push({
            asset: {
                type: isVideo ? "video" : "image",
                src: item.url,
                ...(isVideo && { volume: 0 }) // Only add volume for videos
            },
            start: currentTime,
            length: duration,
            fit: "contain", // Never stretch or cut
            effect: isVideo ? undefined : style.effect,
            transition: {
                in: style.transition,
                out: style.transition
            }
        })

        currentTime += duration - 1 // -1 for 1s overlap/transition
    })

    const lastClip = fgClips[fgClips.length - 1]
    const totalDuration = lastClip ? lastClip.start + lastClip.length : 10

    // 2. Build Audio Track
    // ... (rest of audio logic matches existing, just ensure we copy it right if replacing)
    let audioSrc = musicUrl
    if (musicUrl && musicUrl.startsWith('/')) {
        if (musicUrl.includes('emotional')) audioSrc = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        else if (musicUrl.includes('energy')) audioSrc = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
        else if (musicUrl.includes('elegant')) audioSrc = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
        else audioSrc = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    }

    const audioTrack = audioSrc ? [
        {
            asset: {
                type: "audio",
                src: audioSrc,
            },
            start: 0,
            length: totalDuration
        }
    ] : []

    // 3. Construct Payload
    const timeline = {
        background: "#000000",
        tracks: [
            { clips: fgClips }, // Topmost visual layer (Foreground)
            { clips: bgClips }, // Middle layer (Background)
            { clips: audioTrack }  // Audio layer
        ]
    }

    const output = {
        format: "mp4",
        resolution: "sd" // Save credits, use "hd" for production
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
