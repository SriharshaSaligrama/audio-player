import { redirect } from 'next/navigation';
import { checkRole } from '@/utils/roles';
import { getDb } from '@/lib/mongodb/client';
import { ObjectId } from 'mongodb';
import { ArtistForm } from '@/components/admin/artists/artist-form';
import { DeleteDialog } from '@/components/admin/delete-dialog';
import { Collections } from '@/lib/constants/collections';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/date';

export default async function EditArtistPage({ params }: { params: Promise<{ id: string }> }) {
    const isAdmin = await checkRole('admin');
    if (!isAdmin) redirect('/');

    const { id } = await params;
    const db = await getDb();
    const _id = new ObjectId(id);
    const artist = await db.collection('artists').findOne({ _id });
    if (!artist) redirect('/admin/artists');

    // Check if artist is deleted
    const isArtistDeleted = !!artist.isDeleted;

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
        isDeleted: Boolean(artist.isDeleted),
        deletedAt: artist.deletedAt ? new Date(artist.deletedAt).toISOString() : null,
        takedownReason: String(artist.takedownReason ?? ''),
    };

    // If artist is deleted, show readonly form or redirect
    if (isArtistDeleted) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/artists"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Artists
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Artist Details (Deleted)</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">This artist has been deleted and cannot be edited</p>
                    </div>
                </div>

                {/* Deletion Warning */}
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Artist Deleted</h3>
                            <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                                <p>This artist was deleted on {formatDate(artist.deletedAt)}.</p>
                                {artist.takedownReason && (
                                    <p className="mt-1"><strong>Reason:</strong> {artist.takedownReason}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Readonly Artist Form */}
                <ArtistForm mode="edit" initial={plainArtist} readonly={true} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Link
                    href="/admin/artists"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Artists
                </Link>
                <DeleteDialog entity={Collections.ARTISTS} id={id} />
            </div>
            <ArtistForm mode="edit" initial={plainArtist} />
        </div>
    );
}
