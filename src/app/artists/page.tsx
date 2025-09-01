import { getPublicArtistsWithFollowStatus, getTrendingArtistsWithFollowStatus, getFeaturedArtistsWithFollowStatus } from '@/actions/artists';
import { ArtistsPageClient } from '@/components/pages/artists-page-client';
import { serializeArtists } from '@/lib/utils/serialization';

export default async function ArtistsPage() {
    // Get both recent and trending artists
    const [allArtists, trendingArtists, featuredArtists] = await Promise.all([
        getPublicArtistsWithFollowStatus(24),
        getTrendingArtistsWithFollowStatus(8),
        getFeaturedArtistsWithFollowStatus(6)
    ]);

    // Serialize artists for client components
    const serializedAllArtists = serializeArtists(allArtists);
    const serializedTrendingArtists = serializeArtists(trendingArtists);
    const serializedFeaturedArtists = serializeArtists(featuredArtists);

    return (
        <ArtistsPageClient
            allArtists={serializedAllArtists}
            trendingArtists={serializedTrendingArtists}
            featuredArtists={serializedFeaturedArtists}
        />
    );
}