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
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 theme-transition">
                    <Users className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No artists found</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by creating your first artist.</p>
                    <Link href="/admin/artists/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all duration-200 text-sm font-medium btn-transition shadow-sm hover:shadow-md">
                        <Plus className="h-4 w-4" />
                        Add First Artist
                    </Link>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 ">
                {artists.map((artist) => (
                    <Link
                        key={String(artist._id)}
                        href={`/admin/artists/${String(artist._id)}`}
                        className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 transition-all duration-300 hover:-translate-y-1"
                    >
                        {/* Status Badge */}
                        <div className="absolute top-4 right-4 z-10">
                            <div
                                className={`px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${artist.isDeleted
                                    ? 'bg-red-100/90 text-red-700 dark:bg-red-900/80 dark:text-red-300 border border-red-200 dark:border-red-800'
                                    : 'bg-emerald-100/90 text-emerald-700 dark:bg-emerald-900/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                    }`}
                            >
                                {artist.isDeleted ? 'Deleted' : 'Active'}
                            </div>
                        </div>

                        {/* Artist Avatar Section */}
                        <div className="flex flex-col items-center pt-8 pb-6 px-6">
                            <div className="relative mb-4">
                                {artist.avatar ? (
                                    <div className="relative">
                                        <Image
                                            src={addCacheBuster(artist.avatar)}
                                            alt={artist.name}
                                            width={80}
                                            height={80}
                                            className="rounded-full object-cover ring-4 ring-gray-100 dark:ring-gray-700 shadow-lg group-hover:ring-blue-200 dark:group-hover:ring-blue-800 transition-all duration-300"
                                            unoptimized={true}
                                            key={createImageKey(artist.avatar, String(artist._id))}
                                        />
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                ) : (
                                    <div className="w-20 h-20 bg-gradient-to-br from-slate-400 to-slate-600 dark:from-slate-600 dark:to-slate-800 rounded-full flex items-center justify-center ring-4 ring-gray-100 dark:ring-gray-700 shadow-lg group-hover:ring-blue-200 dark:group-hover:ring-blue-800 transition-all duration-300">
                                        <Users className="h-8 w-8 text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Artist Name */}
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white text-center mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 truncate w-full px-2">
                                {artist.name}
                            </h3>

                            {/* Bio */}
                            <div className="min-h-[2.5rem] flex items-center px-2">
                                {artist.bio ? (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center leading-relaxed line-clamp-2">
                                        {artist.bio}
                                    </p>
                                ) : (
                                    <p className="text-sm text-gray-400 dark:text-gray-500 italic text-center">
                                        No biography available
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Stats Section */}
                        {artist.stats && (
                            <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1.5 mb-1">
                                            <Play className="h-3.5 w-3.5 text-blue-500" />
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Plays</span>
                                        </div>
                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {formatNumber(artist.stats.totalPlays)}
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1.5 mb-1">
                                            <Users className="h-3.5 w-3.5 text-emerald-500" />
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Followers</span>
                                        </div>
                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {formatNumber(artist.stats.followers)}
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1.5 mb-1">
                                            <Music className="h-3.5 w-3.5 text-purple-500" />
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Tracks</span>
                                        </div>
                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {artist.stats.totalTracks || 0}
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-1.5 mb-1">
                                            <Disc className="h-3.5 w-3.5 text-orange-500" />
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Albums</span>
                                        </div>
                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {artist.stats.totalAlbums || 0}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Social Links Section */}
                        <SocialLinks socialLinks={artist.socialLinks} />

                        {/* Hover Indicator */}
                        <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-blue-200 dark:group-hover:ring-blue-800 transition-all duration-300" />

                        {/* Subtle Arrow */}
                        <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                <ChevronRight className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
