export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase-server";
import { notFound, redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { ClaimForm } from "./claim-form";
import { ShieldCheck } from "lucide-react";

// Next.js 15+ Params are Promises
export default async function ClaimPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect(`/login?next=/court/${id}/claim`);
    }

    // 2. Fetch Court
    const { data: court, error } = await supabase
        .from('courts')
        .select('id, name, city, is_claimed')
        .eq('id', id)
        .single();

    if (error || !court) {
        notFound();
    }

    // 3. Handle Already Claimed
    if (court.is_claimed) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="max-w-2xl mx-auto px-6 py-24 text-center">
                    <ShieldCheck className="w-16 h-16 text-primary mx-auto mb-6" />
                    <h1 className="text-3xl font-bold mb-4">Already Claimed</h1>
                    <p className="text-muted-foreground mb-8">
                        This court has already been verified and claimed by an owner.
                        If you believe this is an error, please contact support.
                    </p>
                    <a href={`/court/${id}`} className="text-primary hover:underline">&larr; Back to Court</a>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
                    <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-foreground">
                        Claim "{court.name}"
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        {court.city}. Prove ownership to manage this listing.
                    </p>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-lg bg-card p-8 rounded-xl border border-border">
                    <ClaimForm courtId={court.id} />
                </div>
            </div>
        </div>
    )
}
