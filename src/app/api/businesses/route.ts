import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const { name, slug, region } = await req.json()

        if (!name || !slug) {
            return new NextResponse("Name and Slug are required", { status: 400 })
        }

        const existing = await prisma.business.findUnique({
            where: { slug },
        })

        if (existing) {
            return new NextResponse("Slug already exists", { status: 409 })
        }

        const business = await prisma.business.create({
            data: {
                name,
                slug,
                region: region || "Global"
            },
        })

        return NextResponse.json(business)
    } catch (error) {
        console.error(error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
