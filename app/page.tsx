import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { MapPin, Trophy, Users, Search, Activity, Star, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const cities = [
  { name: 'Austin, TX', image: '/destinations/austin.png', count: 42 },
  { name: 'Seattle, WA', image: '/destinations/seattle.png', count: 35 },
  { name: 'Denver, CO', image: '/destinations/denver.png', count: 28 },
  { name: 'San Diego, CA', image: '/destinations/san-diego.png', count: 56 },
  { name: 'Phoenix, AZ', image: '/destinations/phoenix.png', count: 48 },
  { name: 'Naples, FL', image: '/destinations/naples.png', count: 64 },
  { name: 'Houston, TX', image: '/destinations/houston.png', count: 30 },
  { name: 'Miami, FL', image: '/destinations/miami.png', count: 45 },
];

const reviews = [
  { user: "Sarah J.", city: "Austin, TX", text: "Found a hidden gem of a court just 5 mins from my house. The community features are amazing!", rating: 5 },
  { user: "Mike T.", city: "Denver, CO", text: "Used this to organize a tournament. The bracket tools made it so easy.", rating: 5 },
  { user: "Jessica L.", city: "Naples, FL", text: "Love seeing which courts have lights before I drive out. Essential app for players.", rating: 5 },
];

export default function Home() {
  return (
    <div className="bg-background min-h-screen flex flex-col font-sans selection:bg-primary/20">
      <Navbar />
      <Hero />

      {/* 1. Trust/Stats Strip with Animation */}
      <div className="border-y border-border bg-card/30 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-border/50">
            {[
              { label: 'Active Courts', value: '12,000+', icon: MapPin },
              { label: 'Monthly Players', value: '450k', icon: Users },
              { label: 'Communities', value: '850+', icon: Activity },
              { label: 'Tournaments', value: '120/mo', icon: Trophy },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center gap-2 group cursor-default">
                <stat.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <dd className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{stat.value}</dd>
                <dt className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</dt>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. How It Works (Process) */}
      <section className="py-24 bg-gradient-to-b from-background to-secondary/20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Your Court, Your Game</h2>
            <p className="mt-4 text-lg text-muted-foreground">From finding a spot to tracking your stats, we handle the details so you can play.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" />

            {[
              { icon: Search, title: "1. Discover", desc: "Search by city, surface type, or amenities like lights and dedicated lines." },
              { icon: CheckCircle2, title: "2. Verify & Check-in", desc: "See real-time traffic, check court conditions, and mark yourself as 'playing'." },
              { icon: Activity, title: "3. Track Progress", desc: "Log your matches, improve your DUPR rating (coming soon), and climb the leaderboard." }
            ].map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center bg-background/50 p-6 rounded-2xl border border-transparent hover:border-border transition-all">
                <div className="w-24 h-24 rounded-full bg-background border-4 border-secondary flex items-center justify-center z-10 mb-6 shadow-sm group hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Popular Destinations (Improved Grid) */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
        <div className="flex flex-col sm:flex-row items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Trending Destinations</h2>
            <p className="mt-2 text-muted-foreground">Explore the hottest pickleball hubs across the country.</p>
          </div>
          <Link href="/search" className="hidden sm:flex items-center text-primary font-semibold hover:text-primary/80 transition-colors">
            View all 100+ cities <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cities.map((city) => (
            <Link href={`/search?q=${encodeURIComponent(city.name)}`} key={city.name} className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 shadow-sm hover:shadow-xl transition-all duration-500 ring-1 ring-black/5">
              <Image
                src={city.image}
                alt={city.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/20">
                {city.count} Courts
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <div className="text-white font-bold text-xl flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                  {city.name.split(',')[0]}
                </div>
                <div className="text-gray-300 text-sm font-medium pl-7 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                  Explore {city.name} accounts →
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex justify-center sm:hidden">
          <Link href="/search" className="button-primary">View all cities</Link>
        </div>
      </section>

      {/* 4. Social Proof / Community */}
      <section className="bg-slate-900 text-white py-24 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">Loved by the Community</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, i) => (
              <div key={i} className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 hover:border-emerald-500/30 transition-colors relative">
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 italic">"{review.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center font-bold text-slate-900">
                    {review.user[0]}
                  </div>
                  <div>
                    <div className="font-bold">{review.user}</div>
                    <div className="text-xs text-slate-400">{review.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Final CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative rounded-3xl bg-primary px-6 py-16 sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 h-full items-center overflow-hidden shadow-2xl">
            {/* Background Pattern */}
            <svg viewBox="0 0 1024 1024" className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0" aria-hidden="true">
              <circle cx={512} cy={512} r={512} fill="url(#gradient)" fillOpacity="0.7" />
              <defs>
                <radialGradient id="gradient">
                  <stop stopColor="#ffffff" />
                  <stop offset={1} stopColor="#ffffff" />
                </radialGradient>
              </defs>
            </svg>

            <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-16 lg:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to hit the courts?<br />
                Join the community today.
              </h2>
              <p className="mt-6 text-lg leading-8 text-green-50">
                Create your profile to save favorite courts, track your games, and connect with local players. It's completely free.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
                <Link
                  href="/login"
                  className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-primary shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Get Started
                </Link>
                <Link href="/search" className="text-sm font-semibold leading-6 text-white hover:text-green-50">
                  Browse Courts First <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
