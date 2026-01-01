const SHOTSTACK_API_ENDPOINT = "https://api.shotstack.io/edit/stage/render";
const apiKey = "q2sv9htLGddiAlNmFXdEkD02mYdkTB6uRfUNzKA8";

const payload = {
    timeline: {
        background: "#000000",
        soundtrack: {
            src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            effect: "fadeInFadeOut"
        },
        tracks: [
            { clips: [] }, // Empty track test
            {
                clips: [
                    {
                        asset: {
                            type: "image",
                            src: "https://images.unsplash.com/photo-1542362567-b05503f3f5f4?w=800"
                        },
                        start: 0,
                        length: 5,
                        fit: "contain"
                    }
                ]
            }
        ]
    },
    output: {
        format: "mp4",
        resolution: "sd"
    }
};

async function test() {
    console.log("Testing Shotstack Empty Track Payload...");

    try {
        const res = await fetch(SHOTSTACK_API_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log("RESPONSE STATUS:", res.status);
        if (res.status !== 201 && res.status !== 200) {
            console.log("ERROR DETAILS:", JSON.stringify(data, null, 2));
        } else {
            console.log("SUCCESS!", data.response.id);
        }
    } catch (err) {
        console.error("FETCH ERROR:", err);
    }
}

test();
