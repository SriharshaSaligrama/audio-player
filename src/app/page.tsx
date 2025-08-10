import { UniversalLayout } from '@/components/layout/universal-layout';
import { SignInButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';

export default async function Home() {
    const { userId } = await auth();
    const isSignedIn = !!userId;

    return (
        <UniversalLayout>
            <div className="space-y-6 fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Welcome</h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Welcome to the audio streaming platform.
                        </p>
                    </div>
                    {!isSignedIn && (
                        <SignInButton mode="modal">
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                                Sign In
                            </button>
                        </SignInButton>
                    )}
                </div>

                {/* Featured Content */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 card-hover theme-transition">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Discover Music</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Explore new artists and tracks tailored to your taste.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 card-hover theme-transition">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your Library</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Access your saved songs, playlists, and albums.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 card-hover theme-transition">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Trending Now</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Check out what&apos;s popular right now.
                        </p>
                    </div>
                </div>

                {!isSignedIn && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Sign in to access your music
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Create playlists, save your favorite songs, and discover personalized recommendations.
                        </p>
                        <SignInButton mode="modal">
                            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg">
                                Get Started
                            </button>
                        </SignInButton>
                    </div>
                )}
            </div>
        </UniversalLayout>
    );
}
