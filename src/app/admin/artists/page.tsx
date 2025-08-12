import { redirect } from 'next/navigation';
import { checkRole } from '@/utils/roles';
import { getDb } from '@/lib/mongodb/client';
import Link from 'next/link';
import { ChevronRight, Plus, Users, Music, Play, ExternalLink, Twitter, Instagram, Disc } from 'lucide-react';
import Image from 'next/image';

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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {artists.map((artist) => (
                    <Link
                        key={String(artist._id)}
                        href={`/admin/artists/${String(artist._id)}`}
                        className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden card-hover theme-transition"
                    >
                        {/* Header Section with Cover/Gradient Background */}
                        <div className="relative h-32 overflow-hidden">
                            {/* Cover Image or Gradient Background */}
                            {artist.coverImage ? (
                                <Image
                                    src={artist.coverImage}
                                    alt={`${artist.name} cover`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    priority={artists.indexOf(artist) < 3}
                                    unoptimized={artist.coverImage.includes('blob.vercel-storage.com')}
                                    className="object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600" />
                            )}

                            {/* Gradient overlay for better text readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                            {/* Status Badge */}
                            <div className="absolute top-3 right-3 z-10">
                                <div
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${artist.isDeleted
                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/80 dark:text-red-400'
                                        : 'bg-gradient-to-r from-green-400 to-teal-500 text-white shadow-lg'
                                        }`}
                                    style={artist.isDeleted ? {} : { textShadow: '0 0 4px rgba(0, 128, 0, 0.6)' }}
                                >
                                    {artist.isDeleted ? 'Deleted' : 'Active'}
                                </div>
                            </div>

                            {/* Avatar and Name - Positioned at bottom of header */}
                            <div className="absolute bottom-4 left-4 right-4 flex items-end gap-3">
                                <div className="relative">
                                    {artist.avatar ? (
                                        <Image
                                            src={artist.avatar}
                                            alt={artist.name}
                                            width={60}
                                            height={60}
                                            className="rounded-full object-cover border-3 border-white shadow-lg"
                                        />
                                    ) : (
                                        <div className="w-[60px] h-[60px] bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center border-3 border-white shadow-lg">
                                            <Users className="h-7 w-7 text-white" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 pb-1">
                                    <h3 className="font-semibold text-white text-lg group-hover:text-blue-200 transition-colors truncate drop-shadow-sm">
                                        {artist.name}
                                    </h3>
                                    {artist.bio && (
                                        <p className="text-sm text-gray-200 truncate drop-shadow-sm">
                                            {artist.bio}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content Section */}


                        {/* Stats Section */}
                        {artist.stats && (
                            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Play className="h-4 w-4 text-blue-500" />
                                        <span className="text-gray-600 dark:text-gray-400">Plays:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {formatNumber(artist.stats.totalPlays)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-green-500" />
                                        <span className="text-gray-600 dark:text-gray-400">Followers:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {formatNumber(artist.stats.followers)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Music className="h-4 w-4 text-purple-500" />
                                        <span className="text-gray-600 dark:text-gray-400">Tracks:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {artist.stats.totalTracks || 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Disc className="h-4 w-4 text-orange-500" />
                                        <span className="text-gray-600 dark:text-gray-400">Albums:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {artist.stats.totalAlbums || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Social Links Section */}
                        {artist.socialLinks &&
                            (artist.socialLinks.spotify ||
                                artist.socialLinks.twitter ||
                                artist.socialLinks.instagram) && (
                                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-600">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Social:</span>
                                        <div className="flex items-center gap-2">
                                            {artist.socialLinks.spotify && (
                                                <div className="p-1 rounded bg-green-500 text-white">
                                                    <ExternalLink className="h-3 w-3" />
                                                </div>
                                            )}
                                            {artist.socialLinks.twitter && (
                                                <div className="p-1 rounded bg-blue-500 text-white">
                                                    <Twitter className="h-3 w-3" />
                                                </div>
                                            )}
                                            {artist.socialLinks.instagram && (
                                                <div className="p-1 rounded bg-pink-500 text-white">
                                                    <Instagram className="h-3 w-3" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                        {/* Hover Arrow */}
                        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200/50 dark:border-gray-600/50 group-hover:bg-white dark:group-hover:bg-gray-700 group-hover:scale-110 transition-all duration-200">
                                <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
