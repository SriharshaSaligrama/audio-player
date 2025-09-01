'use server';

import { getDb } from '@/lib/mongodb/client';
import { serializeForClient } from '@/lib/utils/serialization';
import { checkRole } from '@/utils/roles';
import { redirect } from 'next/navigation';
import type { TrackWithDetails } from '@/app/admin/tracks/page';
import type { Album, Artist } from '@/lib/mongodb/schemas';

type AlbumWithArtists = Omit<Album, "artists"> & {
    artistDetails: Pick<Artist, "name" | "isDeleted">[];
};

export async function searchAdminTracks(query: string, limit = 20): Promise<TrackWithDetails[]> {
    const isAdmin = await checkRole('admin');
    if (!isAdmin) redirect('/');

    try {
        const db = await getDb();

        const tracks = await db.collection('tracks').aggregate<TrackWithDetails>([
            {
                $match: {
                    $or: [
                        { title: { $regex: query, $options: 'i' } },
                        { genres: { $elemMatch: { $regex: query, $options: 'i' } } }
                    ]
                }
            },
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
            },
            { $limit: limit }
        ]).toArray();

        return serializeForClient(tracks);
    } catch (error) {
        console.error('Error searching admin tracks:', error);
        return [];
    }
}

export async function searchAdminAlbums(query: string, limit = 20): Promise<AlbumWithArtists[]> {
    const isAdmin = await checkRole('admin');
    if (!isAdmin) redirect('/');

    try {
        const db = await getDb();

        const albums = await db.collection('albums').aggregate<AlbumWithArtists>([
            {
                $match: {
                    $or: [
                        { title: { $regex: query, $options: 'i' } },
                        { description: { $regex: query, $options: 'i' } },
                        { label: { $regex: query, $options: 'i' } },
                        { genres: { $elemMatch: { $regex: query, $options: 'i' } } }
                    ]
                }
            },
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
            },
            { $limit: limit }
        ]).toArray();

        return serializeForClient(albums);
    } catch (error) {
        console.error('Error searching admin albums:', error);
        return [];
    }
}

export async function searchAdminArtists(query: string, limit = 20): Promise<Artist[]> {
    const isAdmin = await checkRole('admin');
    if (!isAdmin) redirect('/');

    try {
        const db = await getDb();

        const artists = await db.collection('artists').find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { bio: { $regex: query, $options: 'i' } },
                { genres: { $elemMatch: { $regex: query, $options: 'i' } } }
            ]
        }).limit(limit).toArray() as unknown as Artist[];

        return serializeForClient(artists);
    } catch (error) {
        console.error('Error searching admin artists:', error);
        return [];
    }
}