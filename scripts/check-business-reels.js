const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBusinessReels(businessId) {
    try {
        const business = await prisma.business.findUnique({
            where: { id: businessId },
            include: {
                reels: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        });

        if (!business) {
            console.log(`No business found with ID: ${businessId}`);
            return;
        }

        console.log(`Reels for Business: ${business.name} (${business.id})`);
        business.reels.forEach(reel => {
            console.log(`- ID: ${reel.id}`);
            console.log(`  Title: ${reel.title}`);
            console.log(`  State: ${reel.url}`);
            console.log(`  Created: ${reel.createdAt}`);
            console.log('---');
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

const targetId = 'cmjvlvurx0001drjzbkswyo9o';
checkBusinessReels(targetId);
