import { prisma } from "@/lib/prisma"
import Link from "next/link"

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
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Businesses</h1>
                <Link
                    href="/admin/new-business"
                    className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                    Add Business
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {businesses.map((business) => (
                    <div key={business.id} className="rounded-lg bg-white p-6 shadow">
                        <h2 className="text-xl font-semibold mb-2">{business.name}</h2>
                        <p className="text-gray-500 text-sm mb-4">/{business.slug}</p>
                        <div className="flex justify-between items-center text-sm text-gray-600">
                            <span>Uploads: {business._count.mediaItems}</span>
                            <Link href={`/admin/business/${business.id}`} className="text-blue-600 hover:underline">
                                Manage
                            </Link>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <Link href={`/b/${business.slug}`} target="_blank" className="text-sm font-medium text-gray-900 hover:text-blue-600">
                                Open Public Page &rarr;
                            </Link>
                        </div>
                    </div>
                ))}
                {businesses.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500">
                        No businesses found. Create one to get started.
                    </div>
                )}
            </div>
        </div>
    )
}
