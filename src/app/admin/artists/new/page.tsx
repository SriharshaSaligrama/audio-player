import { redirect } from 'next/navigation';
import { checkRole } from '@/utils/roles';
import { ArtistForm } from '@/components/admin/artists/artist-form';

export default async function NewArtistPage() {
    const isAdmin = await checkRole('admin');
    if (!isAdmin) redirect('/');
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold">Create Artist</h1>
            <ArtistForm mode="create" />
        </div>
    );
}
