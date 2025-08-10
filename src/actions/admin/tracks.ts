'use server';

import { ObjectId } from 'mongodb';
import { put, del } from '@vercel/blob';
import { BLOB_FOLDERS } from '@/lib/constants/images';
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
            releaseDate: formData.get('releaseDate') ? new Date(String(formData.get('releaseDate'))) : undefined,
            duration: formData.get('duration') ? Number(formData.get('duration')) : undefined,
            fileUrl: String(formData.get('fileUrl') || ''),
            coverImage: String(formData.get('coverImage') || ''),
            genre: String(formData.get('genre') || ''),
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
            genre: payload.genre || undefined,
            releaseDate: payload.releaseDate,
            duration: payload.duration ?? undefined,
            fileUrl: payload.fileUrl,
            coverImage: payload.coverImage || undefined,
            tags: payload.tags,
            stats: { plays: 0, likes: 0, shares: 0, downloads: 0 },
            createdAt: now,
            updatedAt: now,
            isDeleted: false,
            deletedAt: null,
        } as const;

        const result = await withTransaction(async ({ session }) => {
            const insert = await db.collection(Collections.TRACKS).insertOne(trackDoc, { session });
            // Also update album aggregates (best-effort; ensure album exists)
            if (payload.duration && payload.defaultAlbum) {
                await db.collection(Collections.ALBUMS).updateOne(
                    { _id: new ObjectId(payload.defaultAlbum) },
                    { $inc: { totalTracks: 1, totalDuration: payload.duration } },
                    { session }
                );
            }
            return insert;
        });

        const insertedId = String(result?.insertedId);
        const updates: Record<string, unknown> = {};
        if (trackDoc.coverImage) {
            let currentPath: string | null = null;
            try { currentPath = new URL(String(trackDoc.coverImage)).pathname; } catch { currentPath = null; }
            const ext = currentPath?.split('.').pop() ? `.${currentPath!.split('.').pop()}` : '.jpg';
            const desiredKey = `${BLOB_FOLDERS.tracks}/${insertedId}${ext}`;
            if (!currentPath || !currentPath.endsWith(desiredKey)) {
                const resp = await fetch(String(trackDoc.coverImage));
                const array = await resp.arrayBuffer();
                const blob = new Blob([array]);
                const putRes = await put(desiredKey, blob, { access: 'public', allowOverwrite: true });
                updates.coverImage = putRes.url;
                if (currentPath) { try { await del(currentPath); } catch { } }
            }
        }
        if (Object.keys(updates).length > 0) {
            await db.collection(Collections.TRACKS).updateOne({ _id: new ObjectId(insertedId) }, { $set: updates });
        }
    } catch (error) {
        try {
            handleActionError({ error, source: 'createTrack' });
        } catch (e) {
            const err = e as CustomError;
            return { success: false, message: err.message, errors: { _form: err.message } };
        }
        return { success: false, message: 'Unknown error' };
    }

    (await cookies()).set('admin_success_message', 'track_created', {
        httpOnly: false,
        secure: false,
        maxAge: 5,
        path: '/'
    });
    revalidatePath('/admin/tracks');
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
            duration: formData.get('duration') ? Number(formData.get('duration')) : undefined,
            fileUrl: String(formData.get('fileUrl') || ''),
            coverImage: String(formData.get('coverImage') || ''),
            genre: String(formData.get('genre') || ''),
            tags: (String(formData.get('tags') || '')).split(',').map((t) => t.trim()).filter(Boolean),
        };

        validateRequiredFields({
            obj: payload as Record<string, unknown>,
            fields: ['title', 'artistIds', 'albumIds', 'defaultAlbum', 'releaseDate', 'fileUrl'],
        });

        const db = await getDb();
        const now = new Date();

        await db.collection(Collections.TRACKS).updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    title: payload.title,
                    artists: payload.artistIds.map((oid) => new ObjectId(oid)),
                    albums: payload.albumIds.map((oid) => new ObjectId(oid)),
                    defaultAlbum: new ObjectId(payload.defaultAlbum),
                    genre: payload.genre || undefined,
                    releaseDate: payload.releaseDate,
                    duration: payload.duration ?? undefined,
                    fileUrl: payload.fileUrl,
                    coverImage: payload.coverImage || undefined,
                    tags: payload.tags,
                    updatedAt: now,
                },
            }
        );
    } catch (error) {
        try {
            handleActionError({ error, source: 'updateTrack' });
        } catch (e) {
            const err = e as CustomError;
            return { success: false, message: err.message, errors: { _form: err.message } };
        }
        return { success: false, message: 'Unknown error' };
    }

    (await cookies()).set('admin_success_message', 'track_updated', {
        httpOnly: false,
        secure: false,
        maxAge: 5,
        path: '/'
    });
    revalidatePath('/admin/tracks');
    redirect('/admin/tracks');
}

export async function softDeleteTrack(trackId: string, reason: string) {
    try {
        await requireAdmin();
        if (!trackId) throw new CustomError({ message: 'Missing track id', statusCode: 400, type: 'ValidationError' });
        const db = await getDb();
        await db.collection(Collections.TRACKS).updateOne(
            { _id: new ObjectId(trackId) },
            { $set: { isDeleted: true, deletedAt: new Date(), takedownReason: reason } }
        );
    } catch (error) {
        try { handleActionError({ error, source: 'softDeleteTrack', details: { trackId, reason } }); } catch (e) { const err = e as CustomError; return { success: false, message: err.message }; }
    }

    (await cookies()).set('admin_success_message', 'track_deleted', {
        httpOnly: false,
        secure: false,
        maxAge: 5,
        path: '/'
    });
    revalidatePath('/admin/tracks');
    redirect('/admin/tracks');
}
