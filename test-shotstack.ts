
import { postToShotstack } from "./src/lib/shotstack"
import { getStyleForVariation } from "./src/lib/director"

// Mock Media Items
const mockMediaItems = [
    { id: "1", type: "image", url: "https://res.cloudinary.com/demo/image/upload/sample.jpg" },
    { id: "2", type: "image", url: "https://res.cloudinary.com/demo/image/upload/cld-sample.jpg" }
]

// Mock Music
const mockMusic = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"

async function test() {
    console.log("Testing Shotstack Integration (Intelligent Director)...")
    console.log("---------------------------------------------------")

    for (let i = 0; i < 3; i++) {
        // This will pick a random variation of the style
        const style = getStyleForVariation(i)
        console.log(`\nTesting Style ${i}: [${style.name}]`)
        console.log(`- Transition: ${style.transition}`)
        console.log(`- Effect: ${style.effect}`)

        try {
            const response = await postToShotstack(mockMediaItems, mockMusic, style)
            console.log("SUCCESS! Render ID:", response.id)
        } catch (e: any) {
            console.error("FAILURE:")
            console.log(e.message || JSON.stringify(e))
        }
    }
}

test()
