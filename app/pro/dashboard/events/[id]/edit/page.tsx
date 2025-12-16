
import { createClient } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { EditEventForm } from './edit-event-form'
import { ArrowLeft } from 'lucide-react'

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/login?next=/pro/dashboard/events/${id}/edit`);
    }

    // 1. Fetch Event & Validate Permission
    const { data: event } = await supabase
        .from('events')
        .select('*, business:businesses(owner_user_id), courts(name)')
        .eq('id', id)
        .single();

    if (!event) notFound();

    // Verify ownership
    if (event.business?.owner_user_id !== user.id) {
        return (
            <div className="p-8 text-center bg-white rounded-lg shadow">
                <h1 className="text-xl font-bold text-red-600">Access Denied</h1>
                <p>You do not have permission to edit this event.</p>
                <Link href="/pro/dashboard/events" className="text-primary hover:underline mt-4 block">Back to Events</Link>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href={`/pro/dashboard/events/${id}`} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
                    <p className="text-sm text-gray-500">
                        {event.title} • {event.courts?.name}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 sm:p-8">
                    <EditEventForm event={event} />
                </div>
            </div>
        </div>
    )
}
