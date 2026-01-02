const { PrismaClient } = require('./src/generated/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const reels = await prisma.generatedReel.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: {
                id: true,
                title: true,
                url: true,
                createdAt: true
            }
        });
        console.log('REEL_STATUS_START');
        console.log(JSON.stringify(reels, null, 2));
        console.log('REEL_STATUS_END');
    } catch (e) {
        console.error('DATABASE_ERROR:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
