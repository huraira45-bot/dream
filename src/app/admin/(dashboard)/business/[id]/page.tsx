import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Film, Image as ImageIcon, Calendar, Play, Globe, QrCode, Wand2, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { BusinessQRCode } from "@/components/admin/business-qr"
import { GenerateButton } from "@/components/admin/generate-button"
import { ResetMediaButton } from "@/components/admin/reset-media-button"
import { DeleteReelButton } from "@/components/admin/delete-reel-button"
import { ScheduleReelButton } from "@/components/admin/schedule-reel-button"
import { ReelStatusPoller } from "@/components/admin/reel-status-poller"
import { getUpcomingEvents } from "@/lib/calendar"
import { Loader2, Palette } from "lucide-react"

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
                where: {
                    status: { not: "DISCARDED" }
                },
                orderBy: { createdAt: "desc" }
            }
        }
    })

    if (!business) {
        notFound()
    }

    const imagesCount = business.mediaItems.filter((m: any) => m.type === "IMAGE").length
    const videosCount = business.mediaItems.filter((m: any) => m.type === "VIDEO").length

    const drafts = business.reels.filter((r: any) => r.status === "DRAFT")
    const scheduled = business.reels.filter((r: any) => r.status === "SCHEDULED")

    const upcomingEvents = await getUpcomingEvents(30) // Show next 30 days of Pakistani events

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

            {/* NEW: BRANDING & CALENDAR PREVIEW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Brand Identity */}
                <div className="bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                            <Palette className="w-5 h-5 text-pink-600" /> Brand Identity
                        </h2>
                        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Auto-Extracted</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-tight">
                                <span>Primary</span>
                                <span className="font-mono text-zinc-900">{(business as any).primaryColor || "#000000"}</span>
                            </div>
                            <div className="h-12 w-full rounded-2xl border border-zinc-100" style={{ backgroundColor: (business as any).primaryColor || "#000000" }} />
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-tight">
                                <span>Secondary</span>
                                <span className="font-mono text-zinc-900">{(business as any).secondaryColor || "#FFFFFF"}</span>
                            </div>
                            <div className="h-12 w-full rounded-2xl border border-zinc-100" style={{ backgroundColor: (business as any).secondaryColor || "#FFFFFF" }} />
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-tight">
                                <span>Accent</span>
                                <span className="font-mono text-zinc-900">{(business as any).accentColor || "#FF0000"}</span>
                            </div>
                            <div className="h-12 w-full rounded-2xl border border-zinc-100" style={{ backgroundColor: (business as any).accentColor || "#FF0000" }} />
                        </div>
                    </div>
                </div>

                {/* Calendar Wisdom */}
                <div className="bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-sm overflow-hidden relative group">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-purple-600" /> Marketing Calendar
                        </h2>
                        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest text-purple-500">Upcoming Events</span>
                    </div>

                    <div className="space-y-4">
                        {upcomingEvents.slice(0, 2).map((event, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl group/event hover:bg-zinc-100 transition-colors">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
                                    <span className="text-[10px] font-black text-purple-600 uppercase tracking-tighter">{event.date.toLocaleString('default', { month: 'short' })}</span>
                                    <span className="text-lg font-black text-zinc-900 leading-none">{event.date.getDate()}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-zinc-900 truncate">{event.title}</h4>
                                    <p className="text-xs text-zinc-500 line-clamp-1 italic">"{event.suggestionPrompt.substring(0, 40)}..."</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {upcomingEvents.length === 0 && (
                        <div className="py-8 text-center text-zinc-400 text-sm italic">No major events this week</div>
                    )}
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
                    <ResetMediaButton businessId={business.id} />
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

            {/* NEW: SCHEDULER TIMELINE */}
            {scheduled.length > 0 && (
                <div className="pt-12 border-t border-zinc-100 space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-3 tracking-tight">
                            <Calendar className="w-6 h-6 text-purple-600" /> Published & Scheduled
                        </h2>
                        <p className="text-zinc-500 text-sm mt-1">Your marketing calendar for this month</p>
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-6 -mx-6 px-6 scrollbar-hide">
                        {scheduled.map((reel: any) => (
                            <div key={reel.id} className="flex-shrink-0 w-[240px] space-y-4">
                                <div className="aspect-[9/16] rounded-[2rem] bg-zinc-900 relative overflow-hidden group shadow-2xl shadow-purple-500/10 border-2 border-zinc-100">
                                    <video src={reel.url} className="w-full h-full object-cover opacity-80" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <div className="bg-purple-600 text-white text-[10px] font-black px-2 py-1 rounded-lg w-fit mb-2 uppercase tracking-tighter shadow-lg shadow-purple-600/50">
                                            {new Date(reel.scheduledAt || reel.createdAt).toLocaleDateString()}
                                        </div>
                                        <p className="text-sm font-bold text-white line-clamp-2 leading-tight">{reel.title}</p>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link href={`/v/${reel.id}`} className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black shadow-xl">
                                            <Play className="w-5 h-5 fill-black ml-1" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* DRAFTS SECTION */}
            <div className="pt-12 border-t border-zinc-100 space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-3 tracking-tight">
                        <Wand2 className="w-6 h-6 text-pink-600 animate-pulse" /> New Drafts (Pick One)
                    </h2>
                    <p className="text-zinc-500 text-sm mt-1">Review the unique variations and schedule your favorite.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {drafts.map((reel: any) => (
                        <div key={reel.id} className="relative group bg-white rounded-[2.5rem] border border-zinc-100 p-8 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 bg-zinc-50 rounded-2xl group-hover:bg-zinc-900 group-hover:text-white transition-all">
                                    <Film className="w-6 h-6" />
                                </div>
                                <div className="px-3 py-1 bg-zinc-50 rounded-full text-[10px] font-black uppercase text-zinc-400 tracking-widest group-hover:bg-zinc-900/10">
                                    {reel.trendingAudioTip ? "Music: Hit" : "Royalty Free"}
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-zinc-900 mb-2 line-clamp-1">{reel.title}</h3>
                            <p className="text-sm text-zinc-500 line-clamp-3 mb-8 leading-relaxed italic">"{reel.caption}"</p>

                            <div className="flex items-center gap-3">
                                {reel.url.startsWith('pending') ? (
                                    <div className="w-full flex items-center gap-2">
                                        <div className="flex-1">
                                            <ReelStatusPoller reelId={reel.id} currentUrl={reel.url} />
                                        </div>
                                        <DeleteReelButton reelId={reel.id} />
                                    </div>
                                ) : (
                                    <>
                                        <ScheduleReelButton reelId={reel.id} />
                                        <Link href={`/v/${reel.id}`} className="flex-1 py-3 text-center bg-zinc-50 hover:bg-zinc-100 text-zinc-900 rounded-xl font-bold text-xs transition-all">
                                            Preview
                                        </Link>
                                        <DeleteReelButton reelId={reel.id} />
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                    {drafts.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-zinc-50 rounded-[2rem] border-2 border-dashed border-zinc-100">
                            <p className="text-sm text-zinc-400 font-medium italic">No new drafts. Click "Generate Content" to start.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
