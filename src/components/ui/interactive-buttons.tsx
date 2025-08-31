'use client';

import { useState, useTransition, useEffect } from 'react';
import { Heart, Share2, Download, Users, Check } from 'lucide-react';
import { likeTrack, likeAlbum, followArtist, shareContent, downloadTrack } from '@/actions/user-interactions';
import { useAuth } from '@clerk/nextjs';
import { useToastContext } from '../providers/toast-provider';

type LikeButtonProps = {
    type: 'track' | 'album';
    id: string;
    initialLiked?: boolean;
    className?: string;
    showText?: boolean;
}

export function LikeButton({ type, id, initialLiked = false, className = '', showText = true }: LikeButtonProps) {
    const [liked, setLiked] = useState(initialLiked);
    const [isPending, startTransition] = useTransition();
    const { isSignedIn } = useAuth();
    const { success, error } = useToastContext();

    // Fetch current like status when component mounts or when user signs in
    useEffect(() => {
        if (!isSignedIn) {
            setLiked(false);
            return;
        }

        const fetchLikeStatus = async () => {
            try {
                const { isTrackLiked, isAlbumLiked } = await import('@/actions/user-interactions');
                const currentLiked = type === 'track'
                    ? await isTrackLiked(id)
                    : await isAlbumLiked(id);
                setLiked(currentLiked);
            } catch (err) {
                console.error('Error fetching like status:', err);
            }
        };

        fetchLikeStatus();
    }, [type, id, isSignedIn]);

    const handleLike = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isSignedIn) {
            // Could show sign-in modal here
            alert('Please sign in to like content');
            return;
        }

        startTransition(async () => {
            try {
                const result = type === 'track'
                    ? await likeTrack(id)
                    : await likeAlbum(id);

                if (result.success) {
                    setLiked(result.liked ?? false);
                    success(result.message);
                } else {
                    error(result.message);
                }
            } catch (err) {
                console.error('Error liking content:', err);
                error('Failed to update like status');
            }
        });
    };

    return (
        <button
            onClick={handleLike}
            disabled={isPending}
            className={`flex items-center justify-center gap-2 ${showText ? 'px-6 py-3' : 'p-2'} border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 ${liked ? 'text-red-600 border-red-300 bg-red-50 dark:bg-red-900/20' : 'text-gray-700 dark:text-gray-300'
                } ${className}`}
        >
            <Heart className={`${showText ? 'h-4 w-4' : 'h-5 w-5'} ${liked ? 'fill-current text-red-500' : ''}`} />
            {showText && <span>{liked ? 'Liked' : 'Like'}</span>}
        </button>
    );
}

type FollowButtonProps = {
    artistId: string;
    initialFollowing?: boolean;
    className?: string;
    showText?: boolean;
}

export function FollowButton({ artistId, initialFollowing = false, className = '', showText = true }: FollowButtonProps) {
    const [following, setFollowing] = useState(initialFollowing);
    const [isPending, startTransition] = useTransition();
    const { isSignedIn } = useAuth();
    const { success, error } = useToastContext();

    const handleFollow = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isSignedIn) {
            alert('Please sign in to follow artists');
            return;
        }

        startTransition(async () => {
            try {
                const result = await followArtist(artistId);
                if (result.success) {
                    setFollowing(result.following ?? false);
                    success(result.message);
                } else {
                    error(result.message);
                }
            } catch (err) {
                console.error('Error following artist:', err);
                error('Failed to update follow status');
            }
        });
    };

    return (
        <button
            onClick={handleFollow}
            disabled={isPending}
            className={`flex items-center justify-center gap-2 ${showText ? 'px-6 py-3' : 'p-2'} border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 ${following ? 'text-blue-600 border-blue-300 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-700 dark:text-gray-300'
                } ${className}`}
        >
            <Users className={`${showText ? 'h-4 w-4' : 'h-5 w-5'} ${following ? 'fill-current text-blue-500' : ''}`} />
            {showText && <span>{following ? 'Following' : 'Follow'}</span>}
        </button>
    );
}

type ShareButtonProps = {
    type: 'track' | 'album' | 'artist';
    id: string;
    title: string;
    className?: string;
    showText?: boolean;
}

export function ShareButton({ type, id, title, className = '', showText = true }: ShareButtonProps) {
    const [shared, setShared] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleShare = () => {
        startTransition(async () => {
            try {
                const result = await shareContent(type, id);
                if (result.success && result.shareUrl) {
                    // Try to use Web Share API first
                    if (navigator.share) {
                        await navigator.share({
                            title: `Check out this ${type}: ${title}`,
                            url: result.shareUrl
                        });
                    } else {
                        // Fallback to clipboard
                        await navigator.clipboard.writeText(result.shareUrl);
                        setShared(true);
                        setTimeout(() => setShared(false), 2000);
                    }
                } else {
                    console.error('Failed to share:', result.message);
                }
            } catch (error) {
                console.error('Error sharing content:', error);
                // Fallback: just copy the current URL
                try {
                    await navigator.clipboard.writeText(window.location.href);
                    setShared(true);
                    setTimeout(() => setShared(false), 2000);
                } catch (clipboardError) {
                    console.error('Failed to copy to clipboard:', clipboardError);
                }
            }
        });
    };

    return (
        <button
            onClick={handleShare}
            disabled={isPending}
            className={`flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 ${className}`}
        >
            {shared ? (
                <Check className="h-4 w-4 text-green-600" />
            ) : (
                <Share2 className="h-4 w-4" />
            )}
            {showText && <span>{shared ? 'Copied!' : 'Share'}</span>}
        </button>
    );
}

type DownloadButtonProps = {
    trackId: string;
    trackTitle: string;
    className?: string;
    showText?: boolean;
}

export function DownloadButton({ trackId, trackTitle, className = '', showText = true }: DownloadButtonProps) {
    const [downloading, setDownloading] = useState(false);
    const [isPending, startTransition] = useTransition();
    const { isSignedIn } = useAuth();

    const handleDownload = () => {
        if (!isSignedIn) {
            alert('Please sign in to download tracks');
            return;
        }

        startTransition(async () => {
            setDownloading(true);
            try {
                const result = await downloadTrack(trackId);
                if (result.success && result.downloadUrl) {
                    // Create a temporary link to trigger download
                    const link = document.createElement('a');
                    link.href = result.downloadUrl;
                    link.download = result.filename || `${trackTitle}.mp3`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    console.error('Failed to download:', result.message);
                    alert('Download failed. Please try again.');
                }
            } catch (error) {
                console.error('Error downloading track:', error);
                alert('Download failed. Please try again.');
            } finally {
                setDownloading(false);
            }
        });
    };

    return (
        <button
            onClick={handleDownload}
            disabled={isPending || downloading}
            className={`flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 ${className}`}
        >
            <Download className={`h-4 w-4 ${downloading ? 'animate-bounce' : ''}`} />
            {showText && <span>{downloading ? 'Downloading...' : 'Download'}</span>}
        </button>
    );
}