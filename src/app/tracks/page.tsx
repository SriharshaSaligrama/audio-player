import { getPublicTracksWithLikeStatus, getTrendingTracksWithLikeStatus } from '@/actions/tracks';
import { TracksPageClient } from '@/components/pages/tracks-page-client';
import { serializeTracks } from '@/lib/utils/serialization';

export default async function TracksPage() {
    // Get both recent and trending tracks
    const [recentTracks, trendingTracks] = await Promise.all([
        getPublicTracksWithLikeStatus(20),
        getTrendingTracksWithLikeStatus(10)
    ]);

    // Serialize tracks for client components
    const serializedRecentTracks = serializeTracks(recentTracks);
    const serializedTrendingTracks = serializeTracks(trendingTracks);

    return (
        <TracksPageClient
            recentTracks={serializedRecentTracks}
            trendingTracks={serializedTrendingTracks}
        />
    );
}