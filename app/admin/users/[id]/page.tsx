
import { createClient } from "@/lib/supabase-server";
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from "next/navigation";
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { EditUserForm } from "./edit-user-form";

export const dynamic = 'force-dynamic';

export default async function EditUserPage({ params }: { params: { id: string } }) {
    // 1. Verify Verification
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const userId = params.id;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
        return <div className="p-8">Error: Service Role Key missing.</div>;
    }

    // 2. Fetch User Details
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: { user: targetUser }, error } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (error || !targetUser) {
        return (
            <div className="max-w-4xl mx-auto p-8">
                <div className="bg-red-50 p-4 rounded-lg text-red-700 mb-4">
                    User not found or error loading user: {error?.message}
                </div>
                <Link href="/admin/users" className="text-primary hover:underline">&larr; Back to Users</Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <Link href="/admin/users" className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Users
            </Link>

            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Edit User Profile</h1>
                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-500">{targetUser.id}</span>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <EditUserForm user={targetUser} />
            </div>
        </div>
    );
}
