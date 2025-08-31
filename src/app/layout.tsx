import {
    ClerkProvider,
} from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ConditionalLayout } from "@/components/layout/conditional-layout";
import { ToastProvider } from "@/components/providers/toast-provider";
import { AudioProvider } from "@/components/audio-player/audio-context";
import { AudioPlayer } from "@/components/audio-player/audio-player";
import { KeyboardShortcuts } from "@/components/audio-player/keyboard-shortcuts";
import { LikeSyncProvider } from "@/contexts/like-sync-context";

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
                    className={`${geistSans.variable} ${geistMono.variable} antialiased theme-transition`}
                    suppressHydrationWarning
                >
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="light"
                        enableSystem={false}
                        storageKey="theme"
                        disableTransitionOnChange={false}
                        forcedTheme={undefined}
                    >
                        <ToastProvider>
                            <AudioProvider>
                                <LikeSyncProvider>
                                    <ConditionalLayout>
                                        {children}
                                    </ConditionalLayout>
                                    <AudioPlayer />
                                    <KeyboardShortcuts />
                                </LikeSyncProvider>
                            </AudioProvider>
                        </ToastProvider>
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
