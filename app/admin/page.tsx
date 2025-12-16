import { createClient } from "@/lib/supabase-server";
import { Navbar } from "@/components/navbar";
import { Users, MapPin, CheckCircle, TrendingUp, AlertCircle } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Parallel fetch for stats
    const [
        { count: userCount },
        { count: courtCount },
        { count: verifiedCourtCount },
        { count: pendingClaimsCount },
        { data: recentClaims }
    ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }), // Assuming profiles table exists, else auth.users (not accessible directly via client usually, but here we are server side. Actually supabase.from('profiles') is safer if it exists, otherwise we might fail counting users. Let's assume businesses or courts for now if profiles missing.)
        supabase.from('courts').select('*', { count: 'exact', head: true }),
        supabase.from('courts').select('*', { count: 'exact', head: true }).eq('is_claimed', true),
        supabase.from('claims').select('*', { count: 'exact', head: true }).eq('status', 'verified').eq('status', 'pending'), // Wait, eq pending
        supabase.from('claims').select('*, court:courts(name), business:businesses(business_name)').order('created_at', { ascending: false }).limit(5)
    ]);

    // Fix pending count query above
    const { count: pendingCountActual } = await supabase
        .from('claims')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Overview</h1>
                <p className="text-gray-600">Platform health and key metrics.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Total Courts</h3>
                        <MapPin className="text-primary w-5 h-5" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{courtCount || 0}</div>
                    <div className="text-xs text-green-600 mt-1 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" /> All locations
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Verified Owners</h3>
                        <CheckCircle className="text-blue-500 w-5 h-5" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{verifiedCourtCount || 0}</div>
                    <div className="text-xs text-blue-600 mt-1">
                        {Math.round(((verifiedCourtCount || 0) / (courtCount || 1)) * 100)}% coverage
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Pending Requests</h3>
                        <AlertCircle className="text-orange-500 w-5 h-5" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{pendingCountActual || 0}</div>
                    <div className="text-xs text-gray-500 mt-1">
                        Requires action
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Total Businesses</h3>
                        <Users className="text-purple-500 w-5 h-5" />
                    </div>
                    {/* Temporarily using business count as proxy for 'Users' since strict auth user count is harder */}
                    <div className="text-3xl font-bold text-gray-900">N/A</div>
                    <div className="text-xs text-gray-400 mt-1">
                        (Tracking coming soon)
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Claims</h3>
                    {recentClaims && recentClaims.length > 0 ? (
                        <ul className="space-y-4">
                            {recentClaims.map((claim: any) => (
                                <li key={claim.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${claim.status === 'verified' ? 'bg-green-500' : 'bg-orange-500'}`} />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{claim.business?.business_name}</p>
                                            <p className="text-xs text-gray-500">Claimed {claim.court?.name}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">{new Date(claim.created_at).toLocaleDateString()}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-sm">No recent activity.</p>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center text-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Quick Actions</h3>
                    <p className="text-sm text-gray-500 mb-6">Manage your platform efficiently.</p>

                    <div className="grid grid-cols-2 gap-4 w-full">
                        <a href="/admin/claims" className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
                            <AlertCircle className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                            <span className="block text-sm font-medium text-gray-700">Review Claims</span>
                        </a>
                        <a href="/admin/courts" className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
                            <MapPin className="w-6 h-6 text-green-500 mx-auto mb-2" />
                            <span className="block text-sm font-medium text-gray-700">Manage Courts</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
