import { redirect } from 'next/navigation';
import { checkRole } from '@/utils/roles';
import { getDb } from '@/lib/mongodb/client';
import { ObjectId } from 'mongodb';
import { AlbumForm } from '@/components/admin/albums/album-form';
import { DeleteDialog } from '@/components/admin/delete-dialog';
import { Collections } from '@/lib/constants/collections';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/date';

export default async function EditAlbumPage({ params }: { params: Promise<{ id: string }> }) {
    const isAdmin = await checkRole('admin');
    if (!isAdmin) redirect('/');

    const { id } = await params;
    const db = await getDb();
    const _id = new ObjectId(id);
    const [album, artists] = await Promise.all([
        db.collection('albums').findOne({ _id }),
        db.collection('artists').find({ isDeleted: { $ne: true } }, { projection: { name: 1, isDeleted: 1 } }).toArray(),
    ]);

    if (!album) redirect('/admin/albums');

    // Check if album is deleted
    const isAlbumDeleted = album.isDeleted;

    // Get artist details for the album
    const albumArtistIds = (album.artists || []).map((a: ObjectId) => String(a));
    const albumArtists = artists.filter(artist => albumArtistIds.includes(String(artist._id)));
    const hasDeletedArtists = albumArtists.some(artist => artist.isDeleted);

    const plainAlbum = {
        _id: String(album._id),
        title: String(album.title ?? ''),
        artists: albumArtistIds,
        releaseDate: album.releaseDate ? new Date(album.releaseDate).toISOString() : '',
        coverImage: String(album.coverImage ?? ''),
        description: String(album.description ?? ''),
        genres: Array.isArray(album.genres) ? album.genres.map(String) : [],
        label: String(album.label ?? ''),
        totalTracks: Number(album.totalTracks ?? 1),
        totalDuration: Number(album.totalDuration ?? 0),
        isDeleted: Boolean(album.isDeleted),
        deletedAt: album.deletedAt ? new Date(album.deletedAt).toISOString() : null,
        takedownReason: String(album.takedownReason ?? ''),
    };

    // If album is deleted, show readonly form or redirect
    if (isAlbumDeleted) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/albums"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Albums
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Album Details (Deleted)</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">This album has been deleted and cannot be edited</p>
                    </div>
                </div>

                {/* Deletion Warning */}
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Album Deleted</h3>
                            <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                                <p>This album was deleted on {formatDate(album.deletedAt)}.</p>
                                {album.takedownReason && (
                                    <p className="mt-1"><strong>Reason:</strong> {album.takedownReason}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Readonly Album Form */}
                <AlbumForm
                    mode="edit"
                    initial={plainAlbum}
                    artists={artists.map((a) => ({
                        value: String(a._id),
                        label: a.name + (a.isDeleted ? ' (Deleted)' : '')
                    }))}
                    readonly={true}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Link
                    href="/admin/albums"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Albums
                </Link>
                <DeleteDialog entity={Collections.ALBUMS} id={id} />
            </div>
            {hasDeletedArtists && (
                <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    This album contains deleted artists
                </p>
            )}

            {/* Warning for deleted artists */}
            {hasDeletedArtists && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Contains Deleted Artists</h3>
                            <div className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                                <p>Some artists associated with this album have been deleted. They will appear as &quot;(Deleted)&quot; in the artist selection.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <AlbumForm
                mode="edit"
                initial={plainAlbum}
                artists={artists.map((a) => ({
                    value: String(a._id),
                    label: a.name + (a.isDeleted ? ' (Deleted)' : '')
                }))}
            />
        </div>
    );
}
