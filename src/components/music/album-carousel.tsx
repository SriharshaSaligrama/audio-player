"use client"

import Image from 'next/image';
import Link from 'next/link';
import { Play, Calendar, Clock, Music } from 'lucide-react';
import { AlbumWithDetails, AlbumWithLikeStatus } from '@/actions/albums';
import { formatDate } from '@/lib/utils/date';
import { OptimisticLikeButton } from '@/components/ui/optimistic-interactive-buttons';
import { Carousel } from '@/components/ui/carousel';

type AlbumCarouselProps = {
    albums: (AlbumWithDetails | AlbumWithLikeStatus)[];
    title?: string;
    viewAllHref?: string;
    className?: string;
}

export function AlbumCarousel({
    albums,
    title = "Albums",
    viewAllHref,
    className = ""
}: AlbumCarouselProps) {
    const formatDuration = (seconds?: number) => {
        if (!seconds) return '0:00';
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
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
        <section className={className}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
                {viewAllHref && (
                    <Link
                        href={viewAllHref}
                        className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium transition-colors hover:underline"
                    >
                        View All
                    </Link>
                )}
            </div>

            {/* Carousel */}
            <Carousel itemWidth={280} gap={24} className="px-1">
                {albums.map((album) => {
                    const albumId = String(album._id);

                    return (
                        <Link
                            key={albumId}
                            href={`/albums/${albumId}`}
                            className="group block flex-shrink-0"
                            style={{ width: '280px' }}
                        >
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30 transition-all duration-300 h-full flex flex-col">
                                {/* Album Cover */}
                                <div className="relative aspect-square overflow-hidden">
                                    {album.coverImage ? (
                                        <Image
                                            src={`${album.coverImage}${album.coverImage.includes('?') ? '&' : '?'}t=${Date.now()}`}
                                            alt={album.title}
                                            width={280}
                                            height={280}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            unoptimized={true}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                                            <Music className="h-16 w-16 text-gray-400" />
                                        </div>
                                    )}

                                    {/* Play Button Overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center pointer-events-none">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                console.log('Play album:', album.title);
                                            }}
                                            className="w-16 h-16 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300 shadow-2xl border-2 border-gray-200 hover:border-green-500 pointer-events-auto"
                                        >
                                            <Play className="h-6 w-6 text-gray-800 hover:text-green-600 ml-1" fill="currentColor" />
                                        </button>
                                    </div>

                                    {/* Like Button */}
                                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 pointer-events-none">
                                        <OptimisticLikeButton
                                            type="album"
                                            id={albumId}
                                            initialLiked={'isLiked' in album ? album.isLiked : false}
                                            showText={false}
                                            className="w-12 h-12 bg-white hover:bg-red-50 border-2 border-gray-300 hover:border-red-400 rounded-full p-2.5 shadow-xl text-gray-600 hover:text-red-500 backdrop-blur-sm transition-all duration-200 pointer-events-auto"
                                        />
                                    </div>
                                </div>

                                {/* Album Info */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                        {album.title}
                                    </h3>

                                    {/* Artists */}
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex-shrink-0">
                                        {album.artistDetails && album.artistDetails.length > 0 ? (
                                            <div className="flex items-center gap-1 flex-wrap">
                                                {album.artistDetails.slice(0, 2).map((artist, idx) => (
                                                    <span key={String(artist._id)} className="hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
                                                        {artist.name}
                                                        {idx < Math.min(album.artistDetails.length - 1, 1) && ', '}
                                                    </span>
                                                ))}
                                                {album.artistDetails.length > 2 && (
                                                    <span className="text-gray-400">& {album.artistDetails.length - 2} more</span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 font-medium">Unknown Artist</span>
                                        )}
                                    </div>

                                    {/* Album Stats */}
                                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3 flex-shrink-0">
                                        <div className="flex items-center gap-2">
                                            {album.releaseDate && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{formatDate(album.releaseDate)}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {album.totalTracks > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <Music className="h-3 w-3" />
                                                    <span>{album.totalTracks}</span>
                                                </div>
                                            )}

                                            {album.totalDuration > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{formatDuration(album.totalDuration)}</span>
                                                </div>
                                            )}
                                        </div>
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
            </Carousel>
        </section>
    );
}