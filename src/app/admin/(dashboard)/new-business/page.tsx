"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Globe, ArrowLeft, Loader2, Sparkles } from "lucide-react"
import Link from "next/link"

export default function NewBusiness() {
    const [name, setName] = useState("")
    const [slug, setSlug] = useState("")
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const res = await fetch("/api/businesses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, slug }),
        })

        if (res.ok) {
            router.push("/admin")
            router.refresh()
        } else {
            alert("Failed to create business")
        }
        setLoading(false)
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setName(val)
        // Only auto-update slug if it's currently empty or previously derived from name
        const derivedSlug = val.toLowerCase().trim().replace(/[\s\W]+/g, "-")
        setSlug(derivedSlug)
    }

    return (
        <div className="max-w-xl">
            <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-black mb-8 transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </Link>

            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-zinc-100">
                <div className="mb-8">
                    <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 text-purple-600">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">New Business</h1>
                    <p className="text-zinc-500 mt-2">Create a unique space for a new restaurant or shop.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Business Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={handleNameChange}
                            placeholder="e.g. Blue Pepper Bistro"
                            className="w-full bg-zinc-50 border-none rounded-2xl p-4 text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none font-medium"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            URL Identifier (Slug)
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">/b/</div>
                            <input
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[\s\W]+/g, "-"))}
                                placeholder="blue-pepper"
                                className="w-full bg-zinc-50 border-none rounded-2xl p-4 pl-10 text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none font-medium"
                                required
                            />
                        </div>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest px-1">
                            This is the unique link customers will scan.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !name || !slug}
                        className="w-full mt-4 bg-black hover:bg-zinc-800 text-white font-bold py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/10 active:scale-[0.98]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Creating Space...
                            </>
                        ) : "Register Business"}
                    </button>
                </form>
            </div>
        </div>
    )
}
