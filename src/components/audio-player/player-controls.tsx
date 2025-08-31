'use client';

import { useAudio } from './audio-context';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Loader2 } from 'lucide-react';

type PlayerControlsProps = {
    compact?: boolean;
}

export function PlayerControls({ compact = false }: PlayerControlsProps) {
    const { state, togglePlay, nextTrack, previousTrack, toggleShuffle, toggleRepeat } = useAudio();

    const getRepeatIcon = () => {
        switch (state.repeatMode) {
            case 'one':
                return <Repeat1 className={`${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />;
            case 'all':
                return <Repeat className={`${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />;
            default:
                return <Repeat className={`${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />;
        }
    };

    if (compact) {
        return (
            <div className="flex items-center gap-1">
                <button
                    onClick={previousTrack}
                    disabled={state.queue.length <= 1}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <SkipBack className="h-4 w-4" />
                </button>

                <button
                    onClick={togglePlay}
                    disabled={!state.currentTrack || state.isLoading}
                    className="p-2 rounded-full bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {state.isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : state.isPlaying ? (
                        <Pause className="h-4 w-4" fill="currentColor" />
                    ) : (
                        <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
                    )}
                </button>

                <button
                    onClick={nextTrack}
                    disabled={state.queue.length <= 1 && state.repeatMode === 'none'}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <SkipForward className="h-4 w-4" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4">
            {/* Shuffle */}
            <button
                onClick={toggleShuffle}
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${state.isShuffled ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' : 'text-gray-600 dark:text-gray-400'
                    }`}
                title={state.isShuffled ? 'Shuffle On' : 'Shuffle Off'}
            >
                <Shuffle className="h-5 w-5" />
            </button>

            {/* Previous */}
            <button
                onClick={previousTrack}
                disabled={state.queue.length <= 1}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous Track"
            >
                <SkipBack className="h-6 w-6" />
            </button>

            {/* Play/Pause */}
            <button
                onClick={togglePlay}
                disabled={!state.currentTrack || state.isLoading}
                className="p-3 rounded-full bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
                title={state.isPlaying ? 'Pause' : 'Play'}
            >
                {state.isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                ) : state.isPlaying ? (
                    <Pause className="h-6 w-6" fill="currentColor" />
                ) : (
                    <Play className="h-6 w-6 ml-1" fill="currentColor" />
                )}
            </button>

            {/* Next */}
            <button
                onClick={nextTrack}
                disabled={state.queue.length <= 1 && state.repeatMode === 'none'}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next Track"
            >
                <SkipForward className="h-6 w-6" />
            </button>

            {/* Repeat */}
            <button
                onClick={toggleRepeat}
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${state.repeatMode !== 'none' ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' : 'text-gray-600 dark:text-gray-400'
                    }`}
                title={`Repeat: ${state.repeatMode === 'none' ? 'Off' : state.repeatMode === 'one' ? 'One' : 'All'}`}
            >
                {getRepeatIcon()}
            </button>
        </div>
    );
}