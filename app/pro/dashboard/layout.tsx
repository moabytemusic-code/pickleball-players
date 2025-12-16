
'use client'

import { createClient } from '@/lib/supabase-client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './sidebar' // We'll create this next
import { Loader2, AlertCircle } from 'lucide-react'

export default function ProDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        async function checkAuth() {
            const { data: { user }, error } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login?next=/pro/dashboard');
                return;
            }

            // Check if they manage any businesses/courts (simplified check for now)
            // In a real app, we'd check the 'businesses' table or a claim status.
            // For MVP, we treat any logged-in user in this route as a potential pro, 
            // but the content will show empty states if they have no claims.

            setAuthorized(true);
            setLoading(false);
        }
        checkAuth();
    }, [router, supabase]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!authorized) return null;

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
