
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Store, Calendar, CreditCard, LogOut, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'

export function Sidebar() {
    const pathname = usePathname();
    const supabase = createClient();

    const links = [
        { href: '/pro/dashboard', label: 'Overview', icon: LayoutDashboard },
        { href: '/pro/dashboard/listings', label: 'My Listings', icon: MapPin }, // Updated icon to MapPin for clarity
        { href: '/pro/dashboard/events', label: 'Events', icon: Calendar },
        { href: '/pro/dashboard/subscription', label: 'Subscription', icon: CreditCard },
    ];

    async function handleSignOut() {
        await supabase.auth.signOut();
        window.location.href = '/';
    }

    return (
        <div className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-64">
                <div className="flex flex-col h-0 flex-1 bg-gray-900 shadow-xl">
                    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                        <div className="flex items-center flex-shrink-0 px-4 mb-5">
                            <span className="text-xl font-bold text-white tracking-wider">PRO PORTAL</span>
                        </div>
                        <nav className="mt-5 flex-1 px-2 space-y-1">
                            {links.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                                ? 'bg-gray-800 text-white'
                                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                            }`}
                                    >
                                        <link.icon className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-300'
                                            }`} />
                                        {link.label}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>
                    <div className="flex-shrink-0 flex bg-gray-800 p-4">
                        <button
                            onClick={handleSignOut}
                            className="flex-shrink-0 w-full group block"
                        >
                            <div className="flex items-center">
                                <LogOut className="inline-block h-5 w-5 text-gray-400 group-hover:text-gray-300" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-300 group-hover:text-white">Sign Out</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
