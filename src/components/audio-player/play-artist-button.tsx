'use client';

import { Play, Loader2 } from 'lucide-react';
import { usePlayCollection } from '@/hooks/use-play-collection';

type PlayArtistButtonProps = {
    artistId: string;
    artistName: string;
    className?: string;
}

export function PlayArtistButton({ artistId, artistName, className = '' }: PlayArtistButtonProps) {
    const { playCollection, isLoading } = usePlayCollection();

    const handlePlay = () => {
        playCollection(artistId, 'artist', artistName);
    };

    const loading = isLoading(artistId, 'artist');

    return (
        <button
            onClick={handlePlay}
            disabled={loading}
            className={`flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-full font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 disabled:cursor-not-allowed disabled:scale-100 ${className}`}
            title={`Play all tracks by ${artistName}`}
        >
            {loading ? (
                <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading...
                </>
            ) : (
                <>
                    <Play className="h-5 w-5" fill="currentColor" />
                    Play
                </>
            )}
        </button>
    );
}