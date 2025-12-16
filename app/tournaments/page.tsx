import { createClient } from "@/lib/supabase-server";
import { Navbar } from "@/components/navbar";
import { Calendar, MapPin, Users, Filter, Clock, Banknote } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function TournamentsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
    const { type } = await searchParams;
    const supabase = await createClient();

    let query = supabase
        .from('events')
        .select('*, courts(name, city, region)')
        .gt('starts_at', new Date().toISOString()) // Only future events
        .order('starts_at', { ascending: true });

    if (type) {
        query = query.eq('event_kind', type);
    }

    const { data: events } = await query;

    const filters = [
        { label: "All", value: undefined },
        { label: "Tournaments", value: "tournament" },
        { label: "Open Play", value: "open_play" },
        { label: "Leagues", value: "league" },
        { label: "Clinics", value: "clinic" },
    ];

    return (
        <div className="min-h-screen bg-background pb-20">
            <Navbar position="relative" />

            <div className="bg-gray-900 py-16 px-6 sm:px-12 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-purple-900/40" />
                <div className="relative z-10 max-w-3xl mx-auto">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4">Upcoming Events</h1>
                    <p className="text-gray-300 text-lg">Find tournaments, open play, and clinics near you.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-8 items-center">
                    <Filter className="w-4 h-4 text-muted-foreground mr-2" />
                    {filters.map((f) => (
                        <Link
                            key={f.label}
                            href={f.value ? `/tournaments?type=${f.value}` : '/tournaments'}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${type === f.value
                                ? "bg-primary text-white border-primary"
                                : "bg-card hover:bg-secondary text-foreground border-border"
                                }`}
                        >
                            {f.label}
                        </Link>
                    ))}
                </div>

                {/* Grid */}
                {events && events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event: any) => (
                            <Link href={`/tournaments/${event.id}`} key={event.id} className="group block bg-card rounded-2xl border border-border overflow-hidden hover:shadow-md transition-all hover:border-primary/50">
                                <div className="h-32 bg-secondary/50 relative">
                                    <div className="absolute top-4 left-4 bg-background/90 backdrop-blur rounded-lg px-3 py-1.5 flex flex-col items-center border border-border">
                                        <span className="text-xs font-bold text-primary uppercase">{new Date(event.starts_at).toLocaleString('default', { month: 'short' })}</span>
                                        <span className="text-lg font-bold text-foreground">{new Date(event.starts_at).getDate()}</span>
                                    </div>
                                    <div className="absolute top-4 right-4 bg-primary/90 text-white text-xs font-bold px-2 py-1 rounded capitalize">
                                        {event.event_kind.replace('_', ' ')}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors mb-1 truncate">{event.title}</h3>
                                    <div className="flex items-center text-sm text-muted-foreground mb-4 gap-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span className="truncate">{event.courts.name} ({event.courts.city})</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2 text-foreground/80">
                                            <Clock className="w-4 h-4 text-muted-foreground" />
                                            {new Date(event.starts_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                        </div>
                                        <div className="flex items-center gap-2 text-foreground/80">
                                            <Banknote className="w-4 h-4 text-muted-foreground" />
                                            {event.cost_cents ? `$${(event.cost_cents / 100).toFixed(2)}` : 'Free'}
                                        </div>
                                        {event.skill_level && (
                                            <div className="flex items-center gap-2 text-foreground/80 col-span-2">
                                                <Users className="w-4 h-4 text-muted-foreground" />
                                                Skill: {event.skill_level}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-secondary/20 rounded-2xl border border-dashed border-border">
                        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground">No events found</h3>
                        <p className="text-muted-foreground">Try adjusting your filters or check back later.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
