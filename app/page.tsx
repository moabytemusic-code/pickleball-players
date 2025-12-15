import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";

export default function Home() {
  return (
    <div className="bg-background">
      <Navbar />
      <Hero />

      {/* Sections below fold (Features, Cities, etc.) */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Everything you need to play</h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Whether you are a beginner looking for lessons or a pro looking for tournaments, we have you covered.
          </p>
        </div>
      </div>
    </div>
  );
}
