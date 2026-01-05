"use client"

import { useState } from "react"
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Link as LinkIcon, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface StyleDNAEditorProps {
    businessId: string
    currentReferences?: string[]
    currentDNA?: string
}

export function StyleDNAEditor({ businessId, currentReferences = [], currentDNA }: StyleDNAEditorProps) {
    const [urls, setUrls] = useState<string[]>(currentReferences.length > 0 ? currentReferences : ["", "", ""])
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
    const router = useRouter()

    const handleUrlChange = (index: number, value: string) => {
        const newUrls = [...urls]
        newUrls[index] = value
        setUrls(newUrls)
        setStatus("idle")
    }

    const handleSync = async () => {
        const validUrls = urls.filter(u => u.trim() !== "")
        if (validUrls.length === 0) return

        setLoading(true)
        setStatus("idle")

        try {
            const res = await fetch("/api/business/style", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ businessId, imageUrls: validUrls })
            })

            if (!res.ok) throw new Error("Sync failed")

            setStatus("success")
            router.refresh()
        } catch (err) {
            console.error(err)
            setStatus("error")
        } finally {
            setLoading(false)
        }
    }

    const dnaParsed = currentDNA ? JSON.parse(currentDNA) : null

    return (
        <div className="pt-8 border-t border-zinc-100">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-zinc-900 tracking-tight text-sm">Style DNA Mimicry</h3>
                </div>
                {dnaParsed && (
                    <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-black uppercase rounded-full tracking-widest border border-green-100">
                        Profiled
                    </span>
                )}
            </div>

            <p className="text-[10px] text-zinc-500 mb-6 leading-relaxed bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50">
                Paste 3 Instagram or Pinterest image URLs that you ❤️. Our **Mimetic AI** will analyze the typography and layout to replicate the style.
            </p>

            <div className="space-y-3">
                {urls.map((url, idx) => (
                    <div key={idx} className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
                            <LinkIcon className="w-3.5 h-3.5" />
                        </div>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => handleUrlChange(idx, e.target.value)}
                            placeholder={`Reference Post URL #${idx + 1}`}
                            className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-[11px] font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-400"
                        />
                    </div>
                ))}
            </div>

            {/* Sync Button */}
            <button
                onClick={handleSync}
                disabled={loading || urls.every(u => u.trim() === "")}
                className={cn(
                    "w-full mt-6 py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/10 active:scale-[0.98]",
                    status === "success"
                        ? "bg-green-500 text-white shadow-green-500/20"
                        : status === "error"
                            ? "bg-red-500 text-white"
                            : "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:shadow-none"
                )}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Extracting Style DNA...
                    </>
                ) : status === "success" ? (
                    <>
                        <CheckCircle2 className="w-4 h-4" />
                        DNA Synced
                    </>
                ) : status === "error" ? (
                    <>
                        <AlertCircle className="w-4 h-4" />
                        Extraction Failed
                    </>
                ) : (
                    <>
                        <Sparkles className="w-4 h-4" />
                        Sync Style DNA
                    </>
                )}
            </button>

            {/* DNA Preview */}
            {dnaParsed && (
                <div className="mt-6 p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Active Directives</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white p-2 rounded-lg border border-zinc-100">
                            <div className="text-[8px] font-black text-zinc-400 uppercase">Text</div>
                            <div className="text-[10px] font-bold text-indigo-600 truncate">{dnaParsed.typography.category}</div>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-zinc-100">
                            <div className="text-[8px] font-black text-zinc-400 uppercase">Tone</div>
                            <div className="text-[10px] font-bold text-indigo-600 truncate">{dnaParsed.copy.tone}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
