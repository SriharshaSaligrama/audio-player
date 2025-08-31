'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Clock, Calendar, Music, Users, Disc, Heart } from 'lucide-react';
import { OptimisticTrackList } from '@/components/music/optimistic-track-list';
import { formatDate } from '@/lib/utils/date';
import { OptimisticLikeButtonWithCount } from '@/components/ui/optimistic-interactive-buttons';
import { ShareButton } from '@/components/ui/interactive-buttons';
import { PlayAlbumButton } from '@/components/audio-player/play-album-button';
import { AlbumWithLikeStatus } from '@/actions/albums';
import { TrackWithLikeStatus } from '@/actions/tracks';

type AlbumDetailClientProps = {
    album: AlbumWithLikeStatus;
    tracks: TrackWithLikeStatus[];
    initialLiked: boolean;
}

export function AlbumDetailClient({ album, tracks, initialLiked }: AlbumDetailClientProps) {
    const [likeCount, setLikeCount] = useState(album.stats?.likes || 0);

    const formatDuration = (seconds?: number) => {
        if (!seconds) return '0:00';
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    const formatNumber = (num?: number) => {
        if (!num) return '0';
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const handleLikeCountChange = (newCount: number) => {
        setLikeCount(newCount);
    };

    return (
        <div className="space-y-8 fade-in">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 dark:from-purple-500/5 dark:via-pink-500/5 dark:to-orange-500/5 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Album Cover */}
                    <div className="relative flex-shrink-0">
                        {album.coverImage ? (
                            <Image
                                src={`${album.coverImage}${album.coverImage.includes('?') ? '&' : '?'}t=${Date.now()}`}
                                alt={album.title}
                                width={300}
                                height={300}
                                className="w-72 h-72 rounded-2xl object-cover shadow-2xl"
                                priority
                            />
                        ) : (
                            <div className="w-72 h-72 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-2xl flex items-center justify-center shadow-2xl">
                                <Disc className="h-24 w-24 text-gray-500 dark:text-gray-400" />
                            </div>
                        )}
                    </div>

                    {/* Album Info */}
                    <div className="flex-1 min-w-0">
                        <div className="mb-4">
                            <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-sm font-medium rounded-full mb-4">
                                Album
                            </span>
                            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                                {album.title}
                            </h1>
                        </div>

                        {/* Artists */}
                        <div className="flex items-center gap-2 mb-6">
                            <Users className="h-5 w-5 text-gray-500" />
                            <div className="flex items-center gap-2 flex-wrap">
                                {album.artistDetails?.map((artist, idx: number) => (
                                    <span key={String(artist._id)} className="flex items-center gap-1">
                                        <Link
                                            href={`/artists/${artist._id}`}
                                            className="text-lg font-semibold text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                        >
                                            {artist.name}
                                        </Link>
                                        {idx < album.artistDetails.length - 1 && (
                                            <span className="text-gray-500">,</span>
                                        )}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Album Description */}
                        {album.description && (
                            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                                {album.description}
                            </p>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-6 mb-8 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                            <div className="flex items-center gap-2">
                                <Play className="h-4 w-4" />
                                <span>{formatNumber(album.stats?.plays)} plays</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Heart className="h-4 w-4" />
                                <span>{formatNumber(likeCount)} likes</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Music className="h-4 w-4" />
                                <span>{album.totalTracks} tracks</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{formatDuration(album.totalDuration)}</span>
                            </div>
                            {album.releaseDate && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(album.releaseDate)}</span>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-4 flex-wrap">
                            <PlayAlbumButton tracks={tracks} />
                            <OptimisticLikeButtonWithCount
                                type="album"
                                id={String(album._id)}
                                initialLiked={initialLiked}
                                initialLikeCount={album.stats?.likes || 0}
                                onCountChange={handleLikeCountChange}
                            />
                            <ShareButton
                                type="album"
                                id={String(album._id)}
                                title={album.title}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Album Content */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Track List */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tracks</h2>
                        {tracks.length > 0 ? (
                            <OptimisticTrackList
                                tracks={tracks}
                                showAlbum={false}
                                showArtist={true}
                                showPlayCount={true}
                            />
                        ) : (
                            <div className="text-center py-12">
                                <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tracks available</h3>
                                <p className="text-gray-600 dark:text-gray-400">This album doesn&apos;t have any tracks yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Album Stats */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statistics</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">Total Plays</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {formatNumber(album.stats?.plays)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">Likes</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {formatNumber(likeCount)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">Shares</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {formatNumber(album.stats?.shares)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">Total Tracks</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {album.totalTracks}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Album Details */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Album Details</h3>
                        <div className="space-y-3 text-sm">
                            {album.releaseDate && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Release Date</span>
                                    <span className="text-gray-900 dark:text-white">{formatDate(album.releaseDate)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Total Duration</span>
                                <span className="text-gray-900 dark:text-white">{formatDuration(album.totalDuration)}</span>
                            </div>
                            {album.label && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Label</span>
                                    <span className="text-gray-900 dark:text-white">{album.label}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Genres */}
                    {album.genres && album.genres.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Genres</h3>
                            <div className="flex flex-wrap gap-2">
                                {album.genres.map((genre: string, idx: number) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm font-medium"
                                    >
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}