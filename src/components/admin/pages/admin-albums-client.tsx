'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ChevronRight, Plus, Disc3, Calendar, Users, Building2, Play, Heart, Music, Clock } from 'lucide-react';
import Image from 'next/image';
import { formatDate } from '@/lib/utils/date';
import { formatDuration } from '@/lib/utils/audio';
import { AdminAlbumSearch } from '@/components/admin/search/admin-album-search';
import type { Album, Artist } from '@/lib/mongodb/schemas';

type AlbumWithArtists = Omit<Album, "artists"> & {
    artistDetails: Pick<Artist, "name" | "isDeleted">[];
};

type AdminAlbumsClientProps = {
    initialAlbums: AlbumWithArtists[];
};

export function AdminAlbumsClient({ initialAlbums }: AdminAlbumsClientProps) {
    const [displayedAlbums, setDisplayedAlbums] = useState(initialAlbums);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearchResults = useCallback((results: AlbumWithArtists[], searching: boolean) => {
        setDisplayedAlbums(results);
        setIsSearching(searching);
    }, []);

    const formatNumber = (num?: number) => {
        if (!num) return '0';
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    return (
        <div className="space-y-6 fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Albums</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {isSearching ? `${displayedAlbums.length} search results` : `${initialAlbums.length} total albums`}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <AdminAlbumSearch
                        allAlbums={initialAlbums}
                        onSearchResults={handleSearchResults}
                    />
                    <Link href="/admin/albums/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all duration-200 text-sm font-medium btn-transition shadow-sm hover:shadow-md">
                        <Plus className="h-4 w-4" />
                        Add Album
                    </Link>
                </div>
            </div>

            {/* Search Results Header */}
            {isSearching && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        🔍 Search Results
                    </h2>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        Found {displayedAlbums.length} albums matching your search
                    </p>
                </div>
            )}

            {displayedAlbums.length === 0 && (
                <div className="text-center py-12 bg-gradient-to-br from-white via-gray-50/50 to-blue-50/40 dark:bg-gray-800 rounded-xl border-2 border-gray-200/80 dark:border-gray-700 shadow-lg shadow-gray-200/40 dark:shadow-none theme-transition">
                    <Disc3 className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {isSearching ? 'No albums found' : 'No albums found'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {isSearching ? 'Try adjusting your search terms.' : 'Get started by creating your first album.'}
                    </p>
                    {!isSearching && (
                        <Link href="/admin/albums/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all duration-200 text-sm font-medium btn-transition shadow-sm hover:shadow-md">
                            <Plus className="h-4 w-4" />
                            Add First Album
                        </Link>
                    )}
                </div>
            )}

            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 2xl:grid-cols-3">
                {displayedAlbums.map((album) => {
                    const isDeleted = album.isDeleted;
                    const hasDeletedArtists = album.artistDetails?.some((artist) => artist.isDeleted);

                    return (
                        <Link
                            key={String(album._id)}
                            href={`/admin/albums/${String(album._id)}`}
                            className="group relative bg-gradient-to-br from-white via-gray-50/50 to-blue-50/60 dark:from-gray-800 dark:via-gray-800 dark:to-blue-900/20 rounded-3xl border-2 border-gray-200/80 dark:border-gray-700/60 shadow-lg shadow-gray-200/40 dark:shadow-none overflow-hidden hover:shadow-2xl hover:shadow-blue-500/25 dark:hover:shadow-blue-500/10 hover:border-blue-300/60 dark:hover:border-blue-600/60 transition-all duration-500 hover:scale-[1.02] backdrop-blur-sm"
                        >
                            {/* Animated Background Pattern */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-indigo-500/8 to-purple-500/8 dark:from-blue-500/3 dark:via-indigo-500/3 dark:to-purple-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 dark:from-blue-400/10 dark:to-purple-400/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                            {/* Enhanced Status Badge */}
                            <div className="absolute top-4 right-4 z-20">
                                <div
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-lg ${isDeleted
                                        ? 'bg-red-500/90 text-white shadow-red-500/25'
                                        : 'bg-emerald-500/90 text-white shadow-emerald-500/25'
                                        } group-hover:scale-110 transition-transform duration-300`}
                                >
                                    {isDeleted ? 'Deleted' : 'Live'}
                                </div>
                            </div>

                            {/* Album Cover Section with Enhanced Layout */}
                            <div className="relative p-6">
                                <div className="flex flex-col items-center">
                                    {/* Enhanced Album Cover */}
                                    <div className="relative mb-3">
                                        {album.coverImage ? (
                                            <div className="relative">
                                                <Image
                                                    src={`${album.coverImage}${album.coverImage?.includes('?') ? '&' : '?'}t=${Date.now()}`}
                                                    alt={album.title}
                                                    width={140}
                                                    height={140}
                                                    className="rounded-3xl object-cover shadow-2xl shadow-gray-300/60 dark:shadow-black/60 ring-4 ring-white/80 dark:ring-gray-700/60 group-hover:ring-blue-400/80 dark:group-hover:ring-blue-500/60 group-hover:shadow-blue-400/30 dark:group-hover:shadow-blue-500/30 transition-all duration-500 group-hover:shadow-3xl group-hover:scale-105"
                                                    unoptimized={true}
                                                    key={`${album.coverImage}-${album._id}`}
                                                />
                                                <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                {/* Vinyl Record Effect */}
                                                <div className="absolute inset-0 rounded-3xl border-4 border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                {/* Play Button Overlay */}
                                                <div className="absolute inset-0 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                    <div className="w-12 h-12 bg-white/95 dark:bg-gray-900/95 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-sm">
                                                        <Play className="h-6 w-6 text-blue-600 dark:text-blue-400 ml-1" fill="currentColor" />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-35 h-35 bg-gradient-to-br from-slate-400 via-slate-500 to-slate-600 dark:from-slate-600 dark:via-slate-700 dark:to-slate-800 rounded-3xl flex items-center justify-center shadow-2xl shadow-gray-300/60 dark:shadow-black/60 ring-4 ring-white/80 dark:ring-gray-700/60 group-hover:ring-blue-400/80 dark:group-hover:ring-blue-500/60 group-hover:shadow-blue-400/30 dark:group-hover:shadow-blue-500/30 transition-all duration-500 group-hover:shadow-3xl group-hover:scale-105">
                                                <Disc3 className="h-16 w-16 text-white" />
                                            </div>
                                        )}
                                        {/* Glow Effect */}
                                        <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500" />
                                    </div>

                                    {/* Album Title */}
                                    <h3 className="font-bold text-xl text-gray-900 dark:text-white text-center mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-2 leading-tight px-2 max-w-full truncate">
                                        {album.title}
                                    </h3>

                                    {/* Artists with Enhanced Styling */}
                                    <div className="flex items-center gap-2 w-full justify-center">
                                        <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                                            <Users className="h-3 w-3 text-white" />
                                        </div>
                                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 text-center truncate max-w-48">
                                            {album.artistDetails?.map(artist => artist.name).join(", ") || "No artists"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Metadata Grid */}
                            <div className="px-6 pb-4">
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-gradient-to-r from-blue-100/90 to-indigo-100/90 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-3 border-2 border-blue-200/70 dark:border-blue-800/30 shadow-sm shadow-blue-200/40 dark:shadow-none">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Duration</span>
                                        </div>
                                        <div className="text-sm font-bold text-blue-900 dark:text-blue-100">
                                            {album.totalDuration ? formatDuration(album.totalDuration) : '0:00'}
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-purple-100/90 to-pink-100/90 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-3 border-2 border-purple-200/70 dark:border-purple-800/30 shadow-sm shadow-purple-200/40 dark:shadow-none">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Music className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                                            <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">Tracks</span>
                                        </div>
                                        <div className="text-sm font-bold text-purple-900 dark:text-purple-100">
                                            {album.totalTracks || 0}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-gradient-to-r from-emerald-100/90 to-teal-100/90 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-3 border-2 border-emerald-200/70 dark:border-emerald-800/30 shadow-sm shadow-emerald-200/40 dark:shadow-none">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Calendar className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Released</span>
                                        </div>
                                        <div className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                                            {formatDate(album.releaseDate)}
                                        </div>
                                    </div>

                                    {album.label && (
                                        <div className="bg-gradient-to-r from-orange-100/90 to-red-100/90 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-3 border-2 border-orange-200/70 dark:border-orange-800/30 shadow-sm shadow-orange-200/40 dark:shadow-none">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Building2 className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                                                <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">Label</span>
                                            </div>
                                            <div className="text-sm font-bold text-orange-900 dark:text-orange-100 truncate">
                                                {album.label}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Enhanced Genres */}
                                <div>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {album.genres && album.genres.length > 0 ? (
                                            <>
                                                {album.genres.slice(0, 3).map((genre: string, index: number) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:shadow-blue-500/25 transition-shadow duration-300"
                                                    >
                                                        {genre}
                                                    </span>
                                                ))}
                                                {album.genres.length > 3 && (
                                                    <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg">
                                                        +{album.genres.length - 3}
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-xs text-gray-400 dark:text-gray-500 italic font-medium">No genres assigned</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Stats Section - HORIZONTAL LAYOUT */}
                            {album.stats && (
                                <div className="mx-4 sm:mx-6 mb-4 bg-gradient-to-r from-gray-100/90 to-gray-200/90 dark:from-gray-700/50 dark:to-gray-800/50 rounded-2xl p-3 sm:p-4 border-2 border-gray-300/60 dark:border-gray-600/50 shadow-sm shadow-gray-200/50 dark:shadow-none">
                                    <div className="flex items-center justify-center gap-4 sm:gap-8">
                                        {/* Plays - Horizontal Layout */}
                                        <div className="flex items-center gap-2 sm:gap-4 group/stat">
                                            <div className="relative">
                                                <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg group-hover/stat:scale-110 transition-transform duration-300 flex-shrink-0">
                                                    <Play className="h-3 w-3 sm:h-4 sm:w-4 text-white ml-0.5" fill="currentColor" />
                                                </div>
                                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-0 group-hover/stat:opacity-20 blur-lg transition-opacity duration-500" />
                                            </div>
                                            <div className="text-left min-w-0">
                                                <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                                                    {formatNumber(album.stats.plays)}
                                                </div>
                                                <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    PLAYS
                                                </div>
                                            </div>
                                        </div>

                                        {/* Likes - Horizontal Layout */}
                                        <div className="flex items-center gap-2 sm:gap-4 group/stat">
                                            <div className="relative">
                                                <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg group-hover/stat:scale-110 transition-transform duration-300 flex-shrink-0">
                                                    <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-white" fill="currentColor" />
                                                </div>
                                                <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full opacity-0 group-hover/stat:opacity-20 blur-lg transition-opacity duration-500" />
                                            </div>
                                            <div className="text-left min-w-0">
                                                <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                                                    {formatNumber(album.stats.likes)}
                                                </div>
                                                <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    LIKES
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Warning for deleted artists */}
                            {hasDeletedArtists && !isDeleted && (
                                <div className="mx-6 mb-4 bg-gradient-to-r from-amber-100/90 to-orange-100/90 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-3 border-2 border-amber-300/70 dark:border-amber-800/50 shadow-sm shadow-amber-200/40 dark:shadow-none">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                                            Contains deleted artists
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Enhanced Hover Effects */}
                            <div className="absolute inset-0 rounded-3xl ring-2 ring-transparent group-hover:ring-blue-400/50 dark:group-hover:ring-blue-500/30 transition-all duration-500" />

                            {/* Floating Action Button */}
                            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <ChevronRight className="h-5 w-5 text-white" />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}