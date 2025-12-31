import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

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
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-white shadow-md">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-800">Dream Admin</h1>
                </div>
                <nav className="mt-6 px-4">
                    <Link
                        href="/admin"
                        className="block rounded-md px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/admin/new-business"
                        className="mt-2 block rounded-md px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                        Register Business
                    </Link>
                </nav>
            </aside>
            <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
    )
}
