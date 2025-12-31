"use client"

import { useEffect, useRef, useState } from "react"
import { Camera, RefreshCw, X, Video, Image as ImageIcon, Circle, StopCircle, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface CustomCameraProps {
    onCapture: (file: File) => void
    onClose: () => void
}

export function CustomCamera({ onCapture, onClose }: CustomCameraProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [mode, setMode] = useState<"PHOTO" | "VIDEO">("PHOTO")
    const [isRecording, setIsRecording] = useState(false)
    const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")
    const [recordingTime, setRecordingTime] = useState(0)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        startCamera()
        return () => stopCamera()
    }, [facingMode])

    const startCamera = async () => {
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop())
            }
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode },
                audio: mode === "VIDEO"
            })
            setStream(newStream)
            if (videoRef.current) {
                videoRef.current.srcObject = newStream
            }
        } catch (err) {
            console.error("Error accessing camera:", err)
            alert("Could not access camera. Please ensure you have given permission.")
            onClose()
        }
    }

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
        }
    }

    const switchCamera = () => {
        setFacingMode(prev => prev === "user" ? "environment" : "user")
    }

    const takePhoto = () => {
        if (!videoRef.current) return
        const canvas = document.createElement("canvas")
        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight
        const ctx = canvas.getContext("2d")
        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0)
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" })
                    onCapture(file)
                }
            }, "image/jpeg", 0.9)
        }
    }

    const startRecording = () => {
        if (!stream) return
        const chunks: Blob[] = []

        try {
            const recorder = new MediaRecorder(stream)
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data)
                }
            }
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: "video/webm" })
                const file = new File([blob], `video-${Date.now()}.webm`, { type: "video/webm" })
                onCapture(file)
            }
            mediaRecorderRef.current = recorder
            recorder.start()
            setIsRecording(true)

            setRecordingTime(0)
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1)
            }, 1000)
        } catch (err) {
            console.error("MediaRecorder error:", err)
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-between p-6 overflow-hidden">
            {/* Header */}
            <div className="w-full flex items-center justify-between z-10">
                <button
                    onClick={onClose}
                    className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all"
                >
                    <X className="w-6 h-6" />
                </button>

                {isRecording && (
                    <div className="px-4 py-2 bg-red-600 rounded-full flex items-center gap-2 animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-white" />
                        <span className="text-white font-bold text-sm">{formatTime(recordingTime)}</span>
                    </div>
                )}

                <button
                    onClick={switchCamera}
                    className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all"
                >
                    <RefreshCw className="w-6 h-6" />
                </button>
            </div>

            {/* Video Preview */}
            <div className="absolute inset-0 w-full h-full bg-zinc-900">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Footer Controls */}
            <div className="w-full space-y-8 z-10 mb-6">
                {/* Mode Switcher */}
                {!isRecording && (
                    <div className="flex justify-center gap-8 text-sm font-bold tracking-widest uppercase">
                        <button
                            onClick={() => setMode("PHOTO")}
                            className={cn(
                                "transition-all",
                                mode === "PHOTO" ? "text-white" : "text-white/40"
                            )}
                        >
                            Photo
                        </button>
                        <button
                            onClick={() => setMode("VIDEO")}
                            className={cn(
                                "transition-all",
                                mode === "VIDEO" ? "text-white" : "text-white/40"
                            )}
                        >
                            Video
                        </button>
                    </div>
                )}

                {/* Main Action Button */}
                <div className="flex items-center justify-center">
                    {mode === "PHOTO" ? (
                        <button
                            onClick={takePhoto}
                            className="w-20 h-20 bg-white rounded-full p-1 border-4 border-white flex items-center justify-center hover:scale-110 active:scale-90 transition-all"
                        >
                            <div className="w-full h-full rounded-full border-2 border-zinc-200" />
                        </button>
                    ) : (
                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={cn(
                                "w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all",
                                isRecording ? "border-white bg-white/20" : "border-white bg-white"
                            )}
                        >
                            {isRecording ? (
                                <div className="w-8 h-8 bg-red-600 rounded-sm" />
                            ) : (
                                <div className="w-6 h-6 bg-red-600 rounded-full" />
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
