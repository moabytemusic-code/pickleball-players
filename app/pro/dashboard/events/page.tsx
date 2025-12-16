
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Plus, Calendar } from 'lucide-react'

export default async function EventsManagerPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Get Businesses (to find courts owned)
    const { data: businesses } = await supabase
        .from('businesses')
        .select('id, courts(id, name)')
        .eq('owner_user_id', user?.id);

    const courtIds = businesses?.map((b: any) => b.courts?.id).filter(Boolean) || [];

    // 2. Get Events for those courts with registration counts
    let events: any[] = [];
    if (courtIds.length > 0) {
        // Supabase allows counting related rows
        const { data } = await supabase
            .from('events')
            .select(`
                *, 
                courts(name),
                event_registrations(count)
            `)
            .in('court_id', courtIds)
            .order('starts_at', { ascending: true });
        events = data || [];
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Event Manager</h1>
                {/* Find first court to link new event to, or general create page if we had one */}
                {courtIds.length > 0 && (
                    <Link
                        href={`/court/${courtIds[0]}/events/new`}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Create Event
                    </Link>
                )}
            </div>

            <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Event
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Registrations
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Revenue
                                        </th>
                                        <th scope="col" className="relative px-6 py-3">
                                            <span className="sr-only">Edit</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {events.map((event) => {
                                        const regCount = event.event_registrations[0]?.count || 0;
                                        const revenue = (event.cost_cents || 0) * regCount;

                                        return (
                                            <tr key={event.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="text-sm font-medium text-gray-900">{event.title}</div>
                                                    </div>
                                                    <div className="text-sm text-gray-500 capitalize">{event.event_kind.replace('_', ' ')} • {event.courts?.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{new Date(event.starts_at).toLocaleDateString()}</div>
                                                    <div className="text-sm text-gray-500">{new Date(event.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {regCount} / {event.max_participants || 'Unl'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                    ${(revenue / 100).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link href={`/pro/dashboard/events/${event.id}`} className="text-primary hover:text-indigo-900">
                                                        Manage
                                                    </Link>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    {events.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                <Calendar className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                                No events created yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
