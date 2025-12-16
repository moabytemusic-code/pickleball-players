import { createClient } from "@/lib/supabase-server";
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Navbar } from "@/components/navbar";
import { redirect } from "next/navigation";
import Link from "next/link";
import EditForm from "./edit-form";

export const dynamic = 'force-dynamic';

export default async function AdminCourtEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Validate UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
        return (
            <div className="p-12 text-center">
                <h1 className="text-xl font-bold text-red-600">Invalid Court ID</h1>
                <p className="text-gray-500 mt-2">The ID provided is not valid: {id}</p>
                <Link href="/admin/courts" className="text-primary hover:underline mt-4 block">Back to Courts</Link>
            </div>
        );
    }

    if (!serviceRoleKey) {
        return (
            <div className="p-12 text-center">
                <h1 className="text-xl font-bold text-red-600">Configuration Error</h1>
                <p className="text-gray-500 mt-2">Missing SUPABASE_SERVICE_ROLE_KEY environment variable.</p>
            </div>
        );
    }

    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Use Admin client to bypass RLS
    const { data: court, error } = await supabaseAdmin
        .from('courts')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !court) {
        return (
            <div className="p-12 text-center">
                <h1 className="text-xl font-bold text-red-600">Court Not Found</h1>
                <p className="text-gray-500 mt-2">ID: {id}</p>
                <p className="text-gray-400 text-sm mt-1">{error?.message}</p>
            </div>
        );
    }

    const { data: photos } = await supabaseAdmin
        .from('photos')
        .select('*')
        .eq('court_id', id)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

    return (
        <EditForm court={court} photos={photos || []} />
    );
}
