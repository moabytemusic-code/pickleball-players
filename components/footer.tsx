import Link from 'next/link'
import { Facebook, Twitter, Instagram, Linkedin, Github } from 'lucide-react'

const navigation = {
    main: [
        { name: 'Find Courts', href: '/search' },
        { name: 'Tournaments', href: '/tournaments' },
        { name: 'Community', href: '/community' },
        { name: 'For Owners', href: '/pro' },
    ],
    social: [
        {
            name: 'Facebook',
            href: '#',
            icon: Facebook,
        },
        {
            name: 'Instagram',
            href: '#',
            icon: Instagram,
        },
        {
            name: 'Twitter',
            href: '#',
            icon: Twitter,
        },
        {
            name: 'GitHub',
            href: '#',
            icon: Github,
        },
    ],
}

export function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200">
            <div className="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
                <nav className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer">
                    {navigation.main.map((item) => (
                        <div key={item.name} className="pb-6">
                            <Link href={item.href} className="text-sm leading-6 text-gray-600 hover:text-gray-900">
                                {item.name}
                            </Link>
                        </div>
                    ))}
                </nav>
                <div className="mt-10 flex justify-center space-x-10">
                    {navigation.social.map((item) => (
                        <Link key={item.name} href={item.href} className="text-gray-400 hover:text-gray-500">
                            <span className="sr-only">{item.name}</span>
                            <item.icon className="h-6 w-6" aria-hidden="true" />
                        </Link>
                    ))}
                </div>
                <p className="mt-10 text-center text-xs leading-5 text-gray-500">
                    &copy; {new Date().getFullYear()} Pickleball Players, Inc. All rights reserved.
                </p>
            </div>
        </footer>
    )
}
