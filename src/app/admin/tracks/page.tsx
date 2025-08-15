import { redirect } from 'next/navigation';
import { checkRole } from '@/utils/roles';
import { getDb } from '@/lib/mongodb/client';
import Link from 'next/link';
import { ChevronRight, Plus, Music, Clock, Play, Heart, Users, Disc3, Calendar } from 'lucide-react';
import Image from 'next/image';
import { formatDate } from '@/lib/utils/date';
import { Album, Artist, Track } from '@/lib/mongodb/schemas';

export type TrackWithDetails = Omit<Track, "artists" | "album"> & {
    artistDetails: Pick<Artist, "name" | "isDeleted">[];
    albumDetails: Pick<Album, "title" | "coverImage" | "isDeleted">[];
};

export default async function AdminTracksPage() {
    const isAdmin = await checkRole('admin');
    if (!isAdmin) redirect('/');
    const db = await getDb();

    // Fetch tracks with artist and album information
    const tracks = await db.collection('tracks').aggregate<TrackWithDetails>([
        {
            $lookup: {
                from: 'artists',
                localField: 'artists',
                foreignField: '_id',
                as: 'artistDetails'
            }
        },
        {
            $lookup: {
                from: 'albums',
                localField: 'albums',
                foreignField: '_id',
                as: 'albumDetails'
            }
        },
        {
            $project: {
                title: 1,
                duration: 1,
                coverImage: 1,
                genres: 1,
                releaseDate: 1,
                stats: 1,
                isDeleted: 1,
                deletedAt: 1,
                takedownReason: 1,
                artistDetails: { name: 1, isDeleted: 1 },
                albumDetails: { title: 1, coverImage: 1, isDeleted: 1 }
            }
        }
    ]).toArray();

    const formatDuration = (seconds?: number) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

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
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Tracks</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{tracks.length} total tracks</p>
                </div>
                <Link href="/admin/tracks/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all duration-200 text-sm font-medium btn-transition shadow-sm hover:shadow-md">
                    <Plus className="h-4 w-4" />
                    Add Track
                </Link>
            </div>

            {tracks.length === 0 && (
                <div className="text-center py-12 bg-gradient-to-br from-white via-gray-50/50 to-blue-50/40 dark:bg-gray-800 rounded-xl border-2 border-gray-200/80 dark:border-gray-700 shadow-lg shadow-gray-200/40 dark:shadow-none theme-transition">
                    <Music className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tracks found</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by creating your first track.</p>
                    <Link href="/admin/tracks/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all duration-200 text-sm font-medium btn-transition shadow-sm hover:shadow-md">
                        <Plus className="h-4 w-4" />
                        Add First Track
                    </Link>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tracks.map((track) => {
                    const isDeleted = track.isDeleted;
                    const hasDeletedArtists = track.artistDetails?.some((artist) => artist.isDeleted);
                    const hasDeletedAlbum = track.albumDetails?.[0]?.isDeleted;
                    const album = track.albumDetails?.[0];

                    return (
                        <Link
                            key={String(track._id)}
                            href={`/admin/tracks/${String(track._id)}`}
                            className="group relative bg-gradient-to-br from-white via-gray-50/50 to-blue-50/60 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/50 rounded-3xl border-2 border-gray-200/80 dark:border-gray-700/60 shadow-lg shadow-gray-200/40 dark:shadow-none overflow-hidden hover:shadow-2xl hover:shadow-blue-500/25 dark:hover:shadow-blue-500/5 hover:border-blue-300/60 dark:hover:border-blue-600/60 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] backdrop-blur-sm"
                        >
                            {/* Animated Background Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-purple-500/8 to-pink-500/8 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Status Badge with Glow */}
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

                            {/* Header Section with Cover and Title */}
                            <div className="relative p-6 pb-4">
                                <div className="flex items-start gap-4">
                                    {/* Enhanced Cover Art */}
                                    <div className="relative flex-shrink-0">
                                        {track.coverImage || album?.coverImage ? (
                                            <div className="relative">
                                                <Image
                                                    src={`${track.coverImage || album?.coverImage || ''}${(track.coverImage || album?.coverImage)?.includes('?') ? '&' : '?'}t=${Date.now()}`}
                                                    alt={track.title}
                                                    width={80}
                                                    height={80}
                                                    className="rounded-2xl object-cover shadow-xl shadow-gray-300/60 dark:shadow-black/60 ring-2 ring-white/80 dark:ring-gray-700/50 group-hover:ring-blue-400/80 dark:group-hover:ring-blue-500/50 group-hover:shadow-blue-400/30 dark:group-hover:shadow-blue-500/30 transition-all duration-500 group-hover:shadow-2xl group-hover:scale-105"
                                                    unoptimized={true}
                                                    key={`${track.coverImage || album?.coverImage}-${track._id}`}
                                                />
                                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                {/* Play Button Overlay */}
                                                <div className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                    <div className="w-8 h-8 bg-white/90 dark:bg-gray-900/90 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
                                                        <Play className="h-4 w-4 text-blue-600 dark:text-blue-400 ml-0.5" fill="currentColor" />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-20 h-20 bg-gradient-to-br from-slate-400 via-slate-500 to-slate-600 dark:from-slate-600 dark:via-slate-700 dark:to-slate-800 rounded-2xl flex items-center justify-center shadow-xl shadow-gray-300/60 dark:shadow-black/60 ring-2 ring-white/80 dark:ring-gray-700/50 group-hover:ring-blue-400/80 dark:group-hover:ring-blue-500/50 group-hover:shadow-blue-400/30 dark:group-hover:shadow-blue-500/30 transition-all duration-500 group-hover:shadow-2xl group-hover:scale-105">
                                                <Music className="h-8 w-8 text-white" />
                                            </div>
                                        )}
                                        {/* Pulse Animation */}
                                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-500" />
                                    </div>

                                    {/* Track Info */}
                                    <div className="flex-1 min-w-0 max-w-full">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-2 leading-tight truncate">
                                            {track.title}
                                        </h3>

                                        {/* Artists with Enhanced Styling */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Users className="h-2.5 w-2.5 text-white" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate">
                                                {track.artistDetails?.map(artist => artist.name).join(", ") || "No artists"}
                                            </p>
                                        </div>

                                        {/* Album with Enhanced Styling */}
                                        {album && (
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <Disc3 className="h-2.5 w-2.5 text-white" />
                                                </div>
                                                <p className={`text-sm font-medium truncate ${hasDeletedAlbum
                                                    ? 'text-gray-400 dark:text-gray-500 line-through'
                                                    : 'text-gray-600 dark:text-gray-300'
                                                    }`}>
                                                    {album.title}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Metadata Section */}
                            <div className="px-6 pb-4">
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-gradient-to-r from-blue-100/90 to-indigo-100/90 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-3 border-2 border-blue-200/70 dark:border-blue-800/30 shadow-sm shadow-blue-200/40 dark:shadow-none">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Duration</span>
                                        </div>
                                        <div className="text-sm font-bold text-blue-900 dark:text-blue-100">
                                            {formatDuration(track.duration)}
                                        </div>
                                    </div>

                                    {track.releaseDate && (
                                        <div className="bg-gradient-to-r from-emerald-100/90 to-teal-100/90 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-3 border-2 border-emerald-200/70 dark:border-emerald-800/30 shadow-sm shadow-emerald-200/40 dark:shadow-none">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Calendar className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Released</span>
                                            </div>
                                            <div className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                                                {formatDate(track.releaseDate)}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Enhanced Genres */}
                                <div >
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {track.genres && track.genres.length > 0 ? (
                                            <>
                                                {track.genres.slice(0, 3).map((genre: string, index: number) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-purple-500/25 transition-shadow duration-300"
                                                    >
                                                        {genre}
                                                    </span>
                                                ))}
                                                {track.genres.length > 3 && (
                                                    <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg">
                                                        +{track.genres.length - 3}
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
                            {track.stats && (
                                <div className="mx-6 mb-4 bg-gradient-to-r from-gray-100/90 to-gray-200/90 dark:from-gray-700/50 dark:to-gray-800/50 rounded-2xl p-4 border-2 border-gray-300/60 dark:border-gray-600/50 shadow-sm shadow-gray-200/50 dark:shadow-none">
                                    <div className="flex items-center justify-center gap-8">
                                        {/* Plays - Horizontal Layout */}
                                        <div className="flex items-center gap-4 group/stat">
                                            <div className="relative">
                                                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg group-hover/stat:scale-110 transition-transform duration-300">
                                                    <Play className="h-5 w-5 text-white ml-0.5" fill="currentColor" />
                                                </div>
                                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-0 group-hover/stat:opacity-20 blur-lg transition-opacity duration-500" />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-xl font-bold text-gray-900 dark:text-white">
                                                    {formatNumber(track.stats.plays)}
                                                </div>
                                                <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    PLAYS
                                                </div>
                                            </div>
                                        </div>

                                        {/* Likes - Horizontal Layout */}
                                        <div className="flex items-center gap-4 group/stat">
                                            <div className="relative">
                                                <div className="w-7 h-7 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg group-hover/stat:scale-110 transition-transform duration-300">
                                                    <Heart className="h-5 w-5 text-white" fill="currentColor" />
                                                </div>
                                                <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full opacity-0 group-hover/stat:opacity-20 blur-lg transition-opacity duration-500" />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-xl font-bold text-gray-900 dark:text-white">
                                                    {formatNumber(track.stats.likes)}
                                                </div>
                                                <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    LIKES
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Warning for deleted related items */}
                            {(hasDeletedArtists || hasDeletedAlbum) && !isDeleted && (
                                <div className="mx-6 mb-4 bg-gradient-to-r from-amber-100/90 to-orange-100/90 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-3 border-2 border-amber-300/70 dark:border-amber-800/50 shadow-sm shadow-amber-200/40 dark:shadow-none">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                                            {hasDeletedArtists && hasDeletedAlbum
                                                ? 'Deleted artists & album'
                                                : hasDeletedArtists
                                                    ? 'Contains deleted artists'
                                                    : 'Album is deleted'
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Enhanced Hover Effects */}
                            <div className="absolute inset-0 rounded-3xl ring-2 ring-transparent group-hover:ring-blue-400/50 dark:group-hover:ring-blue-500/30 transition-all duration-500" />

                            {/* Floating Action Button */}
                            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
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
