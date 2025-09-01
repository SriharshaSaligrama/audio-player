"use client"

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Users, Play } from 'lucide-react';
import { Artist } from '@/lib/mongodb/schemas';
import { ArtistWithFollowStatus } from '@/actions/artists';
import { OptimisticFollowButtonWithCount } from '@/components/ui/optimistic-interactive-buttons';
import { Carousel } from '@/components/ui/carousel';

type ArtistCarouselProps = {
    artists: (Artist | ArtistWithFollowStatus)[];
    title?: string;
    viewAllHref?: string;
    className?: string;
}

export function ArtistCarousel({
    artists,
    title = "Artists",
    viewAllHref,
    className = ""
}: ArtistCarouselProps) {
    // Track follower counts for each artist
    const [followerCounts, setFollowerCounts] = useState<Record<string, number>>(() => {
        const counts: Record<string, number> = {};
        artists.forEach(artist => {
            counts[String(artist._id)] = artist.stats?.followers || 0;
        });
        return counts;
    });

    const formatNumber = (num?: number) => {
        if (!num) return '0';
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const handleFollowerCountChange = (artistId: string, newCount: number) => {
        setFollowerCounts(prev => ({
            ...prev,
            [artistId]: newCount
        }));
    };

    if (artists.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No artists found</h3>
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
            <Carousel itemWidth={240} gap={24} className="px-1">
                {artists.map((artist) => {
                    const artistId = String(artist._id);
                    const currentFollowerCount = followerCounts[artistId] || 0;

                    return (
                        <Link
                            key={artistId}
                            href={`/artists/${artistId}`}
                            className="group block flex-shrink-0"
                            style={{ width: '240px' }}
                        >
                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30 transition-all duration-300 h-full">
                                <div className="p-6 text-center h-full flex flex-col">
                                    {/* Artist Avatar */}
                                    <div className="relative mb-5 flex-shrink-0">
                                        {artist.avatar ? (
                                            <Image
                                                src={`${artist.avatar}${artist.avatar.includes('?') ? '&' : '?'}t=${Date.now()}`}
                                                alt={artist.name}
                                                width={120}
                                                height={120}
                                                className="w-28 h-28 rounded-full mx-auto object-cover shadow-lg group-hover:scale-105 transition-transform duration-300 border-4 border-white dark:border-gray-700"
                                                unoptimized={true}
                                            />
                                        ) : (
                                            <div className="w-28 h-28 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 border-4 border-white dark:border-gray-700">
                                                <Users className="h-14 w-14 text-white" />
                                            </div>
                                        )}

                                        {/* Play Button Overlay */}
                                        <div className="absolute inset-0 rounded-full transition-all duration-300 flex items-center justify-center pointer-events-none">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    console.log('Play artist:', artist.name);
                                                }}
                                                className="w-14 h-14 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300 shadow-2xl border-2 border-gray-200 hover:border-blue-500 pointer-events-auto"
                                            >
                                                <Play className="h-5 w-5 text-gray-800 hover:text-blue-600 ml-0.5" fill="currentColor" />
                                            </button>
                                        </div>

                                        {/* Follow Button */}
                                        <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 pointer-events-none">
                                            <OptimisticFollowButtonWithCount
                                                artistId={artistId}
                                                initialFollowing={'isFollowed' in artist ? artist.isFollowed : false}
                                                initialFollowerCount={currentFollowerCount}
                                                showText={false}
                                                className="w-10 h-10 bg-white hover:bg-blue-50 border-2 border-gray-300 hover:border-blue-400 rounded-full p-2 shadow-xl text-gray-600 hover:text-blue-500 backdrop-blur-sm transition-all duration-200 pointer-events-auto"
                                                onCountChange={(newCount) => handleFollowerCountChange(artistId, newCount)}
                                            />
                                        </div>
                                    </div>

                                    {/* Artist Name */}
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 flex-shrink-0">
                                        {artist.name}
                                    </h3>

                                    {/* Bio Preview */}
                                    {artist.bio && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed flex-shrink-0">
                                            {artist.bio}
                                        </p>
                                    )}

                                    {/* Stats */}
                                    <div className="flex justify-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-4 flex-shrink-0 font-medium">
                                        <span className="text-xs">{formatNumber(currentFollowerCount)} followers</span>
                                        <span className="text-gray-400 text-xs">•</span>
                                        <span className="text-xs">{artist.stats?.totalTracks || 0} tracks</span>
                                    </div>

                                    {/* Genres */}
                                    {artist.genres && artist.genres.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 justify-center mt-auto">
                                            {artist.genres.slice(0, 2).map((genre, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2.5 py-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full font-medium border border-blue-200 dark:border-blue-800"
                                                >
                                                    {genre}
                                                </span>
                                            ))}
                                            {artist.genres.length > 2 && (
                                                <span className="px-2.5 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full font-medium border border-gray-200 dark:border-gray-600">
                                                    +{artist.genres.length - 2}
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