'use server';

import { getDb } from '@/lib/mongodb/client';
import { Collections } from '@/lib/constants/collections';
import { ObjectId } from 'mongodb';
import { Artist } from '@/lib/mongodb/schemas';
import { auth } from '@clerk/nextjs/server';

export type ArtistWithFollowStatus = Artist & {
    isFollowed: boolean;
};

export async function getPublicArtists(limit = 50, skip = 0): Promise<Artist[]> {
    try {
        const db = await getDb();

        const artists = await db.collection(Collections.ARTISTS).find<Artist>({
            $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
        })
            .sort({ 'stats.followers': -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        return artists;
    } catch (error) {
        console.error('Error fetching public artists:', error);
        return [];
    }
}

export async function getArtistById(id: string): Promise<Artist | null> {
    try {
        const db = await getDb();

        const artist = await db.collection(Collections.ARTISTS).findOne<Artist>({
            _id: new ObjectId(id),
            $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
        });

        return artist;
    } catch (error) {
        console.error('Error fetching artist by ID:', error);
        return null;
    }
}

export async function searchArtists(query: string, limit = 20): Promise<Artist[]> {
    try {
        if (!query.trim()) return [];

        const db = await getDb();

        const artists = await db.collection(Collections.ARTISTS).find<Artist>({
            $and: [
                { $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }] },
                {
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { bio: { $regex: query, $options: 'i' } },
                        { genres: { $regex: query, $options: 'i' } }
                    ]
                }
            ]
        })
            .limit(limit)
            .toArray();

        return artists;
    } catch (error) {
        console.error('Error searching artists:', error);
        return [];
    }
}

export async function getTrendingArtists(limit = 20): Promise<Artist[]> {
    try {
        const db = await getDb();

        const artists = await db.collection(Collections.ARTISTS).find<Artist>({
            $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
        })
            .sort({
                'stats.totalPlays': -1,
                'stats.followers': -1,
                'stats.totalTracks': -1
            })
            .limit(limit)
            .toArray();

        return artists;
    } catch (error) {
        console.error('Error fetching trending artists:', error);
        return [];
    }
}

export async function getFeaturedArtists(limit = 10): Promise<Artist[]> {
    try {
        const db = await getDb();

        // Get artists with high engagement and content
        const artists = await db.collection(Collections.ARTISTS).aggregate<Artist>([
            {
                $match: {
                    $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
                }
            },
            {
                $addFields: {
                    // Calculate a featured score based on various metrics
                    featuredScore: {
                        $add: [
                            { $multiply: [{ $ifNull: ["$stats.totalPlays", 0] }, 0.4] },
                            { $multiply: [{ $ifNull: ["$stats.followers", 0] }, 0.3] },
                            { $multiply: [{ $ifNull: ["$stats.totalTracks", 0] }, 0.2] },
                            { $multiply: [{ $ifNull: ["$stats.totalAlbums", 0] }, 0.1] }
                        ]
                    }
                }
            },
            {
                $match: {
                    avatar: { $exists: true, $ne: "" }, // Only artists with avatars for featured
                    "stats.totalTracks": { $gt: 0 } // Only artists with tracks
                }
            },
            { $sort: { featuredScore: -1 } },
            { $limit: limit }
        ]).toArray();

        return artists;
    } catch (error) {
        console.error('Error fetching featured artists:', error);
        return [];
    }
}

export async function getArtistsByGenre(genre: string, limit = 20): Promise<Artist[]> {
    try {
        const db = await getDb();

        const artists = await db.collection(Collections.ARTISTS).find<Artist>({
            $and: [
                { $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }] },
                { genres: { $regex: genre, $options: 'i' } }
            ]
        })
            .sort({ 'stats.followers': -1 })
            .limit(limit)
            .toArray();

        return artists;
    } catch (error) {
        console.error('Error fetching artists by genre:', error);
        return [];
    }
}

export async function getPopularArtists(limit = 20): Promise<Artist[]> {
    try {
        const db = await getDb();

        const artists = await db.collection(Collections.ARTISTS).find<Artist>({
            $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
        })
            .sort({ 'stats.followers': -1, 'stats.totalPlays': -1 })
            .limit(limit)
            .toArray();

        return artists;
    } catch (error) {
        console.error('Error fetching popular artists:', error);
        return [];
    }
}

export async function getNewArtists(limit = 20): Promise<Artist[]> {
    try {
        const db = await getDb();

        const artists = await db.collection(Collections.ARTISTS).find<Artist>({
            $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .toArray();

        return artists;
    } catch (error) {
        console.error('Error fetching new artists:', error);
        return [];
    }
}

// Enhanced functions with follow status
export async function getFeaturedArtistsWithFollowStatus(limit = 10): Promise<ArtistWithFollowStatus[]> {
    try {
        const { userId } = await auth();
        const db = await getDb();
        const { serializeForClient } = await import('@/lib/utils/serialization');

        const artists = await getFeaturedArtists(limit);

        if (!userId) {
            const artistsWithFollowStatus = artists.map(artist => ({ ...artist, isFollowed: false }));
            return serializeForClient(artistsWithFollowStatus);
        }

        // Get user's followed artists
        const followedArtists = await db.collection(Collections.USER_LIKED_ARTISTS).find({
            userId: userId,
            artistId: { $in: artists.map(artist => artist._id) }
        }).toArray();

        const followedArtistIds = new Set(followedArtists.map(follow => follow.artistId.toString()));

        const artistsWithFollowStatus = artists.map(artist => ({
            ...artist,
            isFollowed: followedArtistIds.has(artist._id.toString())
        }));

        return serializeForClient(artistsWithFollowStatus);
    } catch (error) {
        console.error('Error fetching featured artists with follow status:', error);
        const { serializeForClient } = await import('@/lib/utils/serialization');
        return serializeForClient([]);
    }
}

export async function searchArtistsWithFollowStatus(query: string, limit = 20): Promise<ArtistWithFollowStatus[]> {
    try {
        const { userId } = await auth();
        const artists = await searchArtists(query, limit);
        const { serializeForClient } = await import('@/lib/utils/serialization');

        if (!userId) {
            const artistsWithFollowStatus = artists.map(artist => ({ ...artist, isFollowed: false }));
            return serializeForClient(artistsWithFollowStatus);
        }

        const db = await getDb();
        const followedArtists = await db.collection(Collections.USER_LIKED_ARTISTS).find({
            userId: userId,
            artistId: { $in: artists.map(artist => artist._id) }
        }).toArray();

        const followedArtistIds = new Set(followedArtists.map(follow => follow.artistId.toString()));

        const artistsWithFollowStatus = artists.map(artist => ({
            ...artist,
            isFollowed: followedArtistIds.has(artist._id.toString())
        }));

        return serializeForClient(artistsWithFollowStatus);
    } catch (error) {
        console.error('Error searching artists with follow status:', error);
        const artists = await searchArtists(query, limit);
        const { serializeForClient } = await import('@/lib/utils/serialization');
        const artistsWithFollowStatus = artists.map(artist => ({ ...artist, isFollowed: false }));
        return serializeForClient(artistsWithFollowStatus);
    }
}

export async function getTrendingArtistsWithFollowStatus(limit = 20): Promise<ArtistWithFollowStatus[]> {
    try {
        const { userId } = await auth();
        const artists = await getTrendingArtists(limit);
        const { serializeForClient } = await import('@/lib/utils/serialization');

        if (!userId) {
            const artistsWithFollowStatus = artists.map(artist => ({ ...artist, isFollowed: false }));
            return serializeForClient(artistsWithFollowStatus);
        }

        const db = await getDb();
        const followedArtists = await db.collection(Collections.USER_LIKED_ARTISTS).find({
            userId: userId,
            artistId: { $in: artists.map(artist => artist._id) }
        }).toArray();

        const followedArtistIds = new Set(followedArtists.map(follow => follow.artistId.toString()));

        const artistsWithFollowStatus = artists.map(artist => ({
            ...artist,
            isFollowed: followedArtistIds.has(artist._id.toString())
        }));

        return serializeForClient(artistsWithFollowStatus);
    } catch (error) {
        console.error('Error fetching trending artists with follow status:', error);
        const artists = await getTrendingArtists(limit);
        const { serializeForClient } = await import('@/lib/utils/serialization');
        const artistsWithFollowStatus = artists.map(artist => ({ ...artist, isFollowed: false }));
        return serializeForClient(artistsWithFollowStatus);
    }
}

export async function getPublicArtistsWithFollowStatus(limit = 50, skip = 0): Promise<ArtistWithFollowStatus[]> {
    try {
        const { userId } = await auth();
        const db = await getDb();
        const { serializeForClient } = await import('@/lib/utils/serialization');

        const artists = await getPublicArtists(limit, skip);

        if (!userId) {
            const artistsWithFollowStatus = artists.map(artist => ({ ...artist, isFollowed: false }));
            return serializeForClient(artistsWithFollowStatus);
        }

        // Get user's followed artists
        const followedArtists = await db.collection(Collections.USER_LIKED_ARTISTS).find({
            userId: userId,
            artistId: { $in: artists.map(artist => artist._id) }
        }).toArray();

        const followedArtistIds = new Set(followedArtists.map(follow => follow.artistId.toString()));

        const artistsWithFollowStatus = artists.map(artist => ({
            ...artist,
            isFollowed: followedArtistIds.has(artist._id.toString())
        }));

        return serializeForClient(artistsWithFollowStatus);
    } catch (error) {
        console.error('Error fetching artists with follow status:', error);
        const { serializeForClient } = await import('@/lib/utils/serialization');
        return serializeForClient([]);
    }
}