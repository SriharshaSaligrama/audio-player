'use client';

import { useEffect } from 'react';
import { useAudioPlayer } from '@/hooks/use-audio-player';

export function KeyboardShortcuts() {
    const {
        togglePlay,
        nextTrack,
        previousTrack,
        setVolume,
        volume,
        seekTo,
        currentTime,
        duration,
        toggleMute,
        toggleShuffle,
        toggleRepeat
    } = useAudioPlayer();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in inputs
            if (e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                e.target instanceof HTMLSelectElement) {
                return;
            }

            // Prevent default for our shortcuts
            const shortcutKeys = ['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyM', 'KeyS', 'KeyR'];
            if (shortcutKeys.includes(e.code)) {
                e.preventDefault();
            }

            switch (e.code) {
                case 'Space':
                    // Play/Pause
                    togglePlay();
                    break;

                case 'ArrowLeft':
                    if (e.shiftKey) {
                        // Shift + Left: Previous track
                        previousTrack();
                    } else {
                        // Left: Seek backward 10 seconds
                        const newTime = Math.max(0, currentTime - 10);
                        seekTo(newTime);
                    }
                    break;

                case 'ArrowRight':
                    if (e.shiftKey) {
                        // Shift + Right: Next track
                        nextTrack();
                    } else {
                        // Right: Seek forward 10 seconds
                        const newTime = Math.min(duration, currentTime + 10);
                        seekTo(newTime);
                    }
                    break;

                case 'ArrowUp':
                    // Volume up
                    const newVolumeUp = Math.min(1, volume + 0.1);
                    setVolume(newVolumeUp);
                    break;

                case 'ArrowDown':
                    // Volume down
                    const newVolumeDown = Math.max(0, volume - 0.1);
                    setVolume(newVolumeDown);
                    break;

                case 'KeyM':
                    // Mute/Unmute
                    toggleMute();
                    break;

                case 'KeyS':
                    // Toggle shuffle
                    toggleShuffle();
                    break;

                case 'KeyR':
                    // Toggle repeat
                    toggleRepeat();
                    break;

                case 'Digit0':
                case 'Digit1':
                case 'Digit2':
                case 'Digit3':
                case 'Digit4':
                case 'Digit5':
                case 'Digit6':
                case 'Digit7':
                case 'Digit8':
                case 'Digit9':
                    // Seek to percentage (0-9 = 0%-90%)
                    const digit = parseInt(e.code.replace('Digit', ''));
                    const percentage = digit / 10;
                    const seekTime = duration * percentage;
                    seekTo(seekTime);
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [
        togglePlay,
        nextTrack,
        previousTrack,
        setVolume,
        volume,
        seekTo,
        currentTime,
        duration,
        toggleMute,
        toggleShuffle,
        toggleRepeat
    ]);

    return null; // This component doesn't render anything
}