import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Users, Music, ExternalLink } from 'lucide-react';
import { getArtistById } from '@/actions/artists';
import { getTracksByArtistWithLikeStatus } from '@/actions/tracks';
import { getAlbumsByArtistWithLikeStatus } from '@/actions/albums';
import { isArtistFollowed } from '@/actions/user-interactions';
import { OptimisticTrackList } from '@/components/music/optimistic-track-list';
import { OptimisticAlbumGrid } from '@/components/music/optimistic-album-grid';
import { formatDate } from '@/lib/utils/date';
import { OptimisticFollowButton } from '@/components/ui/optimistic-interactive-buttons';
import { ShareButton } from '@/components/ui/interactive-buttons';
import { serializeTracks, serializeAlbums } from '@/lib/utils/serialization';

type ArtistDetailPageProps = {
    params: Promise<{ id: string }>;
}

export default async function ArtistDetailPage({ params }: ArtistDetailPageProps) {
    const { id: artistId } = await params;
    const [artist, tracks, albums, initialFollowing] = await Promise.all([
        getArtistById(artistId),
        getTracksByArtistWithLikeStatus(artistId, 10), // Limit to top 10 tracks
        getAlbumsByArtistWithLikeStatus(artistId, 8),   // Limit to 8 albums
        isArtistFollowed(artistId)
    ]);

    // Serialize data for client components
    const serializedTracks = serializeTracks(tracks);
    const serializedAlbums = serializeAlbums(albums);

    if (!artist) {
        notFound();
    }

    const formatNumber = (num?: number) => {
        if (!num) return '0';
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    return (
        <div className="space-y-8 fade-in">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-500/5 dark:via-indigo-500/5 dark:to-purple-500/5 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Artist Avatar */}
                    <div className="relative flex-shrink-0">
                        {artist.avatar ? (
                            <Image
                                src={`${artist.avatar}${artist.avatar.includes('?') ? '&' : '?'}t=${Date.now()}`}
                                alt={artist.name}
                                width={300}
                                height={300}
                                className="w-72 h-72 rounded-full object-cover shadow-2xl ring-8 ring-white/50 dark:ring-gray-700/50"
                                priority
                            />
                        ) : (
                            <div className="w-72 h-72 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl ring-8 ring-white/50 dark:ring-gray-700/50">
                                <Users className="h-32 w-32 text-white" />
                            </div>
                        )}

                        {/* Verified Badge */}
                        <div className="absolute bottom-4 right-4 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>

                    {/* Artist Info */}
                    <div className="flex-1 min-w-0">
                        <div className="mb-4">
                            <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium rounded-full mb-4">
                                Verified Artist
                            </span>
                            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                                {artist.name}
                            </h1>
                        </div>

                        {/* Bio */}
                        {artist.bio && (
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                                {artist.bio}
                            </p>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    {formatNumber(artist.stats?.followers)}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                    Followers
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                    {formatNumber(artist.stats?.totalPlays)}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                    Total Plays
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                    {artist.stats?.totalTracks || 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                    Tracks
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                                    {artist.stats?.totalAlbums || 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                    Albums
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-4 flex-wrap">
                            <button className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-colors shadow-lg hover:shadow-xl">
                                <Play className="h-5 w-5" fill="currentColor" />
                                Play
                            </button>
                            <OptimisticFollowButton
                                artistId={artistId}
                                initialFollowing={initialFollowing}
                            />
                            <ShareButton
                                type="artist"
                                id={artistId}
                                title={artist.name}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Sections */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Popular Tracks */}
                    {tracks.length > 0 && (
                        <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Popular Tracks</h2>
                                {tracks.length >= 10 && (
                                    <Link
                                        href={`/artists/${artist._id}/tracks`}
                                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                                    >
                                        View All
                                    </Link>
                                )}
                            </div>
                            <OptimisticTrackList
                                tracks={serializedTracks}
                                showAlbum={true}
                                showArtist={false}
                                showPlayCount={true}
                            />
                        </section>
                    )}

                    {/* Albums */}
                    {albums.length > 0 && (
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Albums</h2>
                                {albums.length >= 8 && (
                                    <Link
                                        href={`/artists/${artist._id}/albums`}
                                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                                    >
                                        View All
                                    </Link>
                                )}
                            </div>
                            <OptimisticAlbumGrid albums={serializedAlbums} columns={2} />
                        </section>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Social Links */}
                    {artist.socialLinks && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Connect</h3>
                            <div className="space-y-3">
                                {artist.socialLinks.spotify && (
                                    <a
                                        href={artist.socialLinks.spotify}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                                    >
                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                            <Music className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400">
                                            Spotify
                                        </span>
                                        <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
                                    </a>
                                )}

                                {artist.socialLinks.twitter && (
                                    <a
                                        href={artist.socialLinks.twitter}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                                    >
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                            <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                            </svg>
                                        </div>
                                        <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                            Twitter
                                        </span>
                                        <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
                                    </a>
                                )}

                                {artist.socialLinks.instagram && (
                                    <a
                                        href={artist.socialLinks.instagram}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                            <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323C5.902 8.198 7.053 7.708 8.35 7.708s2.448.49 3.323 1.297c.897.875 1.387 2.026 1.387 3.323s-.49 2.448-1.297 3.323c-.875.897-2.026 1.387-3.323 1.387zm7.718 0c-1.297 0-2.448-.49-3.323-1.297-.897-.875-1.387-2.026-1.387-3.323s.49-2.448 1.297-3.323c.875-.897 2.026-1.387 3.323-1.387s2.448.49 3.323 1.297c.897.875 1.387 2.026 1.387 3.323s-.49 2.448-1.297 3.323c-.875.897-2.026 1.387-3.323 1.387z" />
                                            </svg>
                                        </div>
                                        <span className="text-gray-700 dark:text-gray-300 group-hover:text-pink-600 dark:group-hover:text-pink-400">
                                            Instagram
                                        </span>
                                        <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Genres */}
                    {artist.genres && artist.genres.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Genres</h3>
                            <div className="flex flex-wrap gap-2">
                                {artist.genres.map((genre, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium"
                                    >
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Artist Info */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Artist Info</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Total Followers</span>
                                <span className="text-gray-900 dark:text-white">{formatNumber(artist.stats?.followers)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Total Plays</span>
                                <span className="text-gray-900 dark:text-white">{formatNumber(artist.stats?.totalPlays)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Tracks Released</span>
                                <span className="text-gray-900 dark:text-white">{artist.stats?.totalTracks || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Albums Released</span>
                                <span className="text-gray-900 dark:text-white">{artist.stats?.totalAlbums || 0}</span>
                            </div>
                            {artist.createdAt && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Joined</span>
                                    <span className="text-gray-900 dark:text-white">{formatDate(artist.createdAt)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}