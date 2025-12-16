import { Navbar } from "@/components/navbar";
import { CheckCircle, ArrowRight, ShieldCheck, BarChart3, Calendar } from "lucide-react";
import Link from "next/link";

export default function ProPage() {
    return (
        <div className="bg-background min-h-screen">
            <Navbar />

            {/* Hero */}
            <div className="relative isolate pt-14">
                <div className="py-24 sm:py-32 lg:pb-40">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                                Grow your Pickleball Business
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-muted-foreground">
                                Claim your court verify your listing, manage events, and attract thousands of local players.
                            </p>
                            <div className="mt-10 flex items-center justify-center gap-x-6">
                                <Link
                                    href="/search?claim=true"
                                    className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white !text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary flex items-center gap-2"
                                >
                                    Claim my Court <ArrowRight className="w-4 h-4" />
                                </Link>
                                <a href="#features" className="text-sm font-semibold leading-6 text-foreground">
                                    Learn more <span aria-hidden="true">→</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features */}
            <div id="features" className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-primary">For Facility Owners</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Everything you need to manage your courts
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                        <div className="relative pl-16">
                            <dt className="text-base font-semibold leading-7 text-foreground">
                                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                                    <ShieldCheck className="h-6 w-6 text-white" aria-hidden="true" />
                                </div>
                                Verified Badge
                            </dt>
                            <dd className="mt-2 text-base leading-7 text-muted-foreground">
                                Stand out with a verified badge. Players trust verified listings more, leading to higher attendance.
                            </dd>
                        </div>
                        <div className="relative pl-16">
                            <dt className="text-base font-semibold leading-7 text-foreground">
                                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                                    <BarChart3 className="h-6 w-6 text-white" aria-hidden="true" />
                                </div>
                                Analytics Dashboard
                            </dt>
                            <dd className="mt-2 text-base leading-7 text-muted-foreground">
                                See how many people are viewing your court, clicking for directions, and checking your events.
                            </dd>
                        </div>
                        <div className="relative pl-16">
                            <dt className="text-base font-semibold leading-7 text-foreground">
                                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                                    <Calendar className="h-6 w-6 text-white" aria-hidden="true" />
                                </div>
                                Event Management
                            </dt>
                            <dd className="mt-2 text-base leading-7 text-muted-foreground">
                                Create and promote clinics, tournaments, and open play sessions directly on your court page.
                            </dd>
                        </div>
                        <div className="relative pl-16">
                            <dt className="text-base font-semibold leading-7 text-foreground">
                                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                                    <CheckCircle className="h-6 w-6 text-white" aria-hidden="true" />
                                </div>
                                Update Details
                            </dt>
                            <dd className="mt-2 text-base leading-7 text-muted-foreground">
                                Keep hours, pricing, and photos up to date to ensure players have the right information.
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    )
}
