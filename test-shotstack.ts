
import { postToShotstack } from "./src/lib/shotstack"
import { DIRECTOR_STYLES } from "./src/lib/director"

// Mock Media Items
const mockMediaItems = [
    { id: "1", type: "image", url: "https://res.cloudinary.com/demo/image/upload/sample.jpg" },
    { id: "2", type: "image", url: "https://res.cloudinary.com/demo/image/upload/cld-sample.jpg" }
]

// Mock Music
const mockMusic = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"

async function test() {
    console.log("Testing Shotstack Integration...")
    console.log(`API Endpoint: https://api.shotstack.io/edit/stage/render`)

    // Set env var manually for this test if needed, or rely on .env
    // process.env.SHOTSTACK_API_KEY = "..." 

    for (const style of DIRECTOR_STYLES) {
        console.log(`\nTesting Style: ${style.name} (Transition: ${style.transition}, Effect: ${style.effect})`)
        try {
            const response = await postToShotstack(mockMediaItems, mockMusic, style)
            console.log("SUCCESS!")
            console.log("Render ID:", response.id)
        } catch (e: any) {
            console.error("FAILURE:")
            console.log(e.message || JSON.stringify(e))
        }
    }
}

test()
