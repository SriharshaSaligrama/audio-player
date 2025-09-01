'use client';

import { useState } from 'react';
import { Users } from 'lucide-react';
import { ArtistSearch } from '@/components/search/artist-search';
import { OptimisticArtistGrid } from '@/components/music/optimistic-artist-grid';
import type { ArtistWithFollowStatus } from '@/actions/artists';

type ArtistsPageClientProps = {
    allArtists: ArtistWithFollowStatus[];
    trendingArtists: ArtistWithFollowStatus[];
    featuredArtists: ArtistWithFollowStatus[];
};

export function ArtistsPageClient({
    allArtists,
    trendingArtists,
    featuredArtists
}: ArtistsPageClientProps) {
    const [displayedArtists, setDisplayedArtists] = useState(allArtists);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearchResults = (results: ArtistWithFollowStatus[], searching: boolean) => {
        setDisplayedArtists(results);
        setIsSearching(searching);
    };

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
                    <ArtistSearch
                        allArtists={allArtists}
                        onSearchResults={handleSearchResults}
                    />
                </div>
            </div>

            {/* Search Results */}
            {isSearching && (
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        🔍 Search Results ({displayedArtists.length})
                    </h2>
                    {displayedArtists.length > 0 ? (
                        <OptimisticArtistGrid artists={displayedArtists} columns={4} />
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-600 dark:text-gray-400">No artists found matching your search.</p>
                        </div>
                    )}
                </section>
            )}

            {/* Default Content - Only show when not searching */}
            {!isSearching && (
                <>
                    {/* Featured Artists Section */}
                    {featuredArtists.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">⭐ Featured Artists</h2>
                            <OptimisticArtistGrid artists={featuredArtists} columns={3} />
                        </section>
                    )}

                    {/* Trending Artists Section */}
                    {trendingArtists.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🔥 Trending Artists</h2>
                            <OptimisticArtistGrid artists={trendingArtists} columns={4} />
                        </section>
                    )}

                    {/* All Artists Section */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">All Artists</h2>
                        <OptimisticArtistGrid artists={displayedArtists} columns={4} />
                    </section>

                    {/* Load More Button */}
                    {displayedArtists.length >= 24 && (
                        <div className="text-center">
                            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                                Load More Artists
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Empty State */}
            {!isSearching && displayedArtists.length === 0 && trendingArtists.length === 0 && featuredArtists.length === 0 && (
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