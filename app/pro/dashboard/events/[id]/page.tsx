
import { createClient } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, DollarSign, Users, Mail, CheckCircle, Clock } from 'lucide-react'

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
                <div>
                    <Link
                        href={`/court/${event.court_id}/events/${event.id}/edit`}
                        /* Note: We haven't built the edit page at this specific URL yet, usually re-use the create form or a dedicated edit page. 
                           For now, we can link to the public page or just hide this until Edit is ready.
                           Actually, we can use the listing editor approach but for events.
                        */
                        className="hidden inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
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
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Attendees</h3>
                    <button className="text-sm text-primary hover:underline">Download CSV</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Player
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Data Registered
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Payment
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {registrations?.map((reg: any) => (
                                <tr key={reg.user_id + reg.event_id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {reg.profiles?.first_name
                                                ? `${reg.profiles.first_name} ${reg.profiles.last_name || ''}`
                                                : 'Unknown User'
                                            }
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                            {reg.profiles?.email || 'No email provided'}
                                            {/* Note: profiles table might not have email depending on sync, fallback needed? */}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(reg.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {reg.payment_status === 'paid' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <CheckCircle className="w-3 h-3 mr-1" /> Paid
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                <Clock className="w-3 h-3 mr-1" /> Pending
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {(!registrations || registrations.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        No registrations yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
