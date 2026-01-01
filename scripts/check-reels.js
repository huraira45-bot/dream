const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPendingReels() {
    try {
        const reels = await prisma.generatedReel.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
        });

        console.log('Recent Reels Status:');
        reels.forEach(reel => {
            console.log(`ID: ${reel.id} | Title: ${reel.title} | Status: ${reel.url} | Created: ${reel.createdAt}`);
        });
    } catch (error) {
        console.error('Error fetching reels:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkPendingReels();
