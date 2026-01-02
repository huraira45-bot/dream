"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface ReelStatusPollerProps {
    reelId: string
    currentUrl: string
}

export function ReelStatusPoller({ reelId, currentUrl }: ReelStatusPollerProps) {
    const [status, setStatus] = useState<"pending" | "done" | "failed" | "ready">(
        currentUrl.startsWith("pending:") ? "pending" :
            currentUrl.startsWith("failed:") ? "failed" : "ready"
    )
    const router = useRouter()

    useEffect(() => {
        if (status !== "pending") return

        const renderId = currentUrl.split(":")[1]

        const interval = setInterval(async () => {
            try {
                const res = await fetch("/api/reels/status", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ reelId, renderId }),
                })
                const data = await res.json()

                if (data.status === "done") {
                    setStatus("ready")
                    clearInterval(interval)
                    router.refresh() // Refresh page to show final URL/Preview
                } else if (data.status === "failed") {
                    setStatus("failed")
                    clearInterval(interval)
                    router.refresh()
                }
            } catch (err) {
                console.error("Polling error:", err)
            }
        }, 5000) // Poll every 5 seconds

        return () => clearInterval(interval)
    }, [reelId, currentUrl, status, router])

    if (status === "ready") return null

    return (
        <div className="flex items-center gap-2 px-2 py-1 bg-zinc-900/50 backdrop-blur-sm rounded-lg border border-white/10">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${status === 'failed' ? 'bg-red-500' : 'bg-purple-500'}`} />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                {status === 'failed' ? 'Failed' : 'Rendering...'}
            </span>
        </div>
    )
}
