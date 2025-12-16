import { createClient } from "@/lib/supabase-server";
import { Navbar } from "@/components/navbar";
import { redirect } from "next/navigation";
import EditForm from "./edit-form";

export const dynamic = 'force-dynamic';

export default async function AdminCourtEditPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: court } = await supabase
        .from('courts')
        .select('*')
        .eq('id', params.id)
        .single();

    if (!court) {
        return (
            <div className="p-12 text-center">
                <h1 className="text-xl font-bold">Court Not Found</h1>
            </div>
        );
    }

    const { data: photos } = await supabase
        .from('photos')
        .select('*')
        .eq('court_id', params.id)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

    return (
        <EditForm court={court} photos={photos || []} />
    );
}
