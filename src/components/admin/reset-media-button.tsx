"use client"

import { useState } from "react"
import { RefreshCcw, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface ResetMediaButtonProps {
    businessId: string
}

export function ResetMediaButton({ businessId }: ResetMediaButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleReset = async () => {
        if (!confirm("Are you sure you want to reuse all existing content for new AI generations?")) {
            return
        }

        setLoading(true)
        try {
            const res = await fetch("/api/media/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ businessId }),
            })

            if (res.ok) {
                router.refresh()
            } else {
                throw new Error("Failed to reset media")
            }
        } catch (e) {
            console.error(e)
            alert("Failed to reset media items")
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleReset}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold text-xs rounded-xl transition-all disabled:opacity-50"
        >
            {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
                <RefreshCcw className="w-3.5 h-3.5" />
            )}
            Reuse All Content
        </button>
    )
}
