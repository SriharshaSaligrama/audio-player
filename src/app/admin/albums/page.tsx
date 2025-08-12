import { redirect } from 'next/navigation';
import { checkRole } from '@/utils/roles';
import { getDb } from '@/lib/mongodb/client';
import Link from 'next/link';
import { ChevronRight, Plus, Disc3, Calendar, Users, Building2, Play, Heart, Share2, Music } from 'lucide-react';
import Image from 'next/image';
import { formatDate } from '@/lib/utils/date';
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
                            className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden card-hover theme-transition"
                        >
                            {/* Header Section with Cover/Gradient Background */}
                            <div className="relative h-32 overflow-hidden">
                                {/* Background Cover Image or Gradient */}
                                {album.coverImage ? (
                                    <Image
                                        src={album.coverImage}
                                        alt={`${album.title} background`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        priority={albums.indexOf(album) < 3}
                                        unoptimized={album.coverImage.includes('blob.vercel-storage.com')}
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500" />
                                )}

                                {/* Gradient overlay for better text readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                                {/* Status Badge */}
                                <div className="absolute top-3 right-3 z-10">
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

                                {/* Album Cover and Info - Positioned at bottom of header */}
                                <div className="absolute bottom-4 left-4 right-4 flex items-end gap-3">
                                    <div className="relative">
                                        {album.coverImage ? (
                                            <Image
                                                src={album.coverImage}
                                                alt={album.title}
                                                width={60}
                                                height={60}
                                                className="rounded-lg object-cover border-3 border-white shadow-lg"
                                            />
                                        ) : (
                                            <div className="w-[60px] h-[60px] bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center border-3 border-white shadow-lg">
                                                <Disc3 className="h-7 w-7 text-white" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 pb-1">
                                        <h3 className="font-semibold text-white text-lg group-hover:text-blue-200 transition-colors truncate drop-shadow-sm">
                                            {album.title}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Users className="h-4 w-4 text-white/80" />
                                            <p className="text-sm text-gray-200 truncate drop-shadow-sm">
                                                {album.artistDetails?.map((artist, index) => (
                                                    <span key={artist.name} className={artist.isDeleted ? 'line-through opacity-60' : ''}>
                                                        {artist.name}
                                                        {index < album.artistDetails.length - 1 && ", "}
                                                    </span>
                                                ))}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Album Details Section */}
                            <div className="p-4">
                                {/* Release Date and Label */}
                                <div className="flex items-center justify-between text-sm mb-3">
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <Calendar className="h-4 w-4" />
                                        <span>{formatDate(album.releaseDate)}</span>
                                    </div>
                                    {album.label && (
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                            <Building2 className="h-4 w-4" />
                                            <span className="truncate max-w-24">{album.label}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="mb-3 min-h-[2.5rem]">
                                    {album.description ? (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                            {album.description}
                                        </p>
                                    ) : (
                                        <div className="h-10"></div>
                                    )}
                                </div>

                                {/* Genres - Always reserve space */}
                                <div className="min-h-[1.75rem] flex flex-wrap gap-1">
                                    {album.genres && album.genres.length > 0 ? (
                                        <>
                                            {album.genres.slice(0, 3).map((genre: string, index: number) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                >
                                                    {genre}
                                                </span>
                                            ))}
                                            {album.genres.length > 3 && (
                                                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                                    +{album.genres.length - 3}
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-xs text-gray-400 dark:text-gray-500 py-1">No genres specified</span>
                                    )}
                                </div>
                            </div>

                            {/* Stats Section */}
                            {album.stats && (
                                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Play className="h-4 w-4 text-blue-500" />
                                            <span className="text-gray-600 dark:text-gray-400">Plays:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {formatNumber(album.stats.plays)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Heart className="h-4 w-4 text-red-500" />
                                            <span className="text-gray-600 dark:text-gray-400">Likes:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {formatNumber(album.stats.likes)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Music className="h-4 w-4 text-purple-500" />
                                            <span className="text-gray-600 dark:text-gray-400">Tracks:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {album.totalTracks || 0}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Share2 className="h-4 w-4 text-green-500" />
                                            <span className="text-gray-600 dark:text-gray-400">Shares:</span>
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {formatNumber(album.stats.shares)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Warning for deleted artists */}
                            {hasDeletedArtists && !isDeleted && (
                                <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800">
                                    <p className="text-xs text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
                                        <span className="w-1 h-1 rounded-full bg-yellow-500"></span>
                                        Contains deleted artists
                                    </p>
                                </div>
                            )}

                            {/* Hover Arrow */}
                            <div className="absolute top-1/2 right-4 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200/50 dark:border-gray-600/50 group-hover:bg-white dark:group-hover:bg-gray-700 group-hover:scale-110 transition-all duration-200">
                                    <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
