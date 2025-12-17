import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { MapPin, Trophy, Users, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const cities = [
  { name: 'Austin, TX', image: '/destinations/austin.png' },
  { name: 'Seattle, WA', image: '/destinations/seattle.png' },
  { name: 'Denver, CO', image: '/destinations/denver.png' },
  { name: 'San Diego, CA', image: '/destinations/san-diego.png' },
  { name: 'Phoenix, AZ', image: '/destinations/phoenix.png' },
  { name: 'Naples, FL', image: '/destinations/naples.png' },
  { name: 'Houston, TX', image: '/destinations/houston.png' },
  { name: 'Miami, FL', image: '/destinations/miami.png' },
  { name: 'New York, NY', image: '/destinations/nyc.png' },
];

export default function Home() {
  return (
    <div className="bg-background">
      <Navbar />
      <Hero />

      {/* Popular Destinations */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-12 text-center">Popular Destinations</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          {cities.map((city) => (
            <Link href={`/search?q=${encodeURIComponent(city.name)}`} key={city.name} className="block group relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 shadow-md">
              <Image
                src={city.image}
                alt={city.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 text-white font-bold text-lg md:text-xl flex items-center gap-2">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-primary" /> {city.name}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="bg-secondary/30 py-24 border-t border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Community Driven</h3>
              <p className="mt-4 text-muted-foreground">Join thousands of players sharing reviews, photos, and court conditions.</p>
            </div>
            <div>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Find Courts Fast</h3>
              <p className="mt-4 text-muted-foreground">Our comprehensive map and filters help you find the perfect court in seconds.</p>
            </div>
            <div>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Tournaments & Events</h3>
              <p className="mt-4 text-muted-foreground">Discover local tournaments, clinics, and open play sessions near you.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
