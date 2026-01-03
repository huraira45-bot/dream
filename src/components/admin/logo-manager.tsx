"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Image as ImageIcon, Upload, Loader2, Link2, Check, X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface LogoManagerProps {
    businessId: string
    currentLogoUrl: string | null
}

export function LogoManager({ businessId, currentLogoUrl }: LogoManagerProps) {
    const [logoUrl, setLogoUrl] = useState(currentLogoUrl || "")
    const [isUploading, setIsUploading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isSaved, setIsSaved] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // 1. Show local preview
        const localUrl = URL.createObjectURL(file)
        setPreviewUrl(localUrl)

        try {
            setIsUploading(true)

            // 2. Get Signature
            const signRes = await fetch("/api/upload/sign", {
                method: "POST",
                body: JSON.stringify({ folder: `dream-app/logos/${businessId}` })
            })
            if (!signRes.ok) throw new Error("Failed to sign upload")
            const { signature, timestamp, cloudName, apiKey } = await signRes.json()

            // 3. Upload to Cloudinary
            const formData = new FormData()
            formData.append("file", file)
            formData.append("api_key", apiKey)
            formData.append("timestamp", timestamp.toString())
            formData.append("signature", signature)
            formData.append("folder", `dream-app/logos/${businessId}`)

            const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
                method: "POST",
                body: formData
            })

            if (!uploadRes.ok) throw new Error("Cloudinary upload failed")
            const uploadData = await uploadRes.json()
            const newUrl = uploadData.secure_url

            // 4. Update Database
            const dbRes = await fetch(`/api/businesses/${businessId}`, {
                method: "PATCH",
                body: JSON.stringify({ logoUrl: newUrl }),
            })

            if (!dbRes.ok) throw new Error("Failed to update business logo")

            setLogoUrl(newUrl)
            toast.success("Logo uploaded and saved!")
            setIsSaved(true)
            setTimeout(() => setIsSaved(false), 2000)
            router.refresh()
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Upload failed")
            setPreviewUrl(null)
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    const onClear = async () => {
        if (!confirm("Are you sure you want to remove the logo?")) return

        try {
            setIsSaving(true)
            const response = await fetch(`/api/businesses/${businessId}`, {
                method: "PATCH",
                body: JSON.stringify({ logoUrl: "" }), // Clear logo
            })

            if (!response.ok) throw new Error("Failed to clear logo")

            setLogoUrl("")
            setPreviewUrl(null)
            toast.success("Logo removed")
            router.refresh()
        } catch (error) {
            toast.error("Cloud not remove logo")
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

            <div className="flex gap-6 items-start">
                <div className="relative group w-32 h-32 bg-zinc-50 rounded-[2rem] border-2 border-dashed border-zinc-100 flex items-center justify-center overflow-hidden shrink-0 transition-all hover:border-pink-200">
                    {(previewUrl || logoUrl) ? (
                        <div className="relative w-full h-full p-4">
                            <img
                                src={previewUrl || logoUrl}
                                alt="Logo Preview"
                                className={cn(
                                    "w-full h-full object-contain transition-opacity",
                                    isUploading ? "opacity-30" : "opacity-100"
                                )}
                            />
                            {isUploading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-pink-600" />
                                </div>
                            )}
                            <button
                                onClick={onClear}
                                className="absolute -top-1 -right-1 p-1.5 bg-zinc-900 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 shadow-lg"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <ImageIcon className="w-8 h-8 text-zinc-200" />
                            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">No Logo</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 space-y-4 pt-2">
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-zinc-900">Upload Identity</p>
                        <p className="text-[11px] text-zinc-500 leading-relaxed max-w-[200px]">
                            Upload your PNG or SVG logo. Transparent backgrounds work best for posts.
                        </p>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-zinc-200 text-zinc-900 rounded-xl font-bold text-xs hover:bg-zinc-50 hover:border-zinc-300 disabled:opacity-50 transition-all shadow-sm active:scale-95"
                    >
                        {isUploading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-pink-600" />
                        ) : (
                            <Upload className="w-4 h-4 text-pink-600" />
                        )}
                        {isUploading ? "Uploading..." : logoUrl ? "Change Logo" : "Choose File"}
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-amber-50/50 rounded-xl border border-amber-100/50">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                <p className="text-[10px] text-amber-700 font-medium">
                    This logo will be used in every generated post. Ensure it's high resolution.
                </p>
            </div>
        </div>
    )
}
