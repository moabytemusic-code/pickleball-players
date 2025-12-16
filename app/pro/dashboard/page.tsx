
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Plus, AlertTriangle, CheckCircle } from 'lucide-react'

export default async function ProDashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch user's business/courts
    // For now, businesses are linked via 'owner_user_id'
    const { data: businesses } = await supabase
        .from('businesses')
        .select('*, courts(*)')
        .eq('owner_user_id', user?.id);

    const hasBusinesses = businesses && businesses.length > 0;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>

            {!hasBusinesses ? (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
                    <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Verified Courts Yet</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-6">
                        Claim a court to start managing events, updating photos, and viewing analytics.
                    </p>
                    <Link
                        href="/search?claim=true"
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Find & Claim Court
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Stats Card - Placeholder */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500">Total Profile Views</h3>
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900">0</div>
                        <p className="text-xs text-gray-400 mt-1">Last 30 days</p>
                    </div>
                </div>
            )}
        </div>
    )
}
