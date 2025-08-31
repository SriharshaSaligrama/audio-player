import { SignInButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { Play, Music, Users, TrendingUp } from 'lucide-react';
import { getFeaturedContent } from '@/actions/search';
import { OptimisticTrackList } from '@/components/music/optimistic-track-list';
import { OptimisticAlbumGrid } from '@/components/music/optimistic-album-grid';
import { OptimisticArtistGrid } from '@/components/music/optimistic-artist-grid';
import { serializeTracks, serializeAlbums, serializeArtists } from '@/lib/utils/serialization';

export default async function Home() {
    const { userId } = await auth();
    const isSignedIn = !!userId;

    // Get featured content for the homepage
    const { featuredTracks, featuredAlbums, featuredArtists } = await getFeaturedContent();

    // Serialize data for client components
    const serializedTracks = serializeTracks(featuredTracks);
    const serializedAlbums = serializeAlbums(featuredAlbums);
    const serializedArtists = serializeArtists(featuredArtists);

    return (
        <div className="space-y-8 fade-in">
            {/* Hero Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Discover Amazing Music
                    </h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                        Stream your favorite tracks, discover new artists, and create playlists.
                    </p>
                </div>
                {!isSignedIn && (
                    <SignInButton mode="modal">
                        <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-lg">
                            Sign In
                        </button>
                    </SignInButton>
                )}
            </div>

            {/* Quick Navigation */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Link href="/tracks" className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Music className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Browse Tracks</h3>
                            <p className="text-blue-100 text-sm">Explore all music</p>
                        </div>
                    </div>
                </Link>

                <Link href="/albums" className="group bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Albums</h3>
                            <p className="text-purple-100 text-sm">Full album collections</p>
                        </div>
                    </div>
                </Link>

                <Link href="/artists" className="group bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Artists</h3>
                            <p className="text-green-100 text-sm">Discover creators</p>
                        </div>
                    </div>
                </Link>

                <Link href="/search" className="group bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Search</h3>
                            <p className="text-orange-100 text-sm">Find anything</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Featured Tracks */}
            {serializedTracks.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Trending Tracks</h2>
                        <Link
                            href="/tracks"
                            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium transition-colors"
                        >
                            View All
                        </Link>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <OptimisticTrackList tracks={serializedTracks.slice(0, 6)} />
                    </div>
                </section>
            )}

            {/* Featured Albums */}
            {serializedAlbums.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Albums</h2>
                        <Link
                            href="/albums"
                            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium transition-colors"
                        >
                            View All
                        </Link>
                    </div>
                    <OptimisticAlbumGrid albums={serializedAlbums} columns={3} />
                </section>
            )}

            {/* Featured Artists */}
            {serializedArtists.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Artists</h2>
                        <Link
                            href="/artists"
                            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium transition-colors"
                        >
                            View All
                        </Link>
                    </div>
                    <OptimisticArtistGrid artists={serializedArtists} columns={4} />
                </section>
            )}

            {/* Sign Up CTA for non-authenticated users */}
            {!isSignedIn && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Ready to dive deeper?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                        Sign up to create playlists, save your favorite songs, and get personalized recommendations based on your listening habits.
                    </p>
                    <SignInButton mode="modal">
                        <button className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl">
                            Get Started Free
                        </button>
                    </SignInButton>
                </div>
            )}
        </div>
    );
}
