'use client';

import { useAudio } from '@/components/audio-player/audio-context';
import { TrackWithLikeStatus } from '@/actions/tracks';

export function useAudioPlayer() {
    const {
        state,
        playTrack,
        playQueue,
        togglePlay,
        nextTrack,
        previousTrack,
        seekTo,
        setVolume,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        removeFromQueue,
        reorderQueue,
        dispatch
    } = useAudio();

    // Convenience methods
    const playAlbum = (tracks: TrackWithLikeStatus[], startIndex = 0) => {
        if (tracks.length === 0) return;
        playQueue(tracks, startIndex);
    };

    const playArtistTopTracks = (tracks: TrackWithLikeStatus[]) => {
        if (tracks.length === 0) return;
        playQueue(tracks, 0);
    };

    const addToQueue = (track: TrackWithLikeStatus) => {
        const newQueue = [...state.queue, track];
        dispatch({ type: 'SET_QUEUE', payload: { queue: newQueue, startIndex: state.currentIndex } });
    };

    const playNext = (track: TrackWithLikeStatus) => {
        const newQueue = [...state.queue];
        newQueue.splice(state.currentIndex + 1, 0, track);
        dispatch({ type: 'SET_QUEUE', payload: { queue: newQueue, startIndex: state.currentIndex } });
    };

    const clearQueue = () => {
        if (state.currentTrack) {
            dispatch({ type: 'SET_QUEUE', payload: { queue: [state.currentTrack], startIndex: 0 } });
        }
    };

    const isTrackInQueue = (trackId: string) => {
        return state.queue.some(track => String(track._id) === trackId);
    };

    const isCurrentTrack = (trackId: string) => {
        return state.currentTrack && String(state.currentTrack._id) === trackId;
    };

    const getTrackPosition = (trackId: string) => {
        return state.queue.findIndex(track => String(track._id) === trackId);
    };

    const jumpToTrack = (trackId: string) => {
        const index = getTrackPosition(trackId);
        if (index !== -1) {
            const track = state.queue[index];
            playTrack(track, state.queue, index);
        }
    };

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getProgress = () => {
        if (state.duration === 0) return 0;
        return (state.currentTime / state.duration) * 100;
    };

    const getRemainingTime = () => {
        return state.duration - state.currentTime;
    };

    const getQueueDuration = () => {
        return state.queue.reduce((total, track) => total + (track.duration || 0), 0);
    };

    const getRemainingQueueTime = () => {
        const remainingTracks = state.queue.slice(state.currentIndex + 1);
        const remainingDuration = remainingTracks.reduce((total, track) => total + (track.duration || 0), 0);
        return remainingDuration + getRemainingTime();
    };

    return {
        // State
        ...state,

        // Basic controls
        playTrack,
        playQueue,
        togglePlay,
        nextTrack,
        previousTrack,
        seekTo,
        setVolume,
        toggleMute,
        toggleShuffle,
        toggleRepeat,

        // Queue management
        addToQueue,
        playNext,
        removeFromQueue,
        reorderQueue,
        clearQueue,
        jumpToTrack,

        // Convenience methods
        playAlbum,
        playArtistTopTracks,

        // Utility methods
        isTrackInQueue,
        isCurrentTrack,
        getTrackPosition,
        formatTime,
        getProgress,
        getRemainingTime,
        getQueueDuration,
        getRemainingQueueTime,

        // UI controls
        toggleMinimized: () => dispatch({ type: 'TOGGLE_MINIMIZED' }),
        toggleQueue: () => dispatch({ type: 'TOGGLE_QUEUE' }),

        // Error handling
        clearError: () => dispatch({ type: 'SET_ERROR', payload: null }),
    };
}