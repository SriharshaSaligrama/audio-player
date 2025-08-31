import { Suspense } from 'react';
import { Users, Search } from 'lucide-react';
import { getPublicArtistsWithFollowStatus, getTrendingArtistsWithFollowStatus, getFeaturedArtistsWithFollowStatus } from '@/actions/artists';
import { OptimisticArtistGrid } from '@/components/music/optimistic-artist-grid';
import { serializeArtists } from '@/lib/utils/serialization';

export default async function ArtistsPage() {
    // Get both recent and trending artists
    const [allArtists, trendingArtists, featuredArtists] = await Promise.all([
        getPublicArtistsWithFollowStatus(24),
        getTrendingArtistsWithFollowStatus(8),
        getFeaturedArtistsWithFollowStatus(6)
    ]);

    // Serialize artists for client components
    const serializedAllArtists = serializeArtists(allArtists);
    const serializedTrendingArtists = serializeArtists(trendingArtists);
    const serializedFeaturedArtists = serializeArtists(featuredArtists);

    return (
        <div className="space-y-8 fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Users className="h-8 w-8 text-blue-600" />
                        Artists
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Discover talented musicians and explore their music collections.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search artists..."
                            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Featured Artists Section */}
            {featuredArtists.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">⭐ Featured Artists</h2>
                    <OptimisticArtistGrid artists={serializedFeaturedArtists} columns={3} />
                </section>
            )}

            {/* Trending Artists Section */}
            {trendingArtists.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🔥 Trending Artists</h2>
                    <OptimisticArtistGrid artists={serializedTrendingArtists} columns={4} />
                </section>
            )}

            {/* All Artists Section */}
            <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">All Artists</h2>
                <Suspense fallback={
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                                    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                }>
                    <OptimisticArtistGrid artists={serializedAllArtists} columns={4} />
                </Suspense>
            </section>

            {/* Load More Button */}
            {allArtists.length >= 24 && (
                <div className="text-center">
                    <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                        Load More Artists
                    </button>
                </div>
            )}

            {/* Empty State */}
            {allArtists.length === 0 && trendingArtists.length === 0 && featuredArtists.length === 0 && (
                <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No artists available</h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                        It looks like there are no artists in the catalog yet. Check back later for new talent!
                    </p>
                </div>
            )}
        </div>
    );
}