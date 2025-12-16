"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Rocket, User as UserIcon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase-client';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface NavbarProps {
    position?: "absolute" | "relative" | "sticky";
    className?: string;
}

export function Navbar({ position = "absolute", className = "" }: NavbarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    const navigation = [
        { name: 'Find Courts', href: '/search' },
        { name: 'Tournaments', href: '/tournaments' },
        { name: 'Community', href: '/community' },
    ];

    return (
        <header className={`${position} inset-x-0 top-0 z-50 ${className}`}>
            <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">

                {/* Logo */}
                <div className="flex lg:flex-1">
                    <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
                        <span className="sr-only">Pickleball Players</span>
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl">P</div>
                        <span className="font-bold text-xl tracking-tight">Pickleball<span className="text-primary">Players</span></span>
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <div className="flex lg:hidden">
                    <button
                        type="button"
                        className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-200"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <span className="sr-only">Open main menu</span>
                        <Menu className="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>

                {/* Desktop Links */}
                <div className="hidden lg:flex lg:gap-x-12">
                    {navigation.map((item) => (
                        <Link key={item.name} href={item.href} className="text-sm font-semibold leading-6 text-gray-900 hover:text-primary transition-colors">
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Desktop Right CTA */}
                <div className="hidden lg:flex lg:flex-1 lg:justify-end gap-x-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link href="/profile" className="text-sm font-semibold text-gray-900 hover:text-primary transition-colors">
                                {user.email?.split('@')[0]}
                            </Link>
                            <button onClick={handleSignOut} className="text-sm font-semibold leading-6 text-gray-900 hover:text-red-500 transition-colors my-auto flex items-center gap-1">
                                <LogOut className="w-4 h-4" />
                                Sign out
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className="text-sm font-semibold leading-6 text-gray-900 hover:text-primary transition-colors my-auto">
                            Log in
                        </Link>
                    )}

                    {user ? (
                        <Link href="/pro/dashboard" className="rounded-full bg-foreground text-background px-4 py-2 text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center gap-2">
                            Dashboard <Rocket className="w-3 h-3" />
                        </Link>
                    ) : (
                        <Link href="/pro" className="rounded-full bg-foreground text-background px-4 py-2 text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center gap-2">
                            For Owners <Rocket className="w-3 h-3" />
                        </Link>
                    )}
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "100%" }}
                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                        className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 shadow-2xl"
                    >
                        <div className="flex items-center justify-between">
                            <Link href="#" className="-m-1.5 p-1.5 flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl">P</div>
                                <span className="font-bold text-xl tracking-tight">Pickleball<span className="text-primary">Players</span></span>
                            </Link>
                            <button
                                type="button"
                                className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-200"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <span className="sr-only">Close menu</span>
                                <X className="h-6 w-6" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="mt-6 flow-root">
                            <div className="-my-6 divide-y divide-gray-500/10 dark:divide-gray-700">
                                <div className="space-y-2 py-6">
                                    {navigation.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-gray-50 dark:hover:bg-gray-800"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                                <div className="py-6">
                                    {user ? (
                                        <>
                                            <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold text-foreground/80 hover:text-primary mb-4 px-3">
                                                {user.email}
                                            </Link>
                                            <button
                                                onClick={handleSignOut}
                                                className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-red-500 hover:bg-gray-50 dark:hover:bg-gray-800 w-full text-left"
                                            >
                                                Sign out
                                            </button>
                                        </>
                                    ) : (
                                        <Link
                                            href="/login"
                                            className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-foreground hover:bg-gray-50 dark:hover:bg-gray-800"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Log in
                                        </Link>
                                    )}
                                    {user ? (
                                        <Link
                                            href="/pro/dashboard"
                                            className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-primary hover:bg-gray-50 dark:hover:bg-gray-800"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/pro"
                                            className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-primary hover:bg-gray-50 dark:hover:bg-gray-800"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            For Owners
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
