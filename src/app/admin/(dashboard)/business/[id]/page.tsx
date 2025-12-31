import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Film, Image as ImageIcon, Calendar, Play, Globe, QrCode, Wand2 } from "lucide-react"

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
                    <button className="px-6 py-3 bg-black text-white rounded-2xl font-bold text-sm hover:bg-zinc-800 transition-all shadow-xl shadow-black/10 flex items-center gap-2">
                        <Film className="w-4 h-4" />
                        Generate Reel
                    </button>
                </div>
            </div>

            {/* Stats Quick View */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 bg-white rounded-[2rem] border border-zinc-100 shadow-sm">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Moments</p>
                    <p className="text-3xl font-black text-zinc-900">{business.mediaItems.length}</p>
                </div>
                <div className="p-8 bg-white rounded-[2rem] border border-zinc-100 shadow-sm">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Videos</p>
                    <p className="text-3xl font-black text-zinc-900">{videosCount}</p>
                </div>
                <div className="p-8 bg-white rounded-[2rem] border border-zinc-100 shadow-sm">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Generated Reels</p>
                    <p className="text-3xl font-black text-zinc-900">{business.reels.length}</p>
                </div>
            </div>

            {/* Media Grid */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-zinc-900">Recent Uploads</h2>
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase tracking-wider">
                            <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                            Live Feed
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {business.mediaItems.map((item: any) => (
                        <div key={item.id} className="group relative aspect-square bg-zinc-100 rounded-[1.5rem] overflow-hidden border border-zinc-100">
                            {item.type === "VIDEO" ? (
                                <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                    <Play className="w-8 h-8 text-white/20 group-hover:text-white/50 transition-colors" />
                                    <div className="absolute top-3 right-3 p-1.5 bg-black/40 backdrop-blur-md rounded-lg">
                                        <Film className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                            ) : (
                                <img
                                    src={item.url}
                                    alt="Upload"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            )}
                            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-[10px] font-bold text-white uppercase tracking-widest">
                                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}
                    {business.mediaItems.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-zinc-100">
                            <ImageIcon className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                            <p className="text-zinc-500 font-medium">No media uploaded yet for this business.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Generated Reels Section */}
            <div className="pt-8 border-t border-zinc-100 space-y-6">
                <h2 className="text-2xl font-bold text-zinc-900">Generated AI Reels</h2>
                <div className="grid gap-6 md:grid-cols-2">
                    {business.reels.map((reel: any) => (
                        <div key={reel.id} className="p-6 bg-white rounded-[2rem] border border-zinc-100 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                                    <Wand2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-zinc-900">End-of-day Reel</p>
                                    <p className="text-xs text-zinc-500">{new Date(reel.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <Link
                                href={reel.url}
                                className="px-4 py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 font-bold text-xs rounded-xl transition-all"
                            >
                                View Output
                            </Link>
                        </div>
                    ))}
                    {business.reels.length === 0 && (
                        <p className="text-sm text-zinc-400 italic">No reels generated yet.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
