import Link from "next/link";
import { LayoutDashboard, MapPin, Users, Settings, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/navbar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Use Public Navbar for consistent logged-in state/auth button */}
            <Navbar />

            <div className="flex flex-1">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
                    <div className="p-6">
                        <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
                            Admin
                        </h2>
                    </div>
                    <nav className="px-3">
                        <Link
                            href="/admin"
                            className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 mb-1"
                        >
                            <TrendingUp size={20} />
                            Overview
                        </Link>
                        <Link
                            href="/admin/claims"
                            className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 mb-1"
                        >
                            <LayoutDashboard size={20} />
                            Claims
                        </Link>
                        <Link
                            href="/admin/courts"
                            className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 mb-1"
                        >
                            <MapPin size={20} />
                            Courts
                        </Link>
                        <Link
                            href="/admin/users"
                            className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 mb-1"
                        >
                            <Users size={20} />
                            Users
                        </Link>
                    </nav>
                </aside>

                {/* Content */}
                <main className="flex-1 p-6 md:p-12">
                    {children}
                </main>
            </div>
        </div>
    );
}
