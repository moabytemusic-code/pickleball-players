import { MapPin, Star, Trophy, Users, Sun, CheckCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils"; // We need to create this util or just use template literals

// Simplified util for now if not exists
function classNames(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}

interface CourtProps {
    id: string;
    name: string;
    address: string;
    image: string;
    rating: number; // 0-5
    reviewCount: number;
    isVerified: boolean;
    isIndoor: boolean;
    courtCount: number;
    features: string[];
    isClaimed: boolean;
}

export function CourtCard({ court, enableClaiming }: { court: CourtProps, enableClaiming?: boolean }) {
    return (
        <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-card text-card-foreground shadow-sm transition-all hover:shadow-md dark:border-gray-800">

            {/* Image Area */}
            <div className="relative h-48 w-full overflow-hidden bg-gray-100 sm:h-56">
                {/* Placeholder or Real Image */}
                <img
                    src={court.image}
                    alt={court.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Badges Overlay */}
                <div className="absolute top-3 left-3 flex gap-2">
                    {court.isVerified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-600/90 px-2 py-1 text-xs font-semibold text-white backdrop-blur-md">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                        </span>
                    )}
                    {court.isIndoor ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-gray-900 backdrop-blur-md">
                            <Users className="w-3 h-3" /> Indoor
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-gray-900 backdrop-blur-md">
                            <Sun className="w-3 h-3" /> Outdoor
                        </span>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-1 flex-col p-4">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold tracking-tight text-foreground line-clamp-1">
                        <Link href={`/court/${court.id}`}>
                            <span className="absolute inset-0" />
                            {court.name}
                        </Link>
                    </h3>
                    {/* Rating */}
                    <div className="flex items-center gap-1 shrink-0">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-semibold">{court.rating}</span>
                        <span className="text-xs text-muted-foreground">({court.reviewCount})</span>
                    </div>
                </div>

                <div className="mt-1 flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-3.5 w-3.5 shrink-0" />
                    <span className="line-clamp-1">{court.address}</span>
                </div>

                {/* Features / Amenities Preview */}
                <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-inset ring-gray-500/10">
                        {court.courtCount} Courts
                    </span>
                    {court.features.slice(0, 3).map((feature) => (
                        <span key={feature} className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-inset ring-gray-500/10">
                            {feature}
                        </span>
                    ))}
                    {court.features.length > 3 && (
                        <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-inset ring-gray-500/10">
                            +{court.features.length - 3}
                        </span>
                    )}
                </div>

                <div className="mt-4 border-t border-border pt-4 flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                        Last updated 2 days ago
                    </div>
                    {enableClaiming ? (
                        court.isClaimed ? (
                            <button disabled className="z-10 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-400 cursor-not-allowed">
                                Already Claimed
                            </button>
                        ) : (
                            <Link
                                href={`/court/${court.id}/claim`}
                                className="z-10 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white hover:bg-primary/90 transition-colors shadow-sm"
                            >
                                Claim This Court
                            </Link>
                        )
                    ) : (
                        <button className="z-10 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors">
                            Book Now
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
