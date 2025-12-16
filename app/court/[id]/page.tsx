import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import { MapPin, Share, Star, Calendar, Clock, Phone, Globe, ShieldCheck, Users } from "lucide-react";
import { Navbar } from "@/components/navbar";

import { ReviewsSection } from "@/components/reviews";

// Next.js 15+ Params are Promises
export default async function CourtPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: court, error } = await supabase
        .from('courts')
        .select('*')
        .eq('id', id)
        .single();

    // Fetch Reviews
    const { data: reviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('court_id', id)
        .order('created_at', { ascending: false });

    // Fetch User
    const { data: { user } } = await supabase.auth.getUser();

    if (error || !court) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <Navbar />

            {/* Header Image / Hero */}
            <div className="relative h-[400px] w-full bg-gray-900">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1626244422527-8898b95886d4?auto=format&fit=crop&q=80&w=1200"
                        alt={court.name}
                        className="h-full w-full object-cover opacity-60"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-track/50 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                {court.verified_badge && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                                        <ShieldCheck className="w-3 h-3" /> Verified Court
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                                    {court.indoor_outdoor === 'indoor' ? 'Indoor' : 'Outdoor'}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">{court.name}</h1>
                            <div className="flex items-center gap-4 mt-4 text-gray-200">
                                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {court.city}, {court.region}</span>
                                <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /> 4.8 (124 reviews)</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="rounded-xl bg-white/10 backdrop-blur-md px-6 py-3 font-semibold text-white hover:bg-white/20 transition-colors flex items-center gap-2 border border-white/20">
                                <Share className="w-4 h-4" /> Share
                            </button>
                            <button className="rounded-xl bg-primary px-8 py-3 font-semibold text-white hover:bg-green-700 transition-colors shadow-lg shadow-green-900/20">
                                Book a Court
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-12">

                    {/* About */}
                    <section>
                        <h2 className="text-2xl font-bold text-foreground mb-4">About this Venue</h2>
                        <p className="text-muted-foreground leading-relaxed text-lg">
                            {court.description || `Experience top-tier pickleball at ${court.name}. Featuring ${court.court_count || 'multiple'} ${court.surface || 'premium'} courts, this venue is perfect for players of all skill levels. Whether you are looking for open play, tournaments, or private lessons, this facility delivers a verified, high-quality experience.`}
                        </p>

                        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="p-4 rounded-2xl bg-secondary/50 border border-border">
                                <div className="text-sm text-muted-foreground">Courts</div>
                                <div className="text-xl font-bold text-foreground">{court.court_count || '-'}</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-secondary/50 border border-border">
                                <div className="text-sm text-muted-foreground">Surface</div>
                                <div className="text-xl font-bold text-foreground capitalize">{court.surface || 'Hard'}</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-secondary/50 border border-border">
                                <div className="text-sm text-muted-foreground">Lights</div>
                                <div className="text-xl font-bold text-foreground">{court.lights ? 'Yes' : 'No'}</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-secondary/50 border border-border">
                                <div className="text-sm text-muted-foreground">Access</div>
                                <div className="text-xl font-bold text-foreground overflow-hidden text-ellipsis whitespace-nowrap" title={court.access_type}>{court.access_type || 'Public'}</div>
                            </div>
                        </div>
                    </section>


                    {/* Events Mock */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-foreground">Upcoming Events</h2>
                            <a href="#" className="text-sm font-semibold text-primary hover:underline">View all</a>
                        </div>

                        <div className="space-y-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-2xl border border-border hover:bg-secondary/30 transition-colors">
                                    <div className="h-16 w-16 rounded-xl bg-secondary flex flex-col items-center justify-center border border-border text-center">
                                        <span className="text-xs font-bold text-primary uppercase">Dec</span>
                                        <span className="text-xl font-bold text-foreground">{15 + i}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground">Beginner Clinic: Level 1.0 - 2.5</h3>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 9:00 AM - 11:00 AM</span>
                                            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> 8 spots left</span>
                                        </div>
                                    </div>
                                    <div className="ml-auto flex items-center">
                                        <button className="text-sm font-semibold border border-border rounded-lg px-4 py-2 hover:bg-background">Register</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Reviews */}
                    <section>
                        <ReviewsSection
                            courtId={court.id}
                            initialReviews={reviews || []}
                            userId={user?.id}
                        />
                    </section>

                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <div className="rounded-3xl border border-border p-6 shadow-sm sticky top-24">
                        <h3 className="font-bold text-lg mb-4">Location & Hours</h3>

                        {/* Map Placeholder */}
                        <div className="h-48 w-full bg-secondary rounded-xl mb-6 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover grayscale" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <MapPin className="w-8 h-8 text-primary drop-shadow-lg animate-bounce" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <MapPin className="w-5 h-5 text-muted-foreground shrink-0" />
                                <span className="text-sm text-foreground">
                                    {court.address1}<br />
                                    {court.city}, {court.region} {court.postal_code}
                                </span>
                            </div>
                            <div className="flex gap-3">
                                <Clock className="w-5 h-5 text-muted-foreground shrink-0" />
                                <div className="text-sm text-foreground">
                                    <div className="flex justify-between w-full"><span className="w-16 text-muted-foreground">Mon-Fri</span> <span>7:00 AM - 10:00 PM</span></div>
                                    <div className="flex justify-between w-full"><span className="w-16 text-muted-foreground">Sat-Sun</span> <span>8:00 AM - 8:00 PM</span></div>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                                <Phone className="w-5 h-5 text-muted-foreground shrink-0" />
                                <span className="text-sm text-primary hover:underline cursor-pointer">(555) 123-4567</span>
                            </div>
                            <div className="flex gap-3">
                                <Globe className="w-5 h-5 text-muted-foreground shrink-0" />
                                <a href="#" className="text-sm text-primary hover:underline cursor-pointer">Visit Website</a>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
