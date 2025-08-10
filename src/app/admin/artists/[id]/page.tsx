import { redirect } from 'next/navigation';
import { checkRole } from '@/utils/roles';
import { getDb } from '@/lib/mongodb/client';
import { ObjectId } from 'mongodb';
import { ArtistForm } from '@/components/admin/artists/artist-form';
import { DeleteDialog } from '@/components/admin/delete-dialog';
import { Collections } from '@/lib/constants/collections';

export default async function EditArtistPage({ params }: { params: Promise<{ id: string }> }) {
    const isAdmin = await checkRole('admin');
    if (!isAdmin) redirect('/');

    const { id } = await params;
    const db = await getDb();
    const _id = new ObjectId(id);
    const artist = await db.collection('artists').findOne({ _id });
    if (!artist) redirect('/admin/artists');
    const plainArtist = {
        _id: String(artist._id),
        name: String(artist.name ?? ''),
        avatar: String(artist.avatar ?? ''),
        coverImage: String(artist.coverImage ?? ''),
        bio: String(artist.bio ?? ''),
        genres: Array.isArray(artist.genres) ? artist.genres.map(String) : [],
        socialLinks: {
            spotify: String(artist.socialLinks?.spotify ?? ''),
            twitter: String(artist.socialLinks?.twitter ?? ''),
            instagram: String(artist.socialLinks?.instagram ?? ''),
        },
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Edit Artist</h1>
                <DeleteDialog entity={Collections.ARTISTS} id={id} />
            </div>
            <ArtistForm mode="edit" initial={plainArtist} />
        </div>
    );
}
