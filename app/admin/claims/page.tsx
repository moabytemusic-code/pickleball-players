import { createClient } from "@/lib/supabase-server";
import { Navbar } from "@/components/navbar";
import { approveClaim, rejectClaim } from "../actions";
import { CheckCircle, XCircle, ShieldAlert } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AdminClaimsPage() {
    const supabase = await createClient();

    // Auth Check (Basic)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: claims, error } = await supabase
        .from('claims')
        .select(`
            *,
            business:businesses(*),
            court:courts(name, city, region)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Manage pending court claims.</p>
            </div>

            {claims && claims.length > 0 ? (
                <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {claims.map((claim: any) => (
                            <li key={claim.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                                                Pending
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(claim.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            Court: {claim.court?.name}
                                        </h3>
                                        <div className="text-sm text-gray-600 mb-4">
                                            {claim.court?.city}, {claim.court?.region}
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="block font-semibold text-gray-700">Business Name</span>
                                                {claim.business?.business_name}
                                            </div>
                                            <div>
                                                <span className="block font-semibold text-gray-700">Contact</span>
                                                {claim.business?.contact_name} ({claim.business?.contact_phone})
                                            </div>
                                            <div className="col-span-1 sm:col-span-2">
                                                <span className="block font-semibold text-gray-700">Verification Notes</span>
                                                <p className="text-gray-600 italic">"{claim.verification_notes || 'No notes provided'}"</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row md:flex-col gap-3 shrink-0">
                                        <form action={async () => {
                                            'use server';
                                            await approveClaim(claim.id, claim.court_id);
                                        }}>
                                            <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-all">
                                                <CheckCircle className="w-4 h-4" /> Approve
                                            </button>
                                        </form>

                                        <form action={async () => {
                                            'use server';
                                            await rejectClaim(claim.id);
                                        }}>
                                            <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50 hover:ring-red-400 transition-all">
                                                <XCircle className="w-4 h-4" /> Reject
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <ShieldAlert className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">No Pending Claims</h3>
                    <p className="text-gray-500">Good job! All requests have been processed.</p>
                </div>
            )}
        </div>
    )
}
