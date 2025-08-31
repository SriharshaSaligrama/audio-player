import { Suspense } from 'react';
import { Disc, Search } from 'lucide-react';
import { getTrendingAlbumsWithLikeStatus, getRecentAlbumsWithLikeStatus } from '@/actions/albums';
import { OptimisticAlbumGrid } from '@/components/music/optimistic-album-grid';
import { serializeAlbums } from '@/lib/utils/serialization';

export default async function AlbumsPage() {
    // Get both recent and trending albums
    const [recentAlbums, trendingAlbums] = await Promise.all([
        getRecentAlbumsWithLikeStatus(20),
        getTrendingAlbumsWithLikeStatus(8)
    ]);

    // Serialize albums for client components
    const serializedRecentAlbums = serializeAlbums(recentAlbums);
    const serializedTrendingAlbums = serializeAlbums(trendingAlbums);

    return (
        <div className="space-y-8 fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Disc className="h-8 w-8 text-purple-600" />
                        Albums
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Explore complete album collections from your favorite artists.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search albums..."
                            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Trending Albums Section */}
            {trendingAlbums.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🔥 Trending Albums</h2>
                    <Suspense fallback={
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    }>
                        <OptimisticAlbumGrid albums={serializedTrendingAlbums} columns={4} />
                    </Suspense>
                </section>
            )}

            {/* Recent Albums Section */}
            <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Latest Releases</h2>
                <Suspense fallback={
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                }>
                    <OptimisticAlbumGrid albums={serializedRecentAlbums} columns={4} />
                </Suspense>
            </section>

            {/* Load More Button */}
            {recentAlbums.length >= 20 && (
                <div className="text-center">
                    <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                        Load More Albums
                    </button>
                </div>
            )}

            {/* Empty State */}
            {recentAlbums.length === 0 && trendingAlbums.length === 0 && (
                <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Disc className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No albums available</h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                        It looks like there are no albums in the catalog yet. Check back later for new releases!
                    </p>
                </div>
            )}
        </div>
    );
}