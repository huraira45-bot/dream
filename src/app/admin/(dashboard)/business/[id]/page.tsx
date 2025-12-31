import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Film, Image as ImageIcon, Calendar, Play, Globe, QrCode, Wand2, Share2 } from "lucide-react"
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

            {/* Generated Reels Section */}
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
                                        {reel.type === 'POST' ? "Curated Post" : "AI Highlight Reel"}
                                    </p>
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
                        <p className="text-sm text-zinc-400 italic">No content generated yet.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
