import { redirect } from 'next/navigation';
import { checkRole } from '@/utils/roles';
import { getDb } from '@/lib/mongodb/client';
import Link from 'next/link';
import { ChevronRight, Plus, Disc3, Calendar, Users, Building2, Play, Heart, Music, Clock } from 'lucide-react';
import Image from 'next/image';
import { formatDate } from '@/lib/utils/date';
import { formatDuration } from '@/lib/utils/audio';
import { Album, Artist } from '@/lib/mongodb/schemas';

type AlbumWithArtists = Omit<Album, "artists"> & {
    artistDetails: Pick<Artist, "name" | "isDeleted">[];
};

export default async function AdminAlbumsPage() {
    const isAdmin = await checkRole('admin');
    if (!isAdmin) redirect('/');
    const db = await getDb();

    // Fetch albums with artist information
    const albums = await db.collection('albums').aggregate<AlbumWithArtists>([
        {
            $lookup: {
                from: 'artists',
                localField: 'artists',
                foreignField: '_id',
                as: 'artistDetails'
            }
        },
        {
            $project: {
                title: 1,
                releaseDate: 1,
                coverImage: 1,
                description: 1,
                label: 1,
                genres: 1,
                totalTracks: 1,
                totalDuration: 1,
                stats: 1,
                isDeleted: 1,
                deletedAt: 1,
                takedownReason: 1,
                artistDetails: { name: 1, isDeleted: 1 }
            }
        }
    ]).toArray();

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
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{albums.length} total albums</p>
                </div>
                <Link href="/admin/albums/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all duration-200 text-sm font-medium btn-transition shadow-sm hover:shadow-md">
                    <Plus className="h-4 w-4" />
                    Add Album
                </Link>
            </div>

            {albums.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 theme-transition">
                    <Disc3 className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No albums found</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by creating your first album.</p>
                    <Link href="/admin/albums/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all duration-200 text-sm font-medium btn-transition shadow-sm hover:shadow-md">
                        <Plus className="h-4 w-4" />
                        Add First Album
                    </Link>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {albums.map((album) => {
                    const isDeleted = album.isDeleted;
                    const hasDeletedArtists = album.artistDetails?.some((artist) => artist.isDeleted);

                    return (
                        <Link
                            key={String(album._id)}
                            href={`/admin/albums/${String(album._id)}`}
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

                            {/* Album Cover Section */}
                            <div className="flex flex-col items-center pt-8 pb-6 px-6">
                                <div className="relative mb-4">
                                    {album.coverImage ? (
                                        <div className="relative">
                                            <Image
                                                src={`${album.coverImage}${album.coverImage?.includes('?') ? '&' : '?'}t=${Date.now()}`}
                                                alt={album.title}
                                                width={120}
                                                height={120}
                                                className="rounded-xl object-cover ring-4 ring-gray-100 dark:ring-gray-700 shadow-lg group-hover:ring-blue-200 dark:group-hover:ring-blue-800 transition-all duration-300"
                                                unoptimized={true}
                                                key={`${album.coverImage}-${album._id}`}
                                            />
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>
                                    ) : (
                                        <div className="w-30 h-30 bg-gradient-to-br from-slate-400 to-slate-600 dark:from-slate-600 dark:to-slate-800 rounded-xl flex items-center justify-center ring-4 ring-gray-100 dark:ring-gray-700 shadow-lg group-hover:ring-blue-200 dark:group-hover:ring-blue-800 transition-all duration-300">
                                            <Disc3 className="h-12 w-12 text-white" />
                                        </div>
                                    )}
                                </div>

                                {/* Album Title */}
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white text-center mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 truncate w-full px-2">
                                    {album.title}
                                </h3>

                                {/* Artists */}
                                <div className="flex items-center gap-1.5 mb-3 w-full">
                                    <Users className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center truncate flex-1 min-w-0">
                                        {album.artistDetails?.map(artist => artist.name).join(", ") || "No artists"}
                                    </p>
                                </div>

                                {/* Release Date and Label */}
                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3 w-3" />
                                        <span>{formatDate(album.releaseDate)}</span>
                                    </div>
                                    {album.label && (
                                        <>
                                            <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                                            <div className="flex items-center gap-1.5">
                                                <Building2 className="h-3 w-3" />
                                                <span className="truncate max-w-20">{album.label}</span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Duration and Track Count */}
                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-3 w-3" />
                                        <span>{album.totalDuration ? formatDuration(album.totalDuration) : '0:00'}</span>
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                                    <div className="flex items-center gap-1.5">
                                        <Music className="h-3 w-3" />
                                        <span>{album.totalTracks || 0} track{(album.totalTracks || 0) !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Genres */}
                            <div className="px-6 pb-4">
                                <div className="flex flex-wrap gap-1.5 justify-center min-h-[1.5rem]">
                                    {album.genres && album.genres.length > 0 ? (
                                        <>
                                            {album.genres.slice(0, 2).map((genre: string, index: number) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium"
                                                >
                                                    {genre}
                                                </span>
                                            ))}
                                            {album.genres.length > 2 && (
                                                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 font-medium">
                                                    +{album.genres.length - 2}
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-xs text-gray-400 dark:text-gray-500 italic">No genres</span>
                                    )}
                                </div>
                            </div>

                            {/* Stats Section */}
                            {album.stats && (
                                <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1.5 mb-1">
                                                <Play className="h-3.5 w-3.5 text-blue-500" />
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Plays</span>
                                            </div>
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {formatNumber(album.stats.plays)}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1.5 mb-1">
                                                <Heart className="h-3.5 w-3.5 text-red-500" />
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Likes</span>
                                            </div>
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {formatNumber(album.stats.likes)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Warning for deleted artists */}
                            {hasDeletedArtists && !isDeleted && (
                                <div className="px-6 py-2 bg-amber-50/50 dark:bg-amber-900/20 border-t border-amber-100 dark:border-amber-800/50">
                                    <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center justify-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                        Contains deleted artists
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
