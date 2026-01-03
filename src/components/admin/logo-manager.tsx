"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Image as ImageIcon, Save, Loader2, Link2, Check } from "lucide-react"
import { toast } from "sonner"

interface LogoManagerProps {
    businessId: string
    currentLogoUrl: string | null
}

export function LogoManager({ businessId, currentLogoUrl }: LogoManagerProps) {
    const [logoUrl, setLogoUrl] = useState(currentLogoUrl || "")
    const [isSaving, setIsSaving] = useState(false)
    const [isSaved, setIsSaved] = useState(false)
    const router = useRouter()

    const onSave = async () => {
        try {
            setIsSaving(true)
            const response = await fetch(`/api/businesses/${businessId}`, {
                method: "PATCH",
                body: JSON.stringify({ logoUrl }),
            })

            if (!response.ok) throw new Error("Failed to update logo")

            toast.success("Logo updated successfully")
            setIsSaved(true)
            setTimeout(() => setIsSaved(false), 2000)
            router.refresh()
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                    <ImageIcon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-zinc-900 tracking-tight">Brand Logo</h3>
            </div>

            <div className="flex gap-4">
                <div className="relative group w-24 h-24 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-100 flex items-center justify-center overflow-hidden shrink-0">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                    ) : (
                        <ImageIcon className="w-8 h-8 text-zinc-200" />
                    )}
                </div>

                <div className="flex-1 space-y-3">
                    <div className="relative">
                        <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                            type="text"
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                            placeholder="Paste logo URL (Direct link to PNG/SVG)"
                            className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none transition-all"
                        />
                    </div>

                    <button
                        onClick={onSave}
                        disabled={isSaving || logoUrl === currentLogoUrl}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold text-xs hover:bg-black disabled:bg-zinc-100 disabled:text-zinc-400 transition-all shadow-xl shadow-zinc-900/10"
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isSaved ? (
                            <Check className="w-4 h-4" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {isSaving ? "Saving..." : isSaved ? "Saved!" : "Save Logo"}
                    </button>
                </div>
            </div>

            <p className="text-[10px] text-zinc-400 italic">
                Tip: Use a transparent PNG or SVG for best rendering results.
            </p>
        </div>
    )
}
