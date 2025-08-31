'use client';

import { useAudio } from './audio-context';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

type VolumeControlProps = {
    compact?: boolean;
}

export function VolumeControl({ compact = false }: VolumeControlProps) {
    const { state, setVolume, toggleMute } = useAudio();
    const [isDragging, setIsDragging] = useState(false);
    const [showSlider, setShowSlider] = useState(false);
    const volumeRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const getVolumeIcon = () => {
        if (state.isMuted || state.volume === 0) {
            return <VolumeX className={`${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />;
        } else if (state.volume < 0.5) {
            return <Volume1 className={`${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />;
        } else {
            return <Volume2 className={`${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />;
        }
    };

    const updateVolume = useCallback((e: MouseEvent | React.MouseEvent) => {
        if (!volumeRef.current) return;

        const rect = volumeRef.current.getBoundingClientRect();
        let percentage;

        if (compact) {
            // Horizontal slider for compact mode
            const x = e.clientX - rect.left;
            percentage = Math.max(0, Math.min(1, x / rect.width));
        } else {
            // Vertical slider for full mode
            const y = e.clientY - rect.top;
            percentage = Math.max(0, Math.min(1, 1 - (y / rect.height)));
        }

        setVolume(percentage);
    }, [compact, setVolume]);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        updateVolume(e);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            updateVolume(e);
        }
    }, [isDragging, updateVolume]);

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove]);

    // Hide slider when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSlider(false);
            }
        };

        if (showSlider) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showSlider]);

    if (compact) {
        return (
            <div ref={containerRef} className="relative flex items-center gap-2">
                <button
                    onClick={toggleMute}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                    title={state.isMuted ? 'Unmute' : 'Mute'}
                >
                    {getVolumeIcon()}
                </button>

                {/* Horizontal Volume Slider */}
                <div
                    ref={volumeRef}
                    className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer group"
                    onMouseDown={handleMouseDown}
                >
                    <div
                        className="h-full bg-green-600 dark:bg-green-500 rounded-full relative"
                        style={{ width: `${(state.isMuted ? 0 : state.volume) * 100}%` }}
                    >
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-green-600 dark:bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative flex items-center gap-4">
            <button
                onClick={toggleMute}
                onMouseEnter={() => setShowSlider(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                title={state.isMuted ? 'Unmute' : 'Mute'}
            >
                {getVolumeIcon()}
            </button>

            {/* Volume Slider */}
            {showSlider && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <div
                        ref={volumeRef}
                        className="w-1 h-20 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer group mx-auto relative"
                        onMouseDown={handleMouseDown}
                    >
                        <div className="w-full h-full flex flex-col justify-end">
                            <div
                                className="w-full bg-green-600 dark:bg-green-500 rounded-full relative"
                                style={{ height: `${(state.isMuted ? 0 : state.volume) * 100}%` }}
                            >
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-green-600 dark:bg-green-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    </div>
                    <div className="text-xs text-center text-gray-600 dark:text-gray-400 mt-1">
                        {Math.round((state.isMuted ? 0 : state.volume) * 100)}%
                    </div>
                </div>
            )}
        </div>
    );
}