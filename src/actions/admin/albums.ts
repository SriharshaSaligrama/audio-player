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
        const result = await db.collection(Collections.ALBUMS).insertOne(doc);
        const insertedId = String(result.insertedId);
        if (doc.coverImage) {
            let currentPath: string | null = null;
            try { currentPath = new URL(String(doc.coverImage)).pathname; } catch { currentPath = null; }
            const ext = currentPath?.split('.').pop() ? `.${currentPath!.split('.').pop()}` : '.jpg';
            const desiredKey = `${BLOB_FOLDERS.albums}/${insertedId}${ext}`;
            if (!currentPath || !currentPath.endsWith(desiredKey)) {
                const resp = await fetch(String(doc.coverImage));
                const array = await resp.arrayBuffer();
                const blob = new Blob([array]);
                const putRes = await put(desiredKey, blob, { access: 'public', allowOverwrite: true });
                await db.collection(Collections.ALBUMS).updateOne({ _id: result.insertedId }, { $set: { coverImage: putRes.url } });
                if (currentPath) { try { await del(currentPath); } catch { } }
            }
        }
    } catch (error) {
        try { handleActionError({ error, source: 'createAlbum' }); } catch (e) { const err = e as CustomError; return { success: false, message: err.message, errors: { _form: err.message } }; }
        return { success: false, message: 'Unknown error' };
    }

    (await cookies()).set('admin_success_message', 'album_created', {
        httpOnly: false,
        secure: false,
        maxAge: 5,
        path: '/'
    });
    revalidatePath('/admin/albums');
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
    } catch (error) {
        try { handleActionError({ error, source: 'updateAlbum' }); } catch (e) { const err = e as CustomError; return { success: false, message: err.message, errors: { _form: err.message } }; }
        return { success: false, message: 'Unknown error' };
    }

    (await cookies()).set('admin_success_message', 'album_updated', {
        httpOnly: false,
        secure: false,
        maxAge: 5,
        path: '/'
    });
    revalidatePath('/admin/albums');
    redirect('/admin/albums');
}

export async function softDeleteAlbum(albumId: string, reason: string) {
    try {
        await requireAdmin();
        if (!albumId) throw new CustomError({ message: 'Missing album id', statusCode: 400, type: 'ValidationError' });
        const db = await getDb();
        await db.collection(Collections.ALBUMS).updateOne(
            { _id: new ObjectId(albumId) },
            { $set: { isDeleted: true, deletedAt: new Date(), takedownReason: reason } }
        );
    } catch (error) {
        try {
            handleActionError({ error, source: 'softDeleteAlbum', details: { albumId, reason } });
        } catch (e) {
            const err = e as CustomError; return { success: false, message: err.message };
        }
    }

    (await cookies()).set('admin_success_message', 'album_deleted', {
        httpOnly: false,
        secure: false,
        maxAge: 5,
        path: '/'
    });
    revalidatePath('/admin/albums');
    redirect('/admin/albums');
}
