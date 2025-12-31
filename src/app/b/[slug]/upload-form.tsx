"use client"

import { useState } from "react"
import { Upload, CheckCircle, Smartphone } from "lucide-react"

export function UploadForm({ businessId }: { businessId: string }) {
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [uploaded, setUploaded] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleUpload = async () => {
        if (!file) return
        setLoading(true)

        const formData = new FormData()
        formData.append("file", file)
        formData.append("businessId", businessId)

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            })

            if (res.ok) {
                setUploaded(true)
            } else {
                alert("Upload failed")
            }
        } catch (e) {
            console.error(e)
            alert("Error uploading")
        } finally {
            setLoading(false)
        }
    }

    if (uploaded) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-green-500">
                <CheckCircle className="w-16 h-16 mb-4" />
                <h3 className="text-xl font-bold">Thank You!</h3>
                <p className="text-gray-400 text-center mt-2">Your moment has been captured.</p>
                <button
                    onClick={() => { setUploaded(false); setFile(null) }}
                    className="mt-6 text-sm underline text-gray-500"
                >
                    Upload another
                </button>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center">
            <label className="w-full h-48 border-2 border-dashed border-zinc-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors bg-zinc-900/50">
                {file ? (
                    <div className="text-center">
                        <p className="font-medium text-white">{file.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                ) : (
                    <div className="text-center text-gray-400">
                        <Smartphone className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p className="font-medium">Tap to Capture or Upload</p>
                        <p className="text-xs mt-1 opacity-70">Images & Videos</p>
                    </div>
                )}
                <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileChange}
                    capture="environment"
                />
            </label>

            <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
                {loading ? "Uploading..." : (
                    <>
                        <Upload className="w-4 h-4" />
                        Send to Reel
                    </>
                )}
            </button>
        </div>
    )
}
