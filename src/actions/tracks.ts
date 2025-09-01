'use server';

import { getDb } from '@/lib/mongodb/client';
import { Collections } from '@/lib/constants/collections';
import { ObjectId } from 'mongodb';
import { Track, Artist, Album } from '@/lib/mongodb/schemas';
import { auth } from '@clerk/nextjs/server';

export type TrackWithDetails = Omit<Track, "artists" | "albums" | "defaultAlbum"> & {
    artistDetails: Pick<Artist, "_id" | "name" | "avatar">[];
    albumDetails: Pick<Album, "_id" | "title" | "coverImage">[];
    defaultAlbumDetails: Pick<Album, "_id" | "title" | "coverImage"> | null;
};

export type TrackWithLikeStatus = TrackWithDetails & {
    isLiked: boolean;
};

// Helper function to extract track ID from like document (handles both trackId and songId for backward compatibility)
function extractTrackIdFromLike(like: Record<string, unknown>): string {
    const trackId = like.trackId || like.songId;
    return trackId ? trackId.toString() : '';
}

export async function getPublicTracks(limit = 50, skip = 0): Promise<TrackWithDetails[]> {
    try {
        const db = await getDb();

        const tracks = await db.collection(Collections.TRACKS).aggregate<TrackWithDetails>([
            {
                $match: {
                    $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
                }
            },
            {
                $lookup: {
                    from: Collections.ARTISTS,
                    localField: 'artists',
                    foreignField: '_id',
                    as: 'artistDetails',
                    pipeline: [
                        {
                            $match: {
                                $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
                            }
                        },
                        { $project: { _id: 1, name: 1, avatar: 1 } }
                    ]
                }
            },
            {
                $lookup: {
                    from: Collections.ALBUMS,
                    localField: 'albums',
                    foreignField: '_id',
                    as: 'albumDetails',
                    pipeline: [
                        {
                            $match: {
                                $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
                            }
                        },
                        { $project: { _id: 1, title: 1, coverImage: 1 } }
                    ]
                }
            },
            {
                $lookup: {
                    from: Collections.ALBUMS,
                    localField: 'defaultAlbum',
                    foreignField: '_id',
                    as: 'defaultAlbumDetails',
                    pipeline: [
                        {
                            $match: {
                                $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
                            }
                        },
                        { $project: { _id: 1, title: 1, coverImage: 1 } }
                    ]
                }
            },
            {
                $addFields: {
                    defaultAlbumDetails: { $arrayElemAt: ['$defaultAlbumDetails', 0] }
                }
            },
            {
                $match: {
                    artistDetails: { $ne: [] }, // Only tracks with non-deleted artists
                    albumDetails: { $ne: [] }   // Only tracks with non-deleted albums
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit }
        ]).toArray();

        return tracks;
    } catch (error) {
        console.error('Error fetching public tracks:', error);
        return [];
    }
}

export async function getTrackById(id: string): Promise<TrackWithDetails | null> {
    try {
        const db = await getDb();

        const tracks = await db.collection(Collections.TRACKS).aggregate<TrackWithDetails>([
            {
                $match: {
                    _id: new ObjectId(id),
                    $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
                }
            },
            {
                $lookup: {
                    from: Collections.ARTISTS,
                    localField: 'artists',
                    foreignField: '_id',
                    as: 'artistDetails',
                    pipeline: [
                        {
                            $match: {
                                $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
                            }
                        },
                        { $project: { _id: 1, name: 1, avatar: 1 } }
                    ]
                }
            },
            {
                $lookup: {
                    from: Collections.ALBUMS,
                    localField: 'albums',
                    foreignField: '_id',
                    as: 'albumDetails',
                    pipeline: [
                        {
                            $match: {
                                $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
                            }
                        },
                        { $project: { _id: 1, title: 1, coverImage: 1 } }
                    ]
                }
            },
            {
                $lookup: {
                    from: Collections.ALBUMS,
                    localField: 'defaultAlbum',
                    foreignField: '_id',
                    as: 'defaultAlbumDetails',
                    pipeline: [
                        {
                            $match: {
                                $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
                            }
                        },
                        { $project: { _id: 1, title: 1, coverImage: 1 } }
                    ]
                }
            },
            {
                $addFields: {
                    defaultAlbumDetails: { $arrayElemAt: ['$defaultAlbumDetails', 0] }
                }
            }
        ]).toArray();

        return tracks[0] || null;
    } catch (error) {
        console.error('Error fetching track by ID:', error);
        return null;
    }
}

export async function searchTracks(query: string, limit = 20): Promise<TrackWithDetails[]> {
    try {
        if (!query.trim()) return [];

        const db = await getDb();

        const tracks = await db.collection(Collections.TRACKS).aggregate<TrackWithDetails>([
            {
                $match: {
                    $and: [
                        { $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }] },
                        {
                            $or: [
                                { title: { $regex: query, $options: 'i' } },
                                { genres: { $regex: query, $options: 'i' } },
                                { tags: { $regex: query, $options: 'i' } }
                            ]
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: Collections.ARTISTS,
                    localField: 'artists',
                    foreignField: '_id',
                    as: 'artistDetails',
                    pipeline: [
                        {
                            $match: {
                                $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
                            }
                        },
                        { $project: { _id: 1, name: 1, avatar: 1 } }
                    ]
                }
            },
            {
                $lookup: {
                    from: Collections.ALBUMS,
                    localField: 'albums',
                    foreignField: '_id',
                    as: 'albumDetails',
                    pipeline: [
                        {
                            $match: {
                                $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
                            }
                        },
                        { $project: { _id: 1, title: 1, coverImage: 1 } }
                    ]
                }
            },
            {
                $lookup: {
                    from: Collections.ALBUMS,
                    localField: 'defaultAlbum',
                    foreignField: '_id',
                    as: 'defaultAlbumDetails',
                    pipeline: [
                        {
                            $match: {
                                $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
                            }
                        },
                        { $project: { _id: 1, title: 1, coverImage: 1 } }
                    ]
                }
            },
            {
                $addFields: {
                    defaultAlbumDetails: { $arrayElemAt: ['$defaultAlbumDetails', 0] }
                }
            },
            {
                $match: {
                    artistDetails: { $ne: [] },
                    albumDetails: { $ne: [] }
                }
            },
            { $limit: limit }
        ]).toArray();

        return tracks;
    } catch (error) {
        console.error('Error searching tracks:', error);
        return [];
    }
}

export async function getTracksByArtist(artistId: string, limit = 50): Promise<TrackWithDetails[]> {
    try {
        const db = await getDb();

        const tracks = await db.collection(Collections.TRACKS).aggregate<TrackWithDetails>([
            {
                $match: {
                    artists: new ObjectId(artistId),
                    $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
                }
            },
            {
                $lookup: {
                    from: Collections.ARTISTS,
                    localField: 'artists',
                    foreignField: '_id',
                    as: 'artistDetails',
                    pipeline: [
                        {
                            $match: {
                                $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
                            }
                        },
                        { $project: { _id: 1, name: 1, avatar: 1 } }
                    ]
                }
            },
            {
                $lookup: {
                    from: Collections.ALBUMS,
                    localField: 'albums',
                    foreignField: '_id',
                    as: 'albumDetails',
                    pipeline: [
                        {
                            $match: {
                                $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
                            }
                        },
                        { $project: { _id: 1, title: 1, coverImage: 1 } }
                    ]
                }
            },
            {
                $lookup: {
                    from: Collections.ALBUMS,
                    localField: 'defaultAlbum',
                    foreignField: '_id',
                    as: 'defaultAlbumDetails',
                    pipeline: [
                        {
                            $match: {
                                $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
                            }
                        },
                        { $project: { _id: 1, title: 1, coverImage: 1 } }
                    ]
                }
            },
            {
                $addFields: {
                    defaultAlbumDetails: { $arrayElemAt: ['$defaultAlbumDetails', 0] }
                }
            },
            { $sort: { releaseDate: -1 } },
            { $limit: limit }
        ]).toArray();

        return tracks;
    } catch (error) {
        console.error('Error fetching tracks by artist:', error);
        return [];
    }
}

export async function getTracksByAlbum(albumId: string): Promise<TrackWithDetails[]> {
    try {
        const db = await getDb();

        const tracks = await db.collection(Collections.TRACKS).aggregate<TrackWithDetails>([
            {
                $match: {
                    albums: new ObjectId(albumId),
                    $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
                }
            },
            {
                $lookup: {
                    from: Collections.ARTISTS,
                    localField: 'artists',
                    foreignField: '_id',
                    as: 'artistDetails',
                    pipeline: [
                        {
                            $match: {
                                $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
                            }
                        },
                        { $project: { _id: 1, name: 1, avatar: 1 } }
                    ]
                }
            },
            {
                $lookup: {
                    from: Collections.ALBUMS,
                    localField: 'albums',
                    foreignField: '_id',
                    as: 'albumDetails',
                    pipeline: [
                        {
                            $match: {
                                $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
                            }
                        },
                        { $project: { _id: 1, title: 1, coverImage: 1 } }
                    ]
                }
            },
            {
                $lookup: {
                    from: Collections.ALBUMS,
                    localField: 'defaultAlbum',
                    foreignField: '_id',
                    as: 'defaultAlbumDetails',
                    pipeline: [
                        {
                            $match: {
                                $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
                            }
                        },
                        { $project: { _id: 1, title: 1, coverImage: 1 } }
                    ]
                }
            },
            {
                $addFields: {
                    defaultAlbumDetails: { $arrayElemAt: ['$defaultAlbumDetails', 0] }
                }
            },
            { $sort: { releaseDate: 1 } } // Album track order
        ]).toArray();

        return tracks;
    } catch (error) {
        console.error('Error fetching tracks by album:', error);
        return [];
    }
}

export async function getTrendingTracks(limit = 20): Promise<TrackWithDetails[]> {
    try {
        const db = await getDb();

        const tracks = await db.collection(Collections.TRACKS).aggregate<TrackWithDetails>([
            {
                $match: {
                    $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
                }
            },
            {
                $lookup: {
                    from: Collections.ARTISTS,
                    localField: 'artists',
                    foreignField: '_id',
                    as: 'artistDetails',
                    pipeline: [
                        {
                            $match: {
                                $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
                            }
                        },
                        { $project: { _id: 1, name: 1, avatar: 1 } }
                    ]
                }
            },
            {
                $lookup: {
                    from: Collections.ALBUMS,
                    localField: 'albums',
                    foreignField: '_id',
                    as: 'albumDetails',
                    pipeline: [
                        {
                            $match: {
                                $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
                            }
                        },
                        { $project: { _id: 1, title: 1, coverImage: 1 } }
                    ]
                }
            },
            {
                $lookup: {
                    from: Collections.ALBUMS,
                    localField: 'defaultAlbum',
                    foreignField: '_id',
                    as: 'defaultAlbumDetails',
                    pipeline: [
                        {
                            $match: {
                                $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
                            }
                        },
                        { $project: { _id: 1, title: 1, coverImage: 1 } }
                    ]
                }
            },
            {
                $addFields: {
                    defaultAlbumDetails: { $arrayElemAt: ['$defaultAlbumDetails', 0] }
                }
            },
            {
                $match: {
                    artistDetails: { $ne: [] },
                    albumDetails: { $ne: [] }
                }
            },
            { $sort: { 'stats.plays': -1, createdAt: -1 } }, // Sort by plays, then recent
            { $limit: limit }
        ]).toArray();

        return tracks;
    } catch (error) {
        console.error('Error fetching trending tracks:', error);
        return [];
    }
}

export async function getPublicTracksWithLikeStatus(limit = 50, skip = 0): Promise<TrackWithLikeStatus[]> {
    try {
        const { userId } = await auth();
        const tracks = await getPublicTracks(limit, skip);
        const { serializeForClient } = await import('@/lib/utils/serialization');

        if (!userId) {
            const tracksWithLikeStatus = tracks.map(track => ({ ...track, isLiked: false }));
            return serializeForClient(tracksWithLikeStatus);
        }

        const db = await getDb();
        const likedTracks = await db.collection(Collections.USER_LIKED_SONGS).find({
            userId: userId
        }).toArray();

        const likedTrackIds = new Set(likedTracks.map(extractTrackIdFromLike).filter(id => id));

        const tracksWithLikeStatus = tracks.map(track => ({
            ...track,
            isLiked: likedTrackIds.has(track._id.toString())
        }));

        return serializeForClient(tracksWithLikeStatus);
    } catch (error) {
        console.error('Error fetching public tracks with like status:', error);
        const tracks = await getPublicTracks(limit, skip);
        const { serializeForClient } = await import('@/lib/utils/serialization');
        const tracksWithLikeStatus = tracks.map(track => ({ ...track, isLiked: false }));
        return serializeForClient(tracksWithLikeStatus);
    }
}

export async function getTrendingTracksWithLikeStatus(limit = 20): Promise<TrackWithLikeStatus[]> {
    try {
        const { userId } = await auth();
        const tracks = await getTrendingTracks(limit);
        const { serializeForClient } = await import('@/lib/utils/serialization');

        if (!userId) {
            const tracksWithLikeStatus = tracks.map(track => ({ ...track, isLiked: false }));
            return serializeForClient(tracksWithLikeStatus);
        }

        const db = await getDb();
        const likedTracks = await db.collection(Collections.USER_LIKED_SONGS).find({
            userId: userId
        }).toArray();

        const likedTrackIds = new Set(likedTracks.map(extractTrackIdFromLike).filter(id => id));

        const tracksWithLikeStatus = tracks.map(track => ({
            ...track,
            isLiked: likedTrackIds.has(track._id.toString())
        }));

        return serializeForClient(tracksWithLikeStatus);
    } catch (error) {
        console.error('Error fetching trending tracks with like status:', error);
        const tracks = await getTrendingTracks(limit);
        const { serializeForClient } = await import('@/lib/utils/serialization');
        const tracksWithLikeStatus = tracks.map(track => ({ ...track, isLiked: false }));
        return serializeForClient(tracksWithLikeStatus);
    }
}

export async function getTracksByArtistWithLikeStatus(artistId: string, limit = 50): Promise<TrackWithLikeStatus[]> {
    try {
        const { userId } = await auth();
        const tracks = await getTracksByArtist(artistId, limit);
        const { serializeForClient } = await import('@/lib/utils/serialization');

        if (!userId) {
            const tracksWithLikeStatus = tracks.map(track => ({ ...track, isLiked: false }));
            return serializeForClient(tracksWithLikeStatus);
        }

        const db = await getDb();
        const likedTracks = await db.collection(Collections.USER_LIKED_SONGS).find({
            userId: userId
        }).toArray();

        const likedTrackIds = new Set(likedTracks.map(extractTrackIdFromLike).filter(id => id));

        const tracksWithLikeStatus = tracks.map(track => ({
            ...track,
            isLiked: likedTrackIds.has(track._id.toString())
        }));

        return serializeForClient(tracksWithLikeStatus);
    } catch (error) {
        console.error('Error fetching tracks by artist with like status:', error);
        const tracks = await getTracksByArtist(artistId, limit);
        const { serializeForClient } = await import('@/lib/utils/serialization');
        const tracksWithLikeStatus = tracks.map(track => ({ ...track, isLiked: false }));
        return serializeForClient(tracksWithLikeStatus);
    }
}

export async function searchTracksWithLikeStatus(query: string, limit = 20): Promise<TrackWithLikeStatus[]> {
    try {
        const { userId } = await auth();
        const tracks = await searchTracks(query, limit);
        const { serializeForClient } = await import('@/lib/utils/serialization');

        if (!userId) {
            const tracksWithLikeStatus = tracks.map(track => ({ ...track, isLiked: false }));
            return serializeForClient(tracksWithLikeStatus);
        }

        const db = await getDb();
        const likedTracks = await db.collection(Collections.USER_LIKED_SONGS).find({
            userId: userId
        }).toArray();

        const likedTrackIds = new Set(likedTracks.map(extractTrackIdFromLike).filter(id => id));

        const tracksWithLikeStatus = tracks.map(track => ({
            ...track,
            isLiked: likedTrackIds.has(track._id.toString())
        }));

        return serializeForClient(tracksWithLikeStatus);
    } catch (error) {
        console.error('Error searching tracks with like status:', error);
        const tracks = await searchTracks(query, limit);
        const { serializeForClient } = await import('@/lib/utils/serialization');
        const tracksWithLikeStatus = tracks.map(track => ({ ...track, isLiked: false }));
        return serializeForClient(tracksWithLikeStatus);
    }
}

export async function getTracksByAlbumWithLikeStatus(albumId: string): Promise<TrackWithLikeStatus[]> {
    try {
        const { userId } = await auth();
        const tracks = await getTracksByAlbum(albumId);
        const { serializeForClient } = await import('@/lib/utils/serialization');

        if (!userId) {
            const tracksWithLikeStatus = tracks.map(track => ({ ...track, isLiked: false }));
            return serializeForClient(tracksWithLikeStatus);
        }

        const db = await getDb();
        const likedTracks = await db.collection(Collections.USER_LIKED_SONGS).find({
            userId: userId
        }).toArray();

        const likedTrackIds = new Set(likedTracks.map(extractTrackIdFromLike).filter(id => id));

        const tracksWithLikeStatus = tracks.map(track => ({
            ...track,
            isLiked: likedTrackIds.has(track._id.toString())
        }));

        return serializeForClient(tracksWithLikeStatus);
    } catch (error) {
        console.error('Error fetching tracks by album with like status:', error);
        const tracks = await getTracksByAlbum(albumId);
        const { serializeForClient } = await import('@/lib/utils/serialization');
        const tracksWithLikeStatus = tracks.map(track => ({ ...track, isLiked: false }));
        return serializeForClient(tracksWithLikeStatus);
    }
}