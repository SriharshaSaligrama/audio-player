'use client';

import { useState } from 'react';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { getTracksByAlbumWithLikeStatus, getTracksByArtistWithLikeStatus } from '@/actions/tracks';
import type { TrackWithLikeStatus } from '@/actions/tracks';

type CollectionType = 'album' | 'artist';

export function usePlayCollection() {
    const { playAlbum, playArtistTopTracks } = useAudioPlayer();
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

    const playCollection = async (
        id: string,
        type: CollectionType,
        name: string
    ) => {
        const key = `${type}-${id}`;

        try {
            setLoadingStates(prev => ({ ...prev, [key]: true }));

            let tracks: TrackWithLikeStatus[] = [];

            if (type === 'album') {
                tracks = await getTracksByAlbumWithLikeStatus(id);
            } else if (type === 'artist') {
                tracks = await getTracksByArtistWithLikeStatus(id);
            }

            if (tracks.length === 0) {
                console.warn(`No tracks found for ${type}: ${name}`);
                return;
            }

            // Play the tracks using the appropriate method
            if (type === 'album') {
                playAlbum(tracks, 0);
            } else if (type === 'artist') {
                playArtistTopTracks(tracks);
            }

        } catch (error) {
            console.error(`Failed to play ${type} tracks:`, error);
        } finally {
            setLoadingStates(prev => ({ ...prev, [key]: false }));
        }
    };

    const isLoading = (id: string, type: CollectionType) => {
        const key = `${type}-${id}`;
        return loadingStates[key] || false;
    };

    return {
        playCollection,
        isLoading
    };
}