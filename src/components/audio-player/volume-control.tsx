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
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        setVolume(percentage);
    }, [setVolume]);

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

    return (
        <div ref={containerRef} className={`flex items-center gap-2 ${compact ? '' : 'min-w-[120px]'}`}
            title={`${Math.round((state.isMuted ? 0 : state.volume) * 100)}%`}
        >
            <button
                onClick={toggleMute}
                className={`p-1.5 ${compact ? '' : 'p-2'} rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors`}
                aria-label={state.isMuted ? 'Unmute' : 'Mute'}
            >
                {getVolumeIcon()}
            </button>
            <div
                ref={volumeRef}
                className={`h-1 ${compact ? 'w-16' : 'w-24'} bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer group relative`}
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