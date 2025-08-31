'use server';

import { getDb } from '@/lib/mongodb/client';
import { Collections } from '@/lib/constants/collections';
import { ObjectId } from 'mongodb';
import { Album, Artist } from '@/lib/mongodb/schemas';
import { auth } from '@clerk/nextjs/server';

export type AlbumWithDetails = Omit<Album, "artists"> & {
    artistDetails: Pick<Artist, "_id" | "name" | "avatar">[];
};

export type AlbumWithLikeStatus = AlbumWithDetails & {
    isLiked: boolean;
};

export async function getPublicAlbums(limit = 50, skip = 0): Promise<AlbumWithDetails[]> {
    try {
        const db = await getDb();

        const albums = await db.collection(Collections.ALBUMS).aggregate<AlbumWithDetails>([
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
                $match: {
                    artistDetails: { $ne: [] } // Only albums with non-deleted artists
                }
            },
            { $sort: { releaseDate: -1 } },
            { $skip: skip },
            { $limit: limit }
        ]).toArray();

        return albums;
    } catch (error) {
        console.error('Error fetching public albums:', error);
        return [];
    }
}

export async function getAlbumById(id: string): Promise<AlbumWithDetails | null> {
    try {
        const db = await getDb();

        const albums = await db.collection(Collections.ALBUMS).aggregate<AlbumWithDetails>([
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
            }
        ]).toArray();

        return albums[0] || null;
    } catch (error) {
        console.error('Error fetching album by ID:', error);
        return null;
    }
}

export async function searchAlbums(query: string, limit = 20): Promise<AlbumWithDetails[]> {
    try {
        if (!query.trim()) return [];

        const db = await getDb();

        const albums = await db.collection(Collections.ALBUMS).aggregate<AlbumWithDetails>([
            {
                $match: {
                    $and: [
                        { $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }] },
                        {
                            $or: [
                                { title: { $regex: query, $options: 'i' } },
                                { description: { $regex: query, $options: 'i' } },
                                { genres: { $regex: query, $options: 'i' } },
                                { label: { $regex: query, $options: 'i' } }
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
                $match: {
                    artistDetails: { $ne: [] }
                }
            },
            { $limit: limit }
        ]).toArray();

        return albums;
    } catch (error) {
        console.error('Error searching albums:', error);
        return [];
    }
}

export async function getAlbumsByArtist(artistId: string, limit = 50): Promise<AlbumWithDetails[]> {
    try {
        const db = await getDb();

        const albums = await db.collection(Collections.ALBUMS).aggregate<AlbumWithDetails>([
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
            { $sort: { releaseDate: -1 } },
            { $limit: limit }
        ]).toArray();

        return albums;
    } catch (error) {
        console.error('Error fetching albums by artist:', error);
        return [];
    }
}

export async function getTrendingAlbums(limit = 20): Promise<AlbumWithDetails[]> {
    try {
        const db = await getDb();

        const albums = await db.collection(Collections.ALBUMS).aggregate<AlbumWithDetails>([
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
                $match: {
                    artistDetails: { $ne: [] }
                }
            },
            { $sort: { 'stats.plays': -1, releaseDate: -1 } }, // Sort by plays, then recent
            { $limit: limit }
        ]).toArray();

        return albums;
    } catch (error) {
        console.error('Error fetching trending albums:', error);
        return [];
    }
}

export async function getRecentAlbums(limit = 20): Promise<AlbumWithDetails[]> {
    try {
        const db = await getDb();

        const albums = await db.collection(Collections.ALBUMS).aggregate<AlbumWithDetails>([
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
                $match: {
                    artistDetails: { $ne: [] }
                }
            },
            { $sort: { releaseDate: -1 } },
            { $limit: limit }
        ]).toArray();

        return albums;
    } catch (error) {
        console.error('Error fetching recent albums:', error);
        return [];
    }
}

export async function getFeaturedAlbums(limit = 10): Promise<AlbumWithDetails[]> {
    try {
        const db = await getDb();

        // Get albums with high play counts and recent releases
        const albums = await db.collection(Collections.ALBUMS).aggregate<AlbumWithDetails>([
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
                $match: {
                    artistDetails: { $ne: [] },
                    coverImage: { $exists: true, $ne: "" } // Only albums with cover images for featured
                }
            },
            {
                $addFields: {
                    // Calculate a featured score based on plays and recency
                    featuredScore: {
                        $add: [
                            { $multiply: [{ $ifNull: ["$stats.plays", 0] }, 0.7] },
                            { $multiply: [{ $ifNull: ["$stats.likes", 0] }, 0.3] }
                        ]
                    }
                }
            },
            { $sort: { featuredScore: -1, releaseDate: -1 } },
            { $limit: limit }
        ]).toArray();

        return albums;
    } catch (error) {
        console.error('Error fetching featured albums:', error);
        return [];
    }
}

// Enhanced functions with like status
export async function getPublicAlbumsWithLikeStatus(limit = 50, skip = 0): Promise<AlbumWithLikeStatus[]> {
    try {
        const { userId } = await auth();
        const db = await getDb();

        const albums = await getPublicAlbums(limit, skip);

        if (!userId) {
            return albums.map(album => ({ ...album, isLiked: false }));
        }

        // Get user's liked albums
        const likedAlbums = await db.collection(Collections.USER_LIKED_ALBUMS).find({
            userId: userId,
            albumId: { $in: albums.map(album => album._id) }
        }).toArray();

        const likedAlbumIds = new Set(likedAlbums.map(like => like.albumId.toString()));

        return albums.map(album => ({
            ...album,
            isLiked: likedAlbumIds.has(album._id.toString())
        }));
    } catch (error) {
        console.error('Error fetching albums with like status:', error);
        return [];
    }
}

export async function getFeaturedAlbumsWithLikeStatus(limit = 10): Promise<AlbumWithLikeStatus[]> {
    try {
        const { userId } = await auth();
        const db = await getDb();

        const albums = await getFeaturedAlbums(limit);

        if (!userId) {
            return albums.map(album => ({ ...album, isLiked: false }));
        }

        // Get user's liked albums
        const likedAlbums = await db.collection(Collections.USER_LIKED_ALBUMS).find({
            userId: userId,
            albumId: { $in: albums.map(album => album._id) }
        }).toArray();

        const likedAlbumIds = new Set(likedAlbums.map(like => like.albumId.toString()));

        return albums.map(album => ({
            ...album,
            isLiked: likedAlbumIds.has(album._id.toString())
        }));
    } catch (error) {
        console.error('Error fetching featured albums with like status:', error);
        return [];
    }
}

export async function getTrendingAlbumsWithLikeStatus(limit = 20): Promise<AlbumWithLikeStatus[]> {
    try {
        const { userId } = await auth();
        const albums = await getTrendingAlbums(limit);

        if (!userId) {
            return albums.map(album => ({ ...album, isLiked: false }));
        }

        const db = await getDb();
        const likedAlbums = await db.collection(Collections.USER_LIKED_ALBUMS).find({
            userId: userId,
            albumId: { $in: albums.map(album => album._id) }
        }).toArray();

        const likedAlbumIds = new Set(likedAlbums.map(like => like.albumId.toString()));

        return albums.map(album => ({
            ...album,
            isLiked: likedAlbumIds.has(album._id.toString())
        }));
    } catch (error) {
        console.error('Error fetching trending albums with like status:', error);
        const albums = await getTrendingAlbums(limit);
        return albums.map(album => ({ ...album, isLiked: false }));
    }
}

export async function getRecentAlbumsWithLikeStatus(limit = 20): Promise<AlbumWithLikeStatus[]> {
    try {
        const { userId } = await auth();
        const albums = await getRecentAlbums(limit);

        if (!userId) {
            return albums.map(album => ({ ...album, isLiked: false }));
        }

        const db = await getDb();
        const likedAlbums = await db.collection(Collections.USER_LIKED_ALBUMS).find({
            userId: userId,
            albumId: { $in: albums.map(album => album._id) }
        }).toArray();

        const likedAlbumIds = new Set(likedAlbums.map(like => like.albumId.toString()));

        return albums.map(album => ({
            ...album,
            isLiked: likedAlbumIds.has(album._id.toString())
        }));
    } catch (error) {
        console.error('Error fetching recent albums with like status:', error);
        const albums = await getRecentAlbums(limit);
        return albums.map(album => ({ ...album, isLiked: false }));
    }
}

export async function searchAlbumsWithLikeStatus(query: string, limit = 20): Promise<AlbumWithLikeStatus[]> {
    try {
        const { userId } = await auth();
        const albums = await searchAlbums(query, limit);

        if (!userId) {
            return albums.map(album => ({ ...album, isLiked: false }));
        }

        const db = await getDb();
        const likedAlbums = await db.collection(Collections.USER_LIKED_ALBUMS).find({
            userId: userId,
            albumId: { $in: albums.map(album => album._id) }
        }).toArray();

        const likedAlbumIds = new Set(likedAlbums.map(like => like.albumId.toString()));

        return albums.map(album => ({
            ...album,
            isLiked: likedAlbumIds.has(album._id.toString())
        }));
    } catch (error) {
        console.error('Error searching albums with like status:', error);
        const albums = await searchAlbums(query, limit);
        return albums.map(album => ({ ...album, isLiked: false }));
    }
}

export async function getAlbumsByArtistWithLikeStatus(artistId: string, limit = 50): Promise<AlbumWithLikeStatus[]> {
    try {
        const { userId } = await auth();
        const albums = await getAlbumsByArtist(artistId, limit);

        if (!userId) {
            return albums.map(album => ({ ...album, isLiked: false }));
        }

        const db = await getDb();
        const likedAlbums = await db.collection(Collections.USER_LIKED_ALBUMS).find({
            userId: userId
        }).toArray();

        const likedAlbumIds = new Set(likedAlbums.map(like => like.albumId.toString()));

        return albums.map(album => ({
            ...album,
            isLiked: likedAlbumIds.has(album._id.toString())
        }));
    } catch (error) {
        console.error('Error fetching albums by artist with like status:', error);
        const albums = await getAlbumsByArtist(artistId, limit);
        return albums.map(album => ({ ...album, isLiked: false }));
    }
}