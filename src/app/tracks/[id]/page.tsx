import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Clock, Calendar, Music, Users, Disc, Heart } from 'lucide-react';
import { getTrackById } from '@/actions/tracks';
import { isTrackLiked } from '@/actions/user-interactions';
import { formatDate } from '@/lib/utils/date';
import { ShareButton, DownloadButton } from '@/components/ui/interactive-buttons';
import { OptimisticLikeButton } from '@/components/ui/optimistic-interactive-buttons';

type TrackDetailPageProps = {
    params: Promise<{ id: string }>;
}

export default async function TrackDetailPage({ params }: TrackDetailPageProps) {
    const { id: trackId } = await params;
    const [track, initialLiked] = await Promise.all([
        getTrackById(trackId),
        isTrackLiked(trackId)
    ]);

    if (!track) {
        notFound();
    }

    const formatDuration = (seconds?: number) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatNumber = (num?: number) => {
        if (!num) return '0';
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const coverImage = track.coverImage || track.defaultAlbumDetails?.coverImage;

    return (
        <div className="space-y-8 fade-in">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-pink-500/5 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Cover Art */}
                    <div className="relative flex-shrink-0">
                        {coverImage ? (
                            <Image
                                src={`${coverImage}${coverImage.includes('?') ? '&' : '?'}t=${Date.now()}`}
                                alt={track.title}
                                width={300}
                                height={300}
                                className="w-72 h-72 rounded-2xl object-cover shadow-2xl"
                                unoptimized={true}
                            />
                        ) : (
                            <div className="w-72 h-72 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-2xl flex items-center justify-center shadow-2xl">
                                <Music className="h-24 w-24 text-gray-500 dark:text-gray-400" />
                            </div>
                        )}
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                        <div className="mb-4">
                            <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm font-medium rounded-full mb-4">
                                Track
                            </span>
                            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                                {track.title}
                            </h1>
                        </div>

                        {/* Artists */}
                        <div className="flex items-center gap-2 mb-6">
                            <Users className="h-5 w-5 text-gray-500" />
                            <div className="flex items-center gap-2 flex-wrap">
                                {track.artistDetails?.map((artist, idx) => (
                                    <span key={String(artist._id)} className="flex items-center gap-1">
                                        <Link
                                            href={`/artists/${artist._id}`}
                                            className="text-lg font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                        >
                                            {artist.name}
                                        </Link>
                                        {idx < track.artistDetails.length - 1 && (
                                            <span className="text-gray-500">,</span>
                                        )}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Album */}
                        {track.defaultAlbumDetails && (
                            <div className="flex items-center gap-2 mb-6">
                                <Disc className="h-5 w-5 text-gray-500" />
                                <span className="text-gray-600 dark:text-gray-400">From album</span>
                                <Link
                                    href={`/albums/${track.defaultAlbumDetails._id}`}
                                    className="text-lg font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    {track.defaultAlbumDetails.title}
                                </Link>
                            </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-6 mb-8 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                                <Play className="h-4 w-4" />
                                <span>{formatNumber(track.stats?.plays)} plays</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Heart className="h-4 w-4" />
                                <span>{formatNumber(track.stats?.likes)} likes</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{formatDuration(track.duration)}</span>
                            </div>
                            {track.releaseDate && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(track.releaseDate)}</span>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-4 flex-wrap">
                            <button className="flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold transition-colors shadow-lg hover:shadow-xl">
                                <Play className="h-5 w-5" fill="currentColor" />
                                Play
                            </button>
                            <OptimisticLikeButton
                                type="track"
                                id={trackId}
                                initialLiked={initialLiked}
                            />
                            <ShareButton
                                type="track"
                                id={trackId}
                                title={track.title}
                            />
                            <DownloadButton
                                trackId={trackId}
                                trackTitle={track.title}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Track Details */}
            <div className="grid gap-8 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Lyrics */}
                    {track.lyrics && (
                        <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Lyrics</h2>
                            <div className="prose dark:prose-invert max-w-none">
                                <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {track.lyrics}
                                </pre>
                            </div>
                        </section>
                    )}

                    {/* Genres & Tags */}
                    <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Details</h2>

                        {/* Genres */}
                        {track.genres && track.genres.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Genres</h3>
                                <div className="flex flex-wrap gap-2">
                                    {track.genres.map((genre, idx) => (
                                        <span
                                            key={idx}
                                            className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium"
                                        >
                                            {genre}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        {track.tags && track.tags.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {track.tags.map((tag, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Track Stats */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statistics</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">Total Plays</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {formatNumber(track.stats?.plays)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">Likes</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {formatNumber(track.stats?.likes)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">Shares</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {formatNumber(track.stats?.shares)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">Downloads</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {formatNumber(track.stats?.downloads)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Technical Info */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Technical Info</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Duration</span>
                                <span className="text-gray-900 dark:text-white">{formatDuration(track.duration)}</span>
                            </div>
                            {track.fileSize ? (
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">File Size</span>
                                    <span className="text-gray-900 dark:text-white">
                                        {(track.fileSize / (1024 * 1024)).toFixed(1)} MB
                                    </span>
                                </div>
                            ) : null}
                            {track.releaseDate && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Release Date</span>
                                    <span className="text-gray-900 dark:text-white">{formatDate(track.releaseDate)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}