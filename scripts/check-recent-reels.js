const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkReels() {
    const reels = await prisma.reel.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
            business: true,
        }
    });

    console.log('--- RECENT REELS ---');
    reels.forEach(r => {
        console.log(`[${r.createdAt.toISOString()}] Business: ${r.business.name} | Status: ${r.status} | ID: ${r.id} | RenderID: ${r.renderId}`);
    });

    const processing = reels.filter(r => r.status === 'processing' || r.status === 'queued');
    console.log(`\nFound ${processing.length} reels in processing/queued state.`);
}

checkReels()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
