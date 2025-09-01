'use client';

import { useState, startTransition, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Clock, MoreHorizontal } from 'lucide-react';
import { OptimisticLikeButton } from '@/components/ui/optimistic-interactive-buttons';
import { PlayButton } from '@/components/audio-player/play-button';
import { TrackWithLikeStatus } from '@/actions/tracks';
import { useLikeSync } from '@/contexts/like-sync-context';

type OptimisticTrackListProps = {
    tracks: TrackWithLikeStatus[];
    showAlbum?: boolean;
    showArtist?: boolean;
    showPlayCount?: boolean;
}

export function OptimisticTrackList({
    tracks: initialTracks,
    showAlbum = true,
    showArtist = true,
    showPlayCount = true
}: OptimisticTrackListProps) {
    const [tracks, setTracks] = useState(initialTracks);
    const { syncTrackLikeStatus } = useLikeSync();

    // Listen for like status changes from other components
    useEffect(() => {
        const handleLikeStatusChange = (event: CustomEvent) => {
            const { trackId, isLiked } = event.detail;
            startTransition(() => {
                setTracks(prevTracks =>
                    prevTracks.map(track =>
                        track._id.toString() === trackId
                            ? { ...track, isLiked }
                            : track
                    )
                );
            });
        };

        window.addEventListener('trackLikeStatusChanged', handleLikeStatusChange as EventListener);
        return () => {
            window.removeEventListener('trackLikeStatusChanged', handleLikeStatusChange as EventListener);
        };
    }, []);

    const formatDuration = (seconds?: number) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatPlayCount = (count?: number) => {
        if (!count) return '0';
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };

    const handleLikeChange = (trackId: string, newLikedState: boolean) => {
        startTransition(() => {
            setTracks(prevTracks =>
                prevTracks.map(track =>
                    track._id.toString() === trackId
                        ? { ...track, isLiked: newLikedState }
                        : track
                )
            );

            // Sync with audio player and other components
            syncTrackLikeStatus(trackId, newLikedState);
        });
    };

    if (tracks.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tracks found</h3>
                <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or browse our catalog.</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {tracks.map((track, index) => {
                const coverImage = track.coverImage || track.defaultAlbumDetails?.coverImage;
                const albumTitle = track.defaultAlbumDetails?.title || track.albumDetails?.[0]?.title;
                const trackId = track._id.toString();

                return (
                    <div
                        key={trackId}
                        className="group flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                        {/* Track Number / Play Button */}
                        <div className="w-6 sm:w-8 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 group-hover:hidden">
                                {index + 1}
                            </span>
                            <div className="hidden group-hover:block">
                                <PlayButton
                                    track={track}
                                    queue={tracks}
                                    index={index}
                                    size="sm"
                                    variant="primary"
                                />
                            </div>
                        </div>

                        {/* Cover Art */}
                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                            {coverImage ? (
                                <Image
                                    src={`${coverImage}${coverImage.includes('?') ? '&' : '?'}t=${Date.now()}`}
                                    alt={track.title}
                                    width={48}
                                    height={48}
                                    className="rounded-lg object-cover w-full h-full"
                                    unoptimized={true}
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                    <Play className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                </div>
                            )}
                        </div>

                        {/* Track Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/tracks/${track._id}`}
                                    className="font-medium text-sm sm:text-base text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors truncate"
                                >
                                    {track.title}
                                </Link>
                            </div>

                            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                                {showArtist && track.artistDetails && track.artistDetails.length > 0 && (
                                    <>
                                        <div className="flex items-center gap-1 truncate">
                                            {track.artistDetails.slice(0, 2).map((artist, idx: number) => (
                                                <span key={String(artist._id)} className="truncate">
                                                    <Link
                                                        href={`/artists/${artist._id}`}
                                                        className="hover:text-gray-900 dark:hover:text-white transition-colors"
                                                    >
                                                        {artist.name}
                                                    </Link>
                                                    {idx < Math.min(track.artistDetails.length - 1, 1) && ', '}
                                                </span>
                                            ))}
                                            {track.artistDetails.length > 2 && (
                                                <span className="text-gray-400">& {track.artistDetails.length - 2} more</span>
                                            )}
                                        </div>
                                        {showAlbum && albumTitle && <span className="hidden sm:inline">•</span>}
                                    </>
                                )}

                                {showAlbum && albumTitle && (
                                    <Link
                                        href={`/albums/${track.defaultAlbumDetails?._id || track.albumDetails?.[0]?._id}`}
                                        className="hover:text-gray-900 dark:hover:text-white transition-colors truncate hidden sm:inline"
                                    >
                                        {albumTitle}
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Play Count - Hidden on mobile */}
                        {showPlayCount && (
                            <div className="hidden md:flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 min-w-0 flex-shrink-0">
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                                    {formatPlayCount(track.stats?.plays)}
                                </span>
                            </div>
                        )}

                        {/* Actions & Duration */}
                        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                            {/* Like Button - Hidden on mobile, shown on hover */}
                            <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-all">
                                <OptimisticLikeButton
                                    type="track"
                                    id={trackId}
                                    initialLiked={track.isLiked}
                                    onLikeChange={(newState) => handleLikeChange(trackId, newState)}
                                    showText={false}
                                    className="p-1.5 sm:p-2 border-none hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center"
                                />
                            </div>

                            {/* Duration */}
                            <span className="flex items-center gap-1 min-w-0">
                                <Clock className="h-3 w-3" />
                                <span className="hidden sm:inline">{formatDuration(track.duration)}</span>
                                <span className="sm:hidden">
                                    {(() => {
                                        const duration = track.duration || 0;
                                        const minutes = Math.floor(duration / 60);
                                        const seconds = duration % 60;

                                        if (minutes === 0) {
                                            return `${seconds}s`;
                                        } else if (minutes < 10) {
                                            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
                                        } else {
                                            return `${minutes}m`;
                                        }
                                    })()}
                                </span>
                            </span>

                            {/* More Options - Hidden on mobile */}
                            <button className="hidden sm:block opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all">
                                <MoreHorizontal className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}