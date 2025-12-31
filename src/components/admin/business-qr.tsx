"use client"

import { useEffect, useRef, useState } from "react"
import QRCode from "qrcode"
import { Download, Share2, Copy, Check } from "lucide-react"

export function BusinessQRCode({ url, name }: { url: string; name: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (canvasRef.current) {
            QRCode.toCanvas(
                canvasRef.current,
                url,
                {
                    width: 300,
                    margin: 2,
                    color: {
                        dark: "#000000",
                        light: "#ffffff",
                    },
                },
                (error) => {
                    if (error) console.error(error)
                }
            )
        }
    }, [url])

    const downloadQR = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const pngUrl = canvas.toDataURL("image/png")
        const downloadLink = document.createElement("a")
        downloadLink.href = pngUrl
        downloadLink.download = `${name.toLowerCase().replace(/\s+/g, "-")}-qr.png`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
    }

    const copyUrl = () => {
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-sm flex flex-col items-center">
            <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-6">Business QR Code</h3>

            <div className="relative p-4 bg-zinc-50 rounded-[2rem] border border-zinc-100 mb-8 group transition-all">
                <canvas ref={canvasRef} className="rounded-xl w-48 h-48 md:w-64 md:h-64" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/5 rounded-[2rem] transition-opacity">
                    <button
                        onClick={downloadQR}
                        className="bg-white p-4 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all text-black"
                    >
                        <Download className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-3">
                <button
                    onClick={copyUrl}
                    className="flex items-center justify-center gap-2 py-3 bg-zinc-50 rounded-2xl text-sm font-bold text-zinc-600 hover:bg-zinc-100 transition-all"
                >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied" : "Copy Link"}
                </button>
                <button
                    onClick={downloadQR}
                    className="flex items-center justify-center gap-2 py-3 bg-black rounded-2xl text-sm font-bold text-white hover:bg-zinc-800 transition-all"
                >
                    <Download className="w-4 h-4" />
                    Save Image
                </button>
            </div>

            <p className="mt-6 text-[10px] text-zinc-400 font-medium text-center max-w-[200px]">
                Prints this QR and place it on your tables for customers to scan.
            </p>
        </div>
    )
}
