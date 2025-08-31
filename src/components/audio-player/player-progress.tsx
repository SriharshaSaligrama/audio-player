'use client';

import { useAudio } from './audio-context';
import { useState, useRef, useEffect, useCallback } from 'react';

type PlayerProgressProps = {
    compact?: boolean;
}

export function PlayerProgress({ compact = false }: PlayerProgressProps) {
    const { state, seekTo } = useAudio();
    const [isDragging, setIsDragging] = useState(false);
    const [dragTime, setDragTime] = useState(0);
    const progressRef = useRef<HTMLDivElement>(null);

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const updateTime = useCallback((e: MouseEvent | React.MouseEvent) => {
        if (!progressRef.current) return;

        const rect = progressRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const time = percentage * state.duration;
        setDragTime(time);
    }, [state.duration]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        updateTime(e);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            updateTime(e);
        }
    }, [isDragging, updateTime]);

    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            seekTo(dragTime);
            setIsDragging(false);
        }
    }, [isDragging, dragTime, seekTo]);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const currentTime = isDragging ? dragTime : state.currentTime;
    const progress = state.duration > 0 ? (currentTime / state.duration) * 100 : 0;

    if (compact) {
        return (
            <div className="w-full">
                <div
                    ref={progressRef}
                    className="w-full h-1 bg-gray-200 dark:bg-gray-700 cursor-pointer group"
                    onMouseDown={handleMouseDown}
                >
                    <div
                        className="h-full bg-green-600 dark:bg-green-500 transition-all duration-150 relative"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-green-600 dark:bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-2">
            {/* Progress Bar */}
            <div
                ref={progressRef}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer group"
                onMouseDown={handleMouseDown}
            >
                <div
                    className="h-full bg-green-600 dark:bg-green-500 rounded-full transition-all duration-150 relative"
                    style={{ width: `${progress}%` }}
                >
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-green-600 dark:bg-green-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>

            {/* Time Display */}
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(state.duration)}</span>
            </div>
        </div>
    );
}