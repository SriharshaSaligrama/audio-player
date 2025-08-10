import { redirect } from 'next/navigation';
import { checkRole } from '@/utils/roles';
import { getDb } from '@/lib/mongodb/client';
import Link from 'next/link';
import { ChevronRight, Plus } from 'lucide-react';

export default async function AdminTracksPage() {
    const isAdmin = await checkRole('admin');
    if (!isAdmin) redirect('/');
    const db = await getDb();
    const tracks = await db.collection('tracks').find({}, { projection: { title: 1, releaseDate: 1 } }).toArray();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Tracks</h1>
                <Link href="/admin/tracks/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium">
                    <Plus className="h-4 w-4" />
                    Add Track
                </Link>
            </div>
            <div className="grid gap-2">
                {tracks.map((t) => (
                    <Link key={String(t._id)} href={`/admin/tracks/${String(t._id)}`} className="flex items-center justify-between rounded border p-3 hover:bg-muted">
                        <div>
                            <div className="font-medium">{t.title}</div>
                            <div className="text-xs text-muted-foreground">{t.releaseDate ? new Date(t.releaseDate).toDateString() : '—'}</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                ))}
            </div>
        </div>
    );
}
