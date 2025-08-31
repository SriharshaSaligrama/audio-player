'use client';

import { useState, useTransition } from 'react';
import { Heart, Users } from 'lucide-react';
import { likeTrack, likeAlbum, followArtist } from '@/actions/user-interactions';
import { useAuth } from '@clerk/nextjs';
import { useToastContext } from '../providers/toast-provider';

// Simple like button - only handles button state, no count updates
type OptimisticLikeButtonProps = {
    type: 'track' | 'album';
    id: string;
    initialLiked?: boolean;
    className?: string;
    showText?: boolean;
    onLikeChange?: (newState: boolean) => void;
}

export function OptimisticLikeButton({
    type,
    id,
    initialLiked = false,
    className = '',
    showText = true,
    onLikeChange
}: OptimisticLikeButtonProps) {
    const [liked, setLiked] = useState(initialLiked);
    const [isPending, startTransition] = useTransition();
    const { isSignedIn } = useAuth();
    const { error } = useToastContext();

    const handleLike = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isSignedIn) {
            error('Please sign in to like content');
            return;
        }

        startTransition(async () => {
            // Optimistically update button state
            const previousLiked = liked;
            const newLiked = !liked;
            setLiked(newLiked);
            onLikeChange?.(newLiked);

            try {
                const result = type === 'track'
                    ? await likeTrack(id)
                    : await likeAlbum(id);

                if (result.success) {
                    // Server confirms the new state
                    const finalLiked = result.liked ?? false;
                    setLiked(finalLiked);
                    onLikeChange?.(finalLiked);
                } else {
                    // Revert on failure
                    setLiked(previousLiked);
                    onLikeChange?.(previousLiked);
                    error(result.message);
                }
            } catch (err) {
                console.error('Error liking content:', err);
                // Revert on failure
                setLiked(previousLiked);
                onLikeChange?.(previousLiked);
                error('Failed to update like status');
            }
        });
    };

    return (
        <button
            onClick={handleLike}
            disabled={isPending}
            className={`flex items-center justify-center gap-2 ${showText ? 'px-6 py-3' : 'p-2'} border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 ${liked
                ? 'text-red-600 border-red-300 bg-red-50 dark:bg-red-900/20'
                : 'text-gray-700 dark:text-gray-300'
                } ${className}`}
        >
            <Heart className={`${showText ? 'h-4 w-4' : 'h-5 w-5'} ${liked ? 'fill-current text-red-500' : ''}`} />
            {showText && <span>{liked ? 'Liked' : 'Like'}</span>}
        </button>
    );
}

// Simple follow button - only handles button state, no count updates
type OptimisticFollowButtonProps = {
    artistId: string;
    initialFollowing?: boolean;
    className?: string;
    showText?: boolean;
}

export function OptimisticFollowButton({
    artistId,
    initialFollowing = false,
    className = '',
    showText = true
}: OptimisticFollowButtonProps) {
    const [following, setFollowing] = useState(initialFollowing);
    const [isPending, startTransition] = useTransition();
    const { isSignedIn } = useAuth();
    const { error } = useToastContext();

    const handleFollow = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isSignedIn) {
            error('Please sign in to follow artists');
            return;
        }

        startTransition(async () => {
            // Optimistically update button state
            const previousFollowing = following;
            setFollowing(!following);

            try {
                const result = await followArtist(artistId);
                if (result.success) {
                    // Server confirms the new state
                    setFollowing(result.following ?? false);
                } else {
                    // Revert on failure
                    setFollowing(previousFollowing);
                    error(result.message);
                }
            } catch (err) {
                console.error('Error following artist:', err);
                // Revert on failure
                setFollowing(previousFollowing);
                error('Failed to update follow status');
            }
        });
    };

    return (
        <button
            onClick={handleFollow}
            disabled={isPending}
            className={`flex items-center justify-center gap-2 ${showText ? 'px-6 py-3' : 'p-2'} border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 ${following
                ? 'text-blue-600 border-blue-300 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-700 dark:text-gray-300'
                } ${className}`}
        >
            <Users className={`${showText ? 'h-4 w-4' : 'h-5 w-5'} ${following ? 'fill-current text-blue-500' : ''}`} />
            {showText && <span>{following ? 'Following' : 'Follow'}</span>}
        </button>
    );
}

// Follow button with count updates - for components that display follower counts
type OptimisticFollowButtonWithCountProps = {
    artistId: string;
    initialFollowing?: boolean;
    initialFollowerCount?: number;
    className?: string;
    showText?: boolean;
    onCountChange?: (newCount: number) => void;
}

export function OptimisticFollowButtonWithCount({
    artistId,
    initialFollowing = false,
    initialFollowerCount = 0,
    className = '',
    showText = true,
    onCountChange
}: OptimisticFollowButtonWithCountProps) {
    const [following, setFollowing] = useState(initialFollowing);
    const [followerCount, setFollowerCount] = useState(initialFollowerCount);
    const [isPending, startTransition] = useTransition();
    const { isSignedIn } = useAuth();
    const { error } = useToastContext();

    const handleFollow = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isSignedIn) {
            error('Please sign in to follow artists');
            return;
        }

        startTransition(async () => {
            // Optimistically update button state and count
            const previousFollowing = following;
            const previousCount = followerCount;
            const newFollowing = !following;
            const newCount = newFollowing ? followerCount + 1 : followerCount - 1;

            setFollowing(newFollowing);
            setFollowerCount(newCount);
            onCountChange?.(newCount);

            try {
                const result = await followArtist(artistId);
                if (result.success) {
                    // Server confirms the new state
                    setFollowing(result.following ?? false);
                    // Keep the optimistic count since server doesn't return updated count
                } else {
                    // Revert on failure
                    setFollowing(previousFollowing);
                    setFollowerCount(previousCount);
                    onCountChange?.(previousCount);
                    error(result.message);
                }
            } catch (err) {
                console.error('Error following artist:', err);
                // Revert on failure
                setFollowing(previousFollowing);
                setFollowerCount(previousCount);
                onCountChange?.(previousCount);
                error('Failed to update follow status');
            }
        });
    };

    return (
        <button
            onClick={handleFollow}
            disabled={isPending}
            className={`flex items-center justify-center gap-2 ${showText ? 'px-6 py-3' : 'p-2'} border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 ${following
                ? 'text-blue-600 border-blue-300 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-700 dark:text-gray-300'
                } ${className}`}
        >
            <Users className={`${showText ? 'h-4 w-4' : 'h-5 w-5'} ${following ? 'fill-current text-blue-500' : ''}`} />
            {showText && <span>{following ? 'Following' : 'Follow'}</span>}
        </button>
    );
}

// Like button with count updates - for components that display like counts
type OptimisticLikeButtonWithCountProps = {
    type: 'track' | 'album';
    id: string;
    initialLiked?: boolean;
    initialLikeCount?: number;
    className?: string;
    showText?: boolean;
    onCountChange?: (newCount: number) => void;
}

export function OptimisticLikeButtonWithCount({
    type,
    id,
    initialLiked = false,
    initialLikeCount = 0,
    className = '',
    showText = true,
    onCountChange
}: OptimisticLikeButtonWithCountProps) {
    const [liked, setLiked] = useState(initialLiked);
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [isPending, startTransition] = useTransition();
    const { isSignedIn } = useAuth();
    const { error } = useToastContext();

    const handleLike = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isSignedIn) {
            error('Please sign in to like content');
            return;
        }

        startTransition(async () => {
            // Optimistically update button state and count
            const previousLiked = liked;
            const previousCount = likeCount;
            const newLiked = !liked;
            const newCount = newLiked ? likeCount + 1 : likeCount - 1;

            setLiked(newLiked);
            setLikeCount(newCount);
            onCountChange?.(newCount);

            try {
                const result = type === 'track'
                    ? await likeTrack(id)
                    : await likeAlbum(id);

                if (result.success) {
                    // Server confirms the new state
                    setLiked(result.liked ?? false);
                    // Keep the optimistic count since server doesn't return updated count
                } else {
                    // Revert on failure
                    setLiked(previousLiked);
                    setLikeCount(previousCount);
                    onCountChange?.(previousCount);
                    error(result.message);
                }
            } catch (err) {
                console.error('Error liking content:', err);
                // Revert on failure
                setLiked(previousLiked);
                setLikeCount(previousCount);
                onCountChange?.(previousCount);
                error('Failed to update like status');
            }
        });
    };

    return (
        <button
            onClick={handleLike}
            disabled={isPending}
            className={`flex items-center justify-center gap-2 ${showText ? 'px-6 py-3' : 'p-2'} border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 ${liked
                ? 'text-red-600 border-red-300 bg-red-50 dark:bg-red-900/20'
                : 'text-gray-700 dark:text-gray-300'
                } ${className}`}
        >
            <Heart className={`${showText ? 'h-4 w-4' : 'h-5 w-5'} ${liked ? 'fill-current text-red-500' : ''}`} />
            {showText && <span>{liked ? 'Liked' : 'Like'}</span>}
        </button>
    );
}