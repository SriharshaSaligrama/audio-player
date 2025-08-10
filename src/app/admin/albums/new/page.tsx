import { redirect } from 'next/navigation';
import { checkRole } from '@/utils/roles';
import { getDb } from '@/lib/mongodb/client';
import { AlbumForm } from '@/components/admin/albums/album-form';

export default async function NewAlbumPage() {
    const isAdmin = await checkRole('admin');
    if (!isAdmin) redirect('/');
    const db = await getDb();
    const artists = await db.collection('artists').find({}, { projection: { name: 1 } }).toArray();

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold">Create Album</h1>
            <AlbumForm
                mode="create"
                artists={artists.map((a) => ({ value: String(a._id), label: a.name }))}
            />
        </div>
    );
}
