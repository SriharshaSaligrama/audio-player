import { redirect } from 'next/navigation';
import { checkRole } from '@/utils/roles';
import { getDb } from '@/lib/mongodb/client';
import { Album, Artist, Track } from '@/lib/mongodb/schemas';
import { AdminTracksClient } from '@/components/admin/pages/admin-tracks-client';

export type TrackWithDetails = Omit<Track, "artists" | "album"> & {
    artistDetails: Pick<Artist, "name" | "isDeleted">[];
    albumDetails: Pick<Album, "title" | "coverImage" | "isDeleted">[];
};

export default async function AdminTracksPage() {
    const isAdmin = await checkRole('admin');
    if (!isAdmin) redirect('/');
    const db = await getDb();

    // Fetch tracks with artist and album information
    const rawTracks = await db.collection('tracks').aggregate<TrackWithDetails>([
        {
            $lookup: {
                from: 'artists',
                localField: 'artists',
                foreignField: '_id',
                as: 'artistDetails'
            }
        },
        {
            $lookup: {
                from: 'albums',
                localField: 'albums',
                foreignField: '_id',
                as: 'albumDetails'
            }
        },
        {
            $project: {
                title: 1,
                duration: 1,
                coverImage: 1,
                genres: 1,
                releaseDate: 1,
                stats: 1,
                isDeleted: 1,
                deletedAt: 1,
                takedownReason: 1,
                artistDetails: { name: 1, isDeleted: 1 },
                albumDetails: { title: 1, coverImage: 1, isDeleted: 1 }
            }
        }
    ]).toArray();

    const { serializeForClient } = await import('@/lib/utils/serialization');
    const tracks = serializeForClient(rawTracks);

    return <AdminTracksClient initialTracks={tracks} />;
}
