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

            <div className="grid gap-4">
                {tracks.map((track) => {
                    const isDeleted = track.isDeleted;
                    const hasDeletedArtists = track.artistDetails?.some((artist) => artist.isDeleted);
                    const hasDeletedAlbum = track.albumDetails?.[0]?.isDeleted;
                    const album = track.albumDetails?.[0];

                    return (
                        <Link
                            key={String(track._id)}
                            href={`/admin/tracks/${String(track._id)}`}
                            className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden card-hover theme-transition"
                        >
                            <div className="flex items-center p-4 gap-4">
                                {/* Track Cover/Album Art */}
                                <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                                    {track.coverImage || album?.coverImage ? (
                                        <Image
                                            src={track.coverImage || album.coverImage || ''}
                                            alt={`${track.title} cover`}
                                            fill
                                            sizes="64px"
                                            priority={tracks.indexOf(track) < 3}
                                            unoptimized={(track.coverImage || album.coverImage || '').includes('blob.vercel-storage.com')}
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 flex items-center justify-center">
                                            <Music className="h-6 w-6 text-white/80" />
                                        </div>
                                    )}
                                </div>

                                {/* Track Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                                {track.title}
                                            </h3>

                                            {/* Artists */}
                                            <div className="flex items-center gap-2 mt-1">
                                                <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                    {track.artistDetails?.map((artist, index) => (
                                                        <span key={artist.name} className={artist.isDeleted ? 'line-through opacity-60' : ''}>
                                                            {artist.name}
                                                            {index < track.artistDetails.length - 1 && ", "}
                                                        </span>
                                                    ))}
                                                </p>
                                            </div>

                                            {/* Album */}
                                            {album && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Disc3 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                    <p className={`text-sm truncate ${hasDeletedAlbum
                                                        ? 'text-gray-400 dark:text-gray-500 line-through'
                                                        : 'text-gray-600 dark:text-gray-400'
                                                        }`}>
                                                        {album.title}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Duration and Release Date */}
                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{formatDuration(track.duration)}</span>
                                                </div>
                                                {track.releaseDate && (
                                                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{formatDate(track.releaseDate)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="flex-shrink-0 ml-4">
                                            <div
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${isDeleted
                                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/80 dark:text-red-400'
                                                    : 'bg-gradient-to-r from-green-400 to-teal-500 text-white shadow-lg'
                                                    }`}
                                                style={isDeleted ? {} : { textShadow: '0 0 4px rgba(0, 128, 0, 0.6)' }}
                                            >
                                                {isDeleted ? 'Deleted' : 'Active'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Genres */}
                                    {track.genres && track.genres.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {track.genres.slice(0, 3).map((genre: string, index: number) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                                                >
                                                    {genre}
                                                </span>
                                            ))}
                                            {track.genres.length > 3 && (
                                                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                                    +{track.genres.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Stats */}
                                {track.stats && (
                                    <div className="flex-shrink-0 text-right">
                                        <div className="grid grid-cols-1 gap-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Play className="h-4 w-4 text-blue-500" />
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {formatNumber(track.stats.plays)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Heart className="h-4 w-4 text-red-500" />
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {formatNumber(track.stats.likes)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Hover Arrow */}
                                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200/50 dark:border-gray-600/50 group-hover:bg-white dark:group-hover:bg-gray-700 group-hover:scale-110 transition-all duration-200">
                                        <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Warning for deleted related items */}
                            {(hasDeletedArtists || hasDeletedAlbum) && !isDeleted && (
                                <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800">
                                    <p className="text-xs text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
                                        <span className="w-1 h-1 rounded-full bg-yellow-500"></span>
                                        {hasDeletedArtists && hasDeletedAlbum
                                            ? 'Contains deleted artists and album'
                                            : hasDeletedArtists
                                                ? 'Contains deleted artists'
                                                : 'Album is deleted'
                                        }
                                    </p>
                                </div>
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
