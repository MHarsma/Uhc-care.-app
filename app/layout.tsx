import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
    variable: "--font-geist-sans",
    subsets: ["latin"],
    display: "swap",
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
    themeColor: "#0a0a0f",
};

export const metadata: Metadata = {
    title: "UHC Care | Couple Routine & Habit Tracker",
    description:
        "Build stronger routines together. Track daily habits, prayer times, and wellness goals with your partner.",
    applicationName: "UHC Care",
    manifest: "/manifest.json",
    icons: {
        icon: [
            { url: "/icon.svg", type: "image/svg+xml" },
            { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
            { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
        apple: "/icon-512.png",
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "UHC Care",
    },
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
        >
            <body suppressHydrationWarning className="min-h-full bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
