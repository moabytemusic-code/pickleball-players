import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pickleball Players | Find Courts, Tournaments & Players",
  description: "The premium directory for pickleball courts, events, and community nearby.",
  keywords: ["pickleball", "courts", "tournaments", "find courts", "pickleball directory"],
};

export const viewport: Viewport = {
  themeColor: '#22c55e', // Brand green
  width: 'device-width',
  initialScale: 1,
};

import { Footer } from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";

// ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-background text-foreground`}
        suppressHydrationWarning
      >
        <div className="flex min-h-full flex-col">
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
