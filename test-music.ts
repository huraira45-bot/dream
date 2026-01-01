
import { getMusicForMood, MUSIC_LIBRARY } from "./src/lib/music"

function assert(condition: boolean, message: string) {
    if (!condition) {
        console.error(`❌ FAIL: ${message}`)
        process.exit(1)
    } else {
        console.log(`✅ PASS: ${message}`)
    }
}

console.log("Testing AI Music Matching Logic...")
console.log("----------------------------------")

// 1. Test "Phonk" / Gym
const gymTrack = getMusicForMood("Gym Content")
assert(gymTrack.mood === "phonk", `Gym should return Phonk. Got: ${gymTrack.mood}`)
assert(gymTrack.url.includes("Song-8"), `Phonk should be Song-8 (High Energy).`)

// 2. Test "Lo-Fi" / Cafe
const cafeTrack = getMusicForMood("Morning Cafe Art")
assert(cafeTrack.mood === "lofi", `Cafe should return LoFi. Got: ${cafeTrack.mood}`)

// 3. Test "Luxury" / Real Estate
const luxuryTrack = getMusicForMood("Luxury Real Estate Tour")
assert(luxuryTrack.mood === "luxury", `Real Estate should return Luxury. Got: ${luxuryTrack.mood}`)

// 4. Test Fallback
const unknownTrack = getMusicForMood("Random Vibe")
assert(unknownTrack.url.length > 0, "Fallback should return valid track")

console.log("\nAll Logic Verified!")
