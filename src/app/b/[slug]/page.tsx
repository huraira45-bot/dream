import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { UploadForm } from "./upload-form" // We'll create this client component

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
        <div className="min-h-screen bg-black text-white flex flex-col items-center py-10 px-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2">
                {business.name}
            </h1>
            <p className="text-gray-400 mb-8 max-w-sm text-center">
                Review your experience! capture a moment to be featured in our daily reel.
            </p>

            <div className="w-full max-w-md bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                <UploadForm businessId={business.id} />
            </div>

            <footer className="mt-12 text-zinc-600 text-sm">
                Powered by Dream App
            </footer>
        </div>
    )
}
