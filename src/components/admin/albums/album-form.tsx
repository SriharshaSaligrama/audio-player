"use client";

import { useActionState, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Save, X, Disc3, Image as ImageIcon, Users, Tag, Building2, FileText, Sparkles } from 'lucide-react';
import type { AlbumFormState } from '@/actions/admin/albums';
import { createAlbum, updateAlbum } from '@/actions/admin/albums';
import { CardImageUploader } from '@/components/admin/card-image-uploader';
import { AutocompleteInput } from '@/components/admin/autocomplete-input';
import { CalendarInput } from '@/components/admin/calendar-input';
import { GenreTagInput } from '@/components/admin/genre-tag-input';
import { BLOB_FOLDERS } from '@/lib/constants/images';
import type { Option, CreateInitial, EditInitial } from '@/types/common';

export type AlbumInitialData = {
    _id?: string;
    title?: string;
    artists?: string[];
    releaseDate?: string; // ISO string
    coverImage?: string;
    description?: string;
    genres?: string[];
    label?: string;
    coverImagePath?: string;
    isDeleted?: boolean;
    deletedAt?: string | null;
    takedownReason?: string;
    // add more fields if needed
};

type Props =
    | { mode: 'create'; artists: Option[]; initial?: CreateInitial<AlbumInitialData>; readonly?: never }
    | { mode: 'edit'; artists: Option[]; initial: EditInitial<AlbumInitialData>; readonly?: boolean };

function getInitialField<K extends keyof AlbumInitialData>(
    mode: 'create' | 'edit',
    initial: CreateInitial<AlbumInitialData> | EditInitial<AlbumInitialData> | undefined,
    key: K,
    defaultValue: AlbumInitialData[K]
): AlbumInitialData[K] {
    if (mode === 'edit' && initial && key in initial) {
        return initial[key] as AlbumInitialData[K];
    }
    return defaultValue;
}

const initialState: AlbumFormState = { success: false };

export function AlbumForm({ mode, artists, initial, readonly = false }: Props) {
    const action = mode === 'create' ? createAlbum : updateAlbum;
    const [state, formAction, isPending] = useActionState<AlbumFormState, FormData>(action, initialState);
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

    const initialCoverImage = getInitialField(mode, initial, 'coverImage', '') as string;
    const [coverImage, setCoverImage] = useState<string>(initialCoverImage);
    const [albumTitle, setAlbumTitle] = useState<string>(String(getInitialField(mode, initial, 'title', '') || ''));

    const [selectedArtists, setSelectedArtists] = useState<string[]>((getInitialField(mode, initial, 'artists', []) as string[]).map(String));
    const [selectedGenres, setSelectedGenres] = useState<string[]>((getInitialField(mode, initial, 'genres', []) as string[]));

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        <Disc3 className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {mode === 'create' ? 'Create New Album' : 'Edit Album'}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {mode === 'create' ? 'Add a new album to your music collection' : 'Update album information and metadata'}
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
                                Album Title *
                            </label>
                            <div className="relative">
                                <input
                                    name="title"
                                    required={!readonly}
                                    readOnly={readonly}
                                    value={albumTitle}
                                    onChange={(e) => {
                                        if (!readonly) {
                                            setAlbumTitle(e.target.value);
                                            clearError('title');
                                        }
                                    }}
                                    className={`w-full px-4 py-3 rounded-xl border text-base transition-all duration-200 ${readonly
                                        ? 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 cursor-not-allowed'
                                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                        }`}
                                    placeholder={readonly ? '' : "Enter album title"}
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <Disc3 className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                            {errors.title && (
                                <div className="mt-2 flex items-center gap-2 text-red-600 dark:text-red-400">
                                    <div className="w-1 h-1 rounded-full bg-red-500"></div>
                                    <p className="text-sm">{errors.title}</p>
                                </div>
                            )}
                        </div>

                        <AutocompleteInput
                            name="artistIds"
                            options={artists}
                            value={selectedArtists}
                            onChange={readonly ? () => { } : setSelectedArtists}
                            placeholder={readonly ? '' : "Search and select artists..."}
                            multiple={true}
                            required={!readonly}
                            label="Artists"
                            icon={<Users className="h-5 w-5 text-gray-400" />}
                            error={readonly ? undefined : errors.artistIds}
                            onClearError={() => !readonly && clearError('artistIds')}
                            disabled={readonly}
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                readOnly={readonly}
                                defaultValue={String(getInitialField(mode, initial, 'description', '') || '')}
                                onChange={() => !readonly && clearError('description')}
                                rows={4}
                                className={`w-full px-4 py-3 rounded-xl border resize-none transition-all duration-200 ${readonly
                                    ? 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 cursor-not-allowed'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                    }`}
                                placeholder={readonly ? '' : "Describe this album..."}
                            />
                        </div>
                    </div>
                </div>

                {/* Album Details Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <Tag className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Album Details</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CalendarInput
                            name="releaseDate"
                            value={String(getInitialField(mode, initial, 'releaseDate', '') || '')}
                            required={!readonly}
                            readOnly={readonly}
                            label="Release Date"
                            placeholder="Select release date"
                            error={readonly ? undefined : errors.releaseDate}
                            onClearError={() => !readonly && clearError('releaseDate')}
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Record Label
                            </label>
                            <div className="relative">
                                <input
                                    name="label"
                                    readOnly={readonly}
                                    defaultValue={String(getInitialField(mode, initial, 'label', '') || '')}
                                    onChange={() => !readonly && clearError('label')}
                                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${readonly
                                        ? 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 cursor-not-allowed'
                                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                        }`}
                                    placeholder={readonly ? '' : "Record label name"}
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <Building2 className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <GenreTagInput
                            name="genres"
                            value={selectedGenres}
                            onChange={readonly ? undefined : setSelectedGenres}
                            label="Genres"
                            placeholder="Type to add genres..."
                            readOnly={readonly}
                            error={readonly ? undefined : errors.genres}
                            onClearError={() => !readonly && clearError('genres')}
                            maxTags={6}
                        />
                    </div>
                </div>

                {/* Cover Art Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <ImageIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Cover Art</h2>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                        {readonly ? (
                            <div className="text-center">
                                {coverImage ? (
                                    <div className="relative w-48 h-48 mx-auto rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600">
                                        <Image
                                            src={coverImage}
                                            alt="Album cover"
                                            width={192}
                                            height={192}
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-48 h-48 mx-auto rounded-xl bg-gray-200 dark:bg-gray-600 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                                        <ImageIcon className="h-12 w-12 text-gray-400" />
                                    </div>
                                )}
                                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                                    {coverImage ? 'Album cover image' : 'No cover image'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <CardImageUploader
                                    name="coverImage"
                                    folder={BLOB_FOLDERS.albums}
                                    initialUrl={coverImage}
                                    onUploaded={(res) => setCoverImage(res.url)}
                                    entityId={albumTitle}
                                    clearError={clearError}
                                />
                                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                                    Upload a high-quality square image (recommended: 1000x1000px or larger)
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Link
                        href="/admin/albums"
                        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm"
                    >
                        <X className="h-4 w-4" />
                        {readonly ? 'Back' : 'Cancel'}
                    </Link>

                    {!readonly && (
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
                                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 rounded-xl shadow-lg hover:shadow-xl disabled:shadow-sm transition-all duration-200 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100"
                            >
                                {isPending ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                                        {mode === 'create' ? 'Creating Album...' : 'Saving Changes...'}
                                    </>
                                ) : (
                                    <>
                                        {mode === 'create' ? (
                                            <>
                                                <Sparkles className="h-4 w-4" />
                                                Create Album
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
                    )}
                </div>
            </form>
        </div>
    );
}

