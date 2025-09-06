'use client';

import React, { createContext, useContext, useReducer, useRef, useEffect, ReactNode } from 'react';
import { TrackWithLikeStatus } from '@/actions/tracks';
import { addToPlayHistory } from '@/actions/user-interactions';
import { useAuth } from '@clerk/nextjs';

export type AudioState = {
    // Current track and queue
    currentTrack: TrackWithLikeStatus | null;
    queue: TrackWithLikeStatus[];
    currentIndex: number;
    originalQueue: TrackWithLikeStatus[]; // For shuffle mode

    // Playback state
    isPlaying: boolean;
    isPaused: boolean;
    isLoading: boolean;
    duration: number;
    currentTime: number;

    // Player settings
    volume: number;
    isMuted: boolean;
    isShuffled: boolean;
    repeatMode: 'none' | 'one' | 'all';

    // UI state
    isMinimized: boolean;
    showQueue: boolean;

    // Error handling
    error: string | null;
}

type AudioAction =
    | { type: 'SET_TRACK'; payload: { track: TrackWithLikeStatus; queue?: TrackWithLikeStatus[]; index?: number } }
    | { type: 'SET_QUEUE'; payload: { queue: TrackWithLikeStatus[]; startIndex?: number } }
    | { type: 'UPDATE_TRACK_LIKE_STATUS'; payload: { trackId: string; isLiked: boolean } }
    | { type: 'PLAY' }
    | { type: 'PAUSE' }
    | { type: 'STOP' }
    | { type: 'NEXT' }
    | { type: 'PREVIOUS' }
    | { type: 'SET_CURRENT_TIME'; payload: number }
    | { type: 'SET_DURATION'; payload: number }
    | { type: 'SET_VOLUME'; payload: number }
    | { type: 'TOGGLE_MUTE' }
    | { type: 'TOGGLE_SHUFFLE' }
    | { type: 'SET_REPEAT_MODE'; payload: 'none' | 'one' | 'all' }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'TOGGLE_MINIMIZED' }
    | { type: 'TOGGLE_QUEUE' }
    | { type: 'REMOVE_FROM_QUEUE'; payload: number }
    | { type: 'REORDER_QUEUE'; payload: { from: number; to: number } };

const initialState: AudioState = {
    currentTrack: null,
    queue: [],
    currentIndex: -1,
    originalQueue: [],
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    duration: 0,
    currentTime: 0,
    volume: 0.8,
    isMuted: false,
    isShuffled: false,
    repeatMode: 'none',
    isMinimized: true,
    showQueue: false,
    error: null,
};

// Shuffle array utility
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function audioReducer(state: AudioState, action: AudioAction): AudioState {
    switch (action.type) {
        case 'SET_TRACK': {
            const { track, queue = [track], index = 0 } = action.payload;
            return {
                ...state,
                currentTrack: track,
                queue: queue,
                originalQueue: queue,
                currentIndex: index,
                isMinimized: false,
                error: null,
            };
        }

        case 'SET_QUEUE': {
            const { queue, startIndex = 0 } = action.payload;
            return {
                ...state,
                queue: state.isShuffled ? shuffleArray(queue) : queue,
                originalQueue: queue,
                currentIndex: startIndex,
                currentTrack: queue[startIndex] || null,
            };
        }

        case 'PLAY':
            return { ...state, isPlaying: true, isPaused: false, error: null };

        case 'PAUSE':
            return { ...state, isPlaying: false, isPaused: true };

        case 'STOP':
            return { ...state, isPlaying: false, isPaused: false, currentTime: 0 };

        case 'NEXT': {
            let nextIndex = state.currentIndex + 1;

            // Handle repeat modes
            if (nextIndex >= state.queue.length) {
                if (state.repeatMode === 'all') {
                    nextIndex = 0;
                } else if (state.repeatMode === 'one') {
                    nextIndex = state.currentIndex; // Stay on current track
                } else {
                    return { ...state, isPlaying: false, isPaused: false }; // End of queue
                }
            }

            return {
                ...state,
                currentIndex: nextIndex,
                currentTrack: state.queue[nextIndex] || null,
                currentTime: 0,
            };
        }

        case 'PREVIOUS': {
            // If more than 3 seconds played, restart current track
            if (state.currentTime > 3) {
                return { ...state, currentTime: 0 };
            }

            let prevIndex = state.currentIndex - 1;

            if (prevIndex < 0) {
                if (state.repeatMode === 'all') {
                    prevIndex = state.queue.length - 1;
                } else {
                    prevIndex = 0; // Stay at first track
                }
            }

            return {
                ...state,
                currentIndex: prevIndex,
                currentTrack: state.queue[prevIndex] || null,
                currentTime: 0,
            };
        }

        case 'SET_CURRENT_TIME':
            return { ...state, currentTime: action.payload };

        case 'SET_DURATION':
            return { ...state, duration: action.payload };

        case 'SET_VOLUME': {
            const volume = Math.max(0, Math.min(1, action.payload));
            return { ...state, volume, isMuted: volume === 0 };
        }

        case 'TOGGLE_MUTE':
            return { ...state, isMuted: !state.isMuted };

        case 'TOGGLE_SHUFFLE': {
            const isShuffled = !state.isShuffled;
            let newQueue = state.queue;
            let newIndex = state.currentIndex;

            if (isShuffled) {
                // Shuffle the queue, but keep current track at the beginning
                const currentTrack = state.currentTrack;
                const otherTracks = state.originalQueue.filter(track => track._id !== currentTrack?._id);
                newQueue = currentTrack ? [currentTrack, ...shuffleArray(otherTracks)] : shuffleArray(state.originalQueue);
                newIndex = 0;
            } else {
                // Restore original order
                newQueue = state.originalQueue;
                newIndex = state.currentTrack ?
                    state.originalQueue.findIndex(track => track._id === state.currentTrack?._id) : 0;
            }

            return {
                ...state,
                isShuffled,
                queue: newQueue,
                currentIndex: Math.max(0, newIndex),
            };
        }

        case 'SET_REPEAT_MODE': {
            const modes: ('none' | 'one' | 'all')[] = ['none', 'one', 'all'];
            const currentModeIndex = modes.indexOf(state.repeatMode);
            const nextMode = action.payload || modes[(currentModeIndex + 1) % modes.length];
            return { ...state, repeatMode: nextMode };
        }

        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };

        case 'SET_ERROR':
            return { ...state, error: action.payload, isLoading: false };

        case 'TOGGLE_MINIMIZED':
            return { ...state, isMinimized: !state.isMinimized };

        case 'TOGGLE_QUEUE':
            return { ...state, showQueue: !state.showQueue };

        case 'REMOVE_FROM_QUEUE': {
            const indexToRemove = action.payload;
            const newQueue = state.queue.filter((_, index) => index !== indexToRemove);
            let newIndex = state.currentIndex;

            if (indexToRemove < state.currentIndex) {
                newIndex = state.currentIndex - 1;
            } else if (indexToRemove === state.currentIndex) {
                // If removing current track, play next or stop
                if (newQueue.length === 0) {
                    return { ...state, queue: [], currentTrack: null, currentIndex: -1, isPlaying: false };
                }
                newIndex = Math.min(state.currentIndex, newQueue.length - 1);
            }

            return {
                ...state,
                queue: newQueue,
                currentIndex: newIndex,
                currentTrack: newQueue[newIndex] || null,
            };
        }

        case 'REORDER_QUEUE': {
            const { from, to } = action.payload;
            const newQueue = [...state.queue];
            const [movedItem] = newQueue.splice(from, 1);
            newQueue.splice(to, 0, movedItem);

            // Update current index if needed
            let newIndex = state.currentIndex;
            if (from === state.currentIndex) {
                newIndex = to;
            } else if (from < state.currentIndex && to >= state.currentIndex) {
                newIndex = state.currentIndex - 1;
            } else if (from > state.currentIndex && to <= state.currentIndex) {
                newIndex = state.currentIndex + 1;
            }

            return {
                ...state,
                queue: newQueue,
                currentIndex: newIndex,
            };
        }

        case 'UPDATE_TRACK_LIKE_STATUS': {
            const { trackId, isLiked } = action.payload;

            // Update current track if it matches
            const updatedCurrentTrack = state.currentTrack && String(state.currentTrack._id) === trackId
                ? { ...state.currentTrack, isLiked }
                : state.currentTrack;

            // Update queue
            const updatedQueue = state.queue.map(track =>
                String(track._id) === trackId
                    ? { ...track, isLiked }
                    : track
            );

            // Update original queue
            const updatedOriginalQueue = state.originalQueue.map(track =>
                String(track._id) === trackId
                    ? { ...track, isLiked }
                    : track
            );

            return {
                ...state,
                currentTrack: updatedCurrentTrack,
                queue: updatedQueue,
                originalQueue: updatedOriginalQueue,
            };
        }

        default:
            return state;
    }
}

type AudioContextType = {
    state: AudioState;
    dispatch: React.Dispatch<AudioAction>;
    audioRef: React.RefObject<HTMLAudioElement | null>;

    // Convenience methods
    playTrack: (track: TrackWithLikeStatus, queue?: TrackWithLikeStatus[], index?: number) => void;
    playQueue: (queue: TrackWithLikeStatus[], startIndex?: number) => void;
    togglePlay: () => void;
    nextTrack: () => void;
    previousTrack: () => void;
    seekTo: (time: number) => void;
    setVolume: (volume: number) => void;
    toggleMute: () => void;
    toggleShuffle: () => void;
    toggleRepeat: () => void;
    removeFromQueue: (index: number) => void;
    reorderQueue: (from: number, to: number) => void;
    updateTrackLikeStatus: (trackId: string, isLiked: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(audioReducer, initialState);
    const audioRef = useRef<HTMLAudioElement>(null);
    const { isSignedIn } = useAuth();

    // Load saved preferences
    useEffect(() => {
        const savedVolume = localStorage.getItem('audioPlayer.volume');
        const savedRepeatMode = localStorage.getItem('audioPlayer.repeatMode') as 'none' | 'one' | 'all';
        const savedIsShuffled = localStorage.getItem('audioPlayer.isShuffled') === 'true';

        if (savedVolume) {
            dispatch({ type: 'SET_VOLUME', payload: parseFloat(savedVolume) });
        }
        if (savedRepeatMode) {
            dispatch({ type: 'SET_REPEAT_MODE', payload: savedRepeatMode });
        }
        if (savedIsShuffled) {
            dispatch({ type: 'TOGGLE_SHUFFLE' });
        }
    }, []);

    // Save preferences
    useEffect(() => {
        localStorage.setItem('audioPlayer.volume', state.volume.toString());
        localStorage.setItem('audioPlayer.repeatMode', state.repeatMode);
        localStorage.setItem('audioPlayer.isShuffled', state.isShuffled.toString());
    }, [state.volume, state.repeatMode, state.isShuffled]);

    // Audio element event handlers
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadedMetadata = () => {
            dispatch({ type: 'SET_DURATION', payload: audio.duration });
            dispatch({ type: 'SET_LOADING', payload: false });
        };

        const handleTimeUpdate = () => {
            dispatch({ type: 'SET_CURRENT_TIME', payload: audio.currentTime });
        };

        const handleEnded = () => {
            if (state.repeatMode === 'one') {
                audio.currentTime = 0;
                audio.play();
            } else {
                dispatch({ type: 'NEXT' });
            }
        };

        const handleError = () => {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to load audio' });
        };

        const handleLoadStart = () => {
            dispatch({ type: 'SET_LOADING', payload: true });
        };

        const handleCanPlay = () => {
            dispatch({ type: 'SET_LOADING', payload: false });
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);
        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('canplay', handleCanPlay);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('loadstart', handleLoadStart);
            audio.removeEventListener('canplay', handleCanPlay);
        };
    }, [state.repeatMode]);

    // Handle pause state changes
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (!state.isPlaying) {
            // Pausing: record position and pause
            dispatch({ type: 'SET_CURRENT_TIME', payload: audio.currentTime });
            audio.pause();
        }
    }, [state.isPlaying]);

    // Handle time synchronization separately (only when seeking or changing tracks)
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        // Only sync if there's a significant difference and we're not currently playing
        // This prevents interference with natural playback
        if (!state.isPlaying && Math.abs(audio.currentTime - state.currentTime) > 0.1) {
            audio.currentTime = state.currentTime;
        }
    }, [state.currentTime, state.isPlaying]);

    // Handle volume changes
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.volume = state.isMuted ? 0 : state.volume;
    }, [state.volume, state.isMuted]);

    // Handle track changes (only when track actually changes)
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !state.currentTrack) return;

        audio.src = state.currentTrack.fileUrl;
        audio.load();

        // Track play history for authenticated users
        if (isSignedIn && state.currentTrack) {
            addToPlayHistory(String(state.currentTrack._id)).catch(console.error);
        }
    }, [state.currentTrack, isSignedIn]);

    // Handle play state changes for current track
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !state.currentTrack) return;

        if (state.isPlaying) {
            // Sync time before playing to resume from correct position
            const onCanPlay = () => {
                audio.removeEventListener('canplay', onCanPlay);
                audio.currentTime = state.currentTime;
                audio.play().catch((error) => {
                    // Swallow AbortError caused by rapid play/pause actions
                    const name = (error && (error as Error).name) || '';
                    if (name !== 'AbortError') {
                        console.error('Failed to play track:', error);
                        dispatch({ type: 'SET_ERROR', payload: 'Failed to play track' });
                    }
                });
            };

            if (audio.readyState >= 2) {
                audio.currentTime = state.currentTime;
                audio.play().catch((error) => {
                    // Swallow AbortError caused by rapid play/pause actions
                    const name = (error && (error as Error).name) || '';
                    if (name !== 'AbortError') {
                        console.error('Failed to play track:', error);
                        dispatch({ type: 'SET_ERROR', payload: 'Failed to play track' });
                    }
                });
            } else {
                audio.addEventListener('canplay', onCanPlay);
            }
        }
    }, [state.isPlaying, state.currentTime, state.currentTrack]);

    // Convenience methods
    const playTrack = (track: TrackWithLikeStatus, queue?: TrackWithLikeStatus[], index?: number) => {
        dispatch({ type: 'SET_TRACK', payload: { track, queue, index } });
        dispatch({ type: 'PLAY' });
    };

    const playQueue = (queue: TrackWithLikeStatus[], startIndex = 0) => {
        dispatch({ type: 'SET_QUEUE', payload: { queue, startIndex } });
        dispatch({ type: 'PLAY' });
    };

    const togglePlay = () => {
        if (state.isPlaying) {
            dispatch({ type: 'PAUSE' });
        } else {
            dispatch({ type: 'PLAY' });
        }
    };

    const nextTrack = () => dispatch({ type: 'NEXT' });
    const previousTrack = () => dispatch({ type: 'PREVIOUS' });

    const seekTo = (time: number) => {
        const audio = audioRef.current;
        if (audio) {
            audio.currentTime = time;
            dispatch({ type: 'SET_CURRENT_TIME', payload: time });
        }
    };

    const setVolume = (volume: number) => {
        dispatch({ type: 'SET_VOLUME', payload: volume });
    };

    const toggleMute = () => dispatch({ type: 'TOGGLE_MUTE' });
    const toggleShuffle = () => dispatch({ type: 'TOGGLE_SHUFFLE' });
    const toggleRepeat = () => dispatch({ type: 'SET_REPEAT_MODE', payload: 'none' }); // Will cycle through modes

    const removeFromQueue = (index: number) => {
        dispatch({ type: 'REMOVE_FROM_QUEUE', payload: index });
    };

    const reorderQueue = (from: number, to: number) => {
        dispatch({ type: 'REORDER_QUEUE', payload: { from, to } });
    };

    const updateTrackLikeStatus = (trackId: string, isLiked: boolean) => {
        dispatch({ type: 'UPDATE_TRACK_LIKE_STATUS', payload: { trackId, isLiked } });
    };

    const contextValue: AudioContextType = {
        state,
        dispatch,
        audioRef,
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
        updateTrackLikeStatus,
    };

    return (
        <AudioContext value={contextValue}>
            {children}
            {/* Hidden audio element */}
            <audio ref={audioRef} preload="metadata" />
        </AudioContext>
    );
}

export function useAudio() {
    const context = useContext(AudioContext);
    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
}