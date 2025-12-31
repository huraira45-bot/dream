import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus, LayoutDashboard, Globe, Image as ImageIcon, ArrowUpRight } from "lucide-react"

export default async function AdminDashboard() {
    const businesses = await prisma.business.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { mediaItems: true }
            }
        }
    })

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Dashboard</h1>
                    <p className="text-zinc-500 mt-1">Manage your connected businesses and monitor uploads.</p>
                </div>
                <Link
                    href="/admin/new-business"
                    className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-black/20 hover:bg-zinc-800 transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Register Business
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {businesses.map((business) => (
                    <div
                        key={business.id}
                        className="group relative rounded-3xl bg-white p-8 shadow-sm border border-zinc-100 hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-300"
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center group-hover:bg-purple-50 transition-colors">
                                <LayoutDashboard className="w-6 h-6 text-zinc-400 group-hover:text-purple-600 transition-colors" />
                            </div>
                            <Link
                                href={`/b/${business.slug}`}
                                target="_blank"
                                className="p-2 bg-zinc-50 rounded-full text-zinc-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                title="View Public Page"
                            >
                                <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <h2 className="text-xl font-bold text-zinc-900 mb-1">{business.name}</h2>
                        <div className="flex items-center gap-1.5 text-zinc-400 text-sm mb-6">
                            <Globe className="w-3.5 h-3.5" />
                            <span>/{business.slug}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-zinc-50">
                            <div className="space-y-1">
                                <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Total Media</p>
                                <div className="flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-zinc-900" />
                                    <span className="text-lg font-bold text-zinc-900">{business._count.mediaItems}</span>
                                </div>
                            </div>
                            <div className="flex items-end justify-end">
                                <Link
                                    href={`/admin/business/${business.id}`}
                                    className="text-sm font-bold text-black border-b-2 border-transparent hover:border-black transition-all"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {businesses.length === 0 && (
                    <div className="col-span-full py-20 bg-zinc-50 rounded-[2.5rem] border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-zinc-100 rounded-3xl flex items-center justify-center mb-6">
                            <Plus className="w-10 h-10 text-zinc-300" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900">No businesses found</h3>
                        <p className="text-zinc-500 mt-2 max-w-xs mx-auto">
                            Setup your first business to start generating AI-powered reels.
                        </p>
                        <Link
                            href="/admin/new-business"
                            className="mt-8 font-bold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            Create one now &rarr;
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
