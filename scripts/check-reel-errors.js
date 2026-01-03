const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const reels = await prisma.generatedReel.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            url: true,
            title: true,
            createdAt: true
        }
    })

    console.log(JSON.stringify(reels, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
