'use client';

import { useState } from 'react';
import { Disc } from 'lucide-react';
import { AlbumSearch } from '@/components/search/album-search';
import { OptimisticAlbumGrid } from '@/components/music/optimistic-album-grid';
import type { AlbumWithLikeStatus } from '@/actions/albums';

type AlbumsPageClientProps = {
    recentAlbums: AlbumWithLikeStatus[];
    trendingAlbums: AlbumWithLikeStatus[];
};

export function AlbumsPageClient({
    recentAlbums,
    trendingAlbums
}: AlbumsPageClientProps) {
    const [displayedAlbums, setDisplayedAlbums] = useState(recentAlbums);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearchResults = (results: AlbumWithLikeStatus[], searching: boolean) => {
        setDisplayedAlbums(results);
        setIsSearching(searching);
    };

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
                    <AlbumSearch
                        allAlbums={recentAlbums}
                        onSearchResults={handleSearchResults}
                    />
                </div>
            </div>

            {/* Search Results */}
            {isSearching && (
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        🔍 Search Results ({displayedAlbums.length})
                    </h2>
                    {displayedAlbums.length > 0 ? (
                        <OptimisticAlbumGrid albums={displayedAlbums} columns={4} />
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-600 dark:text-gray-400">No albums found matching your search.</p>
                        </div>
                    )}
                </section>
            )}

            {/* Default Content - Only show when not searching */}
            {!isSearching && (
                <>
                    {/* Trending Albums Section */}
                    {trendingAlbums.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🔥 Trending Albums</h2>
                            <OptimisticAlbumGrid albums={trendingAlbums} columns={4} />
                        </section>
                    )}

                    {/* Recent Albums Section */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Latest Releases</h2>
                        <OptimisticAlbumGrid albums={displayedAlbums} columns={4} />
                    </section>

                    {/* Load More Button */}
                    {displayedAlbums.length >= 20 && (
                        <div className="text-center">
                            <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                                Load More Albums
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Empty State */}
            {!isSearching && displayedAlbums.length === 0 && trendingAlbums.length === 0 && (
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