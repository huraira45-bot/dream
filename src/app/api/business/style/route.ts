import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractStyleDNA } from "@/lib/gemini";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
    try {
        const { businessId, imageUrls } = await req.json();

        if (!businessId || !imageUrls || !Array.isArray(imageUrls)) {
            return NextResponse.json({ error: "Missing businessId or imageUrls array" }, { status: 400 });
        }

        logger.info(`🧬 Style Update Triggered for Business: ${businessId}`);

        // 1. Extract Style DNA using Gemini Vision
        const dna = await extractStyleDNA(imageUrls);

        // 2. Update Business with new references and extracted DNA
        const updatedBusiness = await prisma.business.update({
            where: { id: businessId },
            data: {
                referencePosts: imageUrls,
                styleContext: dna
            }
        });

        logger.info(`✅ Style DNA successfully updated for: ${updatedBusiness.name}`);

        return NextResponse.json({
            success: true,
            styleContext: JSON.parse(dna)
        });

    } catch (error: any) {
        logger.error(`❌ Style Update Failed: ${error.message}`);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
