import { prisma } from "@/lib/prisma"
import { Sparkles, Shield, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"

export default async function SettingsPage() {
    const settings = await (prisma as any).globalSetting.findUnique({
        where: { id: "platform-settings" }
    })

    const isConnected = !!(settings?.canvaAccessToken && settings?.canvaRefreshToken)
    const expiresAt = settings?.canvaTokenExpiresAt ? new Date(settings.canvaTokenExpiresAt).toLocaleString() : "N/A"

    return (
        <div className="max-w-4xl">
            <div className="mb-12">
                <h1 className="text-4xl font-black text-zinc-900 tracking-tight mb-2">Global Settings</h1>
                <p className="text-zinc-500 font-medium text-lg">Platform-wide configurations for automation and security.</p>
            </div>

            <div className="grid gap-8">
                {/* Canva Section */}
                <div className="bg-white rounded-[2.5rem] p-10 border border-zinc-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8">
                        <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isConnected ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {isConnected ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {isConnected ? 'System Connected' : 'Authorization Required'}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-zinc-900 leading-none">Canva Platform Auth</h2>
                            <p className="text-zinc-500 text-sm font-medium mt-1">One-time setup for global design automation.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100">
                            <div className="flex items-start gap-4">
                                <Shield className="w-5 h-5 text-zinc-400 mt-1" />
                                <div>
                                    <p className="text-sm font-bold text-zinc-900 mb-1">Zero-Hassle Mode Active</p>
                                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                                        Authorizing here allows the system to generate designs for ALL businesses using your central Canva account.
                                        Once authorized, the system will automatically refresh tokens in the background.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {isConnected && (
                            <div className="flex items-center gap-6 px-2">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Last Updated</span>
                                    <span className="text-sm font-bold text-zinc-900">{settings.updatedAt ? new Date(settings.updatedAt).toLocaleDateString() : "Never"}</span>
                                </div>
                                <div className="w-px h-8 bg-zinc-200" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Token Expiry</span>
                                    <span className="text-sm font-bold text-zinc-900">{expiresAt}</span>
                                </div>
                            </div>
                        )}

                        <div className="pt-4">
                            <Link
                                href={`/api/auth/canva/login?businessId=global`}
                                className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white rounded-2xl font-bold text-sm hover:bg-zinc-800 transition-all shadow-xl shadow-black/10"
                            >
                                <RefreshCw className={`w-4 h-4 ${isConnected ? '' : 'animate-spin'}`} />
                                {isConnected ? 'Re-authorize Global Account' : 'Connect Global Canva Account'}
                            </Link>
                            {!isConnected && (
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter mt-4 ml-2">
                                    ⚠️ Required for Static Post generation.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
