'use client';

import { useState, useCallback } from 'react';
import { Music } from 'lucide-react';
import { TrackSearch } from '@/components/search/track-search';
import { OptimisticTrackList } from '@/components/music/optimistic-track-list';
import type { TrackWithLikeStatus } from '@/actions/tracks';

type TracksPageClientProps = {
    recentTracks: TrackWithLikeStatus[];
    trendingTracks: TrackWithLikeStatus[];
};

export function TracksPageClient({
    recentTracks,
    trendingTracks
}: TracksPageClientProps) {
    const [displayedTracks, setDisplayedTracks] = useState(recentTracks);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearchResults = useCallback((results: TrackWithLikeStatus[], searching: boolean) => {
        setDisplayedTracks(results);
        setIsSearching(searching);
    }, []);

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
                    <TrackSearch
                        allTracks={recentTracks}
                        onSearchResults={handleSearchResults}
                    />
                </div>
            </div>

            {/* Search Results */}
            {isSearching && (
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        🔍 Search Results ({displayedTracks.length})
                    </h2>
                    {displayedTracks.length > 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <OptimisticTrackList tracks={displayedTracks} />
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-600 dark:text-gray-400">No tracks found matching your search.</p>
                        </div>
                    )}
                </section>
            )}

            {/* Default Content - Only show when not searching */}
            {!isSearching && (
                <>
                    {/* Trending Tracks Section */}
                    {trendingTracks.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🔥 Trending Now</h2>
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                                <OptimisticTrackList tracks={trendingTracks} />
                            </div>
                        </section>
                    )}

                    {/* All Tracks Section */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Latest Releases</h2>
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <OptimisticTrackList tracks={displayedTracks} />
                        </div>
                    </section>

                    {/* Load More Button */}
                    {displayedTracks.length >= 20 && (
                        <div className="text-center">
                            <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                                Load More Tracks
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Empty State */}
            {!isSearching && displayedTracks.length === 0 && trendingTracks.length === 0 && (
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