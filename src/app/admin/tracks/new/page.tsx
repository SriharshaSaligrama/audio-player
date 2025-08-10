import { redirect } from 'next/navigation';
import { checkRole } from '@/utils/roles';
import { getDb } from '@/lib/mongodb/client';
import { TrackForm } from '@/components/admin/tracks/track-form';

export default async function NewTrackPage() {
    const isAdmin = await checkRole('admin');
    if (!isAdmin) redirect('/');
    const db = await getDb();
    const [artists, albums] = await Promise.all([
        db.collection('artists').find({}, { projection: { name: 1 } }).toArray(),
        db.collection('albums').find({}, { projection: { title: 1 } }).toArray(),
    ]);

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold">Create Track</h1>
            <TrackForm
                mode="create"
                artists={artists.map((a) => ({ value: String(a._id), label: a.name }))}
                albums={albums.map((a) => ({ value: String(a._id), label: a.title }))}
            />
        </div>
    );
}
