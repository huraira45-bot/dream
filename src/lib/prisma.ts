import { PrismaClient } from "@prisma/client"
import path from "path"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const isProduction = process.env.NODE_ENV === "production"
const databaseUrl = process.env.DATABASE_URL

// For SQLite on Vercel/Production, we ensure the path is absolute relative to root
const getPrismaClient = () => {
    if (databaseUrl?.startsWith("file:")) {
        const relativePath = databaseUrl.replace("file:", "")
        // If it's a relative path like "./dev.db" or "dev.db"
        if (!path.isAbsolute(relativePath)) {
            const absolutePath = path.join(process.cwd(), "prisma", "dev.db")
            return new PrismaClient({
                datasources: {
                    db: {
                        url: `file:${absolutePath}`
                    }
                }
            })
        }
    }
    return new PrismaClient()
}

export const prisma = globalForPrisma.prisma || getPrismaClient()

if (!isProduction) globalForPrisma.prisma = prisma
