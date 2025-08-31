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
                        className="group flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                        {/* Track Number / Play Button */}
                        <div className="w-8 flex items-center justify-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:hidden">
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
                        <div className="relative w-12 h-12 flex-shrink-0">
                            {coverImage ? (
                                <Image
                                    src={`${coverImage}${coverImage.includes('?') ? '&' : '?'}t=${Date.now()}`}
                                    alt={track.title}
                                    width={48}
                                    height={48}
                                    className="rounded-lg object-cover"
                                    unoptimized={true}
                                />
                            ) : (
                                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                    <Play className="h-5 w-5 text-gray-400" />
                                </div>
                            )}
                        </div>

                        {/* Track Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/tracks/${track._id}`}
                                    className="font-medium text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors truncate"
                                >
                                    {track.title}
                                </Link>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                {showArtist && track.artistDetails && track.artistDetails.length > 0 && (
                                    <>
                                        <div className="flex items-center gap-1">
                                            {track.artistDetails.map((artist, idx: number) => (
                                                <span key={String(artist._id)}>
                                                    <Link
                                                        href={`/artists/${artist._id}`}
                                                        className="hover:text-gray-900 dark:hover:text-white transition-colors"
                                                    >
                                                        {artist.name}
                                                    </Link>
                                                    {idx < track.artistDetails.length - 1 && ', '}
                                                </span>
                                            ))}
                                        </div>
                                        {showAlbum && albumTitle && <span>•</span>}
                                    </>
                                )}

                                {showAlbum && albumTitle && (
                                    <Link
                                        href={`/albums/${track.defaultAlbumDetails?._id || track.albumDetails?.[0]?._id}`}
                                        className="hover:text-gray-900 dark:hover:text-white transition-colors truncate"
                                    >
                                        {albumTitle}
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Play Count */}
                        {showPlayCount && (
                            <div className="hidden sm:flex items-center text-sm text-gray-500 dark:text-gray-400 min-w-0">
                                {formatPlayCount(track.stats?.plays)}
                            </div>
                        )}

                        {/* Duration */}
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <div className="opacity-0 group-hover:opacity-100 transition-all">
                                <OptimisticLikeButton
                                    type="track"
                                    id={trackId}
                                    initialLiked={track.isLiked}
                                    onLikeChange={(newState) => handleLikeChange(trackId, newState)}
                                    showText={false}
                                    className="p-2 border-none hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center"
                                />
                            </div>
                            <span className="flex items-center gap-1 min-w-0">
                                <Clock className="h-3 w-3" />
                                {formatDuration(track.duration)}
                            </span>
                            <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all">
                                <MoreHorizontal className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}