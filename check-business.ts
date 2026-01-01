
import { prisma } from "./src/lib/prisma"

async function main() {
    const businessId = "cmjtuoo4u000019bamsszvetg"
    console.log(`Checking Business: ${businessId}`)

    const business = await prisma.business.findUnique({
        where: { id: businessId },
        include: {
            reels: true,
            mediaItems: {
                select: { id: true, type: true, processed: true, url: true }
            }
        }
    })

    if (!business) {
        console.log("Business not found.")
        return
    }

    console.log(`Name: ${business.name}`)
    console.log(`Media Items: ${business.mediaItems.length} (${business.mediaItems.filter(m => m.processed).length} processed)`)

    console.log("\n--- Generated Reels ---")
    business.reels.forEach(reel => {
        console.log(`ID: ${reel.id}`)
        console.log(`Type: ${reel.type}`)
        console.log(`Title: ${reel.title}`)
        console.log(`Status/URL: ${reel.url}`)
        console.log(`Music: ${reel.musicUrl}`)
        console.log("-----------------------")
    })
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect())
