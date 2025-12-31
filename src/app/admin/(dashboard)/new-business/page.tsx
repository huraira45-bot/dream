"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NewBusiness() {
    const [name, setName] = useState("")
    const [slug, setSlug] = useState("")
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // We need an API endpoint to create business
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

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-6">Register New Business</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Business Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value)
                            // Auto-slug
                            if (!slug) {
                                setSlug(e.target.value.toLowerCase().replace(/ds+/g, "-"))
                            }
                        }}
                        className="mt-1 w-full rounded-md border border-gray-300 p-2"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Slug (URL Identifier)</label>
                    <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="mt-1 w-full rounded-md border border-gray-300 p-2"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Example: just-pizza (will be accessible at /b/just-pizza)
                    </p>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "Creating..." : "Create Business"}
                </button>
            </form>
        </div>
    )
}
