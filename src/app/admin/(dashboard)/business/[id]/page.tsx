import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Film, Image as ImageIcon, Calendar, Play, Globe, QrCode, Wand2, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { BusinessQRCode } from "@/components/admin/business-qr"
import { GenerateButton } from "@/components/admin/generate-button"

export default async function BusinessDetail({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const business = await prisma.business.findUnique({
        where: { id },
        include: {
            mediaItems: {
                orderBy: { createdAt: "desc" }
            },
            reels: {
                orderBy: { createdAt: "desc" }
            }
        }
    })

    if (!business) {
        notFound()
    }

    const imagesCount = business.mediaItems.filter((m: any) => m.type === "IMAGE").length
    const videosCount = business.mediaItems.filter((m: any) => m.type === "VIDEO").length

    return (
        <div className="space-y-8">


            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-black transition-all group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </Link>
                    <div>
                        <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">{business.name}</h1>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1.5 text-zinc-500 text-sm font-medium">
                                <Globe className="w-4 h-4" />
                                <span>/b/{business.slug}</span>
                            </div>
                            <div className="w-1 h-1 bg-zinc-300 rounded-full" />
                            <div className="flex items-center gap-1.5 text-zinc-500 text-sm font-medium">
                                <Calendar className="w-4 h-4" />
                                <span>Joined {new Date(business.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href={`/b/${business.slug}`}
                        target="_blank"
                        className="px-6 py-3 bg-white border border-zinc-200 rounded-2xl font-bold text-sm hover:bg-zinc-50 transition-all flex items-center gap-2"
                    >
                        <QrCode className="w-4 h-4" />
                        Live Page
                    </Link>
                    <GenerateButton businessId={business.id} />
                </div>
            </div>

            {/* Stats & QR View ... remains same ... */}

            {/* Media Gallery Section */}
            <div className="pt-8 border-t border-zinc-100 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-900">Media Gallery</h2>
                        <p className="text-sm text-zinc-500">Raw content uploaded by customers</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {business.mediaItems.map((item: any) => (
                        <div key={item.id} className="group relative aspect-square bg-zinc-100 rounded-2xl overflow-hidden border border-zinc-200">
                            {item.type === "IMAGE" ? (
                                <img
                                    src={item.url}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    alt="Customer upload"
                                />
                            ) : (
                                <div className="w-full h-full relative">
                                    <video src={item.url} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                        <Play className="w-8 h-8 text-white/70 fill-white/20" />
                                    </div>
                                </div>
                            )}

                            {/* Overlay Badge */}
                            <div className="absolute top-2 right-2 flex gap-1">
                                <div className={cn(
                                    "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border",
                                    item.processed
                                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                                        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                )}>
                                    {item.processed ? "Used" : "New"}
                                </div>
                            </div>

                            {/* Type Icon Badge */}
                            <div className="absolute bottom-2 left-2 p-1.5 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 text-white">
                                {item.type === "IMAGE" ? <ImageIcon className="w-3 h-3" /> : <Film className="w-3 h-3" />}
                            </div>
                        </div>
                    ))}
                    {business.mediaItems.length === 0 && (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-zinc-100 rounded-[2rem] bg-zinc-50/50">
                            <ImageIcon className="w-8 h-8 text-zinc-300 mb-2" />
                            <p className="text-sm text-zinc-400 font-medium">No media uploaded yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Generated Content Section */}
            <div className="pt-8 border-t border-zinc-100 space-y-6">
                <h2 className="text-2xl font-bold text-zinc-900">Generated Content</h2>
                <div className="grid gap-6 md:grid-cols-2">
                    {business.reels.map((reel: any) => (
                        <div key={reel.id} className="p-6 bg-white rounded-[2rem] border border-zinc-100 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${reel.type === 'POST' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                    {reel.type === 'POST' ? <ImageIcon className="w-6 h-6" /> : <Wand2 className="w-6 h-6" />}
                                </div>
                                <div>
                                    <p className="font-bold text-zinc-900">
                                        {reel.title || (reel.type === 'POST' ? "Curated Post" : "AI Highlight Reel")}
                                    </p>
                                    {reel.caption && <p className="text-xs text-zinc-600 line-clamp-1 mt-0.5">{reel.caption}</p>}
                                    <p className="text-[10px] text-zinc-400 mt-1">{new Date(reel.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <Link
                                href={reel.url.startsWith('/') ? '#' : reel.url}
                                target={reel.url.startsWith('/') ? undefined : "_blank"}
                                className={cn(
                                    "px-4 py-2 font-bold text-xs rounded-xl transition-all",
                                    reel.url.startsWith('/')
                                        ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                                        : "bg-zinc-50 hover:bg-zinc-100 text-zinc-600"
                                )}
                            >
                                {reel.url.startsWith('/') ? "Processing..." : "View Output"}
                            </Link>
                        </div>
                    ))}
                    {business.reels.length === 0 && (
                        <p className="text-sm text-zinc-400 italic">No content generated yet.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
