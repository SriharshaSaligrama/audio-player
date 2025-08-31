'use client';

import { Play, Pause, Shuffle } from 'lucide-react';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { TrackWithDetails, TrackWithLikeStatus } from '@/actions/tracks';

type PlayAlbumButtonProps = {
    tracks: (TrackWithDetails | TrackWithLikeStatus)[];
    className?: string;
}

// Helper function to ensure track has isLiked property
const ensureTrackWithLikeStatus = (track: TrackWithDetails | TrackWithLikeStatus): TrackWithLikeStatus => {
    return 'isLiked' in track ? track : { ...track, isLiked: false };
};

export function PlayAlbumButton({ tracks, className = '' }: PlayAlbumButtonProps) {
    const { playAlbum, isPlaying, currentTrack, togglePlay } = useAudioPlayer();

    // Check if we're currently playing this album
    const isPlayingThisAlbum = currentTrack && tracks.some(track =>
        String(track._id) === String(currentTrack._id)
    );

    const handlePlay = () => {
        if (isPlayingThisAlbum) {
            togglePlay();
        } else {
            const tracksWithLikeStatus = tracks.map(ensureTrackWithLikeStatus);
            playAlbum(tracksWithLikeStatus, 0);
        }
    };

    const handleShuffle = () => {
        // Shuffle the tracks and play
        const tracksWithLikeStatus = tracks.map(ensureTrackWithLikeStatus);
        const shuffledTracks = [...tracksWithLikeStatus].sort(() => Math.random() - 0.5);
        playAlbum(shuffledTracks, 0);
    };

    if (tracks.length === 0) {
        return (
            <button
                disabled
                className={`flex items-center gap-3 px-8 py-4 bg-gray-400 text-white rounded-full font-semibold cursor-not-allowed ${className}`}
            >
                <Play className="h-5 w-5" fill="currentColor" />
                No Tracks Available
            </button>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={handlePlay}
                className={`flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 ${className}`}
            >
                {isPlayingThisAlbum && isPlaying ? (
                    <>
                        <Pause className="h-5 w-5" fill="currentColor" />
                        Pause Album
                    </>
                ) : (
                    <>
                        <Play className="h-5 w-5" fill="currentColor" />
                        Play Album
                    </>
                )}
            </button>

            <button
                onClick={handleShuffle}
                className="flex items-center gap-2 px-6 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full font-semibold transition-all duration-200 hover:scale-105"
            >
                <Shuffle className="h-4 w-4" />
                Shuffle
            </button>
        </div>
    );
}