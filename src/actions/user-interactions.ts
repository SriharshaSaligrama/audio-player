'use server';

import { auth } from '@clerk/nextjs/server';
import { getDb } from '@/lib/mongodb/client';
import { Collections } from '@/lib/constants/collections';
import { ObjectId } from 'mongodb';
import { CustomError, handleActionError } from '@/lib/utils/error-handler';

// Helper function to require authentication
async function requireAuth() {
    const { userId } = await auth();
    if (!userId) {
        throw new CustomError({
            message: 'Authentication required',
            statusCode: 401,
            type: 'AuthenticationError'
        });
    }
    return userId;
}



// Track Interactions
export async function likeTrack(trackId: string) {
    try {
        const userId = await requireAuth();
        const db = await getDb();

        // Validate trackId
        if (!ObjectId.isValid(trackId)) {
            throw new CustomError({
                message: 'Invalid track ID',
                statusCode: 400,
                type: 'ValidationError'
            });
        }

        // Check if already liked
        const existingLike = await db.collection(Collections.USER_LIKED_SONGS).findOne({
            userId: userId, // Store as string from Clerk
            trackId: new ObjectId(trackId)
        });

        if (existingLike) {
            // Unlike - remove the like
            await db.collection(Collections.USER_LIKED_SONGS).deleteOne({
                userId: userId,
                trackId: new ObjectId(trackId)
            });

            // Decrement track likes count (ensure it doesn't go below 0)
            const track = await db.collection(Collections.TRACKS).findOne({ _id: new ObjectId(trackId) });
            if (track && track.stats && track.stats.likes > 0) {
                await db.collection(Collections.TRACKS).updateOne(
                    { _id: new ObjectId(trackId) },
                    { $inc: { 'stats.likes': -1 } }
                );
            }

            return { success: true, liked: false, message: 'Track unliked' };
        } else {
            // Like - add the like
            const likeDocument = {
                userId: userId, // Store as string from Clerk
                trackId: new ObjectId(trackId),
                likedAt: new Date()
            };

            console.log('Inserting like document:', likeDocument);

            try {
                // First, let's check if the collection exists and what its current validator is
                const collections = await db.listCollections({ name: Collections.USER_LIKED_SONGS }).toArray();
                console.log('Collection info:', collections[0]);

                const insertResult = await db.collection(Collections.USER_LIKED_SONGS).insertOne(likeDocument);
                console.log('Insert result:', insertResult);
            } catch (insertError) {
                console.error('Error inserting like document:', insertError);
                console.error('Error details:', JSON.stringify(insertError, null, 2));
                throw insertError;
            }

            // Increment track likes count
            try {
                await db.collection(Collections.TRACKS).updateOne(
                    { _id: new ObjectId(trackId) },
                    { $inc: { 'stats.likes': 1 } }
                );
            } catch (statsError) {
                // If stats field doesn't exist, initialize it first
                console.log('Initializing stats for track:', trackId);
                console.error('Song Like error details:', JSON.stringify(statsError, null, 2));
                await db.collection(Collections.TRACKS).updateOne(
                    { _id: new ObjectId(trackId) },
                    {
                        $set: {
                            stats: { plays: 0, likes: 1, shares: 0, downloads: 0 }
                        }
                    }
                );
            }

            return { success: true, liked: true, message: 'Track liked' };
        }
    } catch (error) {
        console.error('Error in likeTrack:', error);
        try {
            handleActionError({ error, source: 'likeTrack', details: { trackId } });
        } catch (e) {
            const err = e as CustomError;
            return { success: false, message: err.message };
        }
        return { success: false, message: 'Failed to update track like status' };
    }
}

export async function isTrackLiked(trackId: string): Promise<boolean> {
    try {
        const { userId } = await auth();
        if (!userId) return false;

        const db = await getDb();
        const like = await db.collection(Collections.USER_LIKED_SONGS).findOne({
            userId: userId, // Store as string from Clerk
            trackId: new ObjectId(trackId)
        });

        return !!like;
    } catch (error) {
        console.error('Error checking if track is liked:', error);
        return false;
    }
}

// Album Interactions
export async function likeAlbum(albumId: string) {
    try {
        const userId = await requireAuth();
        const db = await getDb();

        // Validate albumId
        if (!ObjectId.isValid(albumId)) {
            throw new CustomError({
                message: 'Invalid album ID',
                statusCode: 400,
                type: 'ValidationError'
            });
        }

        // Check if already liked
        const existingLike = await db.collection(Collections.USER_LIKED_ALBUMS).findOne({
            userId: userId, // Store as string from Clerk
            albumId: new ObjectId(albumId)
        });

        if (existingLike) {
            // Unlike - remove the like
            await db.collection(Collections.USER_LIKED_ALBUMS).deleteOne({
                userId: userId,
                albumId: new ObjectId(albumId)
            });

            // Decrement album likes count (ensure it doesn't go below 0)
            const album = await db.collection(Collections.ALBUMS).findOne({ _id: new ObjectId(albumId) });
            if (album && album.stats && album.stats.likes > 0) {
                await db.collection(Collections.ALBUMS).updateOne(
                    { _id: new ObjectId(albumId) },
                    { $inc: { 'stats.likes': -1 } }
                );
            }

            return { success: true, liked: false, message: 'Album unliked' };
        } else {
            // Like - add the like
            const likeDocument = {
                userId: userId, // Store as string from Clerk
                albumId: new ObjectId(albumId),
                likedAt: new Date()
            };

            console.log('Inserting album like document:', likeDocument);

            try {
                const insertResult = await db.collection(Collections.USER_LIKED_ALBUMS).insertOne(likeDocument);
                console.log('Album insert result:', insertResult);
            } catch (insertError) {
                console.error('Error inserting album like document:', insertError);
                console.error('Album error details:', JSON.stringify(insertError, null, 2));
                throw insertError;
            }

            // Increment album likes count
            try {
                await db.collection(Collections.ALBUMS).updateOne(
                    { _id: new ObjectId(albumId) },
                    { $inc: { 'stats.likes': 1 } }
                );
            } catch (statsError) {
                // If stats field doesn't exist, initialize it first
                console.log('Initializing stats for album:', albumId);
                console.error('Album Like error details:', JSON.stringify(statsError, null, 2));

                await db.collection(Collections.ALBUMS).updateOne(
                    { _id: new ObjectId(albumId) },
                    {
                        $set: {
                            stats: { plays: 0, likes: 1, shares: 0 }
                        }
                    }
                );
            }

            return { success: true, liked: true, message: 'Album liked' };
        }
    } catch (error) {
        console.error('Error in likeAlbum:', error);
        try {
            handleActionError({ error, source: 'likeAlbum', details: { albumId } });
        } catch (e) {
            const err = e as CustomError;
            return { success: false, message: err.message };
        }
        return { success: false, message: 'Failed to update album like status' };
    }
}

export async function isAlbumLiked(albumId: string): Promise<boolean> {
    try {
        const { userId } = await auth();
        if (!userId) return false;

        const db = await getDb();
        const like = await db.collection(Collections.USER_LIKED_ALBUMS).findOne({
            userId: userId, // Store as string from Clerk
            albumId: new ObjectId(albumId)
        });

        return !!like;
    } catch (error) {
        console.error('Error checking if album is liked:', error);
        return false;
    }
}

// Artist Interactions
export async function followArtist(artistId: string) {
    try {
        const userId = await requireAuth();
        const db = await getDb();

        // Validate artistId
        if (!ObjectId.isValid(artistId)) {
            throw new CustomError({
                message: 'Invalid artist ID',
                statusCode: 400,
                type: 'ValidationError'
            });
        }

        // Check if already following
        const existingFollow = await db.collection(Collections.USER_LIKED_ARTISTS).findOne({
            userId: userId, // Store as string from Clerk
            artistId: new ObjectId(artistId)
        });

        if (existingFollow) {
            // Unfollow - remove the follow
            await db.collection(Collections.USER_LIKED_ARTISTS).deleteOne({
                userId: userId,
                artistId: new ObjectId(artistId)
            });

            // Decrement artist followers count (ensure it doesn't go below 0)
            const artist = await db.collection(Collections.ARTISTS).findOne({ _id: new ObjectId(artistId) });
            if (artist && artist.stats && artist.stats.followers > 0) {
                await db.collection(Collections.ARTISTS).updateOne(
                    { _id: new ObjectId(artistId) },
                    { $inc: { 'stats.followers': -1 } }
                );
            }

            return { success: true, following: false, message: 'Artist unfollowed' };
        } else {
            // Follow - add the follow
            const followDocument = {
                userId: userId, // Store as string from Clerk
                artistId: new ObjectId(artistId),
                likedAt: new Date() // Using 'likedAt' to match schema
            };

            console.log('Inserting artist follow document:', followDocument);

            try {
                const insertResult = await db.collection(Collections.USER_LIKED_ARTISTS).insertOne(followDocument);
                console.log('Artist follow insert result:', insertResult);
            } catch (insertError) {
                console.error('Error inserting artist follow document:', insertError);
                console.error('Artist error details:', JSON.stringify(insertError, null, 2));
                throw insertError;
            }

            // Increment artist followers count
            try {
                await db.collection(Collections.ARTISTS).updateOne(
                    { _id: new ObjectId(artistId) },
                    { $inc: { 'stats.followers': 1 } }
                );
            } catch (statsError) {
                // If stats field doesn't exist, initialize it first
                console.log('Initializing stats for artist:', artistId);
                console.error('Follow Artist error details:', JSON.stringify(statsError, null, 2));

                await db.collection(Collections.ARTISTS).updateOne(
                    { _id: new ObjectId(artistId) },
                    {
                        $set: {
                            stats: { followers: 1, totalPlays: 0, totalTracks: 0, totalAlbums: 0 }
                        }
                    }
                );
            }

            return { success: true, following: true, message: 'Artist followed' };
        }
    } catch (error) {
        console.error('Error in followArtist:', error);
        try {
            handleActionError({ error, source: 'followArtist', details: { artistId } });
        } catch (e) {
            const err = e as CustomError;
            return { success: false, message: err.message };
        }
        return { success: false, message: 'Failed to update artist follow status' };
    }
}

export async function isArtistFollowed(artistId: string): Promise<boolean> {
    try {
        const { userId } = await auth();
        if (!userId) return false;

        const db = await getDb();
        const follow = await db.collection(Collections.USER_LIKED_ARTISTS).findOne({
            userId: userId, // Store as string from Clerk
            artistId: new ObjectId(artistId)
        });

        return !!follow;
    } catch (error) {
        console.error('Error checking if artist is followed:', error);
        return false;
    }
}

// Play History
export async function addToPlayHistory(trackId: string) {
    try {
        const userId = await requireAuth();
        const db = await getDb();

        // Add to play history
        await db.collection(Collections.PLAY_HISTORY).insertOne({
            userId: userId, // Store as string from Clerk
            trackId: new ObjectId(trackId),
            playedAt: new Date()
        });

        // Increment track play count
        await db.collection(Collections.TRACKS).updateOne(
            { _id: new ObjectId(trackId) },
            { $inc: { 'stats.plays': 1 } }
        );

        // Also increment artist and album play counts
        const track = await db.collection(Collections.TRACKS).findOne({ _id: new ObjectId(trackId) });
        if (track) {
            // Increment artist play counts
            if (track.artists && track.artists.length > 0) {
                await db.collection(Collections.ARTISTS).updateMany(
                    { _id: { $in: track.artists } },
                    { $inc: { 'stats.totalPlays': 1 } }
                );
            }

            // Increment album play counts
            if (track.albums && track.albums.length > 0) {
                await db.collection(Collections.ALBUMS).updateMany(
                    { _id: { $in: track.albums } },
                    { $inc: { 'stats.plays': 1 } }
                );
            }
        }

        return { success: true, message: 'Added to play history' };
    } catch (error) {
        try {
            handleActionError({ error, source: 'addToPlayHistory', details: { trackId } });
        } catch (e) {
            const err = e as CustomError;
            return { success: false, message: err.message };
        }
        return { success: false, message: 'Unknown error' };
    }
}

// Share functionality
export async function shareContent(contentType: 'track' | 'album' | 'artist', contentId: string) {
    try {
        const db = await getDb();

        // Increment share count based on content type
        let collection: string;
        switch (contentType) {
            case 'track':
                collection = Collections.TRACKS;
                break;
            case 'album':
                collection = Collections.ALBUMS;
                break;
            case 'artist':
                // Artists don't have share stats in the current schema, but we can track it
                return { success: true, message: 'Artist shared', shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/artists/${contentId}` };
            default:
                throw new CustomError({ message: 'Invalid content type', statusCode: 400, type: 'ValidationError' });
        }

        await db.collection(collection).updateOne(
            { _id: new ObjectId(contentId) },
            { $inc: { 'stats.shares': 1 } }
        );

        // Generate share URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const shareUrl = `${baseUrl}/${contentType}s/${contentId}`;

        return { success: true, message: `${contentType} shared`, shareUrl };
    } catch (error) {
        try {
            handleActionError({ error, source: 'shareContent', details: { contentType, contentId } });
        } catch (e) {
            const err = e as CustomError;
            return { success: false, message: err.message };
        }
        return { success: false, message: 'Unknown error' };
    }
}

// Download functionality (placeholder - would need actual file serving logic)
export async function downloadTrack(trackId: string) {
    try {
        const db = await getDb();

        // Get track info
        const track = await db.collection(Collections.TRACKS).findOne({ _id: new ObjectId(trackId) });
        if (!track) {
            throw new CustomError({ message: 'Track not found', statusCode: 404, type: 'NotFoundError' });
        }

        // Increment download count
        await db.collection(Collections.TRACKS).updateOne(
            { _id: new ObjectId(trackId) },
            { $inc: { 'stats.downloads': 1 } }
        );

        // In a real implementation, you would:
        // 1. Check user permissions/subscription
        // 2. Generate a secure download URL
        // 3. Log the download for analytics
        // 4. Return the actual file URL or stream

        return {
            success: true,
            message: 'Download started',
            downloadUrl: track.fileUrl, // In production, this would be a secure URL
            filename: `${track.title}.mp3`
        };
    } catch (error) {
        try {
            handleActionError({ error, source: 'downloadTrack', details: { trackId } });
        } catch (e) {
            const err = e as CustomError;
            return { success: false, message: err.message };
        }
        return { success: false, message: 'Unknown error' };
    }
}

// Get user's liked content
export async function getUserLikedTracks(limit = 50, skip = 0) {
    try {
        const userId = await requireAuth();
        const db = await getDb();

        const likedTracks = await db.collection(Collections.USER_LIKED_SONGS).aggregate([
            { $match: { userId } },
            { $sort: { likedAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: Collections.TRACKS,
                    localField: 'trackId',
                    foreignField: '_id',
                    as: 'track'
                }
            },
            { $unwind: '$track' },
            {
                $lookup: {
                    from: Collections.ARTISTS,
                    localField: 'track.artists',
                    foreignField: '_id',
                    as: 'track.artistDetails'
                }
            },
            {
                $lookup: {
                    from: Collections.ALBUMS,
                    localField: 'track.defaultAlbum',
                    foreignField: '_id',
                    as: 'track.defaultAlbumDetails'
                }
            },
            {
                $addFields: {
                    'track.defaultAlbumDetails': { $arrayElemAt: ['$track.defaultAlbumDetails', 0] }
                }
            },
            { $replaceRoot: { newRoot: '$track' } }
        ]).toArray();

        return likedTracks;
    } catch (error) {
        try {
            handleActionError({ error, source: 'getUserLikedTracks' });
        } catch (e) {
            console.error('Error getting user liked tracks:', e);
        }
        return [];
    }
}

export async function getUserLikedAlbums(limit = 50, skip = 0) {
    try {
        const userId = await requireAuth();
        const db = await getDb();

        const likedAlbums = await db.collection(Collections.USER_LIKED_ALBUMS).aggregate([
            { $match: { userId } },
            { $sort: { likedAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: Collections.ALBUMS,
                    localField: 'albumId',
                    foreignField: '_id',
                    as: 'album'
                }
            },
            { $unwind: '$album' },
            {
                $lookup: {
                    from: Collections.ARTISTS,
                    localField: 'album.artists',
                    foreignField: '_id',
                    as: 'album.artistDetails'
                }
            },
            { $replaceRoot: { newRoot: '$album' } }
        ]).toArray();

        return likedAlbums;
    } catch (error) {
        try {
            handleActionError({ error, source: 'getUserLikedAlbums' });
        } catch (e) {
            console.error('Error getting user liked albums:', e);
        }
        return [];
    }
}

export async function getUserFollowedArtists(limit = 50, skip = 0) {
    try {
        const userId = await requireAuth();
        const db = await getDb();

        const followedArtists = await db.collection(Collections.USER_LIKED_ARTISTS).aggregate([
            { $match: { userId } },
            { $sort: { likedAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: Collections.ARTISTS,
                    localField: 'artistId',
                    foreignField: '_id',
                    as: 'artist'
                }
            },
            { $unwind: '$artist' },
            { $replaceRoot: { newRoot: '$artist' } }
        ]).toArray();

        return followedArtists;
    } catch (error) {
        try {
            handleActionError({ error, source: 'getUserFollowedArtists' });
        } catch (e) {
            console.error('Error getting user followed artists:', e);
        }
        return [];
    }
}