"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, Music, Volume2, VolumeX, Image as ImageIcon, Film } from "lucide-react"
import { cn } from "@/lib/utils"

interface MediaItem {
    id: string
    url: string
    type: string
}

interface CinematicPlayerProps {
    mediaItems: MediaItem[]
    musicUrl?: string | null
    title?: string | null
    caption?: string | null
}

export function CinematicPlayer({ mediaItems, musicUrl, title, caption }: CinematicPlayerProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(true)
    const [isMuted, setIsMuted] = useState(false)
    const [progress, setProgress] = useState(0)

    const audioRef = useRef<HTMLAudioElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const timerRef = useRef<NodeJS.Timeout>(null)

    const currentItem = mediaItems[currentIndex]
    const isVideo = currentItem?.type.toLowerCase().includes('video')

    // Handle Item Transition
    const nextItem = () => {
        if (currentIndex < mediaItems.length - 1) {
            setCurrentIndex(prev => prev + 1)
            setProgress(0)
        } else {
            // Loop back to start
            setCurrentIndex(0)
            setProgress(0)
        }
    }

    // Auto-advance logic for images
    useEffect(() => {
        if (!isPlaying || isVideo) return

        const duration = 4000 // 4 seconds per image
        const step = 100 // update every 100ms

        timerRef.current = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timerRef.current!)
                    nextItem()
                    return 0
                }
                return prev + (step / duration) * 100
            })
        }, step)

        return () => clearInterval(timerRef.current!)
    }, [currentIndex, isPlaying, isVideo])

    // Video playback events
    const handleVideoEnd = () => {
        nextItem()
    }

    const handleVideoTimeUpdate = () => {
        if (videoRef.current) {
            const p = (videoRef.current.currentTime / videoRef.current.duration) * 100
            setProgress(p)
        }
    }

    // Sync Audio with Play/Pause
    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(() => {
                    // Autoplay might be blocked by browser until user interaction
                    console.log("Audio autoplay blocked")
                })
            } else {
                audioRef.current.pause()
            }
        }
    }, [isPlaying])

    return (
        <div className="relative w-full h-full group bg-black">
            {/* Audio Element */}
            {musicUrl && (
                <audio
                    ref={audioRef}
                    src={musicUrl}
                    loop
                    muted={isMuted}
                />
            )}

            {/* Media Content */}
            <div className="absolute inset-0 flex items-center justify-center">
                {isVideo ? (
                    <video
                        ref={videoRef}
                        src={currentItem.url}
                        className="w-full h-full object-cover"
                        autoPlay={isPlaying}
                        onEnded={handleVideoEnd}
                        onTimeUpdate={handleVideoTimeUpdate}
                        playsInline
                        muted // Video is muted to let background music dominate
                    />
                ) : (
                    <img
                        src={currentItem.url}
                        className="w-full h-full object-cover animate-in fade-in zoom-in duration-700"
                        alt="Reel content"
                    />
                )}
            </div>

            {/* Top Controls Overlay */}
            <div className="absolute top-0 inset-x-0 p-6 flex items-start justify-between bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
                <div className="flex gap-1 flex-1 px-2 pointer-events-auto">
                    {mediaItems.map((_, i) => (
                        <div key={i} className="h-0.5 flex-1 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full bg-white transition-all duration-100 ease-linear",
                                    i < currentIndex ? "w-full" : i === currentIndex ? "" : "w-0"
                                )}
                                style={{ width: i === currentIndex ? `${progress}%` : undefined }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Interactive Controls */}
            <div className="absolute inset-0 flex flex-col justify-center pointer-events-none">
                <div className="flex justify-between px-4 pointer-events-none">
                    <button
                        onClick={() => {
                            if (currentIndex > 0) {
                                setCurrentIndex(prev => prev - 1)
                                setProgress(0)
                            }
                        }}
                        className="w-1/3 h-[50vh] pointer-events-auto"
                        aria-label="Previous"
                    />
                    <button
                        onClick={() => nextItem()}
                        className="w-1/3 h-[50vh] pointer-events-auto"
                        aria-label="Next"
                    />
                </div>
            </div>

            {/* Bottom Controls Overlay */}
            <div className="absolute bottom-0 inset-x-0 p-8 pt-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
                <div className="flex items-end justify-between pointer-events-auto">
                    <div className="space-y-4 max-w-[80%]">
                        <div className="space-y-1">
                            <h1 className="text-xl font-black tracking-tight drop-shadow-md">{title}</h1>
                            <p className="text-sm text-white/80 line-clamp-2 drop-shadow-sm">{caption}</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center animate-spin-slow">
                                <Music className="w-4 h-4" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none">Original Audio</p>
                                <p className="text-xs font-bold truncate">Syncing with mood...</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 text-white hover:bg-white/20 transition-all"
                        >
                            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white" />}
                        </button>
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 text-white hover:bg-white/20 transition-all"
                        >
                            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
