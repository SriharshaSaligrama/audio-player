'use client';

import { useAudio } from './audio-context';
import { Play, Pause, Loader2 } from 'lucide-react';
import { TrackWithDetails, TrackWithLikeStatus } from '@/actions/tracks';

type PlayButtonProps = {
    track: TrackWithDetails | TrackWithLikeStatus;
    queue?: (TrackWithDetails | TrackWithLikeStatus)[];
    index?: number;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'primary' | 'secondary' | 'ghost';
    className?: string;
}

// Helper function to ensure track has isLiked property
const ensureTrackWithLikeStatus = (track: TrackWithDetails | TrackWithLikeStatus): TrackWithLikeStatus => {
    return 'isLiked' in track ? track : { ...track, isLiked: false };
};

export function PlayButton({
    track,
    queue = [track],
    index = 0,
    size = 'md',
    variant = 'primary',
    className = ''
}: PlayButtonProps) {
    const { state, playTrack, togglePlay } = useAudio();

    const isCurrentTrack = state.currentTrack?._id === track._id;
    const isPlaying = isCurrentTrack && state.isPlaying;
    const isLoading = isCurrentTrack && state.isLoading;

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isCurrentTrack) {
            togglePlay();
        } else {
            const trackWithLikeStatus = ensureTrackWithLikeStatus(track);
            const queueWithLikeStatus = queue.map(ensureTrackWithLikeStatus);
            playTrack(trackWithLikeStatus, queueWithLikeStatus, index);
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'w-6 h-6';
            case 'lg':
                return 'w-12 h-12';
            default:
                return 'w-8 h-8';
        }
    };

    const getIconSize = () => {
        switch (size) {
            case 'sm':
                return 'h-3 w-3';
            case 'lg':
                return 'h-6 w-6';
            default:
                return 'h-4 w-4';
        }
    };

    const getVariantClasses = () => {
        switch (variant) {
            case 'secondary':
                return 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700';
            case 'ghost':
                return 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white';
            default:
                return 'bg-green-600 hover:bg-green-700 text-white';
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className={`${getSizeClasses()} ${getVariantClasses()} rounded-full flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            title={isPlaying ? 'Pause' : 'Play'}
        >
            {isLoading ? (
                <Loader2 className={`${getIconSize()} animate-spin`} />
            ) : isPlaying ? (
                <Pause className={`${getIconSize()}`} fill="currentColor" />
            ) : (
                <Play className={`${getIconSize()} ${size === 'sm' ? 'ml-0.5' : 'ml-1'}`} fill="currentColor" />
            )}
        </button>
    );
}