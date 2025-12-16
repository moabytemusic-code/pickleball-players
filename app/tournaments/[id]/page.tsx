import { createClient } from "@/lib/supabase-server";
import { Navbar } from "@/components/navbar";
import { Calendar, MapPin, Clock, Banknote, Users, Share2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RegisterButton } from "./register-button";

export const dynamic = 'force-dynamic';

export default async function EventPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ success?: string, canceled?: string }>
}) {
    const { id } = await params;
    const { success, canceled } = await searchParams;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Fetch Event + Court
    const { data: event, error } = await supabase
        .from('events')
        .select('*, courts(id, name, city, address)')
        .eq('id', id)
        .single();

    if (error || !event) {
        notFound();
    }

    // 2. Fetch Registration Status
    let isRegistered = false;
    if (user) {
        const { data: reg } = await supabase
            .from('event_registrations')
            .select('id')
            .eq('event_id', id)
            .eq('user_id', user.id)
            .single();
        if (reg) isRegistered = true;
    }

    // 3. Fetch Participant Count
    const { count } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', id);


    const startDate = new Date(event.starts_at);
    const endDate = new Date(event.ends_at);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar position="relative" className="bg-white border-b border-gray-200" />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <div className="mb-6">
                    <Link href="/tournaments" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Events
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">

                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center gap-3">
                                <span className="bg-green-100 p-1 rounded-full">✓</span>
                                <div>
                                    <p className="font-bold">Registration Successful!</p>
                                    <p className="text-sm">You're in. Check your email for confirmation details.</p>
                                </div>
                            </div>
                        )}

                        {canceled && (
                            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl">
                                <p className="font-bold">Payment Canceled</p>
                                <p className="text-sm">You have not been charged. Feel free to try again when you're ready.</p>
                            </div>
                        )}

                        {/* Header Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="h-48 bg-gray-900 relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-primary opacity-80" />
                                <div className="absolute bottom-0 left-0 p-8">
                                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur text-white text-xs font-bold rounded mb-3 uppercase tracking-wider">
                                        {event.event_kind.replace('_', ' ')}
                                    </span>
                                    <h1 className="text-3xl font-bold text-white mb-2 shadow-sm">{event.title}</h1>
                                    <div className="flex items-center text-white/90 text-sm gap-4">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4" />
                                            {startDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4" />
                                            {event.courts.city}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="prose max-w-none text-gray-600">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">About this Event</h3>
                                    <p>{event.description || "No description provided for this event."}</p>
                                </div>

                                <div className="mt-8 border-t border-gray-100 pt-8 grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Format</label>
                                        <div className="font-medium text-gray-900 mt-1 capitalize">{event.event_kind.replace('_', ' ')}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Skill Level</label>
                                        <div className="font-medium text-gray-900 mt-1">{event.skill_level || 'Open to All'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-gray-400" /> Location
                            </h3>
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-semibold text-gray-900 text-lg">{event.courts.name}</div>
                                    <div className="text-gray-500 mt-1">{event.courts.address || event.courts.city}</div>
                                </div>
                                <Link
                                    href={`/court/${event.courts.id}`}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                                >
                                    View Court
                                </Link>
                            </div>
                        </div>

                    </div>

                    {/* Sidebar CTA */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-24">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <div className="text-3xl font-bold text-gray-900">
                                        {event.cost_cents ? `$${(event.cost_cents / 100).toFixed(2)}` : 'Free'}
                                    </div>
                                    <div className="text-sm text-gray-500">per player</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900">{count || 0}</div>
                                    <div className="text-xs text-gray-500 uppercase font-bold">Registered</div>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Clock className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <div className="text-sm font-bold">Start Time</div>
                                        <div className="text-sm">{startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Clock className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <div className="text-sm font-bold">End Time</div>
                                        <div className="text-sm">{endDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div>
                                    </div>
                                </div>
                            </div>

                            <RegisterButton eventId={event.id} isRegistered={isRegistered} className="w-full" />

                            <p className="text-xs text-center text-gray-400 mt-4">
                                {isRegistered
                                    ? "You are all set! Check your email for details."
                                    : "Limited spots available. Secure your spot now."}
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
