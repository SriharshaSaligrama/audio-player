'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAudio } from '@/components/audio-player/audio-context';

type LikeSyncContextType = {
    syncTrackLikeStatus: (trackId: string, isLiked: boolean) => void;
}

const LikeSyncContext = createContext<LikeSyncContextType | undefined>(undefined);

export function LikeSyncProvider({ children }: { children: ReactNode }) {
    const { updateTrackLikeStatus } = useAudio();

    const syncTrackLikeStatus = (trackId: string, isLiked: boolean) => {
        // Update audio player context
        updateTrackLikeStatus(trackId, isLiked);

        // Dispatch custom event for other components to listen to
        window.dispatchEvent(new CustomEvent('trackLikeStatusChanged', {
            detail: { trackId, isLiked }
        }));
    };

    return (
        <LikeSyncContext.Provider value={{ syncTrackLikeStatus }}>
            {children}
        </LikeSyncContext.Provider>
    );
}

export function useLikeSync() {
    const context = useContext(LikeSyncContext);
    if (context === undefined) {
        throw new Error('useLikeSync must be used within a LikeSyncProvider');
    }
    return context;
}