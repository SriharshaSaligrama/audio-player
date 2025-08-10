import { redirect } from 'next/navigation';
import { checkRole } from '@/utils/roles';
import { getDb } from '@/lib/mongodb/client';
import { ObjectId } from 'mongodb';
import { TrackForm } from '@/components/admin/tracks/track-form';
import { DeleteDialog } from '@/components/admin/delete-dialog';
import { Collections } from '@/lib/constants/collections';
import { Album, Artist } from '@/lib/mongodb/schemas';

export default async function EditTrackPage({ params }: { params: Promise<{ id: string }> }) {
    const isAdmin = await checkRole('admin');
    if (!isAdmin) redirect('/');

    const { id } = await params;
    const db = await getDb();
    const _id = new ObjectId(id);
    const [track, artists, albums] = await Promise.all([
        db.collection('tracks').findOne({ _id }),
        db.collection('artists').find({}, { projection: { name: 1 } }).toArray(),
        db.collection('albums').find({}, { projection: { title: 1 } }).toArray(),
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
                <h1 className="text-2xl font-semibold">Edit Track</h1>
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
