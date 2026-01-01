const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const businessId = 'cmjtuoo4u000019bamsszvetg';
    const media = await prisma.mediaItem.findMany({
        where: { businessId },
        take: 5
    });
    console.log(JSON.stringify(media, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
