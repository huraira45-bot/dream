"use client"

import { useState, useRef } from "react"
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Plus, X, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface StyleDNAEditorProps {
    businessId: string
    currentReferences?: string[]
    currentDNA?: string
}

export function StyleDNAEditor({ businessId, currentReferences = [], currentDNA }: StyleDNAEditorProps) {
    const [urls, setUrls] = useState<string[]>(currentReferences)
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setUploadingIndex(urls.length)

            // 1. Get Signature
            const signRes = await fetch("/api/upload/sign", {
                method: "POST",
                body: JSON.stringify({ folder: `dream-app/style-dna/${businessId}` })
            })
            if (!signRes.ok) throw new Error("Failed to sign upload")
            const { signature, timestamp, cloudName, apiKey } = await signRes.json()

            // 2. Upload to Cloudinary
            const formData = new FormData()
            formData.append("file", file)
            formData.append("api_key", apiKey)
            formData.append("timestamp", timestamp.toString())
            formData.append("signature", signature)
            formData.append("folder", `dream-app/style-dna/${businessId}`)

            const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
                method: "POST",
                body: formData
            })

            if (!uploadRes.ok) throw new Error("Cloudinary upload failed")
            const uploadData = await uploadRes.json()
            const newUrl = uploadData.secure_url

            setUrls(prev => [...prev.slice(0, 3), newUrl].slice(-3))
            setStatus("idle")
            toast.success("Reference uploaded!")
        } catch (err: any) {
            console.error(err)
            toast.error(err.message || "Upload failed")
        } finally {
            setUploadingIndex(null)
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    const removeUrl = (index: number) => {
        setUrls(prev => prev.filter((_, i) => i !== index))
        setStatus("idle")
    }

    const handleSync = async () => {
        if (urls.length === 0) return

        setLoading(true)
        setStatus("idle")

        try {
            const res = await fetch("/api/business/style", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ businessId, imageUrls: urls })
            })

            if (!res.ok) throw new Error("Sync failed")

            setStatus("success")
            toast.success("Style DNA extracted successfully!")
            router.refresh()
        } catch (err) {
            console.error(err)
            setStatus("error")
            toast.error("Failed to extract Style DNA")
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
                Upload up to 3 posts that you ❤️. Our **Mimetic AI** will analyze the typography, layout, and character styles to replicate the aesthetic.
            </p>

            <div className="grid grid-cols-3 gap-3">
                {urls.map((url, idx) => (
                    <div key={idx} className="relative aspect-square bg-zinc-50 rounded-2xl border border-zinc-100 overflow-hidden group">
                        <img src={url} className="w-full h-full object-cover" alt={`Ref ${idx + 1}`} />
                        <button
                            onClick={() => removeUrl(idx)}
                            className="absolute top-1.5 right-1.5 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}

                {urls.length < 3 && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingIndex !== null}
                        className="aspect-square bg-white border-2 border-dashed border-zinc-100 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
                    >
                        {uploadingIndex !== null ? (
                            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                        ) : (
                            <>
                                <Plus className="w-5 h-5 text-zinc-300 group-hover:text-indigo-500 transition-colors" />
                                <span className="text-[9px] font-black uppercase text-zinc-400 group-hover:text-indigo-600 tracking-widest">Add Like</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                className="hidden"
                accept="image/*"
            />

            {/* Sync Button */}
            <button
                onClick={handleSync}
                disabled={loading || urls.length === 0}
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
                        Analyzing Layout DNA...
                    </>
                ) : status === "success" ? (
                    <>
                        <CheckCircle2 className="w-4 h-4" />
                        Aesthetic Extracted
                    </>
                ) : status === "error" ? (
                    <>
                        <AlertCircle className="w-4 h-4" />
                        Extraction Failed
                    </>
                ) : (
                    <>
                        <Upload className="w-4 h-4" />
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
                            <div className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter">Text</div>
                            <div className="text-[10px] font-bold text-indigo-600 truncate">{dnaParsed.typography?.category}</div>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-zinc-100">
                            <div className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter">Layout</div>
                            <div className="text-[10px] font-bold text-indigo-600 truncate">{dnaParsed.layout?.geometry}</div>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-zinc-100">
                            <div className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter">Character</div>
                            <div className="text-[10px] font-bold text-indigo-600 truncate">{dnaParsed.visual?.characterStyle || "Standard"}</div>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-zinc-100">
                            <div className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter">Tone</div>
                            <div className="text-[10px] font-bold text-indigo-600 truncate">{dnaParsed.copy?.tone}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
