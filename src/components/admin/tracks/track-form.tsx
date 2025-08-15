"use client";

import { useActionState, useEffect, useState } from 'react';
import Link from 'next/link';
import { Save, X, Music, Users, Disc3, Clock, Tag, Upload, Image as ImageIcon, FileText, Sparkles } from 'lucide-react';
import type { TrackFormState } from '@/actions/admin/tracks';
import { createTrack, updateTrack } from '@/actions/admin/tracks';
import { UploadDropzone } from '@/components/upload-dropzone';
import { CardImageUploader } from '@/components/admin/card-image-uploader';
import { AutocompleteInput } from '@/components/admin/autocomplete-input';
import { CalendarInput } from '@/components/admin/calendar-input';
import { GenreTagInput } from '@/components/admin/genre-tag-input';
import { BLOB_FOLDERS } from '@/lib/constants/images';
import type { Option, CreateInitial, EditInitial } from '@/types/common';
import { ObjectId } from 'mongodb';
import { extractAudioMetadata, formatDuration } from '@/lib/utils/audio';

export type TrackInitialData = {
    _id?: string | ObjectId;
    fileUrl?: string;
    defaultAlbum?: string;
    coverImage?: string;
    title?: string;
    artists?: string[];
    albums?: string[];
    releaseDate?: string; // ISO string
    duration?: number;
    genres?: string[];
    tags?: string[];
    coverImagePath?: string;
    description?: string;
    label?: string;
    // Add any other fields you use
};

type Props = { mode: 'create'; artists: Option[]; albums: Option[]; initial?: CreateInitial<TrackInitialData> } |
{ mode: 'edit'; artists: Option[]; albums: Option[]; initial: EditInitial<TrackInitialData> };

function getInitialField<T, K extends keyof T>(
    mode: 'create' | 'edit',
    initial: CreateInitial<T> | EditInitial<T> | undefined,
    key: K,
    defaultValue: T[K]
): T[K] {
    if (mode === 'edit' && initial && key in initial) {
        return initial[key];
    }
    return defaultValue;
}

export function TrackForm({ mode, artists, albums, initial }: Props) {
    const action = mode === 'create' ? createTrack : updateTrack;
    const [state, formAction, isPending] = useActionState<TrackFormState, FormData>(action, { success: false });
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

    // Use helper to safely get initial values
    const initialFileUrl = getInitialField(mode, initial, 'fileUrl', '') as string;
    const initialCoverImage = getInitialField(mode, initial, 'coverImage', '') as string;
    const defaultAlbumId = String(getInitialField(mode, initial, 'defaultAlbum', '') || '');

    const [fileUrl, setFileUrl] = useState<string>(initialFileUrl);
    const [coverImage, setCoverImage] = useState<string>(initialCoverImage);
    const [selectedArtists, setSelectedArtists] = useState<string[]>((getInitialField(mode, initial, 'artists', []) as string[]).map(String));
    const [selectedAlbums, setSelectedAlbums] = useState<string[]>((getInitialField(mode, initial, 'albums', []) as string[]).map(String));
    const [selectedDefaultAlbum, setSelectedDefaultAlbum] = useState<string[]>(defaultAlbumId ? [defaultAlbumId] : []);
    const [selectedGenres, setSelectedGenres] = useState<string[]>(() => {
        const genreValue = getInitialField(mode, initial, 'genres', []);
        return genreValue ? genreValue.map(g => g.trim()).filter(Boolean) : [];
    });
    const [audioMetadata, setAudioMetadata] = useState<{ duration: number; fileSize: number } | null>(null);
    const [trackTitle, setTrackTitle] = useState<string>(String(getInitialField(mode, initial, 'title', '') || ''));

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-blue-500 text-white">
                        <Music className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {mode === 'create' ? 'Create New Track' : 'Edit Track'}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {mode === 'create' ? 'Add a new track to your music library' : 'Update track information and metadata'}
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
                                Track Title *
                            </label>
                            <div className="relative">
                                <input
                                    name="title"
                                    required
                                    value={trackTitle}
                                    onChange={(e) => {
                                        setTrackTitle(e.target.value);
                                        clearError('title');
                                    }}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-base"
                                    placeholder="Enter track title"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <Music className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                            {errors.title && (
                                <div className="mt-2 flex items-center gap-2 text-red-600 dark:text-red-400">
                                    <div className="w-1 h-1 rounded-full bg-red-500"></div>
                                    <p className="text-sm">{errors.title}</p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <AutocompleteInput
                                name="artistIds"
                                options={artists}
                                value={selectedArtists}
                                onChange={setSelectedArtists}
                                placeholder="Search and select artists..."
                                multiple={true}
                                required={true}
                                label="Artists"
                                icon={<Users className="h-5 w-5 text-gray-400" />}
                                error={errors.artistIds}
                                onClearError={() => clearError('artistIds')}
                            />

                            <AutocompleteInput
                                name="albumIds"
                                options={albums}
                                value={selectedAlbums}
                                onChange={setSelectedAlbums}
                                placeholder="Search and select albums..."
                                multiple={true}
                                required={true}
                                label="Albums"
                                icon={<Disc3 className="h-5 w-5 text-gray-400" />}
                                error={errors.albumIds}
                                onClearError={() => clearError('albumIds')}
                            />
                        </div>

                        <AutocompleteInput
                            name="defaultAlbum"
                            options={albums}
                            value={selectedDefaultAlbum}
                            onChange={setSelectedDefaultAlbum}
                            placeholder="Select primary album..."
                            multiple={false}
                            required={true}
                            label="Primary Album"
                            icon={<Disc3 className="h-5 w-5 text-gray-400" />}
                            error={errors.defaultAlbum}
                            onClearError={() => clearError('defaultAlbum')}
                        />
                    </div>
                </div>

                {/* Track Details Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <Tag className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Track Details</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CalendarInput
                            name="releaseDate"
                            value={String(getInitialField(mode, initial, 'releaseDate', '') || '')}
                            required={true}
                            label="Release Date"
                            placeholder="Select release date"
                            error={errors.releaseDate}
                            onClearError={() => clearError('releaseDate')}
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Duration
                            </label>
                            <div className="relative">
                                <div className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white">
                                    {audioMetadata?.duration ? formatDuration(audioMetadata.duration) :
                                        mode === 'edit' && getInitialField(mode, initial, 'duration', 0) ?
                                            formatDuration(Number(getInitialField(mode, initial, 'duration', 0))) :
                                            'Upload audio file to detect duration'}
                                </div>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <Clock className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Duration will be automatically detected from the uploaded audio file
                                {audioMetadata?.fileSize && (
                                    <span className="ml-2">• File size: {(audioMetadata.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                                )}
                            </p>
                            {/* Hidden input to submit the duration */}
                            <input
                                type="hidden"
                                name="duration"
                                value={audioMetadata?.duration || getInitialField(mode, initial, 'duration', 0) || 0}
                            />
                            {/* Hidden input to submit the file size */}
                            <input
                                type="hidden"
                                name="fileSize"
                                value={audioMetadata?.fileSize || 0}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <GenreTagInput
                            name="genres"
                            value={selectedGenres}
                            onChange={setSelectedGenres}
                            label="Genres"
                            placeholder="Type to add genres..."
                            error={errors.genre}
                            onClearError={() => clearError('genre')}
                            maxTags={8}
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Tags
                            </label>
                            <div className="relative">
                                <input
                                    name="tags"
                                    defaultValue={(getInitialField(mode, initial, 'tags', []) as string[]).join(', ')}
                                    onChange={() => clearError('tags')}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                    placeholder="acoustic, live, remix (comma separated)"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <Tag className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Separate multiple tags with commas</p>
                        </div>
                    </div>
                </div>

                {/* Audio File Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <Upload className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Audio File *</h2>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                        <input type="hidden" name="fileUrl" value={fileUrl} />
                        <UploadDropzone
                            folder={BLOB_FOLDERS.tracks}
                            onUploaded={(res) => setFileUrl(res.url)}
                            onFileSelected={async (file) => {
                                try {
                                    const metadata = await extractAudioMetadata(file);
                                    setAudioMetadata(metadata);
                                    clearError('duration');
                                } catch (error) {
                                    console.error('Failed to extract audio metadata:', error);
                                    setAudioMetadata({ duration: 0, fileSize: file.size });
                                }
                            }}
                            accept="audio/*"
                            label={fileUrl ? 'Replace uploaded file' : 'Upload audio file'}
                        />
                        {fileUrl && (
                            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span className="text-sm font-medium">Audio file uploaded successfully</span>
                                </div>
                            </div>
                        )}
                        {errors.fileUrl && (
                            <div className="mt-4 flex items-center gap-2 text-red-600 dark:text-red-400">
                                <div className="w-1 h-1 rounded-full bg-red-500"></div>
                                <p className="text-sm">{errors.fileUrl}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Cover Art Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <ImageIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Cover Art</h2>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                        <CardImageUploader
                            name="coverImage"
                            folder={BLOB_FOLDERS.tracks}
                            initialUrl={coverImage}
                            onUploaded={(res) => setCoverImage(res.url)}
                            entityId={trackTitle}
                            clearError={clearError}
                        />
                        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                            Optional: Upload custom cover art. If not provided, the album&apos;s cover will be used.
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Link
                        href="/admin/tracks"
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
                            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 rounded-xl shadow-lg hover:shadow-xl disabled:shadow-sm transition-all duration-200 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100"
                        >
                            {isPending ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                                    {mode === 'create' ? 'Creating Track...' : 'Saving Changes...'}
                                </>
                            ) : (
                                <>
                                    {mode === 'create' ? (
                                        <>
                                            <Sparkles className="h-4 w-4" />
                                            Create Track
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

