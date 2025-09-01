import { redirect } from 'next/navigation';
import { checkRole } from '@/utils/roles';
import { getDb } from '@/lib/mongodb/client';
import { Album, Artist } from '@/lib/mongodb/schemas';
import { AdminAlbumsClient } from '@/components/admin/pages/admin-albums-client';

type AlbumWithArtists = Omit<Album, "artists"> & {
    artistDetails: Pick<Artist, "name" | "isDeleted">[];
};

export default async function AdminAlbumsPage() {
    const isAdmin = await checkRole('admin');
    if (!isAdmin) redirect('/');
    const db = await getDb();

    // Fetch albums with artist information
    const rawAlbums = await db.collection('albums').aggregate<AlbumWithArtists>([
        {
            $lookup: {
                from: 'artists',
                localField: 'artists',
                foreignField: '_id',
                as: 'artistDetails'
            }
        },
        {
            $project: {
                title: 1,
                releaseDate: 1,
                coverImage: 1,
                description: 1,
                label: 1,
                genres: 1,
                totalTracks: 1,
                totalDuration: 1,
                stats: 1,
                isDeleted: 1,
                deletedAt: 1,
                takedownReason: 1,
                artistDetails: { name: 1, isDeleted: 1 }
            }
        }
    ]).toArray();

    const { serializeForClient } = await import('@/lib/utils/serialization');
    const albums = serializeForClient(rawAlbums);

    return <AdminAlbumsClient initialAlbums={albums} />;
}