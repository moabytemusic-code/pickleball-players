import { createClient } from "@/lib/supabase-server";
import { notFound, redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { EventForm } from "./event-form";

// Next.js 15+ Params are Promises
export default async function NewEventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect(`/login?next=/court/${id}/events/new`);
    }

    // 2. Fetch Court Name
    const { data: court, error } = await supabase.from('courts').select('id, name').eq('id', id).single();
    if (error || !court) notFound();

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-foreground">
                        Host an Event at {court.name}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        Create an open play, social, or tournament.
                    </p>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md bg-card p-8 rounded-xl border border-border">
                    <EventForm courtId={court.id} />
                </div>
            </div>
        </div>
    )
}
