"use client";

import { useActionState, useEffect, useState } from 'react';
import Link from 'next/link';
import { Save, X, User, Image as ImageIcon, Globe, Music, FileText, Hash, Sparkles } from 'lucide-react';
import type { ArtistFormState } from '@/actions/admin/artists';
import { createArtist, updateArtist } from '@/actions/admin/artists';
import { AvatarUploader } from '@/components/admin/avatar-uploader';
import { CardImageUploader } from '@/components/admin/card-image-uploader';
import { BLOB_FOLDERS } from '@/lib/constants/images';
import type { CreateInitial, EditInitial } from '@/types/common';

type ArtistInitialData = {
    name?: string;
    avatar?: string;
    coverImage?: string;
    bio?: string;
    genres?: string[];
    socialLinks?: {
        spotify?: string;
        twitter?: string;
        instagram?: string;
    };
    [key: string]: unknown;  // to allow other possible fields
};

type Props<T = unknown> =
    | { mode: 'create'; initial?: CreateInitial<T> }
    | { mode: 'edit'; initial: EditInitial<T> };

const initialState: ArtistFormState = { success: false };

export function ArtistForm({ mode, initial }: Props<ArtistInitialData>) {
    const action = mode === 'create' ? createArtist : updateArtist;
    const [state, formAction, isPending] = useActionState<ArtistFormState, FormData>(action, initialState);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (state?.errors) setErrors(state.errors);
    }, [state]);


    const clearError = (name: string) => {
        if (errors[name]) {
            const next = { ...errors };
            delete next[name];
            setErrors(next);
        }
    };

    const [avatar, setAvatar] = useState<string>(String(initial?.avatar || ''));
    const [coverImage, setCoverImage] = useState<string>(String(initial?.coverImage || ''));

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        <User className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {mode === 'create' ? 'Create New Artist' : 'Edit Artist'}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {mode === 'create' ? 'Add a new artist to your music library' : 'Update artist information and settings'}
                        </p>
                    </div>
                </div>
            </div>

            <form action={formAction} className="space-y-8">
                {mode === 'edit' && initial?._id && <input type="hidden" name="id" defaultValue={String(initial._id)} />}

                {/* Basic Information Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Artist Name *
                            </label>
                            <div className="relative">
                                <input
                                    name="name"
                                    required
                                    defaultValue={String(initial?.name || '')}
                                    onChange={() => clearError('name')}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-base"
                                    placeholder="Enter artist name"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                            {errors.name && (
                                <div className="mt-2 flex items-center gap-2 text-red-600 dark:text-red-400">
                                    <div className="w-1 h-1 rounded-full bg-red-500"></div>
                                    <p className="text-sm">{errors.name}</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Biography
                            </label>
                            <textarea
                                name="bio"
                                defaultValue={String(initial?.bio || '')}
                                onChange={() => clearError('bio')}
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                                placeholder="Tell us about this artist..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Genres
                            </label>
                            <div className="relative">
                                <input
                                    name="genres"
                                    defaultValue={(initial?.genres as string[] | undefined)?.join?.(', ') ?? ''}
                                    onChange={() => clearError('genres')}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Rock, Pop, Jazz (comma separated)"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <Music className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Separate multiple genres with commas</p>
                        </div>
                    </div>
                </div>

                {/* Media Assets Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <ImageIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Media Assets</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Profile Avatar
                            </label>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                <AvatarUploader
                                    key={avatar || 'no-avatar'}
                                    name="avatar"
                                    folder={BLOB_FOLDERS.artists}
                                    initialUrl={avatar}
                                    onUploaded={(res) => {
                                        setAvatar(res.url);
                                    }}
                                    entityId={String(initial?._id || '')}
                                    oldPathname={String(initial?.avatarPath || '')}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Cover Image
                            </label>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                <CardImageUploader
                                    key={coverImage || 'no-cover'}
                                    name="coverImage"
                                    folder={BLOB_FOLDERS.artists}
                                    initialUrl={coverImage}
                                    onUploaded={(res) => {
                                        setCoverImage(res.url);
                                    }}
                                    entityId={String(initial?._id || '')}
                                    oldPathname={String(initial?.coverImagePath || '')}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Links Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <Globe className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Social Links</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Spotify
                            </label>
                            <div className="relative">
                                <input
                                    name="spotify"
                                    defaultValue={String(initial?.socialLinks?.spotify || '')}
                                    onChange={() => clearError('spotify')}
                                    className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Spotify profile URL"
                                />
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <div className="w-5 h-5 rounded bg-green-500 flex items-center justify-center">
                                        <Music className="h-3 w-3 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Twitter
                            </label>
                            <div className="relative">
                                <input
                                    name="twitter"
                                    defaultValue={String(initial?.socialLinks?.twitter || '')}
                                    onChange={() => clearError('twitter')}
                                    className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Twitter profile URL"
                                />
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center">
                                        <Hash className="h-3 w-3 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Instagram
                            </label>
                            <div className="relative">
                                <input
                                    name="instagram"
                                    defaultValue={String(initial?.socialLinks?.instagram || '')}
                                    onChange={() => clearError('instagram')}
                                    className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Instagram profile URL"
                                />
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <div className="w-5 h-5 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Link
                        href="/admin/artists"
                        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm"
                    >
                        <X className="h-4 w-4" />
                        Cancel
                    </Link>

                    <div className="flex items-center gap-4">
                        {state?.message && (
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${state.success
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                                }`}>
                                <div className={`w-2 h-2 rounded-full ${state.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                {state.message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 rounded-xl shadow-lg hover:shadow-xl disabled:shadow-sm transition-all duration-200 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100"
                        >
                            {isPending ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                                    {mode === 'create' ? 'Creating Artist...' : 'Saving Changes...'}
                                </>
                            ) : (
                                <>
                                    {mode === 'create' ? (
                                        <>
                                            <Sparkles className="h-4 w-4" />
                                            Create Artist
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Save Changes
                                        </>
                                    )}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

