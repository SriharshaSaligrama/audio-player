import { getTrendingAlbumsWithLikeStatus, getRecentAlbumsWithLikeStatus } from '@/actions/albums';
import { AlbumsPageClient } from '@/components/pages/albums-page-client';
import { serializeAlbums } from '@/lib/utils/serialization';

export default async function AlbumsPage() {
    // Get both recent and trending albums
    const [recentAlbums, trendingAlbums] = await Promise.all([
        getRecentAlbumsWithLikeStatus(20),
        getTrendingAlbumsWithLikeStatus(8)
    ]);

    // Serialize albums for client components
    const serializedRecentAlbums = serializeAlbums(recentAlbums);
    const serializedTrendingAlbums = serializeAlbums(trendingAlbums);

    return (
        <AlbumsPageClient
            recentAlbums={serializedRecentAlbums}
            trendingAlbums={serializedTrendingAlbums}
        />
    );
}