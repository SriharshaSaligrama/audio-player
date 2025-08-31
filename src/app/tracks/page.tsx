import { Suspense } from 'react';
import { Music, Search } from 'lucide-react';
import { getPublicTracksWithLikeStatus, getTrendingTracksWithLikeStatus } from '@/actions/tracks';
import { OptimisticTrackList } from '@/components/music/optimistic-track-list';
import { serializeTracks } from '@/lib/utils/serialization';

export default async function TracksPage() {
    // Get both recent and trending tracks
    const [recentTracks, trendingTracks] = await Promise.all([
        getPublicTracksWithLikeStatus(20),
        getTrendingTracksWithLikeStatus(10)
    ]);

    // Serialize tracks for client components
    const serializedRecentTracks = serializeTracks(recentTracks);
    const serializedTrendingTracks = serializeTracks(trendingTracks);

    return (
        <div className="space-y-8 fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Music className="h-8 w-8 text-green-600" />
                        All Tracks
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Discover and stream thousands of tracks from talented artists.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search tracks..."
                            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Trending Tracks Section */}
            {trendingTracks.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🔥 Trending Now</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <OptimisticTrackList tracks={serializedTrendingTracks} />
                    </div>
                </section>
            )}

            {/* All Tracks Section */}
            <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Latest Releases</h2>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <Suspense fallback={
                        <div className="space-y-4">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
                                    <div className="w-8 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                                    </div>
                                    <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                </div>
                            ))}
                        </div>
                    }>
                        <OptimisticTrackList tracks={serializedRecentTracks} />
                    </Suspense>
                </div>
            </section>

            {/* Load More Button */}
            {recentTracks.length >= 20 && (
                <div className="text-center">
                    <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                        Load More Tracks
                    </button>
                </div>
            )}

            {/* Empty State */}
            {recentTracks.length === 0 && trendingTracks.length === 0 && (
                <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Music className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No tracks available</h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                        It looks like there are no tracks in the catalog yet. Check back later for new releases!
                    </p>
                </div>
            )}
        </div>
    );
}