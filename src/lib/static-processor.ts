export interface MediaItem {
    id: string
    url: string
    type: string
}

const SHOTSTACK_API_ENDPOINT = "https://api.shotstack.io/edit/stage/render"

export async function renderStaticPost(
    mediaUrl: string,
    branding: { primary: string, secondary: string, accent: string },
    metadata: { hook: string, title?: string, fontFamily?: string }
) {
    const apiKey = process.env.SHOTSTACK_API_KEY
    if (!apiKey) throw new Error("SHOTSTACK_API_KEY missing")

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

    const payload = {
        timeline: {
            background: branding.primary || "#000000",
            tracks: [
                {
                    clips: [
                        {
                            asset: {
                                type: "text",
                                text: metadata.hook.toUpperCase(),
                                font: {
                                    family: fontFamily,
                                    size: 48,
                                    color: branding.accent || "#ffffff"
                                },
                                alignment: {
                                    horizontal: "center",
                                    vertical: "center"
                                }
                            },
                            start: 0,
                            length: 1
                        }
                    ]
                },
                {
                    clips: [
                        {
                            asset: {
                                type: "image",
                                src: mediaUrl
                            },
                            start: 0,
                            length: 1,
                            fit: "cover",
                            opacity: 0.6
                        }
                    ]
                }
            ]
        },
        output: {
            format: "jpg",
            size: {
                width: 1080,
                height: 1080
            }
        }
    }

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
        throw new Error(`Shotstack Static Error: ${JSON.stringify(err)}`)
    }

    const data = await res.json()
    return data.response
}
