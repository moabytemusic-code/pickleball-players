import { createClient } from "@/lib/supabase-server";
import { Navbar } from "@/components/navbar";
import { User, MessageSquare, Calendar, ArrowRight, Activity } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function CommunityPage() {
    const supabase = await createClient();

    // Fetch Recent Reviews
    const { data: reviews } = await supabase
        .from('reviews')
        .select('*, courts(id, name, city)')
        .order('created_at', { ascending: false })
        .limit(10);

    // Fetch Upcoming Events
    const { data: events } = await supabase
        .from('events')
        .select('*, courts(id, name, city)')
        .gt('starts_at', new Date().toISOString())
        .order('starts_at', { ascending: true })
        .limit(5);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />

            <div className="bg-primary/90 py-16 text-center text-white">
                <div className="flex justify-center mb-4">
                    <Activity className="w-12 h-12" />
                </div>
                <h1 className="text-4xl font-bold">Community Activity</h1>
                <p className="mt-2 text-white/80 max-w-2xl mx-auto px-4">See what other players are saying about local courts and check out upcoming events.</p>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* Reviews Feed */}
                <div className="lg:col-span-2 space-y-8">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <MessageSquare className="text-primary w-6 h-6" /> Recent Reviews
                    </h2>

                    <div className="space-y-4">
                        {reviews && reviews.length > 0 ? reviews.map((review: any) => (
                            <div key={review.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 transition-all hover:shadow-md">
                                <div className="shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                                        <User className="w-6 h-6 text-gray-400" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <h3 className="font-semibold text-gray-900">Verified Player</h3>
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">{new Date(review.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex text-yellow-400 my-1 text-lg">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-200"}>★</span>
                                        ))}
                                    </div>
                                    <p className="text-gray-600 my-3 leading-relaxed">"{review.comment}"</p>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-gray-400">Reviewing</span>
                                        <Link href={`/court/${review.courts?.id}`} className="font-medium text-primary hover:underline">
                                            {review.courts?.name}
                                        </Link>
                                        <span className="text-gray-400">• {review.courts?.city}</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="p-12 text-center bg-white rounded-lg border border-dashed text-gray-500">
                                No reviews yet. Be the first to write one!
                            </div>
                        )}
                    </div>
                </div>

                {/* Events Sidebar */}
                <div className="space-y-8">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Calendar className="text-primary w-6 h-6" /> Upcoming Events
                    </h2>

                    <div className="space-y-4">
                        {events && events.length > 0 ? events.map((event: any) => (
                            <Link href={`/court/${event.courts.id}`} key={event.id} className="group block bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-primary transition-all hover:shadow-md">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="text-xs font-bold text-primary uppercase bg-primary/10 px-2 py-1 rounded">
                                        {event.event_kind}
                                    </div>
                                    <div className="text-xs font-medium text-gray-500">
                                        {new Date(event.starts_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                                <h3 className="font-bold text-gray-900 truncate group-hover:text-primary transition-colors">{event.title}</h3>
                                <div className="text-sm text-gray-500 mt-1 truncate">
                                    {event.courts.name} ({event.courts.city})
                                </div>
                            </Link>
                        )) : (
                            <div className="p-8 text-center bg-white rounded-lg border border-dashed text-gray-500">
                                No upcoming events found.
                            </div>
                        )}

                        <div className="pt-4 border-t border-gray-200">
                            <Link href="/tournaments" className="flex items-center justify-center gap-2 text-sm font-bold text-primary hover:underline bg-white py-3 rounded-lg border border-primary/20 hover:bg-primary/5 transition-colors">
                                View Full Calendar <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="bg-gray-900 text-white p-6 rounded-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-2">Host an Event?</h3>
                            <p className="text-sm text-gray-300 mb-4">Create your own open play or tournament.</p>
                            <Link href="/search" className="inline-block bg-primary text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                                Find a Court to Host
                            </Link>
                        </div>
                        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl"></div>
                    </div>
                </div>

            </div>
        </div>
    )
}
