import { redirect } from 'next/navigation';
import { checkRole } from '@/utils/roles';
import { getDb } from '@/lib/mongodb/client';
import { TrackForm } from '@/components/admin/tracks/track-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NewTrackPage() {
    const isAdmin = await checkRole('admin');
    if (!isAdmin) redirect('/');
    const db = await getDb();
    const [artists, albums] = await Promise.all([
        db.collection('artists').find({ isDeleted: { $ne: true } }, { projection: { name: 1 } }).toArray(),
        db.collection('albums').find({ isDeleted: { $ne: true } }, { projection: { title: 1 } }).toArray(),
    ]);

    return (
        <div className="space-y-4">
            <Link
                href="/admin/tracks"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Tracks
            </Link>
            <TrackForm
                mode="create"
                artists={artists.map((a) => ({ value: String(a._id), label: a.name }))}
                albums={albums.map((a) => ({ value: String(a._id), label: a.title }))}
            />
        </div>
    );
}
