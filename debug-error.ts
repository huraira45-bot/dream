
import { prisma } from "./src/lib/prisma"

async function main() {
    console.log("Fetching latest failed errors...")
    const reels = await prisma.generatedReel.findMany({
        where: {
            url: {
                startsWith: "failed"
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 3
    })

    reels.forEach(r => {
        console.log(`[${r.createdAt.toISOString()}] ${r.title}`)
        console.log(`URL: ${r.url}`)
        console.log("--------------------------------------------------")
    })
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect())
