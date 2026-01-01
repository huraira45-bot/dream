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
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)

    // Refs
    // logic: if current item is video, use videoRef. If image, use timeout.
    const videoRef = useRef<HTMLVideoElement>(null)
    const audioRef = useRef<HTMLAudioElement>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const currentItem = mediaItems[currentIndex] || mediaItems[0]
    const isVideo = currentItem?.type.toLowerCase().includes('video')

    // Handle Transitions
    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % mediaItems.length)
    }

    // Effect: Playback Controller
    useEffect(() => {
        if (!isPlaying) {
            videoRef.current?.pause()
            audioRef.current?.pause()
            if (timerRef.current) clearTimeout(timerRef.current)
            return
        }

        // Start Audio if not playing
        if (audioRef.current && audioRef.current.paused) {
            audioRef.current.play().catch(console.error)
        }

        if (isVideo) {
            // Video Logic: Clear timer, Play video, Wait for 'ended' event (handled in JSX)
            if (timerRef.current) clearTimeout(timerRef.current)

            // Short timeout to ensure ref is mounted
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.currentTime = 0
                    videoRef.current.play().catch(console.error)
                }
            }, 50)
        } else {
            // Image Logic: Set timer for 5s then Next
            // MUTE video ref just in case
            if (timerRef.current) clearTimeout(timerRef.current)
            timerRef.current = setTimeout(() => {
                handleNext()
            }, 5000) // 5s duration per photo
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [currentIndex, isPlaying, isVideo])

    return (
        <div className="w-full h-full relative group bg-black" onClick={() => setIsPlaying(!isPlaying)}>

            {/* Media Renderer */}
            {isVideo ? (
                <video
                    ref={videoRef}
                    src={currentItem.url}
                    className="w-full h-full object-cover"
                    playsInline
                    muted // Mute individual clips, master audio handles sound
                    onEnded={handleNext}
                />
            ) : (
                <div className="w-full h-full relative">
                    {/* Ken Burns Effect usually goes here, simpler for now */}
                    <img
                        src={currentItem.url}
                        className="w-full h-full object-cover animate-in fade-in duration-700"
                        alt="Reel segment"
                    />
                </div>
            )}

            {/* Master Audio Track */}
            {reel.musicUrl && (
                <audio ref={audioRef} src={reel.musicUrl} loop />
            )}

            {/* Play Overlay */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none z-20">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20">
                        <Play className="w-8 h-8 fill-white" />
                    </div>
                </div>
            )}

            {/* Timeline Progress Bar (Optional but nice) */}
            <div className="absolute top-0 inset-x-0 h-1 flex gap-1 p-2 z-30">
                {mediaItems.map((_, idx) => (
                    <div
                        key={idx}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white' : idx < currentIndex ? 'bg-white/50' : 'bg-white/20'}`}
                    />
                ))}
            </div>

            {/* Pro Overlay Details */}
            <div className="absolute top-8 inset-x-0 px-8 pointer-events-none z-20">
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-purple-500 rounded-lg text-[10px] font-black uppercase tracking-widest text-white shadow-lg border border-purple-400">Dream Studio</div>
                    <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest bg-black/20 px-2 py-1 rounded backdrop-blur-sm">Live Preview</div>
                </div>
            </div>

            {/* Metadata Footer */}
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
                            <div className="overflow-hidden">
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">Soundtrack</p>
                                <p className="text-xs font-bold text-white truncate drop-shadow-sm">Original Mix</p>
                            </div>
                        </div>

                        <div className="flex gap-2 pointer-events-auto">
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
                                className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 text-white hover:bg-white/20 transition-all"
                            >
                                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
                            </button>
                            <a
                                href={reel.url}
                                download="Dream-AI-Master.mp4"
                                target="_blank"
                                className="p-3 bg-zinc-800 text-white rounded-2xl shadow-lg border border-white/10 hover:bg-zinc-700 transition-all"
                                title="Download MP4 (Stitched)"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Share2 className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
