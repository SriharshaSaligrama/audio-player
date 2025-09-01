"use client"

import Image from 'next/image';
import Link from 'next/link';
import { Play, Calendar, Clock, Music } from 'lucide-react';
import { AlbumWithDetails, AlbumWithLikeStatus } from '@/actions/albums';
import { formatDate } from '@/lib/utils/date';
import { OptimisticLikeButton } from '@/components/ui/optimistic-interactive-buttons';

type OptimisticAlbumGridProps = {
    albums: (AlbumWithDetails | AlbumWithLikeStatus)[];
    columns?: 2 | 3 | 4 | 5 | 6;
}

export function OptimisticAlbumGrid({ albums, columns = 4 }: OptimisticAlbumGridProps) {
    const formatDuration = (seconds?: number) => {
        if (!seconds) return '0:00';
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    const getGridCols = () => {
        switch (columns) {
            case 2: return 'grid-cols-2';
            case 3: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
            case 4: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
            case 5: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5';
            case 6: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6';
            default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
        }
    };

    if (albums.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Music className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No albums found</h3>
                <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or browse our catalog.</p>
            </div>
        );
    }

    return (
        <div className={`grid gap-6 ${getGridCols()}`}>
            {albums.map((album) => {
                const albumId = String(album._id);

                return (
                    <Link
                        key={albumId}
                        href={`/albums/${albumId}`}
                        className="group block h-full"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30 transition-all duration-300 h-full flex flex-col">
                            {/* Album Cover */}
                            <div className="relative aspect-square overflow-hidden">
                                {album.coverImage ? (
                                    <Image
                                        src={`${album.coverImage}${album.coverImage.includes('?') ? '&' : '?'}t=${Date.now()}`}
                                        alt={album.title}
                                        width={300}
                                        height={300}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        unoptimized={true}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                                        <Music className="h-16 w-16 text-gray-400" />
                                    </div>
                                )}

                                {/* Play Button Overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            // TODO: Implement album play functionality
                                            console.log('Play album:', album.title);
                                        }}
                                        className="w-16 h-16 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300 shadow-2xl border-2 border-gray-200 hover:border-green-500"
                                    >
                                        <Play className="h-6 w-6 text-gray-800 hover:text-green-600 ml-1" fill="currentColor" />
                                    </button>
                                </div>

                                {/* Like Button - Bottom Right Corner */}
                                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform">
                                    <OptimisticLikeButton
                                        type="album"
                                        id={albumId}
                                        initialLiked={'isLiked' in album ? album.isLiked : false}
                                        showText={false}
                                        className="w-12 h-12 bg-white hover:bg-red-50 border-2 border-gray-300 hover:border-red-400 rounded-full p-2.5 shadow-xl text-gray-600 hover:text-red-500 backdrop-blur-sm transition-all duration-200"
                                    />
                                </div>
                            </div>

                            {/* Album Info */}
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors leading-tight">
                                    {album.title}
                                </h3>

                                {/* Artists */}
                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-shrink-0">
                                    {album.artistDetails && album.artistDetails.length > 0 ? (
                                        <div className="flex items-center gap-1 flex-wrap">
                                            {album.artistDetails.map((artist, idx) => (
                                                <span key={String(artist._id)} className="hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
                                                    {artist.name}
                                                    {idx < album.artistDetails.length - 1 && ', '}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 font-medium">Unknown Artist</span>
                                    )}
                                </div>

                                {/* Album Stats */}
                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4 flex-shrink-0">
                                    <div className="flex items-center gap-3">
                                        {album.releaseDate && (
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>{formatDate(album.releaseDate)}</span>
                                            </div>
                                        )}

                                        {album.totalTracks > 0 && (
                                            <div className="flex items-center gap-1">
                                                <Music className="h-3 w-3" />
                                                <span>{album.totalTracks} tracks</span>
                                            </div>
                                        )}
                                    </div>

                                    {album.totalDuration > 0 && (
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{formatDuration(album.totalDuration)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Genres */}
                                {album.genres && album.genres.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-auto">
                                        {album.genres.slice(0, 2).map((genre, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2.5 py-1 text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full font-medium border border-green-200 dark:border-green-800"
                                            >
                                                {genre}
                                            </span>
                                        ))}
                                        {album.genres.length > 2 && (
                                            <span className="px-2.5 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full font-medium border border-gray-200 dark:border-gray-600">
                                                +{album.genres.length - 2}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}