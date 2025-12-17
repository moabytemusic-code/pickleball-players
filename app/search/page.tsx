"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { CourtCard } from "@/components/court-card";
import { SlidersHorizontal, Map as MapIcon, List, Loader2, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("@/components/map"), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full bg-secondary/50"><Loader2 className="animate-spin text-muted-foreground" /></div>
});

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <SearchPageContent />
        </Suspense>
    )
}

function SearchPageContent() {
    const [showMap, setShowMap] = useState(false);
    const [filterIndoor, setFilterIndoor] = useState(false);
    const [courts, setCourts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const query = searchParams.get('q');

    useEffect(() => {
        async function fetchCourts() {
            try {
                let queryBuilder = supabase
                    .from('courts')
                    .select('*, photos(url, is_primary)');

                if (query) {
                    const cleanQuery = query.split(',')[0].trim();
                    queryBuilder = queryBuilder.or(`name.ilike.%${cleanQuery}%,city.ilike.%${cleanQuery}%`);
                }

                if (filterIndoor) {
                    queryBuilder = queryBuilder.eq('indoor_outdoor', 'indoor');
                }

                const { data, error } = await queryBuilder.order('created_at', { ascending: false });

                if (error) {
                    console.error("Supabase Error:", error);
                    setCourts([]);
                    return;
                }

                // Transform data
                const formatted = (data || []).map(court => {
                    // Logic: 1. DB Photo, 2. City Fallback, 3. Generic Fallback
                    let imageUrl = "/destinations/default_court.png";

                    if (court.photos && court.photos.length > 0) {
                        // Prioritize primary, else first
                        const primary = court.photos.find((p: any) => p.is_primary);
                        imageUrl = primary ? primary.url : court.photos[0].url;
                    } else if (court.city) {
                        const cityLower = court.city.toLowerCase();
                        if (cityLower.includes('seattle')) imageUrl = "/destinations/seattle.png";
                        else if (cityLower.includes('san diego') || cityLower.includes('san-diego')) imageUrl = "/destinations/san-diego.png";
                        else if (cityLower.includes('naples')) imageUrl = "/destinations/naples.png";
                        else if (cityLower.includes('austin')) imageUrl = "/destinations/austin.png";
                        else if (cityLower.includes('denver')) imageUrl = "/destinations/denver.png";
                        else if (cityLower.includes('phoenix')) imageUrl = "/destinations/phoenix.png";
                        else if (cityLower.includes('houston')) imageUrl = "/destinations/houston.png";
                        else if (cityLower.includes('miami')) imageUrl = "/destinations/miami.png";
                        else if (cityLower.includes('new york') || cityLower.includes('nyc')) imageUrl = "/destinations/nyc.png";
                    }

                    return {
                        id: court.id,
                        name: court.name,
                        address: [court.address1, court.city, court.region].filter(Boolean).join(', '),
                        image: imageUrl,
                        rating: 0,
                        reviewCount: 0,
                        isVerified: court.verified_badge || false,
                        isIndoor: court.indoor_outdoor === 'indoor',
                        courtCount: court.court_count || 0,
                        features: [court.surface].filter(Boolean),
                        lat: court.latitude,
                        lng: court.longitude,
                        isClaimed: court.is_claimed || false
                    };
                });

                setCourts(formatted);
            } catch (e) {
                console.error("Fetch error:", e);
            } finally {
                setLoading(false);
            }
        }

        fetchCourts();
    }, [query, filterIndoor]);

    const enableClaiming = searchParams.get('claim') === 'true';

    return (
        <div className="flex h-screen flex-col bg-background">
            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
                <Navbar position="relative" />

                {/* Sub-Header: Filters & Sorting */}
                <div className="flex items-center justify-between px-6 py-4 lg:px-8 border-t border-border/50">
                    <div className="flex items-center gap-2">
                        <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                            <SlidersHorizontal className="h-4 w-4" />
                            Filters
                        </button>
                        <div className="hidden sm:flex items-center gap-2 border-l border-border pl-2 ml-2">
                            <button
                                onClick={() => setFilterIndoor(!filterIndoor)}
                                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${filterIndoor
                                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                            >
                                Indoor
                            </button>
                            <button className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">Open Now</button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground hidden sm:inline">
                            Showing {courts.length} results
                        </span>
                        <button
                            className="sm:hidden inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white shadow-sm"
                            onClick={() => setShowMap(!showMap)}
                        >
                            {showMap ? <List className="w-4 h-4" /> : <MapIcon className="w-4 h-4" />}
                            {showMap ? "List" : "Map"}
                        </button>
                    </div>
                </div>
                {enableClaiming && (
                    <div className="bg-primary/10 border-b border-primary/20 px-6 py-2 text-center text-sm font-medium text-primary">
                        Select a court below to claim it as your own.
                    </div>
                )}
            </div>

            <div className="flex flex-1 overflow-hidden">

                {/* Left Side: Results List */}
                <div className={`flex-1 overflow-y-auto p-6 lg:p-8 ${showMap ? 'hidden sm:block' : 'block'}`}>
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                            {courts.map((court) => (
                                <CourtCard key={court.id} court={court} enableClaiming={enableClaiming} />
                            ))}
                            {courts.length === 0 && (
                                <div className="col-span-full text-center py-10 text-muted-foreground">
                                    No courts found. (Check database connection or .env.local).
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pagination Mock */}
                    {!loading && courts.length > 0 && (
                        <div className="mt-12 flex justify-center">
                            <button className="text-sm font-semibold text-primary hover:underline">
                                Load more courts
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Side: Map */}
                <div className={`flex-1 bg-gray-100 dark:bg-gray-900 relative ${showMap ? 'block' : 'hidden sm:block'}`}>
                    <LeafletMap courts={courts} />
                </div>
            </div>
        </div>
    );
}
