"use client"

import { useState } from "react"
import { X, MessageSquare, ShieldAlert, Loader2 } from "lucide-react"

interface FeedbackModalProps {
    reelId: string
    onClose: () => void
    onSuccess: () => void
}

export function FeedbackModal({ reelId, onClose, onSuccess }: FeedbackModalProps) {
    const [loading, setLoading] = useState(false)
    const [category, setCategory] = useState("Context/Hook")
    const [reason, setReason] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch(`/api/reels/feedback`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reelId,
                    category,
                    reason,
                    score: -1.0 // This is a negative signal for the agent
                })
            })

            if (res.ok) {
                onSuccess()
            } else {
                throw new Error("Failed to submit feedback")
            }
        } catch (err) {
            console.error(err)
            alert("Failed to submit feedback")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-zinc-900">What's wrong?</h3>
                                <p className="text-xs text-zinc-500 font-medium tracking-tight">Help our AI learn your style preferences.</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] ml-1">Problem Category</label>
                            <div className="grid grid-cols-2 gap-2">
                                {["Context/Hook", "Visuals/Colors", "Music/Vibe", "Branding/Logo"].map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setCategory(cat)}
                                        className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border ${category === cat
                                                ? "bg-zinc-900 text-white border-zinc-900"
                                                : "bg-zinc-50 text-zinc-500 border-zinc-100 hover:border-zinc-300"
                                            }`}
                                    >
                                        {cat.split('/')[0]}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setCategory("Other")}
                                    className={`col-span-2 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${category === "Other"
                                            ? "bg-zinc-900 text-white border-zinc-900"
                                            : "bg-zinc-50 text-zinc-500 border-zinc-100 hover:border-zinc-300"
                                        }`}
                                >
                                    Other / Everything
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] ml-1">Specific Feedback</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="E.g., The colors don't match our shop's aesthetic..."
                                className="w-full h-32 px-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 outline-none transition-all resize-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit & Discard"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
