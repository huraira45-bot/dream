import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Share2, Play, Image as ImageIcon, Music, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { CinematicPlayer } from "@/components/admin/cinematic-player"

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

    // Fetch all media items in the correct sequence
    let sortedMedia = []
    if (reel.mediaItemIds && reel.mediaItemIds.length > 0) {
        const mediaItems = await prisma.mediaItem.findMany({
            where: {
                id: { in: reel.mediaItemIds }
            }
        })
        // Sort to maintain chronological/curated order
        sortedMedia = reel.mediaItemIds.map((id: string) => mediaItems.find((m: { id: string }) => m.id === id)).filter(Boolean) as any[]
    }

    // Fallback for older reels or reels with no sequence
    if (sortedMedia.length === 0) {
        sortedMedia = [{
            id: reel.id,
            url: reel.url,
            type: reel.type === 'REEL' ? 'video' : 'image'
        }]
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-hidden">
            {/* Top Navigation */}
            <div className="fixed top-0 inset-x-0 z-50 p-6 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
                <Link
                    href={`/admin/business/${reel.businessId}`}
                    className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-white/20 transition-all group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </Link>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Cinematic Reel</span>
                    <span className="text-sm font-bold tracking-tight">{reel.business.name}</span>
                </div>
                <button className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-white/20 transition-all">
                    <Share2 className="w-5 h-5" />
                </button>
            </div>

            {/* Master Production Player */}
            <div className="relative h-[100dvh] w-full flex items-center justify-center">
                {/* Background Blur Effect */}
                <div
                    className="absolute inset-0 opacity-20 blur-[120px] scale-150 rotate-12 bg-gradient-to-br from-purple-600 via-blue-600 to-transparent"
                />

                <div className="relative w-full max-w-[450px] aspect-[9/16] bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 mx-4">
                    <div className="w-full h-full relative group">
                        <video
                            src={reel.url}
                            className="w-full h-full object-cover"
                            autoPlay
                            loop
                            playsInline
                            controls
                        />

                        {/* Pro Overlay Details */}
                        <div className="absolute top-8 inset-x-0 px-8 pointer-events-none">
                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1 bg-purple-500 rounded-lg text-[10px] font-black uppercase tracking-widest text-white shadow-lg">AI Master</div>
                                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">4K Rendered</div>
                            </div>
                        </div>

                        {/* Metadata Footer */}
                        <div className="absolute bottom-0 inset-x-0 p-8 pb-12 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <h1 className="text-xl font-black tracking-tight text-white drop-shadow-md">{reel.title}</h1>
                                    <p className="text-sm text-white/80 line-clamp-2 drop-shadow-sm">{reel.caption}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center animate-spin-slow">
                                            <Music className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none">Studio Audio</p>
                                            <p className="text-xs font-bold text-white truncate">Pro Master Track</p>
                                        </div>
                                    </div>

                                    <a
                                        href={reel.url}
                                        download="Dream-AI-Master.mp4"
                                        target="_blank"
                                        className="p-3 bg-purple-600 text-white rounded-2xl shadow-lg border border-purple-400/50 hover:bg-purple-500 transition-all pointer-events-auto"
                                    >
                                        <Share2 className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
