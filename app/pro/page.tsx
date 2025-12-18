import { Navbar } from "@/components/navbar";
import { CheckCircle, ArrowRight, ShieldCheck, BarChart3, Calendar, Trophy, Users, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ProPage() {
    return (
        <div className="bg-slate-950 min-h-screen text-white selection:bg-emerald-500/30">
            <Navbar forceDark={true} />

            {/* Hero Section */}
            <div className="relative isolate overflow-hidden pt-14">
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-emerald-500 to-purple-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
                </div>

                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
                    <div className="mx-auto max-w-2xl text-center">
                        <div className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-400 mb-8 backdrop-blur-sm">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
                            For Facility Owners & Managers
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-emerald-200">
                            The Operating System for <br />
                            <span className="text-emerald-400">Pickleball Success</span>
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-slate-300 max-w-xl mx-auto">
                            Manage your courts, fill your events, and unlock powerful analytics. Join the platform powering the fastest growing sport in America.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Link
                                href="/search?claim=true"
                                className="rounded-full bg-emerald-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 hover:scale-105 transition-all duration-200 flex items-center gap-2"
                            >
                                Claim Your Court <ArrowRight className="w-4 h-4" />
                            </Link>
                            <a href="#demo" className="text-sm font-semibold leading-6 text-white hover:text-emerald-400 transition-colors">
                                View Demo <span aria-hidden="true">→</span>
                            </a>
                        </div>
                    </div>

                    {/* Dashboard Preview / Mockup Zone */}
                    <div className="mt-20 relative">
                        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-2 shadow-2xl shadow-emerald-900/20 backdrop-blur-sm ring-1 ring-white/10 mx-auto max-w-5xl overflow-hidden">
                            {/* Abstract UI Representation till we have a real screenshot */}
                            <div className="aspect-[16/9] bg-slate-900 rounded-lg relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />

                                {/* Mock UI Elements - Sidebar */}
                                <div className="absolute left-0 top-0 bottom-0 w-64 bg-slate-950 border-r border-slate-800 p-4 hidden md:block">
                                    <div className="flex items-center gap-2 mb-8">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500" />
                                        <div className="h-4 w-24 bg-slate-800 rounded" />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="h-8 w-full bg-slate-800/50 rounded flex items-center px-3 border-l-2 border-emerald-500"><div className="w-4 h-4 bg-emerald-500/50 rounded flex-shrink-0 mr-3" /> <div className="h-2 w-20 bg-slate-700 rounded" /></div>
                                        <div className="h-8 w-full bg-transparent rounded flex items-center px-3 opacity-50"><div className="w-4 h-4 bg-slate-700 rounded flex-shrink-0 mr-3" /> <div className="h-2 w-20 bg-slate-700 rounded" /></div>
                                        <div className="h-8 w-full bg-transparent rounded flex items-center px-3 opacity-50"><div className="w-4 h-4 bg-slate-700 rounded flex-shrink-0 mr-3" /> <div className="h-2 w-20 bg-slate-700 rounded" /></div>
                                        <div className="h-8 w-full bg-transparent rounded flex items-center px-3 opacity-50"><div className="w-4 h-4 bg-slate-700 rounded flex-shrink-0 mr-3" /> <div className="h-2 w-20 bg-slate-700 rounded" /></div>
                                    </div>
                                </div>

                                {/* Mock UI Elements - Main Content */}
                                <div className="absolute left-0 md:left-64 top-0 right-0 bottom-0 p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                                            <div className="text-slate-400 text-sm mb-2">Total Players</div>
                                            <div className="text-3xl font-bold text-white">2,543</div>
                                            <div className="text-emerald-400 text-xs mt-2 flex items-center">↑ 12% vs last month</div>
                                        </div>
                                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                                            <div className="text-slate-400 text-sm mb-2">Revenue</div>
                                            <div className="text-3xl font-bold text-white">$12,450</div>
                                            <div className="text-emerald-400 text-xs mt-2 flex items-center">↑ 8% vs last month</div>
                                        </div>
                                        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                                            <div className="text-slate-400 text-sm mb-2">Active Events</div>
                                            <div className="text-3xl font-bold text-white">8</div>
                                            <div className="text-slate-400 text-xs mt-2">2 ending soon</div>
                                        </div>
                                    </div>

                                    {/* Chart Area */}
                                    <div className="bg-slate-800/30 rounded-xl border border-slate-700 h-64 w-full relative overflow-hidden flex items-end px-8 pb-0 gap-4">
                                        {/* Fake Bars */}
                                        {[40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 95].map((h, i) => (
                                            <div key={i} className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/40 transition-all rounded-t-sm relative group" style={{ height: `${h}%` }}>
                                                <div className="absolute top-0 w-full h-1 bg-emerald-400 opacity-50" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -inset-4 -z-10 bg-emerald-500/20 blur-3xl rounded-[50%]" />
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div id="features" className="py-24 sm:py-32 relative">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center mb-16">
                        <h2 className="text-base font-semibold leading-7 text-emerald-400">Everything You Need</h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            A Complete Toolkit for Facility Management
                        </p>
                        <p className="mt-6 text-lg leading-8 text-slate-300">
                            Stop wrestling with spreadsheets and generic booking tools. Our platform is built specifically for the unique needs of pickleball clubs.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: ShieldCheck,
                                title: "Official Verification",
                                desc: "Get the 'Verified' badge on our map. Verified courts get 3.5x more traffic."
                            },
                            {
                                icon: Calendar,
                                title: "Event Management",
                                desc: "Host tournaments, leagues, and clinics. We handle registrations and payments."
                            },
                            {
                                icon: BarChart3,
                                title: "Performance Analytics",
                                desc: "Track peak hours, player retention, and revenue growth in real-time."
                            },
                            {
                                icon: Users,
                                title: "Member Database",
                                desc: "Understand your players. Track skill levels (DUPR integration pending) and history."
                            },
                            {
                                icon: Trophy,
                                title: "Tournament Engine",
                                desc: "Create brackets, manage pools, and publish live scores effortlessly."
                            },
                            {
                                icon: Star,
                                title: "Reputation Management",
                                desc: "Showcase player reviews and photos to attract new visitors."
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-colors hover:shadow-lg hover:shadow-emerald-900/10 group">
                                <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
                                    <feature.icon className="text-emerald-400 h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="relative isolate py-16 sm:py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="relative bg-slate-900 overflow-hidden rounded-3xl shadow-2xl px-6 py-24 sm:px-24 xl:py-32 flex flex-col items-center text-center border border-slate-800">
                        <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Ready to fill your courts?
                        </h2>
                        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-300">
                            Join over 500 facility managers growing their pickleball community with our tools.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Link
                                href="/search?claim=true"
                                className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            >
                                Get Started Free
                            </Link>
                            <a href="#" className="text-sm font-semibold leading-6 text-white">
                                Contact Sales <span aria-hidden="true">→</span>
                            </a>
                        </div>

                        {/* Decorative gradients */}
                        <div className="absolute -top-24 -left-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl opacity-50 mix-blend-screen" />
                        <div className="absolute -bottom-24 -right-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl opacity-50 mix-blend-screen" />
                    </div>
                </div>
            </div>

        </div>
    )
}
