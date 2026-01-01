"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Music, Share2, Image as ImageIcon } from "lucide-react"

interface MediaItem {
    id: string
    url: string
    type: string
}

interface StudioPlayerProps {
    reel: {
        id: string
        url: string
        musicUrl?: string | null
        title?: string | null
        caption?: string | null
    }
    mediaItems: MediaItem[]
}

export function StudioPlayer({ reel, mediaItems }: StudioPlayerProps) {
    return (
        <div className="relative h-[100dvh] w-full flex items-center justify-center">
            {/* Background Blur Effect */}
            <div
                className="absolute inset-0 opacity-20 blur-[120px] scale-150 rotate-12 bg-gradient-to-br from-purple-600 via-blue-600 to-transparent"
            />

            <div className="relative w-full max-w-[450px] aspect-[9/16] bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 mx-4">
                <VideoWithMusic reel={reel} mediaItems={mediaItems} />
            </div>
        </div>
    )
}

function VideoWithMusic({ reel, mediaItems }: { reel: any, mediaItems: MediaItem[] }) {
    const pUrl = reel.url.startsWith('pending:') ? reel.url : null
    const [finalUrl, setFinalUrl] = useState<string | null>(pUrl ? null : reel.url)
    const [status, setStatus] = useState(pUrl ? 'rendering' : 'ready')

    // Polling Effect
    useEffect(() => {
        if (!pUrl || finalUrl) return

        const renderId = pUrl.split(':')[1]

        // Don't poll initialization IDs
        if (renderId.startsWith('init')) {
            return
        }

        const interval = setInterval(async () => {
            try {
                const res = await fetch('/api/reels/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reelId: reel.id, renderId })
                })
                const data = await res.json()
                if (data.status === 'done') {
                    setFinalUrl(data.url)
                    setStatus('ready')
                    clearInterval(interval)
                } else if (data.status === 'failed') {
                    setStatus('failed')
                    clearInterval(interval)
                }
            } catch (e) {
                console.error("Polling error", e)
            }
        }, 3000) // Check every 3s

        return () => clearInterval(interval)
    }, [pUrl, finalUrl, reel.id])

    // Master Mode: use if ready and url is valid MP4 (not pending)
    // Also ensure it is NOT an image file, to avoid crashes if DB has mismatched data
    const isImageFinal = finalUrl ? /\.(jpg|jpeg|png|webp|gif)($|\?)/i.test(finalUrl) : false
    const isMasterMode = status === 'ready' && finalUrl && finalUrl !== 'failed' && !finalUrl.startsWith('pending:') && !finalUrl.startsWith('http://res.cloudinary.com/dummy') && !isImageFinal

    const [isPlaying, setIsPlaying] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)

    const videoRef = useRef<HTMLVideoElement>(null)
    const audioRef = useRef<HTMLAudioElement>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const currentItem = mediaItems[currentIndex] || mediaItems[0]

    // Robust check: Trust extension over 'type' if conflicting
    const url = currentItem?.url || ""
    const isImageExtension = /\.(jpg|jpeg|png|webp|gif)($|\?)/i.test(url)
    const isVideoType = currentItem?.type.toLowerCase().includes('video')
    const isVideo = isVideoType && !isImageExtension

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % mediaItems.length)
    }

    useEffect(() => {
        if (!isPlaying) {
            videoRef.current?.pause()
            audioRef.current?.pause()
            if (timerRef.current) clearTimeout(timerRef.current)
            return
        }

        if (isMasterMode && videoRef.current) {
            videoRef.current.play().catch(console.error)
            return
        }

        // Slideshow Logic
        if (!isMasterMode) {
            if (audioRef.current && audioRef.current.paused) {
                audioRef.current.play().catch(console.error)
            }

            if (isVideo) {
                if (timerRef.current) clearTimeout(timerRef.current)
                setTimeout(() => {
                    if (videoRef.current) {
                        videoRef.current.currentTime = 0
                        videoRef.current.play().catch(console.error)
                    }
                }, 50)
            } else {
                if (timerRef.current) clearTimeout(timerRef.current)
                timerRef.current = setTimeout(handleNext, 5000)
            }
        }
        return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    }, [currentIndex, isPlaying, isVideo, isMasterMode])

    return (
        <div className="w-full h-full relative group bg-black" onClick={() => setIsPlaying(!isPlaying)}>

            {/* RENDERER */}
            {isMasterMode ? (
                <video
                    ref={videoRef}
                    src={finalUrl!}
                    className="w-full h-full object-cover"
                    loop
                    playsInline
                    onClick={() => setIsPlaying(!isPlaying)}
                />
            ) : status === 'failed' || (finalUrl && finalUrl.startsWith('failed')) ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 p-6 text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                        <Share2 className="w-8 h-8 text-red-500 rotate-180" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">Generation Failed</h3>
                    <p className="text-white/60 text-sm mb-6 max-w-[200px] break-words">
                        {finalUrl?.startsWith('failed:') ? finalUrl.split('failed:')[1] : "We couldn't generate this variation. Please delete it and try again."}
                    </p>
                </div>
            ) : (
                <>
                    {/* PREVIEW MODE */}
                    {isVideo ? (
                        <video
                            ref={videoRef}
                            src={currentItem.url}
                            className="w-full h-full object-cover opacity-50 grayscale"
                            playsInline
                            muted
                            onEnded={handleNext}
                        />
                    ) : (
                        <img
                            src={currentItem.url}
                            className="w-full h-full object-cover opacity-50 grayscale animate-pulse"
                            alt="Preview"
                        />
                    )}
                    {status === 'rendering' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-black/70 px-4 py-2 rounded-full border border-purple-500/50 flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                                <span className="text-xs font-bold text-white uppercase tracking-widest">Rendering Master...</span>
                            </div>
                        </div>
                    )}
                </>
            )}

            {!isMasterMode && reel.musicUrl && (
                <audio ref={audioRef} src={reel.musicUrl} loop />
            )}

            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none z-20">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20">
                        <Play className="w-8 h-8 fill-white" />
                    </div>
                </div>
            )}

            {!isMasterMode && (
                <div className="absolute top-0 inset-x-0 h-1 flex gap-1 p-2 z-30">
                    {mediaItems.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white' : idx < currentIndex ? 'bg-white/50' : 'bg-white/20'}`}
                        />
                    ))}
                </div>
            )}

            <div className="absolute top-8 inset-x-0 px-8 pointer-events-none z-20">
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-purple-500 rounded-lg text-[10px] font-black uppercase tracking-widest text-white shadow-lg border border-purple-400">Dream Studio</div>
                    <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest bg-black/20 px-2 py-1 rounded backdrop-blur-sm">
                        {status === 'rendering' ? 'Generating 4K...' : status === 'ready' ? 'Master File' : 'Preview Mode'}
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 inset-x-0 p-8 pb-12 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-20">
                <div className="space-y-6">
                    <div className="space-y-1">
                        <h1 className="text-xl font-black tracking-tight text-white drop-shadow-md">{reel.title}</h1>
                        <p className="text-sm text-white/80 line-clamp-2 drop-shadow-sm">{reel.caption}</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 backdrop-blur-md border border-purple-500/30 flex items-center justify-center animate-spin-slow">
                                <Music className="w-5 h-5 text-purple-400" />
                            </div>
                        </div>
                        <div className="flex gap-2 pointer-events-auto">
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
                                className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 text-white hover:bg-white/20 transition-all"
                            >
                                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
                            </button>
                            {status === 'ready' && finalUrl && !finalUrl.startsWith('pending:') && (
                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation()
                                        // Smart Share Logic
                                        try {
                                            if (navigator.share) {
                                                const blob = await fetch(finalUrl).then(r => r.blob())
                                                const file = new File([blob], 'reel.mp4', { type: 'video/mp4' })

                                                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                                    await navigator.share({
                                                        files: [file],
                                                        title: 'My Dream Reel',
                                                        text: 'Check out this AI-generated reel! #DreamAI'
                                                    })
                                                    return
                                                }
                                            }
                                            // Fallback to Download
                                            const a = document.createElement('a')
                                            a.href = finalUrl
                                            a.download = "Dream-Instagram-Reel.mp4"
                                            document.body.appendChild(a)
                                            a.click()
                                            document.body.removeChild(a)
                                        } catch (err) {
                                            console.error('Share failed:', err)
                                            // Fallback on error
                                            window.open(finalUrl, '_blank')
                                        }
                                    }}
                                    className="p-3 bg-gradient-to-tr from-purple-500 to-pink-500 text-white rounded-2xl shadow-lg border border-white/20 hover:scale-105 transition-all flex items-center gap-2"
                                >
                                    <Share2 className="w-5 h-5" />
                                    <span className="hidden sm:inline font-bold text-xs">Share</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
