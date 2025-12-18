import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { MapPin, Trophy, Users, Search, Activity, Globe, ArrowRight } from "lucide-react";
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

const stats = [
  { label: 'Active Courts', value: '12,000+' },
  { label: 'Monthly Players', value: '450k' },
  { label: 'Communities', value: '850+' },
  { label: 'Tournaments', value: '120/mo' },
]

export default function Home() {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Navbar />
      <Hero />

      {/* Stats Strip */}
      <div className="border-y border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
          <dl className="grid grid-cols-2 gap-x-8 gap-y-8 text-center lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="mx-auto flex max-w-xs flex-col gap-y-1">
                <dt className="text-sm leading-7 text-muted-foreground">{stat.label}</dt>
                <dd className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Popular Destinations */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Popular Destinations</h2>
            <p className="mt-2 text-muted-foreground">Explore the best courts in trending cities.</p>
          </div>
          <Link href="/search" className="hidden sm:flex items-center text-primary font-semibold hover:underline">
            View all cities <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {cities.map((city) => (
            <Link href={`/search?q=${encodeURIComponent(city.name)}`} key={city.name} className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300">
              <Image
                src={city.image}
                alt={city.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-white font-bold text-lg md:text-xl flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-emerald-400" /> {city.name.split(',')[0]}
                </div>
                <div className="text-gray-300 text-xs font-medium uppercase tracking-wider pl-6">
                  {city.name.split(',')[1]}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex justify-center sm:hidden">
          <Link href="/search" className="text-primary font-semibold hover:underline">View all cities →</Link>
        </div>
      </section>

      {/* Value Props / Features */}
      <section className="bg-secondary/30 py-24 border-t border-border mt-auto">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Why Use Pickleball Players?</h2>
            <p className="mt-4 text-lg text-muted-foreground">The most accurate and up-to-date directory for players of all levels.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="bg-background p-8 rounded-2xl shadow-sm border border-border hover:border-primary/50 transition-colors">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Community Driven</h3>
              <p className="mt-4 text-muted-foreground text-sm leading-relaxed">Join thousands of players sharing reviews, photos, and court conditions in real-time.</p>
            </div>
            <div className="bg-background p-8 rounded-2xl shadow-sm border border-border hover:border-primary/50 transition-colors">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <Search className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Find Courts Fast</h3>
              <p className="mt-4 text-muted-foreground text-sm leading-relaxed">Our comprehensive map uses advanced filters to help you find the perfect court in seconds.</p>
            </div>
            <div className="bg-background p-8 rounded-2xl shadow-sm border border-border hover:border-primary/50 transition-colors">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <Trophy className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Tournaments & Events</h3>
              <p className="mt-4 text-muted-foreground text-sm leading-relaxed">Discover, register, and compete in local tournaments, clinics, and open play sessions.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
