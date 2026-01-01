"use client"

import { useState } from "react"
import { Calendar, Check, Trash2, Loader2, X } from "lucide-react"
import { scheduleReel } from "@/lib/reel-actions"
import { useRouter } from "next/navigation"

export function ScheduleReelButton({ reelId }: { reelId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const [date, setDate] = useState("")
    const router = useRouter()

    async function handleSchedule() {
        if (!date) {
            alert("Please pick a date/time")
            return
        }
        setIsPending(true)
        try {
            await scheduleReel(reelId, date)
            setIsOpen(false)
            router.refresh()
        } catch (err) {
            console.error(err)
            alert("Failed to schedule")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl font-bold text-xs hover:bg-zinc-800 transition-all active:scale-95 shadow-lg shadow-black/10"
            >
                <Calendar className="w-3.5 h-3.5" />
                Schedule
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-zinc-900">Schedule Reel</h3>
                            <button onClick={() => setIsOpen(false)} className="p-2 text-zinc-400 hover:text-black transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Publish Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-black outline-none transition-all"
                                />
                            </div>

                            <p className="text-xs text-zinc-500 leading-relaxed italic">
                                * Saving this reel will discard the other 2 variations from this batch.
                            </p>

                            <button
                                onClick={handleSchedule}
                                disabled={isPending}
                                className="w-full py-4 bg-black text-white rounded-2xl font-bold text-sm hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/20"
                            >
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                Finalize & Schedule
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
