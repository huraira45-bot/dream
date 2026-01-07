import { prisma } from "./prisma";
import { v4 as uuidv4 } from "uuid";

/**
 * Agent-Lightning Instrumentation Layer
 * Emulates the agl.emit_xxx pattern for TypeScript.
 */
export class LightningLogger {
    private traceId: string;

    constructor(traceId?: string) {
        this.traceId = traceId || uuidv4();
    }

    getTraceId() {
        return this.traceId;
    }

    /**
     * Records a decision span for an agent.
     */
    async logDecision(
        agentName: string,
        input: any,
        output: any,
        promptUsed?: string
    ) {
        try {
            return await (prisma as any).agentLightningSpan.create({
                data: {
                    traceId: this.traceId,
                    agentName,
                    input: JSON.stringify(input),
                    output: JSON.stringify(output),
                    promptUsed,
                    startTime: new Date(),
                    endTime: new Date(),
                }
            });
        } catch (err) {
            console.error(`[Lightning] Failed to log decision for ${agentName}:`, err);
            // Fallback: log to console if DB is down
            console.log(`[Lightning Trace: ${this.traceId}] Agent: ${agentName} | Output:`, output);
        }
    }

    /**
     * Records a reward (user feedback) for the entire trace.
     */
    static async emitReward(traceId: string, reward: number) {
        try {
            return await (prisma as any).agentLightningSpan.updateMany({
                where: { traceId },
                data: { reward }
            });
        } catch (err) {
            console.error(`[Lightning] Failed to emit reward for trace ${traceId}:`, err);
        }
    }
}
