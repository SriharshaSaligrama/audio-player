'use client';

import { usePlayCollection } from '@/hooks/use-play-collection';
import { useAudioPlayer } from '@/hooks/use-audio-player';

export function PlayCollectionTest() {
    const { playCollection, isLoading } = usePlayCollection();
    const { currentTrack, isPlaying, queue } = useAudioPlayer();

    const testAlbumId = "60f7b3b3b3b3b3b3b3b3b3b3"; // Replace with actual album ID
    const testArtistId = "60f7b3b3b3b3b3b3b3b3b3b4"; // Replace with actual artist ID

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Play Collection Test</h3>

            <div className="space-y-4">
                <div>
                    <button
                        onClick={() => playCollection(testAlbumId, 'album', 'Test Album')}
                        disabled={isLoading(testAlbumId, 'album')}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                        {isLoading(testAlbumId, 'album') ? 'Loading...' : 'Play Test Album'}
                    </button>
                </div>

                <div>
                    <button
                        onClick={() => playCollection(testArtistId, 'artist', 'Test Artist')}
                        disabled={isLoading(testArtistId, 'artist')}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isLoading(testArtistId, 'artist') ? 'Loading...' : 'Play Test Artist'}
                    </button>
                </div>
            </div>

            <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded">
                <h4 className="font-medium mb-2">Current State:</h4>
                <p>Playing: {isPlaying ? 'Yes' : 'No'}</p>
                <p>Current Track: {currentTrack?.title || 'None'}</p>
                <p>Queue Length: {queue.length}</p>
            </div>
        </div>
    );
}