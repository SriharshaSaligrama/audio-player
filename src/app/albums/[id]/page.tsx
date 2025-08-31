import { notFound } from 'next/navigation';
import { getAlbumById } from '@/actions/albums';
import { getTracksByAlbumWithLikeStatus } from '@/actions/tracks';
import { isAlbumLiked } from '@/actions/user-interactions';
import { serializeTracks, serializeAlbum } from '@/lib/utils/serialization';
import { AlbumDetailClient } from '@/components/albums/album-detail-client';

type AlbumDetailPageProps = {
    params: Promise<{ id: string }>;
}

export default async function AlbumDetailPage({ params }: AlbumDetailPageProps) {
    const { id: albumId } = await params;
    const [album, tracks, initialLiked] = await Promise.all([
        getAlbumById(albumId),
        getTracksByAlbumWithLikeStatus(albumId),
        isAlbumLiked(albumId)
    ]);

    if (!album) {
        notFound();
    }

    // Serialize data for client components
    const serializedTracks = serializeTracks(tracks);
    const serializedAlbum = serializeAlbum({ ...album, isLiked: initialLiked });

    return (
        <AlbumDetailClient
            album={serializedAlbum}
            tracks={serializedTracks}
            initialLiked={initialLiked}
        />
    );
}