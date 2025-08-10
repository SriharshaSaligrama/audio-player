import { redirect } from 'next/navigation';
import { checkRole } from '@/utils/roles';
import { getDb } from '@/lib/mongodb/client';
import Link from 'next/link';
import { ChevronRight, Plus } from 'lucide-react';

export default async function AdminAlbumsPage() {
    const isAdmin = await checkRole('admin');
    if (!isAdmin) redirect('/');
    const db = await getDb();
    const albums = await db.collection('albums').find({}, { projection: { title: 1, releaseDate: 1 } }).toArray();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Albums</h1>
                <Link href="/admin/albums/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium">
                    <Plus className="h-4 w-4" />
                    Add Album
                </Link>
            </div>
            <div className="grid gap-2">
                {albums.map((a) => (
                    <Link key={String(a._id)} href={`/admin/albums/${String(a._id)}`} className="flex items-center justify-between rounded border p-3 hover:bg-muted">
                        <div>
                            <div className="font-medium">{a.title}</div>
                            <div className="text-xs text-muted-foreground">{a.releaseDate ? new Date(a.releaseDate).toDateString() : '—'}</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                ))}
            </div>
        </div>
    );
}
