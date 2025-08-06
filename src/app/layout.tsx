import type { Metadata } from "next";
import {
    ClerkProvider,
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
} from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ThemeSwitch } from "@/components/theme-switch";

import "./globals.css";
import { ensureDbInitialized } from "@/lib/mongodb/init";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export async function generateMetadata() {
    if (process.env.NODE_ENV === 'development') {
        await ensureDbInitialized();
    }
    return {
        title: 'Audio Player',
        description: 'Listen to your favorite music with our audio player app.',
    };
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en" suppressHydrationWarning>
                <body
                    className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground theme-transition`}
                >
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        storageKey="theme"
                        disableTransitionOnChange={false}
                        forcedTheme={undefined}
                    >
                        <header className="flex justify-between items-center p-4 h-16">
                            <h1 className="text-xl font-semibold">Audio Player</h1>
                            <div className="flex items-center gap-4">
                                <ThemeSwitch />
                                <SignedOut>
                                    <SignInButton />
                                    <SignUpButton>
                                        <button className="bg-[#6c47ff] text-ceramic-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                                            Sign Up
                                        </button>
                                    </SignUpButton>
                                </SignedOut>
                                <SignedIn>
                                    <UserButton />
                                </SignedIn>
                            </div>
                        </header>
                        {children}
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
