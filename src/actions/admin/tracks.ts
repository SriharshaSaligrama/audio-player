'use server';

import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb/client';
import { CustomError, handleActionError, validateRequiredFields } from '@/lib/utils/error-handler';
import { requireAdmin, withTransaction } from './utils';
import { Collections } from '@/lib/constants/collections';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export type TrackFormState = {
    success: boolean;
    message?: string;
    errors?: Record<string, string>;
    data?: Record<string, unknown>;
};

const initialState: TrackFormState = { success: false };

export async function createTrack(_prev: TrackFormState = initialState, formData: FormData): Promise<TrackFormState> {
    try {
        await requireAdmin();
        const payload = {
            title: String(formData.get('title') || ''),
            artistIds: (formData.getAll('artistIds') || []).map(String).filter(Boolean),
            albumIds: (formData.getAll('albumIds') || []).map(String).filter(Boolean),
            defaultAlbum: String(formData.get('defaultAlbum') || ''),
            releaseDate: formData.get('releaseDate') ? new Date(String(formData.get('releaseDate'))) : new Date(),
            duration: formData.get('duration') ? Number(formData.get('duration')) : 0,
            fileSize: formData.get('fileSize') ? Number(formData.get('fileSize')) : 0,
            fileUrl: String(formData.get('fileUrl') || ''),
            coverImage: String(formData.get('coverImage') || ''),
            genres: (formData.getAll('genres') || []).map(String).filter(Boolean),
            tags: (String(formData.get('tags') || '')).split(',').map((t) => t.trim()).filter(Boolean),
        };

        validateRequiredFields({
            obj: payload as Record<string, unknown>,
            fields: ['title', 'artistIds', 'albumIds', 'defaultAlbum', 'releaseDate', 'fileUrl'],
            errorMessages: {
                title: 'Title is required',
                artistIds: 'At least one artist is required',
                albumIds: 'At least one album is required',
                defaultAlbum: 'Default album is required',
                releaseDate: 'Release date is required',
                fileUrl: 'Audio file is required',
            },
            type: 'ValidationError',
            statusCode: 400,
        });

        const db = await getDb();

        const now = new Date();
        const trackDoc = {
            title: payload.title,
            artists: payload.artistIds.map((id) => new ObjectId(id)),
            albums: payload.albumIds.map((id) => new ObjectId(id)),
            defaultAlbum: new ObjectId(payload.defaultAlbum),
            genres: payload.genres,
            releaseDate: payload.releaseDate,
            duration: payload.duration,
            fileSize: payload.fileSize,
            fileUrl: payload.fileUrl,
            coverImage: payload.coverImage || '',
            tags: payload.tags,
            stats: { plays: 0, likes: 0, shares: 0, downloads: 0 },
            createdAt: now,
            updatedAt: now,
            isDeleted: false,
            deletedAt: null,
        } as const;

        await withTransaction(async ({ session }) => {
            const insert = await db.collection(Collections.TRACKS).insertOne(trackDoc, { session });

            // Update album statistics for all albums this track belongs to
            if (payload.albumIds.length > 0 && payload.duration > 0) {
                await db.collection(Collections.ALBUMS).updateMany(
                    { _id: { $in: payload.albumIds.map(id => new ObjectId(id)) } },
                    {
                        $inc: {
                            totalTracks: 1,
                            totalDuration: payload.duration
                        }
                    },
                    { session }
                );
            }

            // Update artist statistics for all artists this track belongs to
            if (payload.artistIds.length > 0) {
                await db.collection(Collections.ARTISTS).updateMany(
                    { _id: { $in: payload.artistIds.map(id => new ObjectId(id)) } },
                    {
                        $inc: {
                            'stats.totalTracks': 1,
                            'stats.totalPlays': 0 // Initialize if not exists, but don't increment
                        }
                    },
                    { session }
                );
            }

            return insert;
        });

        // Track creation completed successfully
    } catch (error) {
        try {
            handleActionError({ error, source: 'createTrack' });
        } catch (e) {
            const err = e as CustomError;
            return { success: false, message: err.message, errors: { _form: err.message } };
        }
        return { success: false, message: 'Unknown error' };
    }

    try {
        (await cookies()).set('admin_success_message', 'track_created', {
            httpOnly: false,
            secure: false,
            maxAge: 5,
            path: '/'
        });
        revalidatePath('/admin/tracks');
    } catch (error) {
        console.error('Error setting cookie or revalidating:', error);
    }
    redirect('/admin/tracks');
}

export async function updateTrack(_prev: TrackFormState = initialState, formData: FormData): Promise<TrackFormState> {
    try {
        await requireAdmin();
        const id = String(formData.get('id') || '');
        if (!id) throw new CustomError({ message: 'Missing track id', statusCode: 400, type: 'ValidationError' });

        const payload = {
            title: String(formData.get('title') || ''),
            artistIds: (formData.getAll('artistIds') || []).map(String).filter(Boolean),
            albumIds: (formData.getAll('albumIds') || []).map(String).filter(Boolean),
            defaultAlbum: String(formData.get('defaultAlbum') || ''),
            releaseDate: formData.get('releaseDate') ? new Date(String(formData.get('releaseDate'))) : undefined,
            duration: formData.get('duration') ? Number(formData.get('duration')) : 0,
            fileSize: formData.get('fileSize') ? Number(formData.get('fileSize')) : 0,
            fileUrl: String(formData.get('fileUrl') || ''),
            coverImage: String(formData.get('coverImage') || ''),
            genres: (formData.getAll('genres') || []).map(String).filter(Boolean),
            tags: (String(formData.get('tags') || '')).split(',').map((t) => t.trim()).filter(Boolean),
        };

        validateRequiredFields({
            obj: payload as Record<string, unknown>,
            fields: ['title', 'artistIds', 'albumIds', 'defaultAlbum', 'releaseDate', 'fileUrl'],
        });

        const db = await getDb();
        const now = new Date();

        await withTransaction(async ({ session }) => {
            // Get the current track to compare album changes
            const currentTrack = await db.collection(Collections.TRACKS).findOne(
                { _id: new ObjectId(id) },
                { session }
            );

            if (!currentTrack) {
                throw new CustomError({ message: 'Track not found', statusCode: 404, type: 'NotFoundError' });
            }

            const currentAlbumIds = (currentTrack.albums as ObjectId[]).map(id => id.toString());
            const newAlbumIds = payload.albumIds;
            const currentArtistIds = (currentTrack.artists as ObjectId[]).map(id => id.toString());
            const newArtistIds = payload.artistIds;
            const currentDuration = currentTrack.duration || 0;
            const newDuration = payload.duration || 0;

            // Update the track
            await db.collection(Collections.TRACKS).updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        title: payload.title,
                        artists: payload.artistIds.map((oid) => new ObjectId(oid)),
                        albums: payload.albumIds.map((oid) => new ObjectId(oid)),
                        defaultAlbum: new ObjectId(payload.defaultAlbum),
                        genres: payload.genres,
                        releaseDate: payload.releaseDate,
                        duration: newDuration,
                        fileSize: payload.fileSize,
                        fileUrl: payload.fileUrl,
                        coverImage: payload.coverImage || '',
                        tags: payload.tags,
                        updatedAt: now,
                    },
                },
                { session }
            );

            // Handle album statistics updates
            const albumsToRemove = currentAlbumIds.filter(id => !newAlbumIds.includes(id));
            const albumsToAdd = newAlbumIds.filter(id => !currentAlbumIds.includes(id));
            const albumsToUpdate = currentAlbumIds.filter(id => newAlbumIds.includes(id));

            // Remove track from old albums
            if (albumsToRemove.length > 0) {
                await db.collection(Collections.ALBUMS).updateMany(
                    { _id: { $in: albumsToRemove.map(id => new ObjectId(id)) } },
                    {
                        $inc: {
                            totalTracks: -1,
                            totalDuration: -currentDuration
                        }
                    },
                    { session }
                );
            }

            // Add track to new albums
            if (albumsToAdd.length > 0) {
                await db.collection(Collections.ALBUMS).updateMany(
                    { _id: { $in: albumsToAdd.map(id => new ObjectId(id)) } },
                    {
                        $inc: {
                            totalTracks: 1,
                            totalDuration: newDuration
                        }
                    },
                    { session }
                );
            }

            // Update duration for albums that remain
            if (albumsToUpdate.length > 0 && currentDuration !== newDuration) {
                const durationDiff = newDuration - currentDuration;
                await db.collection(Collections.ALBUMS).updateMany(
                    { _id: { $in: albumsToUpdate.map(id => new ObjectId(id)) } },
                    {
                        $inc: {
                            totalDuration: durationDiff
                        }
                    },
                    { session }
                );
            }

            // Handle artist statistics updates
            const artistsToRemove = currentArtistIds.filter(id => !newArtistIds.includes(id));
            const artistsToAdd = newArtistIds.filter(id => !currentArtistIds.includes(id));

            // Remove track from old artists
            if (artistsToRemove.length > 0) {
                await db.collection(Collections.ARTISTS).updateMany(
                    { _id: { $in: artistsToRemove.map(id => new ObjectId(id)) } },
                    {
                        $inc: {
                            'stats.totalTracks': -1
                        }
                    },
                    { session }
                );
            }

            // Add track to new artists
            if (artistsToAdd.length > 0) {
                await db.collection(Collections.ARTISTS).updateMany(
                    { _id: { $in: artistsToAdd.map(id => new ObjectId(id)) } },
                    {
                        $inc: {
                            'stats.totalTracks': 1
                        }
                    },
                    { session }
                );
            }
        });
    } catch (error) {
        try {
            handleActionError({ error, source: 'updateTrack' });
        } catch (e) {
            const err = e as CustomError;
            return { success: false, message: err.message, errors: { _form: err.message } };
        }
        return { success: false, message: 'Unknown error' };
    }

    try {
        (await cookies()).set('admin_success_message', 'track_updated', {
            httpOnly: false,
            secure: false,
            maxAge: 5,
            path: '/'
        });
        revalidatePath('/admin/tracks');
    } catch (error) {
        console.error('Error setting cookie or revalidating:', error);
    }
    redirect('/admin/tracks');
}

export async function softDeleteTrack(trackId: string, reason: string) {
    try {
        await requireAdmin();
        if (!trackId) throw new CustomError({ message: 'Missing track id', statusCode: 400, type: 'ValidationError' });
        const db = await getDb();

        await withTransaction(async ({ session }) => {
            // Get the track to update album statistics
            const track = await db.collection(Collections.TRACKS).findOne(
                { _id: new ObjectId(trackId) },
                { session }
            );

            if (!track) {
                throw new CustomError({ message: 'Track not found', statusCode: 404, type: 'NotFoundError' });
            }

            // Soft delete the track
            await db.collection(Collections.TRACKS).updateOne(
                { _id: new ObjectId(trackId) },
                { $set: { isDeleted: true, deletedAt: new Date(), takedownReason: reason } },
                { session }
            );

            // Update album statistics
            if (track.albums && track.albums.length > 0 && track.duration) {
                await db.collection(Collections.ALBUMS).updateMany(
                    { _id: { $in: track.albums } },
                    {
                        $inc: {
                            totalTracks: -1,
                            totalDuration: -(track.duration || 0)
                        }
                    },
                    { session }
                );
            }

            // Update artist statistics
            if (track.artists && track.artists.length > 0) {
                await db.collection(Collections.ARTISTS).updateMany(
                    { _id: { $in: track.artists } },
                    {
                        $inc: {
                            'stats.totalTracks': -1
                        }
                    },
                    { session }
                );
            }
        });
    } catch (error) {
        try { handleActionError({ error, source: 'softDeleteTrack', details: { trackId, reason } }); } catch (e) { const err = e as CustomError; return { success: false, message: err.message }; }
    }

    try {
        (await cookies()).set('admin_success_message', 'track_deleted', {
            httpOnly: false,
            secure: false,
            maxAge: 5,
            path: '/'
        });
        revalidatePath('/admin/tracks');
    } catch (error) {
        console.error('Error setting cookie or revalidating:', error);
    }
    redirect('/admin/tracks');
}

/**
 * Recalculate artist statistics based on current tracks and albums
 * This can be used to fix any inconsistencies in artist totals
 */
export async function recalculateArtistStatistics(artistId?: string) {
    try {
        await requireAdmin();
        const db = await getDb();

        const artistFilter = artistId ? { _id: new ObjectId(artistId) } : {};
        const artists = await db.collection(Collections.ARTISTS).find(artistFilter).toArray();

        for (const artist of artists) {
            // Get all non-deleted tracks for this artist
            const tracks = await db.collection(Collections.TRACKS).find({
                artists: artist._id,
                $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
            }).toArray();

            // Get all non-deleted albums for this artist
            const albums = await db.collection(Collections.ALBUMS).find({
                artists: artist._id,
                $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
            }).toArray();

            const totalTracks = tracks.length;
            const totalAlbums = albums.length;

            // Update the artist with correct statistics
            await db.collection(Collections.ARTISTS).updateOne(
                { _id: artist._id },
                {
                    $set: {
                        'stats.totalTracks': totalTracks,
                        'stats.totalAlbums': totalAlbums,
                        updatedAt: new Date()
                    }
                }
            );
        }

        return { success: true, message: `Updated statistics for ${artists.length} artist(s)` };
    } catch (error) {
        try {
            handleActionError({ error, source: 'recalculateArtistStatistics', details: { artistId } });
        } catch (e) {
            const err = e as CustomError;
            return { success: false, message: err.message };
        }
        return { success: false, message: 'Unknown error' };
    }
}

/**
 * Recalculate album statistics based on current tracks
 * This can be used to fix any inconsistencies in album totals
 */
export async function recalculateAlbumStatistics(albumId?: string) {
    try {
        await requireAdmin();
        const db = await getDb();

        const albumFilter = albumId ? { _id: new ObjectId(albumId) } : {};
        const albums = await db.collection(Collections.ALBUMS).find(albumFilter).toArray();

        for (const album of albums) {
            // Get all non-deleted tracks for this album
            const tracks = await db.collection(Collections.TRACKS).find({
                albums: album._id,
                $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
            }).toArray();

            const totalTracks = tracks.length;
            const totalDuration = tracks.reduce((sum, track) => sum + (track.duration || 0), 0);

            // Update the album with correct statistics
            await db.collection(Collections.ALBUMS).updateOne(
                { _id: album._id },
                {
                    $set: {
                        totalTracks,
                        totalDuration,
                        updatedAt: new Date()
                    }
                }
            );
        }

        return { success: true, message: `Updated statistics for ${albums.length} album(s)` };
    } catch (error) {
        try {
            handleActionError({ error, source: 'recalculateAlbumStatistics', details: { albumId } });
        } catch (e) {
            const err = e as CustomError;
            return { success: false, message: err.message };
        }
        return { success: false, message: 'Unknown error' };
    }
}

/**
 * Recalculate track statistics based on actual user interactions
 * This fixes inconsistencies between track stats and user interaction collections
 */
export async function recalculateTrackStatistics(trackId?: string) {
    try {
        await requireAdmin();
        const db = await getDb();

        const trackFilter = trackId ? { _id: new ObjectId(trackId) } : {};
        const tracks = await db.collection(Collections.TRACKS).find(trackFilter).toArray();

        for (const track of tracks) {
            // Count actual likes from user_liked_songs collection
            const actualLikes = await db.collection(Collections.USER_LIKED_SONGS).countDocuments({
                trackId: track._id
            });

            // Count actual plays from play_history collection
            const actualPlays = await db.collection(Collections.PLAY_HISTORY).countDocuments({
                trackId: track._id
            });

            // Update the track with correct statistics
            await db.collection(Collections.TRACKS).updateOne(
                { _id: track._id },
                {
                    $set: {
                        'stats.likes': actualLikes,
                        'stats.plays': actualPlays,
                        updatedAt: new Date()
                    }
                }
            );
        }

        return { success: true, message: `Updated statistics for ${tracks.length} track(s)` };
    } catch (error) {
        try {
            handleActionError({ error, source: 'recalculateTrackStatistics', details: { trackId } });
        } catch (e) {
            const err = e as CustomError;
            return { success: false, message: err.message };
        }
        return { success: false, message: 'Unknown error' };
    }
}