import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"
import "dotenv/config"

const prisma = new PrismaClient()

async function main() {
    const password = await hash("admin123", 12)
    const user = await prisma.user.upsert({
        where: { email: "admin@example.com" },
        update: {},
        create: {
            email: "admin@example.com",
            password,
        },
    })
    console.log({ user })

    const business = await prisma.business.upsert({
        where: { slug: "demo-cafe" },
        update: {},
        create: {
            name: "Demo Cafe",
            slug: "demo-cafe",
        }
    })
    console.log({ business })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
