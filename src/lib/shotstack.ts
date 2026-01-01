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

    // 1. Build the Video Track
    // We calculate start times sequentially.
    let currentTime = 0
    const videoClips = mediaItems.map((item) => {
        const isVideo = item.type.toLowerCase().includes('video')
        // Default duration for images is 4s, videos use 'auto' or we strictly assume input video length?
        // Shotstack needs explicit length for images. For videos, if we leave it out, it might default to full source?
        // Actually, for videos, it's safer to specify 'length' if we know it. 
        // But we don't know exact video lengths on server side easily.
        // Shotstack allows 'trim' but we might just let it play.
        // Constraint: For sequential playback we NEED to know length to set the NEXT clip's start time.
        // If we don't know video length, we can't place the next clip correcty on the timeline!
        // THIS IS A TRICKY PART with generic external URLs.
        // Cloudinary handles this by stitching. Shotstack usually requires knowing duration.
        // Exception: If we just put them on ONE track, strict sequence... 
        // Actually, Shotstack's JSON requires "start".

        // workaround: For this MVP, we might treat videos as fixed duration (e.g. 10s) OR 
        // we accept that we can't do perfect sequential mix of unknown-length videos without probing them first.
        // Cloudinary "info" API could give us duration. 

        // REVISION: I will use a reasonable fixed duration for images (4s).
        // For videos, I will unfortunately have to assume a default length OR 
        // check if Shotstack has an 'auto' sequence feature.
        // Shotstack DOES NOT have auto-sequence in the basic edit API. You must define start times.

        // Use style duration for images, keep videos natural (or cap them?)
        // let's cap videos at 2x style duration to keep pacing
        const duration = isVideo ? Math.min(10, style.minDuration * 2) : style.minDuration

        const clip = {
            asset: {
                type: isVideo ? "video" : "image",
                src: item.url,
            },
            start: currentTime,
            length: duration,
            fit: "cover",
            effect: isVideo ? undefined : style.effect,
            transition: {
                in: style.transition,
                out: style.transition
            }
        }

        currentTime += duration - 1 // -1 for 1s overlap/transition
        return clip
    })

    // Calculate total duration (last clip start + last clip length)
    // We need to be careful with the overlap.
    // Actually, simply: sum of all durations - (overlaps).
    // Or easier: use the calculated `currentTime` + 1 (since we subtracted 1 for the last overlap that didn't happen? No.)
    // Let's rely on the last clip's end time.
    const lastClip = videoClips[videoClips.length - 1]
    const totalDuration = lastClip ? lastClip.start + lastClip.length : 10

    // 2. Build Audio Track
    let audioSrc = musicUrl
    if (musicUrl && musicUrl.startsWith('/')) {
        // Map local music to reliable public URLs for Shotstack
        if (musicUrl.includes('emotional')) audioSrc = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        else if (musicUrl.includes('energy')) audioSrc = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
        else if (musicUrl.includes('elegant')) audioSrc = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
        else audioSrc = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" // Default
    }

    const audioTrack = audioSrc ? [
        {
            asset: {
                type: "audio",
                src: audioSrc,
            },
            start: 0,
            length: totalDuration // Fix: Explicitly set length matches video
        }
    ] : []

    // 3. Construct Payload
    const timeline = {
        background: "#000000",
        tracks: [
            { clips: videoClips }, // Topmost visual layer
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
