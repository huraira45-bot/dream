import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Share2, Play, Image as ImageIcon, Music, Heart } from "lucide-react"
import { cn } from "@/lib/utils"

export default async function ReelViewer({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const reel = await prisma.generatedReel.findUnique({
        where: { id },
        include: {
            business: true
        }
    })

    if (!reel) {
        notFound()
    }

    const isVideo = reel.type === 'REEL'

    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
            {/* Top Navigation */}
            <div className="fixed top-0 inset-x-0 z-50 p-6 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
                <Link
                    href={`/admin/business/${reel.businessId}`}
                    className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-white/20 transition-all group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </Link>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Now Viewing</span>
                    <span className="text-sm font-bold tracking-tight">{reel.business.name}</span>
                </div>
                <button className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-white/20 transition-all">
                    <Share2 className="w-5 h-5" />
                </button>
            </div>

            {/* Immersive Content Container */}
            <div className="relative h-[100dvh] w-full flex items-center justify-center overflow-hidden">
                {/* Background Blur Effect */}
                <div
                    className="absolute inset-0 opacity-30 blur-[100px] scale-150 rotate-12"
                    style={{
                        background: `radial-gradient(circle at center, ${isVideo ? '#7c3aed' : '#2563eb'} 0%, transparent 70%)`
                    }}
                />

                <div className="relative w-full max-w-[450px] aspect-[9/16] bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] border border-white/10 mx-4">
                    {isVideo ? (
                        <div className="relative w-full h-full group">
                            <video
                                src={reel.url}
                                className="w-full h-full object-cover"
                                autoPlay
                                loop
                                muted
                                playsInline
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 pointer-events-none" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="p-5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                                    <Play className="w-10 h-10 fill-white" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative w-full h-full">
                            <img
                                src={reel.url}
                                className="w-full h-full object-cover shadow-2xl scale-105"
                                alt="AI Generated Post"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
                        </div>
                    )}

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 inset-x-0 p-8 space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border",
                                    isVideo
                                        ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                                        : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                )}>
                                    {isVideo ? 'Highlight Reel' : 'Curated Post'}
                                </span>
                            </div>
                            <h1 className="text-2xl font-black leading-tight tracking-tight drop-shadow-lg">
                                {reel.title || 'Untitled Creation'}
                            </h1>
                            <p className="text-zinc-300 text-sm leading-relaxed font-medium drop-shadow-md">
                                {reel.caption}
                            </p>
                        </div>

                        {/* Social/Status Bar */}
                        <div className="pt-2 flex items-center justify-between border-t border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10 shrink-0">
                                    <Music className="w-4 h-4 text-white/60" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Original Audio</p>
                                    <p className="text-xs font-semibold truncate">AI Suggested Mood: Energetic</p>
                                </div>
                            </div>
                            <button className="flex flex-col items-center gap-1 group">
                                <div className="p-2.5 bg-white/10 rounded-2xl border border-white/10 group-hover:bg-red-500/20 group-hover:border-red-500/30 transition-all">
                                    <Heart className="w-5 h-5 group-hover:fill-red-500 group-hover:text-red-500 transition-all" />
                                </div>
                                <span className="text-[10px] font-bold text-white/40">1.2k</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Floating Branding */}
            <div className="fixed bottom-10 inset-x-0 flex justify-center pointer-events-none">
                <div className="px-6 py-3 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                    <span className="text-xs font-bold tracking-widest uppercase opacity-40">Generated by Dream AI</span>
                </div>
            </div>
        </div>
    )
}
