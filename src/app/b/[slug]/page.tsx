import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { UploadForm } from "./upload-form"
import { Wand2, Instagram, Music } from "lucide-react"

export default async function BusinessPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params

    const business = await prisma.business.findUnique({
        where: { slug },
    })

    if (!business) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
            {/* Immersive Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-purple-600/20 to-transparent blur-3xl opacity-50" />
                <div className="absolute bottom-0 left-0 w-full h-[400px] bg-gradient-to-t from-pink-600/10 to-transparent blur-3xl opacity-30" />
            </div>

            <main className="max-w-md mx-auto px-6 py-12 flex flex-col items-center">
                {/* Header / Brand */}
                <div className="flex flex-col items-center mb-12 text-center">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-white/10">
                        < Music className="w-8 h-8 text-black" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-3">
                        {business.name}
                    </h1>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        <Instagram className="w-4 h-4 text-pink-500" />
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Moment Capture</span>
                    </div>
                </div>

                {/* Upload Experience */}
                <div className="w-full">
                    <UploadForm businessId={business.id} />
                </div>

                {/* Social Proof / Footer */}
                <div className="mt-16 text-center space-y-6">
                    <div className="flex items-center justify-center -space-x-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center overflow-hidden">
                                <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900" />
                            </div>
                        ))}
                        <div className="w-10 h-10 rounded-full border-2 border-black bg-white flex items-center justify-center text-[10px] font-black text-black">
                            +12
                        </div>
                    </div>
                    <p className="text-sm text-zinc-500 font-medium">
                        Join others capturing their best <br /> moments at <span className="text-white">{business.name}</span>.
                    </p>

                    <div className="pt-12 flex items-center justify-center gap-2 text-zinc-700">
                        <Wand2 className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Powered by Dream App</span>
                    </div>
                </div>
            </main>
        </div>
    )
}
