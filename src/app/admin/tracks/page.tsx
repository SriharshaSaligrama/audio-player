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
                localField: 'album',
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
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 theme-transition">
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
                            className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 transition-all duration-300 hover:-translate-y-1"
                        >
                            {/* Status Badge */}
                            <div className="absolute top-4 right-4 z-10">
                                <div
                                    className={`px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${isDeleted
                                        ? 'bg-red-100/90 text-red-700 dark:bg-red-900/80 dark:text-red-300 border border-red-200 dark:border-red-800'
                                        : 'bg-emerald-100/90 text-emerald-700 dark:bg-emerald-900/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                        }`}
                                >
                                    {isDeleted ? 'Deleted' : 'Active'}
                                </div>
                            </div>

                            {/* Track Cover Section */}
                            <div className="flex flex-col items-center pt-8 pb-6 px-6">
                                <div className="relative mb-4">
                                    {track.coverImage || album?.coverImage ? (
                                        <div className="relative">
                                            <Image
                                                src={`${track.coverImage || album?.coverImage || ''}${(track.coverImage || album?.coverImage)?.includes('?') ? '&' : '?'}t=${Date.now()}`}
                                                alt={track.title}
                                                width={100}
                                                height={100}
                                                className="rounded-xl object-cover ring-4 ring-gray-100 dark:ring-gray-700 shadow-lg group-hover:ring-blue-200 dark:group-hover:ring-blue-800 transition-all duration-300"
                                                unoptimized={true}
                                                key={`${track.coverImage || album?.coverImage}-${track._id}`}
                                            />
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>
                                    ) : (
                                        <div className="w-25 h-25 bg-gradient-to-br from-slate-400 to-slate-600 dark:from-slate-600 dark:to-slate-800 rounded-xl flex items-center justify-center ring-4 ring-gray-100 dark:ring-gray-700 shadow-lg group-hover:ring-blue-200 dark:group-hover:ring-blue-800 transition-all duration-300">
                                            <Music className="h-10 w-10 text-white" />
                                        </div>
                                    )}
                                </div>

                                {/* Track Title */}
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white text-center mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 truncate w-full px-2">
                                    {track.title}
                                </h3>

                                {/* Artists */}
                                <div className="flex items-center gap-1.5 mb-3 w-full">
                                    <Users className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center truncate flex-1 min-w-0">
                                        {track.artistDetails?.map(artist => artist.name).join(", ") || "No artists"}
                                    </p>
                                </div>

                                {/* Album */}
                                {album && (
                                    <div className="flex items-center gap-1.5 mb-3 w-full">
                                        <Disc3 className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                        <p className={`text-sm text-center truncate flex-1 min-w-0 ${hasDeletedAlbum
                                            ? 'text-gray-400 dark:text-gray-500 line-through'
                                            : 'text-gray-600 dark:text-gray-400'
                                            }`}>
                                            {album.title}
                                        </p>
                                    </div>
                                )}

                                {/* Duration and Release Date */}
                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-3 w-3" />
                                        <span>{formatDuration(track.duration)}</span>
                                    </div>
                                    {track.releaseDate && (
                                        <>
                                            <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-3 w-3" />
                                                <span>{formatDate(track.releaseDate)}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Genres */}
                            <div className="px-6 pb-4">
                                <div className="flex flex-wrap gap-1.5 justify-center min-h-[1.5rem]">
                                    {track.genres && track.genres.length > 0 ? (
                                        <>
                                            {track.genres.slice(0, 2).map((genre: string, index: number) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-medium"
                                                >
                                                    {genre}
                                                </span>
                                            ))}
                                            {track.genres.length > 2 && (
                                                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 font-medium">
                                                    +{track.genres.length - 2}
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-xs text-gray-400 dark:text-gray-500 italic">No genres</span>
                                    )}
                                </div>
                            </div>

                            {/* Stats Section */}
                            {track.stats && (
                                <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1.5 mb-1">
                                                <Play className="h-3.5 w-3.5 text-blue-500" />
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Plays</span>
                                            </div>
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {formatNumber(track.stats.plays)}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1.5 mb-1">
                                                <Heart className="h-3.5 w-3.5 text-red-500" />
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Likes</span>
                                            </div>
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {formatNumber(track.stats.likes)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Warning for deleted related items */}
                            {(hasDeletedArtists || hasDeletedAlbum) && !isDeleted && (
                                <div className="px-6 py-2 bg-amber-50/50 dark:bg-amber-900/20 border-t border-amber-100 dark:border-amber-800/50">
                                    <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center justify-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                        {hasDeletedArtists && hasDeletedAlbum
                                            ? 'Deleted artists & album'
                                            : hasDeletedArtists
                                                ? 'Contains deleted artists'
                                                : 'Album is deleted'
                                        }
                                    </p>
                                </div>
                            )}

                            {/* Hover Indicator */}
                            <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-blue-200 dark:group-hover:ring-blue-800 transition-all duration-300" />

                            {/* Subtle Arrow */}
                            <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                    <ChevronRight className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
