'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    Shuffle,
    Repeat,
    Repeat1,
    List,
    ChevronUp,
    ChevronDown,
    Music,
    MoreHorizontal
} from 'lucide-react';
import { useAudio } from './audio-context';
import { OptimisticLikeButton } from '@/components/ui/optimistic-interactive-buttons';
import { PlayerQueue } from './player-queue';
import { PlayerProgress } from './player-progress';
import { useLikeSync } from '@/contexts/like-sync-context';

export function AudioPlayer() {
    const { state, togglePlay, nextTrack, previousTrack, toggleMute, toggleShuffle, toggleRepeat, dispatch, updateTrackLikeStatus } = useAudio();
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
                    <div className="flex items-center justify-between h-20 px-4">
                        {/* Track Info */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="relative w-12 h-12 flex-shrink-0">
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
                                onClick={previousTrack}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <SkipBack className="h-5 w-5" />
                            </button>

                            <button
                                onClick={togglePlay}
                                disabled={state.isLoading}
                                className="w-10 h-10 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50"
                            >
                                {state.isLoading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : state.isPlaying ? (
                                    <Pause className="h-5 w-5" fill="currentColor" />
                                ) : (
                                    <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
                                )}
                            </button>

                            <button
                                onClick={nextTrack}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <SkipForward className="h-5 w-5" />
                            </button>

                            <button
                                onClick={() => dispatch({ type: 'TOGGLE_MINIMIZED' })}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <ChevronUp className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Full Player */}
                {!state.isMinimized && (
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Now Playing</h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => dispatch({ type: 'TOGGLE_QUEUE' })}
                                    className={`p-2 rounded-full transition-colors ${state.showQueue
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                                        }`}
                                >
                                    <List className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => dispatch({ type: 'TOGGLE_MINIMIZED' })}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-400"
                                >
                                    <ChevronDown className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Track Info */}
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
                                                <span key={String(artist._id)} className="flex items-center gap-1">
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
                                            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span>More</span>
                                            </button>
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
                                        className={`p-2 rounded-full transition-colors ${state.isShuffled
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        <Shuffle className="h-5 w-5" />
                                    </button>

                                    <button
                                        onClick={previousTrack}
                                        className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-700 dark:text-gray-300"
                                    >
                                        <SkipBack className="h-6 w-6" />
                                    </button>

                                    <button
                                        onClick={togglePlay}
                                        disabled={state.isLoading}
                                        className="w-14 h-14 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50 shadow-lg"
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
                                        className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-700 dark:text-gray-300"
                                    >
                                        <SkipForward className="h-6 w-6" />
                                    </button>

                                    <button
                                        onClick={toggleRepeat}
                                        className={`p-2 rounded-full transition-colors ${state.repeatMode !== 'none'
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        {getRepeatIcon()}
                                    </button>
                                </div>
                            </div>

                            {/* Volume Control */}
                            <div className="flex flex-col items-center justify-center">
                                <div className="flex items-center gap-3 mb-4">
                                    <button
                                        onClick={toggleMute}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-400"
                                    >
                                        {state.isMuted || state.volume === 0 ? (
                                            <VolumeX className="h-5 w-5" />
                                        ) : (
                                            <Volume2 className="h-5 w-5" />
                                        )}
                                    </button>

                                    <div className="w-24">
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={state.isMuted ? 0 : state.volume}
                                            onChange={(e) => {
                                                const volume = parseFloat(e.target.value);
                                                dispatch({ type: 'SET_VOLUME', payload: volume });
                                            }}
                                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                        />
                                    </div>

                                    <span className="text-sm text-gray-600 dark:text-gray-400 w-8 text-right">
                                        {Math.round((state.isMuted ? 0 : state.volume) * 100)}
                                    </span>
                                </div>

                                {/* Queue Info */}
                                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                                    <div>Track {state.currentIndex + 1} of {state.queue.length}</div>
                                    {state.queue.length > 1 && (
                                        <div className="mt-1">
                                            {state.queue.length - state.currentIndex - 1} remaining
                                        </div>
                                    )}
                                </div>
                            </div>
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

            {/* Queue Sidebar */}
            {state.showQueue && !state.isMinimized && (
                <PlayerQueue />
            )}
        </>
    );
}