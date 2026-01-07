import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { LightningLogger } from "@/lib/lightning";

export async function POST(req: Request) {
    try {
        const { reelId, category, reason, score } = await req.json();

        // 1. Update the Reel status and store feedback
        const reel = await prisma.generatedReel.update({
            where: { id: reelId },
            data: {
                status: "DISCARDED",
                feedbackScore: score,
                dislikeCategory: category,
                dislikeReason: reason
            } as any
        });

        // 2. Emit reward to the Lightning trace if it exists
        if ((reel as any).traceId) {
            await LightningLogger.emitReward((reel as any).traceId, score);
            console.log(`[Lightning] Emitted reward ${score} for trace ${(reel as any).traceId}`);
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("[Feedback API Error]:", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
