import { redirect } from 'next/navigation';
import { checkRole } from '@/utils/roles';
import { getDb } from '@/lib/mongodb/client';
import { ObjectId } from 'mongodb';
import { AlbumForm } from '@/components/admin/albums/album-form';
import { DeleteDialog } from '@/components/admin/delete-dialog';
import { Collections } from '@/lib/constants/collections';
import { Artist } from '@/lib/mongodb/schemas';

export default async function EditAlbumPage({ params }: { params: Promise<{ id: string }> }) {
    const isAdmin = await checkRole('admin');
    if (!isAdmin) redirect('/');

    const { id } = await params;
    const db = await getDb();
    const _id = new ObjectId(id);
    const [album, artists] = await Promise.all([
        db.collection('albums').findOne({ _id }),
        db.collection('artists').find({}, { projection: { name: 1 } }).toArray(),
    ]);

    if (!album) redirect('/admin/albums');

    const plainAlbum = {
        _id: String(album._id),
        title: String(album.title ?? ''),
        artists: (album.artists || []).map((a: Artist) => String(a)),
        releaseDate: album.releaseDate ? new Date(album.releaseDate).toISOString() : '',
        coverImage: String(album.coverImage ?? ''),
        description: String(album.description ?? ''),
        genres: Array.isArray(album.genres) ? album.genres.map(String) : [],
        label: String(album.label ?? ''),
        totalTracks: Number(album.totalTracks ?? 1),
        totalDuration: Number(album.totalDuration ?? 0),
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Edit Album</h1>
                <DeleteDialog entity={Collections.ALBUMS} id={id} />
            </div>
            <AlbumForm
                mode="edit"
                initial={plainAlbum}
                artists={artists.map((a) => ({ value: String(a._id), label: a.name }))}
            />
        </div>
    );
}
