"use client"

import { useState } from "react"
import { Film, Loader2, Sparkles, Image as ImageIcon, Music, Type } from "lucide-react"
import { useRouter } from "next/navigation"

interface GenerateButtonProps {
    businessId: string
}

interface AIResult {
    title: string
    caption: string
    musicMood: string
    visualStyle: string
    narrative: string
    type: "REEL" | "POST"
    url: string
}

export function GenerateButton({ businessId }: GenerateButtonProps) {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<AIResult | null>(null)
    const router = useRouter()

    const handleGenerate = async () => {
        setLoading(true)
        setResult(null)
        try {
            const res = await fetch("/api/process", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ businessId }),
            })
            const data = await res.json()
            setResult(data)
            router.refresh() // Refresh server components to show new reel in list
        } catch (e) {
            console.error(e)
            alert("Failed to generate content")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-6 py-3 bg-black text-white rounded-2xl font-bold text-sm hover:bg-zinc-800 transition-all shadow-xl shadow-black/10 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        AI Director Working...
                    </>
                ) : (
                    <>
                        <Film className="w-4 h-4" />
                        Generate AI Content
                    </>
                )}
            </button>

            {/* Result Modal / Overlay */}
            {result && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] max-w-md w-full p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${result.type === 'REEL' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                {result.type === 'REEL' ? <Film className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">AI Decision</p>
                                <h3 className="text-2xl font-black text-zinc-900">
                                    {result.type === 'REEL' ? "High-Energy Reel" : "Carousel Post"}
                                </h3>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="p-4 bg-zinc-50 rounded-2xl space-y-2">
                                <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm">
                                    <Type className="w-4 h-4 text-purple-500" />
                                    {result.title}
                                </div>
                                <p className="text-zinc-500 text-xs italic">"{result.narrative}"</p>
                            </div>

                            <div className="flex gap-2">
                                <div className="px-3 py-1.5 bg-pink-50 text-pink-700 text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5">
                                    <Music className="w-3 h-3" />
                                    {result.musicMood}
                                </div>
                                <div className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3" />
                                    {result.visualStyle}
                                </div>
                            </div>

                            <div className="p-4 border border-zinc-100 rounded-xl">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Suggested Caption</p>
                                <p className="text-sm text-zinc-600 leading-relaxed">{result.caption}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setResult(null)}
                            className="w-full py-4 bg-zinc-900 text-white font-bold rounded-xl hover:bg-black transition-colors"
                        >
                            Close & Save
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
