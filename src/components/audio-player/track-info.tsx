'use client';

import { useAudio } from './audio-context';
import Image from 'next/image';
import Link from 'next/link';
import { Music } from 'lucide-react';
import { OptimisticLikeButton } from '@/components/ui/optimistic-interactive-buttons';
import { useLikeSync } from '@/contexts/like-sync-context';

type TrackInfoProps = {
    compact?: boolean;
    expanded?: boolean;
}

export function TrackInfo({ compact = false, expanded = false }: TrackInfoProps) {
    const { state, updateTrackLikeStatus } = useAudio();
    const { syncTrackLikeStatus } = useLikeSync();

    if (!state.currentTrack) {
        return null;
    }

    const track = state.currentTrack;
    const coverImage = track.coverImage || track.defaultAlbumDetails?.coverImage;
    const albumTitle = track.defaultAlbumDetails?.title || track.albumDetails?.[0]?.title;

    if (compact) {
        return (
            <div className="flex items-center gap-3 min-w-0">
                {/* Album Cover */}
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                    {coverImage ? (
                        <Image
                            src={coverImage}
                            alt={`${track.title} cover`}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Music className="h-6 w-6 text-gray-400" />
                        </div>
                    )}
                </div>

                {/* Track Details */}
                <div className="min-w-0 flex-1">
                    <Link
                        href={`/tracks/${track._id}`}
                        className="block font-medium text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors truncate"
                    >
                        {track.title}
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Link
                            href={`/artists/${track.artistDetails?.[0]?._id}`}
                            className="hover:text-green-600 dark:hover:text-green-400 transition-colors truncate"
                        >
                            {track.artistDetails?.[0]?.name || 'Unknown Artist'}
                        </Link>
                        {albumTitle && (
                            <>
                                <span>•</span>
                                <span className="truncate">{albumTitle}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Like Button */}
                <OptimisticLikeButton
                    type="track"
                    id={String(track._id)}
                    initialLiked={track.isLiked}
                    onLikeChange={(newState) => {
                        updateTrackLikeStatus(String(track._id), newState);
                        syncTrackLikeStatus(String(track._id), newState);
                    }}
                    showText={false}
                    className="w-8 h-8 p-1 border-none bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
                />
            </div>
        );
    }

    if (expanded) {
        return (
            <div className="text-center space-y-6">
                {/* Large Album Cover */}
                <div className="relative w-80 h-80 mx-auto rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-700 shadow-2xl">
                    {coverImage ? (
                        <Image
                            src={coverImage}
                            alt={`${track.title} cover`}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Music className="h-20 w-20 text-gray-400" />
                        </div>
                    )}
                </div>

                {/* Track Details */}
                <div className="space-y-2">
                    <Link
                        href={`/tracks/${track._id}`}
                        className="block text-3xl font-bold text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors"
                    >
                        {track.title}
                    </Link>
                    <Link
                        href={`/artists/${track.artistDetails?.[0]?._id}`}
                        className="block text-xl text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                    >
                        {track.artistDetails?.[0]?.name || 'Unknown Artist'}
                    </Link>
                    {albumTitle && (
                        <p className="text-lg text-gray-500 dark:text-gray-500">{albumTitle}</p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-4">
                    <OptimisticLikeButton
                        type="track"
                        id={String(track._id)}
                        initialLiked={track.isLiked}
                        onLikeChange={(newState) => {
                            updateTrackLikeStatus(String(track._id), newState);
                            syncTrackLikeStatus(String(track._id), newState);
                        }}
                        showText={true}
                        className="px-6 py-3"
                    />
                </div>
            </div>
        );
    }

    // Default view
    return (
        <div className="flex items-center gap-4">
            {/* Album Cover */}
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                {coverImage ? (
                    <Image
                        src={coverImage}
                        alt={`${track.title} cover`}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Music className="h-8 w-8 text-gray-400" />
                    </div>
                )}
            </div>

            {/* Track Details */}
            <div className="min-w-0 flex-1">
                <Link
                    href={`/tracks/${track._id}`}
                    className="block text-lg font-semibold text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors truncate"
                >
                    {track.title}
                </Link>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Link
                        href={`/artists/${track.artistDetails?.[0]?._id}`}
                        className="hover:text-green-600 dark:hover:text-green-400 transition-colors truncate"
                    >
                        {track.artistDetails?.[0]?.name || 'Unknown Artist'}
                    </Link>
                    {albumTitle && (
                        <>
                            <span>•</span>
                            <span className="truncate">{albumTitle}</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}