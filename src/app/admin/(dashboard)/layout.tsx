import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LayoutDashboard, PlusCircle, LogOut, Wand2, User, Settings } from "lucide-react"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/admin/login")
    }

    return (
        <div className="flex h-screen bg-[#fafafa] font-sans text-zinc-900">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-zinc-200 flex flex-col">
                <div className="p-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                            <Wand2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Dream Admin</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-zinc-600 hover:bg-zinc-50 hover:text-black transition-all"
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </Link>
                    <Link
                        href="/admin/new-business"
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-zinc-600 hover:bg-zinc-50 hover:text-black transition-all"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Register Business
                    </Link>
                    <Link
                        href="/admin/settings"
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-zinc-600 hover:bg-zinc-50 hover:text-black transition-all"
                    >
                        <Settings className="w-5 h-5" />
                        Global Settings
                    </Link>
                </nav>

                <div className="p-4 mt-auto border-t border-zinc-100">
                    <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center">
                                <User className="w-4 h-4 text-zinc-500" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-zinc-900 truncate max-w-[100px]">{session.user?.email?.split('@')[0]}</span>
                                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Admin</span>
                            </div>
                        </div>
                        <Link
                            href="/api/auth/signout"
                            className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-zinc-400"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden">
                <div className="max-w-7xl mx-auto p-12">
                    {children}
                </div>
            </main>
        </div>
    )
}
