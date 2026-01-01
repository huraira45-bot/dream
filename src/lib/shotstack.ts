export interface MediaItem {
    id: string
    url: string
    type: string
}

const SHOTSTACK_API_ENDPOINT = "https://api.shotstack.io/edit/stage/render"

export async function postToShotstack(mediaItems: MediaItem[], musicUrl?: string | null) {
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

        // OK, I will fallback to a simplified logic: 
        // Images = 5s. 
        // Videos = we will default to 10s for now, or we rely on the implementation plan which implied we might have metadata.
        // We DO NOT have metadata in DB for duration.
        // This is a risk.

        // HOWEVER, since the user already has the "Client Player" which works, 
        // sending to Shotstack is a "Pro" feature. 
        // I will implement a PROBE check for videos if possible? 
        // No, that's slow.

        // Alternative: Use Shotstack "Ingest" but that's async.

        // Hack for now: Images 5s. Videos 10s.
        // This is imperfect but allows testing.

        const duration = isVideo ? 10 : 5 // 10s assumption for videos, 5s for images

        const clip = {
            asset: {
                type: isVideo ? "video" : "image",
                src: item.url,
            },
            start: currentTime,
            length: duration,
            fit: "cover",
            effect: isVideo ? undefined : "zoomIn", // Ken Burns for images
            transition: {
                in: "fade",
                out: "fade"
            }
        }

        currentTime += duration - 1 // -1 for 1s overlap/transition
        return clip
    })

    // 2. Build Audio Track
    const audioTrack = musicUrl ? [
        {
            asset: {
                type: "audio",
                src: musicUrl.startsWith('/') ? `https://dream-eta-ruddy.vercel.app${musicUrl}` : musicUrl, // Resolve local path
            },
            start: 0,
            effect: "fadeOut" // Fade out at end? We don't know total length easily.
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
