"use client";

import { useEffect, useState } from "react";
import { Search, MapPin, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export function Hero() {
    const [query, setQuery] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <div className="relative isolate overflow-hidden">
            {/* Background Gradient Mesh */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.green.100),white)] opacity-20 dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.green.900),theme(colors.slate.950))]" />

            <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
                <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mt-24 sm:mt-32 lg:mt-16"
                    >
                        <a href="#" className="inline-flex space-x-6">
                            <span className="rounded-full bg-green-600/10 px-3 py-1 text-sm font-semibold leading-6 text-green-600 ring-1 ring-inset ring-green-600/10 dark:bg-green-400/10 dark:text-green-400 dark:ring-green-400/20">
                                New
                            </span>
                            <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-gray-600 dark:text-gray-300">
                                <span>Just launched: Pro Analytics</span>
                                <ArrowRight className="h-4 w-4" />
                            </span>
                        </a>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mt-10 text-4xl font-bold tracking-tight text-foreground sm:text-6xl"
                    >
                        Find the Perfect <span className="text-primary">Pickleball Court</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mt-6 text-lg leading-8 text-muted-foreground"
                    >
                        Discover verified courts, local tournaments, and open play schedules near you.
                        The most complete directory for the sport you love.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="mt-10 flex items-center gap-x-6"
                    >
                        <form onSubmit={handleSearch} className="relative w-full max-w-md">
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <MapPin className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    type="text"
                                    name="location"
                                    id="location"
                                    className="block w-full rounded-2xl border-0 py-4 pl-12 pr-14 text-foreground shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-lg sm:leading-6 dark:bg-white/5 dark:ring-white/10"
                                    placeholder="City, Zip, or Court Name"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="absolute inset-y-2 right-2 flex items-center rounded-xl bg-primary px-4 py-1 text-sm font-semibold text-white shadow-sm hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
                                >
                                    Search
                                </button>
                            </div>
                        </form>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-6 text-sm text-gray-500"
                    >
                        Trending: <span className="text-foreground underline decoration-dotted cursor-pointer hover:text-primary">Austin</span>, <span className="text-foreground underline decoration-dotted cursor-pointer hover:text-primary">Naples</span>, <span className="text-foreground underline decoration-dotted cursor-pointer hover:text-primary">Scottsdale</span>
                    </motion.div>

                </div>

                {/* Right Side Visual (Mock Map / Image) */}
                <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mt-0 lg:mr-0 lg:max-w-none lg:flex-none xl:ml-32">
                    <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
                        <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4 dark:bg-white/5 dark:ring-white/10">
                            {/* This image needs to be real later, using a placeholder gradient for now */}
                            <div className="w-[40rem] h-[30rem] rounded-md bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center text-gray-400 shadow-2xl overflow-hidden relative">
                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

                                {/* Mock Map UI Elements */}
                                <div className="absolute top-1/3 left-1/4">
                                    <div className="flex flex-col items-center">
                                        <div className="px-3 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-xs font-bold mb-1 border border-gray-100 dark:border-gray-700">Fairview Park</div>
                                        <div className="w-4 h-4 rounded-full bg-primary border-2 border-white dark:border-gray-800 shadow-xl animate-bounce" />
                                    </div>
                                </div>

                                <div className="absolute top-1/2 left-1/2">
                                    <div className="flex flex-col items-center">
                                        <div className="px-3 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-xs font-bold mb-1 border border-gray-100 dark:border-gray-700">Downtown Rec</div>
                                        <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-gray-800 shadow-xl" />
                                    </div>
                                </div>

                                <span className="text-sm font-medium z-10">Map View Preview</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
