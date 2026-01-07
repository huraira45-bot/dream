"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { FeedbackModal } from "./feedback-modal"

interface DislikeReelButtonProps {
    reelId: string
}

export function DislikeReelButton({ reelId }: DislikeReelButtonProps) {
    const [showModal, setShowModal] = useState(false)
    const router = useRouter()

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-lg"
                title="Discard & Provide Feedback"
            >
                <Trash2 className="w-4 h-4" />
            </button>

            {showModal && (
                <FeedbackModal
                    reelId={reelId}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false)
                        router.refresh()
                    }}
                />
            )}
        </>
    )
}
