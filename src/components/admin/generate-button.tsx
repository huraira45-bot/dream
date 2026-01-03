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
    const [results, setResults] = useState<AIResult[] | null>(null)
    const [campaignGoal, setCampaignGoal] = useState("")
    const router = useRouter()

    const handleGenerate = async () => {
        setLoading(true)
        setResults(null)
        try {
            const res = await fetch("/api/process", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ businessId, campaignGoal }),
            })
            const data = await res.json()
            // Data could be an array of reels or an object with message
            if (Array.isArray(data)) {
                setResults(data)
            } else if (data.reels) {
                setResults(data.reels)
            }
            router.refresh() // Refresh server components to show new reels in list
        } catch (e) {
            console.error(e)
            alert("Failed to generate content")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="flex flex-col gap-3">
                <textarea
                    placeholder="Describe a special offer or event (e.g., '50% off for New Year' or 'Grand Opening on Friday')..."
                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all min-h-[100px] resize-none text-zinc-900"
                    value={campaignGoal}
                    onChange={(e) => setCampaignGoal(e.target.value)}
                />
                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="px-6 py-4 bg-black text-white rounded-2xl font-bold text-sm hover:bg-zinc-800 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            AI Director Working...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            Generate Branded Campaign
                        </>
                    )}
                </button>
            </div>

            {/* Result Modal / Overlay */}
            {results && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-zinc-50 rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden border border-white/20">
                        {/* Modal Header */}
                        <div className="p-8 pb-4 bg-white border-b border-zinc-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-3xl font-black text-zinc-900 tracking-tight">AI Generated Options</h3>
                                <p className="text-zinc-500 font-medium">The AI Director has curated 3 distinct directions for you.</p>
                            </div>
                            <div className="px-3 py-1 bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                                3 Options Ready
                            </div>
                        </div>

                        {/* Options List */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {results.map((result, idx) => (
                                <div key={idx} className="bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-200 group hover:border-purple-500/30 transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${result.type === 'REEL' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {result.type === 'REEL' ? <Film className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Option {idx + 1}</p>
                                                <h4 className="font-black text-zinc-900 leading-none">{result.title}</h4>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 bg-zinc-50 rounded-2xl flex items-start gap-3">
                                            <Sparkles className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                                            <p className="text-zinc-600 text-xs italic font-medium leading-relaxed">
                                                "{result.narrative}"
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <div className="px-2.5 py-1 bg-pink-50 text-pink-700 text-[9px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1.5">
                                                <Music className="w-3 h-3" />
                                                {result.musicMood}
                                            </div>
                                            <div className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[9px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1.5">
                                                <Sparkles className="w-3 h-3" />
                                                {result.visualStyle}
                                            </div>
                                        </div>

                                        <div className="p-4 border border-zinc-100 rounded-xl bg-zinc-50/30">
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Suggested Caption</p>
                                            <p className="text-xs text-zinc-600 leading-relaxed font-medium">{result.caption}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-8 pt-4 bg-white border-t border-zinc-100">
                            <button
                                onClick={() => setResults(null)}
                                className="w-full py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg shadow-black/10"
                            >
                                Looks Great! Show in Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
