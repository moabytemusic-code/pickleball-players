import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { MapPin, Trophy, Users, Search } from "lucide-react";
import Link from "next/link";

const cities = [
  { name: 'Austin, TX', image: 'https://images.unsplash.com/photo-1531218150217-545e10dc29e9?auto=format&fit=crop&q=80&w=600' },
  { name: 'Denver, CO', image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=600' },
  { name: 'Phoenix, AZ', image: 'https://images.unsplash.com/photo-1563290740-42849b28b765?auto=format&fit=crop&q=80&w=600' },
  { name: 'Houston, TX', image: 'https://images.unsplash.com/photo-1530089711124-9ca31fb8e636?auto=format&fit=crop&q=80&w=600' },
  { name: 'Miami, FL', image: 'https://images.unsplash.com/photo-1535498730771-e735b998cd64?auto=format&fit=crop&q=80&w=600' },
  { name: 'New York, NY', image: 'https://images.unsplash.com/photo-1496442226666-8d4a0e29e128?auto=format&fit=crop&q=80&w=600' },
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
              <img src={city.image} alt={city.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
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
