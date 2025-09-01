import { redirect } from 'next/navigation';
import { checkRole } from '@/utils/roles';
import { getDb } from '@/lib/mongodb/client';
import { serializeForClient } from '@/lib/utils/serialization';
import { AdminArtistsClient } from '@/components/admin/pages/admin-artists-client';
import type { Artist } from '@/lib/mongodb/schemas/artist';

export default async function AdminArtistsPage() {
    const isAdmin = await checkRole('admin');
    if (!isAdmin) redirect('/');
    const db = await getDb();
    const rawArtists = await db.collection('artists').find({}).toArray() as unknown as Artist[];
    const artists = serializeForClient(rawArtists);

    return <AdminArtistsClient initialArtists={artists} />;
}