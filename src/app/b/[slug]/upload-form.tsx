"use client"

import { useState } from "react"
import { Upload, CheckCircle, Smartphone, X, Play, Loader2, Camera, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { CustomCamera } from "@/components/camera-interface"

export function UploadForm({ businessId }: { businessId: string }) {
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [uploaded, setUploaded] = useState(false)
    const [showCamera, setShowCamera] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0]
        if (selected) {
            setFile(selected)
            const url = URL.createObjectURL(selected)
            setPreviewUrl(url)
        }
    }

    const clearFile = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setFile(null)
        setPreviewUrl(null)
    }

    const handleUpload = async () => {
        if (!file) return
        setLoading(true)

        try {
            // 1. Get Signature
            const signRes = await fetch("/api/upload/sign", {
                method: "POST",
                body: JSON.stringify({ folder: `dream-app/${businessId}` })
            })
            if (!signRes.ok) throw new Error("Failed to sign upload")
            const { signature, timestamp, cloudName, apiKey } = await signRes.json()

            console.log("DEBUG: Cloudinary Config:", { cloudName, apiKey, timestamp })
            console.log("DEBUG: Resource:", `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`)

            // 2. Upload to Cloudinary
            const formData = new FormData()
            formData.append("file", file)
            formData.append("api_key", apiKey)
            formData.append("timestamp", timestamp.toString())
            formData.append("signature", signature)
            formData.append("folder", `dream-app/${businessId}`)

            const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
                method: "POST",
                body: formData
            })

            if (!uploadRes.ok) {
                const err = await uploadRes.json()
                throw new Error(err.error?.message || "Upload to Cloudinary failed")
            }

            const uploadData = await uploadRes.json()

            // 3. Save to DB
            const saveRes = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    businessId,
                    url: uploadData.secure_url,
                    type: file.type.startsWith("video") ? "VIDEO" : "IMAGE"
                })
            })

            if (!saveRes.ok) throw new Error("Failed to save record")

            console.log("DEBUG: Upload Success", uploadData.secure_url)
            setUploaded(true)
        } catch (e: any) {
            console.error(e)
            alert(`Error: ${e.message || "Upload failed"}`)
        } finally {
            setLoading(false)
        }
    }

    if (uploaded) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Captured!</h3>
                <p className="text-zinc-400 max-w-[240px] leading-relaxed mb-8">
                    Your moment has been sent to our AI. Look out for the daily reel!
                </p>
                <button
                    onClick={() => { setUploaded(false); setFile(null); setPreviewUrl(null) }}
                    className="text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-widest"
                >
                    Send Another Moment
                </button>
            </div>
        )
    }

    const onCapture = (capturedFile: File) => {
        setFile(capturedFile)
        setPreviewUrl(URL.createObjectURL(capturedFile))
        setShowCamera(false)
    }

    return (
        <div className="flex flex-col items-center w-full">
            {showCamera && (
                <CustomCamera onCapture={onCapture} onClose={() => setShowCamera(false)} />
            )}

            <div
                className={cn(
                    "group relative w-full h-[400px] border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all duration-500 overflow-hidden",
                    file ? "border-purple-500/50 bg-purple-500/5" : "border-zinc-800 bg-zinc-900/50"
                )}
            >
                {previewUrl ? (
                    <div className="absolute inset-0 w-full h-full">
                        {file?.type.startsWith('video') ? (
                            <div className="w-full h-full relative">
                                <video
                                    src={previewUrl}
                                    className="w-full h-full object-cover"
                                    muted
                                    loop
                                    autoPlay
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <Play className="w-12 h-12 text-white/50" />
                                </div>
                            </div>
                        ) : (
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                        )}

                        <button
                            onClick={clearFile}
                            className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-colors z-20"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full text-center px-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                                <span className="text-xs font-bold text-white uppercase tracking-wider truncate max-w-[150px]">
                                    {file?.name}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-8 space-y-8 w-full">
                        <div className="space-y-2">
                            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Smartphone className="w-8 h-8 text-zinc-500" />
                            </div>
                            <p className="text-xl font-bold text-white mb-2">Capture the Moment</p>
                            <p className="text-zinc-500 text-sm leading-relaxed max-w-[200px] mx-auto">
                                Record a video or take a photo of your vibe.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setShowCamera(true)}
                                className="flex flex-col items-center gap-3 p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-white"
                            >
                                <Camera className="w-6 h-6" />
                                <span className="text-xs font-bold uppercase tracking-wider">Camera</span>
                            </button>
                            <label className="flex flex-col items-center gap-3 p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-white cursor-pointer text-center justify-center">
                                <ImageIcon className="w-6 h-6" />
                                <span className="text-xs font-bold uppercase tracking-wider">Gallery</span>
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                    </div>
                )}
            </div>

            <div className="w-full mt-8 space-y-4">
                <button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    className="w-full h-16 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-lg rounded-2xl disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center gap-3 shadow-2xl shadow-purple-500/20 active:scale-[0.98]"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Upload className="w-6 h-6" />
                            Feature in Reel
                        </>
                    )}
                </button>
                <p className="text-center text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
                    By uploading, you agree to be featured in our daily highlight.
                </p>
            </div>
        </div>
    )
}
