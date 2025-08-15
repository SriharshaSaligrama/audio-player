import { redirect } from 'next/navigation';
import { checkRole } from '@/utils/roles';
import { getDb } from '@/lib/mongodb/client';
import Link from 'next/link';
import { ChevronRight, Plus, Users, Music, Play, Disc } from 'lucide-react';
import Image from 'next/image';
import { SocialLinks } from '@/components/admin/social-links';

import { addCacheBuster, createImageKey } from '@/lib/utils/image-cache';

export default async function AdminArtistsPage() {
    const isAdmin = await checkRole('admin');
    if (!isAdmin) redirect('/');
    const db = await getDb();
    const artists = await db.collection('artists').find({}).toArray();

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
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Artists</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{artists.length} total artists</p>
                </div>
                <Link href="/admin/artists/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all duration-200 text-sm font-medium btn-transition shadow-sm hover:shadow-md">
                    <Plus className="h-4 w-4" />
                    Add Artist
                </Link>
            </div>

            {artists.length === 0 && (
                <div className="text-center py-12 bg-gradient-to-br from-white via-gray-50/50 to-purple-50/40 dark:bg-gray-800 rounded-xl border-2 border-gray-200/80 dark:border-gray-700 shadow-lg shadow-gray-200/40 dark:shadow-none theme-transition">
                    <Users className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No artists found</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by creating your first artist.</p>
                    <Link href="/admin/artists/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all duration-200 text-sm font-medium btn-transition shadow-sm hover:shadow-md">
                        <Plus className="h-4 w-4" />
                        Add First Artist
                    </Link>
                </div>
            )}

            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 2xl:grid-cols-3">
                {artists.map((artist) => (
                    <Link
                        key={String(artist._id)}
                        href={`/admin/artists/${String(artist._id)}`}
                        className="group relative bg-gradient-to-br from-white via-gray-50/50 to-purple-50/60 dark:from-gray-800 dark:via-gray-800 dark:to-purple-900/20 rounded-3xl border-2 border-gray-200/80 dark:border-gray-700/60 shadow-lg shadow-gray-200/40 dark:shadow-none overflow-hidden hover:shadow-2xl hover:shadow-purple-500/25 dark:hover:shadow-purple-500/10 hover:border-purple-300/60 dark:hover:border-purple-600/60 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] backdrop-blur-sm"
                    >
                        {/* Animated Background Elements */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/8 via-pink-500/8 to-blue-500/8 dark:from-purple-500/3 dark:via-pink-500/3 dark:to-blue-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 dark:from-purple-400/10 dark:to-pink-400/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 dark:from-blue-400/10 dark:to-indigo-400/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        {/* Enhanced Status Badge */}
                        <div className="absolute top-4 right-4 z-20">
                            <div
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-lg ${artist.isDeleted
                                    ? 'bg-red-500/90 text-white shadow-red-500/25'
                                    : 'bg-emerald-500/90 text-white shadow-emerald-500/25'
                                    } group-hover:scale-110 transition-transform duration-300`}
                            >
                                {artist.isDeleted ? 'Deleted' : 'Live'}
                            </div>
                        </div>

                        {/* Artist Profile Section */}
                        <div className="relative p-6 pb-4">
                            <div className="flex flex-col items-center">
                                {/* Enhanced Avatar */}
                                <div className="relative mb-3">
                                    {artist.avatar ? (
                                        <div className="relative">
                                            <Image
                                                src={addCacheBuster(artist.avatar)}
                                                alt={artist.name}
                                                width={100}
                                                height={100}
                                                className="rounded-full object-cover shadow-2xl shadow-gray-300/60 dark:shadow-black/60 ring-4 ring-white/80 dark:ring-gray-700/60 group-hover:ring-purple-400/80 dark:group-hover:ring-purple-500/60 group-hover:shadow-purple-400/30 dark:group-hover:shadow-purple-500/30 transition-all duration-500 group-hover:shadow-3xl group-hover:scale-110"
                                                unoptimized={true}
                                                key={createImageKey(artist.avatar, String(artist._id))}
                                            />
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            {/* Online Status Indicator */}
                                            <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 rounded-full border-3 border-white dark:border-gray-800 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="w-full h-full bg-emerald-400 rounded-full animate-pulse"></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-25 h-25 bg-gradient-to-br from-slate-400 via-slate-500 to-slate-600 dark:from-slate-600 dark:via-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center shadow-2xl shadow-gray-300/60 dark:shadow-black/60 ring-4 ring-white/80 dark:ring-gray-700/60 group-hover:ring-purple-400/80 dark:group-hover:ring-purple-500/60 group-hover:shadow-purple-400/30 dark:group-hover:shadow-purple-500/30 transition-all duration-500 group-hover:shadow-3xl group-hover:scale-110">
                                            <Users className="h-12 w-12 text-white" />
                                        </div>
                                    )}
                                    {/* Glow Effect */}
                                    <div className="absolute -inset-3 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500" />
                                </div>

                                {/* Artist Name */}
                                <h3 className="font-bold text-xl text-gray-900 dark:text-white text-center group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 line-clamp-2 leading-tight px-2 max-w-full truncate">
                                    {artist.name}
                                </h3>

                                {/* Enhanced Bio */}
                                <div className="h-[2rem] flex items-center px-4 max-w-full">
                                    {artist.bio ? (
                                        <p className="text-sm text-gray-600 dark:text-gray-300 text-center leading-relaxed line-clamp-2 font-medium truncate">
                                            {artist.bio}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-400 dark:text-gray-500 italic text-center font-medium">
                                            No biography available
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Stats Grid - HORIZONTAL LAYOUT */}
                        {artist.stats && (
                            <div className="mx-4 sm:mx-6 mb-4 bg-gradient-to-r from-gray-100/90 to-gray-200/90 dark:from-gray-700/50 dark:to-gray-800/50 rounded-2xl p-3 sm:p-4 border-2 border-gray-300/60 dark:border-gray-600/50 shadow-sm shadow-gray-200/50 dark:shadow-none">
                                <div className="grid grid-cols-2 gap-3 sm:gap-6">
                                    {/* Total Plays - Horizontal Layout */}
                                    <div className="flex items-center gap-2 sm:gap-3 group/stat">
                                        <div className="relative">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg group-hover/stat:scale-110 transition-transform duration-300 flex-shrink-0">
                                                <Play className="h-3 w-3 sm:h-4 sm:w-4 text-white ml-0.5" fill="currentColor" />
                                            </div>
                                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-0 group-hover/stat:opacity-20 blur-lg transition-opacity duration-500" />
                                        </div>
                                        <div className="text-left min-w-0">
                                            <div className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
                                                {formatNumber(artist.stats.totalPlays)}
                                            </div>
                                            <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                TOTAL PLAYS
                                            </div>
                                        </div>
                                    </div>

                                    {/* Followers - Horizontal Layout */}
                                    <div className="flex items-center gap-2 sm:gap-3 group/stat">
                                        <div className="relative">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg group-hover/stat:scale-110 transition-transform duration-300 flex-shrink-0">
                                                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                                            </div>
                                            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full opacity-0 group-hover/stat:opacity-20 blur-lg transition-opacity duration-500" />
                                        </div>
                                        <div className="text-left min-w-0">
                                            <div className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
                                                {formatNumber(artist.stats.followers)}
                                            </div>
                                            <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                FOLLOWERS
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tracks - Horizontal Layout */}
                                    <div className="flex items-center gap-2 sm:gap-3 group/stat">
                                        <div className="relative">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg group-hover/stat:scale-110 transition-transform duration-300 flex-shrink-0">
                                                <Music className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                                            </div>
                                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 group-hover/stat:opacity-20 blur-lg transition-opacity duration-500" />
                                        </div>
                                        <div className="text-left min-w-0">
                                            <div className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
                                                {artist.stats.totalTracks || 0}
                                            </div>
                                            <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                TRACKS
                                            </div>
                                        </div>
                                    </div>

                                    {/* Albums - Horizontal Layout */}
                                    <div className="flex items-center gap-2 sm:gap-3 group/stat">
                                        <div className="relative">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg group-hover/stat:scale-110 transition-transform duration-300 flex-shrink-0">
                                                <Disc className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                                            </div>
                                            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full opacity-0 group-hover/stat:opacity-20 blur-lg transition-opacity duration-500" />
                                        </div>
                                        <div className="text-left min-w-0">
                                            <div className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
                                                {artist.stats.totalAlbums || 0}
                                            </div>
                                            <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                ALBUMS
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Enhanced Social Links Section */}
                        <SocialLinks socialLinks={artist.socialLinks} />

                        {/* Enhanced Hover Effects */}
                        <div className="absolute inset-0 rounded-3xl ring-2 ring-transparent group-hover:ring-purple-400/50 dark:group-hover:ring-purple-500/30 transition-all duration-500" />

                        {/* Floating Action Button */}
                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <ChevronRight className="h-5 w-5 text-white" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
