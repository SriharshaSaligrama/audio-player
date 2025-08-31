'use client';

import { useAudio } from './audio-context';
import Image from 'next/image';
import Link from 'next/link';
import { Music, X, GripVertical, Play } from 'lucide-react';
import { useState } from 'react';

export function PlayerQueue() {
    const { state, playTrack, removeFromQueue, reorderQueue } = useAudio();
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const formatDuration = (seconds: number) => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedIndex !== null && draggedIndex !== dropIndex) {
            reorderQueue(draggedIndex, dropIndex);
        }
        setDraggedIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    if (state.queue.length === 0) {
        return (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <Music className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No tracks in queue</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Queue</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {state.queue.length} track{state.queue.length !== 1 ? 's' : ''}
                    </span>
                </div>
                {state.isShuffled && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">Shuffle is on</p>
                )}
            </div>

            {/* Queue List */}
            <div className="flex-1 overflow-y-auto">
                {state.queue.map((track, index) => {
                    const isCurrentTrack = index === state.currentIndex;
                    const coverImage = track.coverImage || track.defaultAlbumDetails?.coverImage;

                    return (
                        <div
                            key={`${track._id}-${index}`}
                            className={`group flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-l-2 ${isCurrentTrack
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                                : 'border-transparent'
                                }`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                        >
                            {/* Drag Handle */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                                <GripVertical className="h-4 w-4 text-gray-400" />
                            </div>

                            {/* Track Number / Play Button */}
                            <div className="w-8 flex items-center justify-center">
                                {isCurrentTrack && state.isPlaying ? (
                                    <div className="w-4 h-4 flex items-center justify-center">
                                        <div className="flex gap-0.5">
                                            <div className="w-0.5 h-4 bg-green-500 animate-pulse" />
                                            <div className="w-0.5 h-4 bg-green-500 animate-pulse" style={{ animationDelay: '0.1s' }} />
                                            <div className="w-0.5 h-4 bg-green-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => playTrack(track, state.queue, index)}
                                        className="w-6 h-6 rounded-full bg-green-600 hover:bg-green-700 text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                                    >
                                        <Play className="h-3 w-3 ml-0.5" fill="currentColor" />
                                    </button>
                                )}
                            </div>

                            {/* Album Cover */}
                            <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                                {coverImage ? (
                                    <Image
                                        src={coverImage}
                                        alt={`${track.title} cover`}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Music className="h-4 w-4 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* Track Info */}
                            <div className="flex-1 min-w-0">
                                <Link
                                    href={`/tracks/${track._id}`}
                                    className={`block font-medium truncate transition-colors ${isCurrentTrack
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400'
                                        }`}
                                >
                                    {track.title}
                                </Link>
                                <Link
                                    href={`/artists/${track.artistDetails?.[0]?._id}`}
                                    className="block text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors truncate"
                                >
                                    {track.artistDetails?.[0]?.name || 'Unknown Artist'}
                                </Link>
                            </div>

                            {/* Duration */}
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                                {formatDuration(track.duration)}
                            </div>

                            {/* Remove Button */}
                            <button
                                onClick={() => removeFromQueue(index)}
                                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                title="Remove from queue"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Queue Actions */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                        {state.repeatMode === 'all' && 'Repeat All'}
                        {state.repeatMode === 'one' && 'Repeat One'}
                        {state.repeatMode === 'none' && 'No Repeat'}
                    </span>
                    <button
                        onClick={() => {
                            // Clear queue except current track
                            const currentTrack = state.currentTrack;
                            if (currentTrack) {
                                playTrack(currentTrack, [currentTrack], 0);
                            }
                        }}
                        className="text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"
                    >
                        Clear Queue
                    </button>
                </div>
            </div>
        </div>
    );
}