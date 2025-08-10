'use server';

import { ObjectId } from 'mongodb';
import { put, del } from '@vercel/blob';
import { BLOB_FOLDERS } from '@/lib/constants/images';
import { getDb } from '@/lib/mongodb/client';
import { CustomError, handleActionError, validateRequiredFields } from '@/lib/utils/error-handler';
import { requireAdmin } from './utils';
import { Collections } from '@/lib/constants/collections';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export type ArtistFormState = {
    success: boolean;
    message?: string;
    errors?: Record<string, string>;
    data?: Record<string, unknown>;
};

const initialState: ArtistFormState = { success: false };

export async function createArtist(_prev: ArtistFormState = initialState, formData: FormData): Promise<ArtistFormState> {
    try {
        await requireAdmin();
        const payload = {
            name: String(formData.get('name') || ''),
            bio: String(formData.get('bio') || ''),
            avatar: String(formData.get('avatar') || ''),
            coverImage: String(formData.get('coverImage') || ''),
            genres: (String(formData.get('genres') || '')).split(',').map((t) => t.trim()).filter(Boolean),
            spotify: String(formData.get('spotify') || ''),
            twitter: String(formData.get('twitter') || ''),
            instagram: String(formData.get('instagram') || ''),
        };

        validateRequiredFields({ obj: payload, fields: ['name'] });

        const db = await getDb();
        const now = new Date();
        const doc = {
            name: payload.name,
            bio: payload.bio || '',
            avatar: payload.avatar || '',
            coverImage: payload.coverImage || '',
            genres: payload.genres,
            socialLinks: { spotify: payload.spotify || '', twitter: payload.twitter || '', instagram: payload.instagram || '' },
            stats: { followers: 0, totalPlays: 0, totalTracks: 0, totalAlbums: 0 },
            createdAt: now,
            updatedAt: now,
            isDeleted: false,
            deletedAt: null,
        };
        const result = await db.collection(Collections.ARTISTS).insertOne(doc);
        const insertedId = String(result.insertedId);
        const updates: Record<string, unknown> = {};

        async function rekeyIfNeeded(currentUrl: string, folder: string, field: 'avatar' | 'coverImage') {
            if (!currentUrl) return;
            let currentPath: string | null = null;
            try { currentPath = new URL(currentUrl).pathname; } catch { currentPath = null; }
            const ext = currentPath?.split('.').pop() ? `.${currentPath!.split('.').pop()}` : '.jpg';
            const desiredKey = `${folder}/${insertedId}${ext}`;
            if (currentPath && currentPath.endsWith(desiredKey)) return;
            const resp = await fetch(currentUrl);
            const array = await resp.arrayBuffer();
            const blob = new Blob([array]);
            const putRes = await put(desiredKey, blob, { access: 'public', allowOverwrite: true });
            updates[field] = putRes.url;
            if (currentPath) { try { await del(currentPath); } catch { } }
        }

        await rekeyIfNeeded(doc.avatar as string, BLOB_FOLDERS.artists, 'avatar');
        await rekeyIfNeeded(doc.coverImage as string, BLOB_FOLDERS.artists, 'coverImage');
        if (Object.keys(updates).length > 0) {
            await db.collection(Collections.ARTISTS).updateOne({ _id: result.insertedId }, { $set: updates });
        }
    } catch (error) {
        try { handleActionError({ error, source: 'createArtist' }); } catch (e) { const err = e as CustomError; return { success: false, message: err.message, errors: { _form: err.message } }; }
        return { success: false, message: 'Unknown error' };
    }

    (await cookies()).set('admin_success_message', 'artist_created', {
        httpOnly: false,
        secure: false,
        maxAge: 5, // 5 seconds
        path: '/'
    });
    revalidatePath('/admin/artists');
    redirect('/admin/artists');
}

export async function updateArtist(_prev: ArtistFormState = initialState, formData: FormData): Promise<ArtistFormState> {
    try {
        await requireAdmin();
        const id = String(formData.get('id') || '');
        if (!id) throw new CustomError({ message: 'Missing artist id', statusCode: 400, type: 'ValidationError' });

        const payload = {
            name: String(formData.get('name') || ''),
            bio: String(formData.get('bio') || ''),
            avatar: String(formData.get('avatar') || ''),
            coverImage: String(formData.get('coverImage') || ''),
            genres: (String(formData.get('genres') || '')).split(',').map((t) => t.trim()).filter(Boolean),
            spotify: String(formData.get('spotify') || ''),
            twitter: String(formData.get('twitter') || ''),
            instagram: String(formData.get('instagram') || ''),
        };

        validateRequiredFields({ obj: payload, fields: ['name'] });

        const db = await getDb();
        await db.collection(Collections.ARTISTS).updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    name: payload.name,
                    bio: payload.bio || '',
                    avatar: payload.avatar || '',
                    coverImage: payload.coverImage || '',
                    genres: payload.genres,
                    socialLinks: { spotify: payload.spotify || '', twitter: payload.twitter || '', instagram: payload.instagram || '' },
                    updatedAt: new Date(),
                },
            }
        );
    } catch (error) {
        try { handleActionError({ error, source: 'updateArtist' }); } catch (e) { const err = e as CustomError; return { success: false, message: err.message, errors: { _form: err.message } }; }
        return { success: false, message: 'Unknown error' };
    }

    (await cookies()).set('admin_success_message', 'artist_updated', {
        httpOnly: false,
        secure: false,
        maxAge: 5, // 5 seconds
        path: '/'
    });
    revalidatePath('/admin/artists');
    redirect('/admin/artists');
}

export async function softDeleteArtist(artistId: string, reason: string) {
    try {
        await requireAdmin();
        if (!artistId) throw new CustomError({ message: 'Missing artist id', statusCode: 400, type: 'ValidationError' });
        const db = await getDb();
        await db.collection(Collections.ARTISTS).updateOne(
            { _id: new ObjectId(artistId) },
            { $set: { isDeleted: true, deletedAt: new Date(), takedownReason: reason } }
        );
    } catch (error) {
        try { handleActionError({ error, source: 'softDeleteArtist', details: { artistId, reason } }); } catch (e) { const err = e as CustomError; return { success: false, message: err.message }; }
    }

    (await cookies()).set('admin_success_message', 'artist_deleted', {
        httpOnly: false,
        secure: false,
        maxAge: 5,
        path: '/'
    });
    revalidatePath('/admin/artists');
    redirect('/admin/artists');
}
