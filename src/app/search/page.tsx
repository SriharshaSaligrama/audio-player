'use client';

import { useState, useEffect } from 'react';
import { Search, Music, Disc, Users } from 'lucide-react';
import { globalSearchWithStatus, SearchResultsWithStatus } from '@/actions/search';
import { OptimisticTrackList } from '@/components/music/optimistic-track-list';
import { OptimisticAlbumGrid } from '@/components/music/optimistic-album-grid';
import { OptimisticArtistGrid } from '@/components/music/optimistic-artist-grid';
import { serializeTracks, serializeAlbums, serializeArtists } from '@/lib/utils/serialization';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResultsWithStatus>({
        tracks: [],
        albums: [],
        artists: [],
        totalResults: 0
    });
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults({ tracks: [], albums: [], artists: [], totalResults: 0 });
            setHasSearched(false);
            return;
        }

        setIsLoading(true);
        try {
            const searchResults = await globalSearchWithStatus(searchQuery);
            // Serialize the results for client components
            const serializedResults = {
                tracks: serializeTracks(searchResults.tracks),
                albums: serializeAlbums(searchResults.albums),
                artists: serializeArtists(searchResults.artists),
                totalResults: searchResults.totalResults
            };
            setResults(serializedResults);
            setHasSearched(true);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className="space-y-8 fade-in">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Search Music
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Find your favorite tracks, albums, and artists
                </p>

                {/* Search Input */}
                <div className="relative max-w-2xl mx-auto">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for tracks, albums, artists..."
                        className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-lg"
                    />
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Searching...</p>
                </div>
            )}

            {/* Search Results */}
            {hasSearched && !isLoading && (
                <>
                    {results.totalResults > 0 ? (
                        <div className="space-y-8">
                            {/* Results Summary */}
                            <div className="text-center">
                                <p className="text-gray-600 dark:text-gray-400">
                                    Found {results.totalResults} results for &quot;{query}&quot;
                                </p>
                            </div>

                            {/* Tracks Results */}
                            {results.tracks.length > 0 && (
                                <section>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                        <Music className="h-6 w-6 text-green-600" />
                                        Tracks ({results.tracks.length})
                                    </h2>
                                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                                        <OptimisticTrackList tracks={results.tracks} />
                                    </div>
                                </section>
                            )}

                            {/* Albums Results */}
                            {results.albums.length > 0 && (
                                <section>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                        <Disc className="h-6 w-6 text-purple-600" />
                                        Albums ({results.albums.length})
                                    </h2>
                                    <OptimisticAlbumGrid albums={results.albums} columns={4} />
                                </section>
                            )}

                            {/* Artists Results */}
                            {results.artists.length > 0 && (
                                <section>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                        <Users className="h-6 w-6 text-blue-600" />
                                        Artists ({results.artists.length})
                                    </h2>
                                    <OptimisticArtistGrid artists={results.artists} columns={4} />
                                </section>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="h-12 w-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                No results found
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                                We couldn&apos;t find anything matching &quot;{query}&quot;. Try different keywords or browse our catalog.
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* Default State - Browse Categories */}
            {!hasSearched && !isLoading && (
                <div className="space-y-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                        Browse by Category
                    </h2>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-8 text-white text-center hover:from-green-600 hover:to-green-700 transition-all cursor-pointer">
                            <Music className="h-12 w-12 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">All Tracks</h3>
                            <p className="text-green-100">Browse our complete music library</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-8 text-white text-center hover:from-purple-600 hover:to-purple-700 transition-all cursor-pointer">
                            <Disc className="h-12 w-12 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Albums</h3>
                            <p className="text-purple-100">Explore complete album collections</p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-8 text-white text-center hover:from-blue-600 hover:to-blue-700 transition-all cursor-pointer">
                            <Users className="h-12 w-12 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Artists</h3>
                            <p className="text-blue-100">Discover talented musicians</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}