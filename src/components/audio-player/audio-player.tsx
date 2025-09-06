'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Shuffle,
    Repeat,
    Repeat1,
    ChevronUp,
    ChevronDown,
    Music,
} from 'lucide-react';
import { useAudio } from './audio-context';
import { OptimisticLikeButton } from '@/components/ui/optimistic-interactive-buttons';
import { PlayerQueue } from './player-queue';
import { PlayerProgress } from './player-progress';
import { useLikeSync } from '@/contexts/like-sync-context';
import { VolumeControl } from './volume-control';

export function AudioPlayer() {
    const { state, togglePlay, nextTrack, previousTrack, toggleShuffle, toggleRepeat, dispatch, updateTrackLikeStatus } = useAudio();
    const { syncTrackLikeStatus } = useLikeSync();
    // const [showVolumeSlider, setShowVolumeSlider] = useState(false);

    // Don't render if no track is loaded
    if (!state.currentTrack) {
        return null;
    }

    // const formatTime = (seconds: number) => {
    //     if (isNaN(seconds)) return '0:00';
    //     const mins = Math.floor(seconds / 60);
    //     const secs = Math.floor(seconds % 60);
    //     return `${mins}:${secs.toString().padStart(2, '0')}`;
    // };

    const getRepeatIcon = () => {
        switch (state.repeatMode) {
            case 'one':
                return <Repeat1 className="h-4 w-4" />;
            case 'all':
                return <Repeat className="h-4 w-4" />;
            default:
                return <Repeat className="h-4 w-4" />;
        }
    };

    const coverImage = state.currentTrack.coverImage || state.currentTrack.defaultAlbumDetails?.coverImage;

    return (
        <>
            {/* Main Player */}
            <div className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300 z-40 ${state.isMinimized ? 'h-20' : 'h-auto'
                }`}>
                {/* Mini Player */}
                {state.isMinimized && (
                    <div className="relative w-full">
                        {/* Mini Player Progress Bar at the very top */}
                        <div className="absolute left-0 right-0 top-0  z-10">
                            <PlayerProgress compact />
                        </div>
                        {/* Mini Player Content below the progress bar */}
                        <div className="flex items-center justify-between h-20 px-4 w-full">
                            {/* Track Info */}
                            <div className="flex items-center gap-3 flex-1 min-w-0 pl-4">
                                <div className="relative w-12 h-12 flex-shrink-0 ">
                                    {coverImage ? (
                                        <Image
                                            src={coverImage}
                                            alt={state.currentTrack.title}
                                            width={48}
                                            height={48}
                                            className="rounded-lg object-cover"
                                            unoptimized={true}
                                        />
                                    ) : (
                                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                            <Music className="h-6 w-6 text-gray-400" />
                                        </div>
                                    )}

                                    {/* Playing indicator */}
                                    {state.isPlaying && (
                                        <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <Link
                                        href={`/tracks/${state.currentTrack._id}`}
                                        className="block font-medium text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors truncate"
                                    >
                                        {state.currentTrack.title}
                                    </Link>
                                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                        {state.currentTrack.artistDetails?.map((artist, idx) => (
                                            <span key={String(artist._id)}>
                                                <Link
                                                    href={`/artists/${artist._id}`}
                                                    className="hover:text-gray-900 dark:hover:text-white transition-colors"
                                                >
                                                    {artist.name}
                                                </Link>
                                                {idx < state.currentTrack!.artistDetails.length - 1 && ', '}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Mini Controls */}
                            <div className="flex items-center gap-2">
                                <OptimisticLikeButton
                                    type="track"
                                    id={String(state.currentTrack._id)}
                                    initialLiked={state.currentTrack.isLiked}
                                    onLikeChange={(newState) => {
                                        updateTrackLikeStatus(String(state.currentTrack!._id), newState);
                                        syncTrackLikeStatus(String(state.currentTrack!._id), newState);
                                    }}
                                    showText={false}
                                    className="p-2 border-none hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                                />
                                <button
                                    onClick={toggleShuffle}
                                    className={`p-2 rounded-full transition-colors cursor-pointer ${state.isShuffled
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                                        }`}
                                    aria-label="Shuffle"
                                >
                                    <Shuffle className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={previousTrack}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer"
                                    aria-label="Previous track"
                                >
                                    <SkipBack className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={togglePlay}
                                    disabled={state.isLoading}
                                    className="w-14 h-14 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50 shadow-lg cursor-pointer"
                                    aria-label={state.isPlaying ? 'Pause' : 'Play'}
                                >
                                    {state.isLoading ? (
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : state.isPlaying ? (
                                        <Pause className="h-7 w-7" fill="currentColor" />
                                    ) : (
                                        <Play className="h-7 w-7 ml-1" fill="currentColor" />
                                    )}
                                </button>
                                <button
                                    onClick={nextTrack}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer"
                                    aria-label="Next track"
                                >
                                    <SkipForward className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={toggleRepeat}
                                    className={`p-2 rounded-full transition-colors cursor-pointer ${state.repeatMode !== 'none'
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                                        }`}
                                    aria-label="Repeat"
                                >
                                    {getRepeatIcon()}
                                </button>
                                <VolumeControl compact />
                                <button
                                    onClick={() => dispatch({ type: 'TOGGLE_MINIMIZED' })}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer"
                                    aria-label="Expand player"
                                >
                                    <ChevronUp className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Full Player */}
                {!state.isMinimized && (
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Now Playing</h2>
                            <button
                                onClick={() => dispatch({ type: 'TOGGLE_MINIMIZED' })}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-400 cursor-pointer"
                            >
                                <ChevronDown className="h-5 w-5" />
                            </button>
                        </div>
                        {/* Main Player and Queue Side by Side */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Track Info and Controls */}
                            <div className="lg:col-span-2">
                                <div className="flex items-start gap-6">
                                    {/* Album Art */}
                                    <div className="relative w-32 h-32 flex-shrink-0">
                                        {coverImage ? (
                                            <Image
                                                src={coverImage}
                                                alt={state.currentTrack.title}
                                                width={128}
                                                height={128}
                                                className="rounded-xl object-cover shadow-lg"
                                                unoptimized={true}
                                            />
                                        ) : (
                                            <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-lg">
                                                <Music className="h-12 w-12 text-gray-400" />
                                            </div>
                                        )}

                                        {/* Playing indicator */}
                                        {state.isPlaying && (
                                            <div className="absolute inset-0 bg-black/10 rounded-xl flex items-center justify-center">
                                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                            </div>
                                        )}
                                    </div>
                                    {/* Track Details */}
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/tracks/${state.currentTrack._id}`}
                                            className="block text-2xl font-bold text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors mb-2"
                                        >
                                            {state.currentTrack.title}
                                        </Link>

                                        <div className="flex items-center gap-2 mb-4">
                                            {state.currentTrack.artistDetails?.map((artist, idx) => (
                                                <span key={String(artist._id)} className="flex items-center">
                                                    <Link
                                                        href={`/artists/${artist._id}`}
                                                        className="text-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                                    >
                                                        {artist.name}
                                                    </Link>
                                                    {idx < state.currentTrack!.artistDetails.length - 1 && (
                                                        <span className="text-gray-500">,</span>
                                                    )}
                                                </span>
                                            ))}
                                        </div>

                                        {state.currentTrack.defaultAlbumDetails && (
                                            <Link
                                                href={`/albums/${state.currentTrack.defaultAlbumDetails._id}`}
                                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                            >
                                                From: {state.currentTrack.defaultAlbumDetails.title}
                                            </Link>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-3 mt-4">
                                            <OptimisticLikeButton
                                                type="track"
                                                id={String(state.currentTrack._id)}
                                                initialLiked={state.currentTrack.isLiked}
                                                onLikeChange={(newState) => {
                                                    updateTrackLikeStatus(String(state.currentTrack!._id), newState);
                                                    syncTrackLikeStatus(String(state.currentTrack!._id), newState);
                                                }}
                                                className="px-4 py-2"
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* Progress Bar */}
                                <div className="mt-6">
                                    <PlayerProgress />
                                </div>
                                {/* Main Controls */}
                                <div className="flex items-center justify-center gap-4 mt-6">
                                    <button
                                        onClick={toggleShuffle}
                                        className={`p-2 rounded-full transition-colors cursor-pointer ${state.isShuffled
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        <Shuffle className="h-5 w-5" />
                                    </button>

                                    <button
                                        onClick={previousTrack}
                                        className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-700 dark:text-gray-300 cursor-pointer"
                                    >
                                        <SkipBack className="h-6 w-6" />
                                    </button>

                                    <button
                                        onClick={togglePlay}
                                        disabled={state.isLoading}
                                        className="w-14 h-14 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50 shadow-lg cursor-pointer"
                                    >
                                        {state.isLoading ? (
                                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : state.isPlaying ? (
                                            <Pause className="h-7 w-7" fill="currentColor" />
                                        ) : (
                                            <Play className="h-7 w-7 ml-1" fill="currentColor" />
                                        )}
                                    </button>

                                    <button
                                        onClick={nextTrack}
                                        className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-700 dark:text-gray-300 cursor-pointer"
                                    >
                                        <SkipForward className="h-6 w-6" />
                                    </button>

                                    <button
                                        onClick={toggleRepeat}
                                        className={`p-2 rounded-full transition-colors cursor-pointer ${state.repeatMode !== 'none'
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        {getRepeatIcon()}
                                    </button>
                                    <VolumeControl />
                                </div>
                            </div>
                            {/* Always show the queue in the third column */}
                            <div className="hidden lg:block">
                                <PlayerQueue />
                            </div>
                        </div>
                        {/* For mobile/tablet, show queue below player */}
                        <div className="block lg:hidden mt-8">
                            <PlayerQueue />
                        </div>
                        {/* Error Display */}
                        {state.error && (
                            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-red-800 dark:text-red-300 text-sm">{state.error}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}