"use client"

import { useState } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface DeleteReelButtonProps {
    reelId: string
}

export function DeleteReelButton({ reelId }: DeleteReelButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this generated content? This cannot be undone.")) {
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`/api/reels/delete?id=${reelId}`, {
                method: "DELETE",
            })

            if (res.ok) {
                router.refresh()
            } else {
                throw new Error("Failed to delete reel")
            }
        } catch (e) {
            console.error(e)
            alert("Failed to delete content")
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-lg disabled:opacity-50"
            title="Delete Generation"
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Trash2 className="w-4 h-4" />
            )}
        </button>
    )
}
