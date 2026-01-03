import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const body = await req.json()
        const { name, slug, region, logoUrl, canvaTemplateId } = body

        const business = await prisma.business.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(slug && { slug }),
                ...(region && { region }),
                ...(logoUrl !== undefined && { logoUrl }),
                ...(canvaTemplateId !== undefined && { canvaTemplateId }),
            },
        })

        return NextResponse.json(business)
    } catch (error) {
        console.error("[BUSINESS_PATCH]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
