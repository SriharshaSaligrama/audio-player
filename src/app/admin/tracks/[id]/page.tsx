import { redirect } from 'next/navigation';
import { checkRole } from '@/utils/roles';
import { getDb } from '@/lib/mongodb/client';
import { ObjectId } from 'mongodb';
import { TrackForm } from '@/components/admin/tracks/track-form';
import { DeleteDialog } from '@/components/admin/delete-dialog';
import { Collections } from '@/lib/constants/collections';
import { Album, Artist } from '@/lib/mongodb/schemas';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function EditTrackPage({ params }: { params: Promise<{ id: string }> }) {
    const isAdmin = await checkRole('admin');
    if (!isAdmin) redirect('/');

    const { id } = await params;
    const db = await getDb();
    const _id = new ObjectId(id);
    const [track, artists, albums] = await Promise.all([
        db.collection('tracks').findOne({ _id }),
        db.collection('artists').find({ isDeleted: { $ne: true } }, { projection: { name: 1 } }).toArray(),
        db.collection('albums').find({ isDeleted: { $ne: true } }, { projection: { title: 1 } }).toArray(),
    ]);

    if (!track) redirect('/admin/tracks');

    const plainTrack = {
        _id: String(track._id),
        title: String(track.title ?? ''),
        artists: (track.artists || []).map((a: Artist) => String(a)),
        albums: (track.albums || []).map((a: Album) => String(a)),
        defaultAlbum: track.defaultAlbum ? String(track.defaultAlbum) : '',
        releaseDate: track.releaseDate ? new Date(track.releaseDate).toISOString() : '',
        duration: Number(track.duration ?? 0),
        fileUrl: String(track.fileUrl ?? ''),
        coverImage: String(track.coverImage ?? ''),
        genre: String(track.genre ?? ''),
        tags: Array.isArray(track.tags) ? track.tags.map(String) : [],
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Link
                    href="/admin/tracks"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Tracks
                </Link>
                <DeleteDialog entity={Collections.TRACKS} id={id} />
            </div>
            <TrackForm
                mode="edit"
                initial={plainTrack}
                artists={artists.map((a) => ({ value: String(a._id), label: a.name }))}
                albums={albums.map((a) => ({ value: String(a._id), label: a.title }))}
            />
        </div>
    );
}
