
import { createClient } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, DollarSign, Users, Mail, CheckCircle, Clock } from 'lucide-react'
import { RegistrationsTable } from './registrations-table'
import { EventActions } from './event-actions'

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/login?next=/pro/dashboard/events/${id}`);
    }

    // 1. Fetch Event & Validate Permission
    const { data: event } = await supabase
        .from('events')
        .select('*, courts(id, name), business:businesses(owner_user_id)')
        .eq('id', id)
        .single();

    if (!event) notFound();

    // Verify ownership
    if (event.business?.owner_user_id !== user.id) {
        return (
            <div className="p-8 text-center bg-white rounded-lg shadow">
                <h1 className="text-xl font-bold text-red-600">Access Denied</h1>
                <p>You do not have permission to view this event.</p>
                <Link href="/pro/dashboard/events" className="text-primary hover:underline mt-4 block">Back to Events</Link>
            </div>
        )
    }

    // 2. Fetch Registrations
    const { data: registrations } = await supabase
        .from('event_registrations')
        .select(`
            *,
            profiles:user_id (
                id,
                email,
                first_name,
                last_name
            )
        `)
        .eq('event_id', id)
        .order('created_at', { ascending: false });

    const totalRevenue = (event.cost_cents || 0) * (registrations?.length || 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/pro/dashboard/events" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
                    <p className="text-sm text-gray-500">
                        {new Date(event.starts_at).toLocaleDateString()} @ {new Date(event.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        <span className="mx-2">•</span>
                        {event.courts?.name}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <EventActions eventId={event.id} isActive={event.is_active} />
                    <Link
                        href={`/pro/dashboard/events/${event.id}/edit`}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                        Edit Details
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Registrations</p>
                        <p className="text-2xl font-bold text-gray-900">{registrations?.length || 0} <span className="text-sm text-gray-400 font-normal">/ {event.max_participants || 'Unl'}</span></p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-full">
                        <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">${(totalRevenue / 100).toFixed(2)}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
                    <div className="bg-purple-100 p-3 rounded-full">
                        <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <p className="text-lg font-bold text-gray-900 uppercase">{event.is_active ? 'Active' : 'Draft'}</p>
                    </div>
                </div>
            </div>

            {/* Attendees List */}
            <RegistrationsTable registrations={registrations || []} eventId={event.id} />
        </div>
    )
}
