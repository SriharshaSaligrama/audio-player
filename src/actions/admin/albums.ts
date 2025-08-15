'use server';

import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb/client';
import { CustomError, handleActionError, validateRequiredFields } from '@/lib/utils/error-handler';
import { requireAdmin } from './utils';
import { Collections } from '@/lib/constants/collections';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export type AlbumFormState = {
    success: boolean;
    message?: string;
    errors?: Record<string, string>;
    data?: Record<string, unknown>;
};

const initialState: AlbumFormState = { success: false };

export async function createAlbum(_prev: AlbumFormState = initialState, formData: FormData): Promise<AlbumFormState> {
    try {
        await requireAdmin();
        const payload = {
            title: String(formData.get('title') || ''),
            artistIds: (formData.getAll('artistIds') || []).map(String).filter(Boolean),
            releaseDate: formData.get('releaseDate') ? new Date(String(formData.get('releaseDate'))) : new Date(),
            coverImage: String(formData.get('coverImage') || ''),
            description: String(formData.get('description') || ''),
            genres: (formData.getAll('genres') || []).map(String).filter(Boolean),
            label: String(formData.get('label') || ''),
        };

        validateRequiredFields({ obj: payload, fields: ['title', 'artistIds', 'releaseDate'] });
        const db = await getDb();
        const now = new Date();
        const doc = {
            title: payload.title,
            artists: payload.artistIds.map((oid) => new ObjectId(oid)),
            releaseDate: payload.releaseDate,
            coverImage: payload.coverImage || '',
            description: payload.description || '',
            genres: payload.genres,
            label: payload.label || '',
            totalTracks: 0,
            totalDuration: 0,
            stats: { plays: 0, likes: 0, shares: 0 },
            createdAt: now,
            updatedAt: now,
            isDeleted: false,
            deletedAt: null,
        };
        await db.collection(Collections.ALBUMS).insertOne(doc);

        // Update artist statistics - increment totalAlbums for all artists in this album
        if (payload.artistIds.length > 0) {
            await db.collection(Collections.ARTISTS).updateMany(
                { _id: { $in: payload.artistIds.map(id => new ObjectId(id)) } },
                {
                    $inc: {
                        'stats.totalAlbums': 1
                    }
                }
            );
        }
    } catch (error) {
        try { handleActionError({ error, source: 'createAlbum' }); } catch (e) { const err = e as CustomError; return { success: false, message: err.message, errors: { _form: err.message } }; }
        return { success: false, message: 'Unknown error' };
    }

    try {
        (await cookies()).set('admin_success_message', 'album_created', {
            httpOnly: false,
            secure: false,
            maxAge: 5,
            path: '/'
        });
        revalidatePath('/admin/albums');
    } catch (error) {
        console.error('Error setting cookie or revalidating:', error);
    }
    redirect('/admin/albums');
}

export async function updateAlbum(_prev: AlbumFormState = initialState, formData: FormData): Promise<AlbumFormState> {
    try {
        await requireAdmin();
        const id = String(formData.get('id') || '');
        if (!id) throw new CustomError({ message: 'Missing album id', statusCode: 400, type: 'ValidationError' });

        const payload = {
            title: String(formData.get('title') || ''),
            artistIds: (formData.getAll('artistIds') || []).map(String).filter(Boolean),
            releaseDate: formData.get('releaseDate') ? new Date(String(formData.get('releaseDate'))) : null,
            coverImage: String(formData.get('coverImage') || ''),
            description: String(formData.get('description') || ''),
            genres: (formData.getAll('genres') || []).map(String).filter(Boolean),
            label: String(formData.get('label') || ''),
        };



        validateRequiredFields({ obj: payload, fields: ['title', 'artistIds', 'releaseDate'] });

        const db = await getDb();

        // Get the current album to compare artist changes
        const currentAlbum = await db.collection(Collections.ALBUMS).findOne({ _id: new ObjectId(id) });
        if (!currentAlbum) {
            throw new CustomError({ message: 'Album not found', statusCode: 404, type: 'NotFoundError' });
        }

        const currentArtistIds = (currentAlbum.artists as ObjectId[]).map(id => id.toString());
        const newArtistIds = payload.artistIds;

        await db.collection(Collections.ALBUMS).updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    title: payload.title,
                    artists: payload.artistIds.map((oid) => new ObjectId(oid)),
                    releaseDate: payload.releaseDate,
                    coverImage: payload.coverImage || '',
                    description: payload.description || '',
                    genres: payload.genres,
                    label: payload.label || '',
                    updatedAt: new Date(),
                },
            }
        );

        // Handle artist statistics updates
        const artistsToRemove = currentArtistIds.filter(id => !newArtistIds.includes(id));
        const artistsToAdd = newArtistIds.filter(id => !currentArtistIds.includes(id));

        // Remove album from old artists
        if (artistsToRemove.length > 0) {
            await db.collection(Collections.ARTISTS).updateMany(
                { _id: { $in: artistsToRemove.map(id => new ObjectId(id)) } },
                {
                    $inc: {
                        'stats.totalAlbums': -1
                    }
                }
            );
        }

        // Add album to new artists
        if (artistsToAdd.length > 0) {
            await db.collection(Collections.ARTISTS).updateMany(
                { _id: { $in: artistsToAdd.map(id => new ObjectId(id)) } },
                {
                    $inc: {
                        'stats.totalAlbums': 1
                    }
                }
            );
        }
    } catch (error) {
        try { handleActionError({ error, source: 'updateAlbum' }); } catch (e) { const err = e as CustomError; return { success: false, message: err.message, errors: { _form: err.message } }; }
        return { success: false, message: 'Unknown error' };
    }

    try {
        (await cookies()).set('admin_success_message', 'album_updated', {
            httpOnly: false,
            secure: false,
            maxAge: 5,
            path: '/'
        });
        revalidatePath('/admin/albums');
    } catch (error) {
        console.error('Error setting cookie or revalidating:', error);
    }
    redirect('/admin/albums');
}

export async function softDeleteAlbum(albumId: string, reason: string) {
    try {
        await requireAdmin();
        if (!albumId) throw new CustomError({ message: 'Missing album id', statusCode: 400, type: 'ValidationError' });
        const db = await getDb();

        // Get the album to update artist statistics
        const album = await db.collection(Collections.ALBUMS).findOne({ _id: new ObjectId(albumId) });
        if (!album) {
            throw new CustomError({ message: 'Album not found', statusCode: 404, type: 'NotFoundError' });
        }

        await db.collection(Collections.ALBUMS).updateOne(
            { _id: new ObjectId(albumId) },
            { $set: { isDeleted: true, deletedAt: new Date(), takedownReason: reason } }
        );

        // Update artist statistics - decrement totalAlbums for all artists in this album
        if (album.artists && album.artists.length > 0) {
            await db.collection(Collections.ARTISTS).updateMany(
                { _id: { $in: album.artists } },
                {
                    $inc: {
                        'stats.totalAlbums': -1
                    }
                }
            );
        }
    } catch (error) {
        try {
            handleActionError({ error, source: 'softDeleteAlbum', details: { albumId, reason } });
        } catch (e) {
            const err = e as CustomError; return { success: false, message: err.message };
        }
    }

    try {
        (await cookies()).set('admin_success_message', 'album_deleted', {
            httpOnly: false,
            secure: false,
            maxAge: 5,
            path: '/'
        });
        revalidatePath('/admin/albums');
    } catch (error) {
        console.error('Error setting cookie or revalidating:', error);
    }
    redirect('/admin/albums');
}
