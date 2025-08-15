"use client";

import { useRef, useState, useEffect } from "react";
import { ImageCropper } from "@/components/admin/image-cropper";
import Image from "next/image";
import { deleteBlobForEntity, isVercelBlobUrl } from "@/lib/utils/blob-cleanup";

export type UploadResult = { url: string; pathname: string };

type Props = {
    name: string; // hidden input name
    folder: string;
    initialUrl?: string;
    onUploaded?: (res: UploadResult) => void;
    className?: string;
    label?: string;
    entityId?: string; // to name blobs consistently

    clearError?: (name: string) => void; // to clear form errors
};

export function AvatarUploader({ name, folder, initialUrl, onUploaded, className, label = "Upload avatar", entityId, clearError }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const progressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [imageUrl, setImageUrl] = useState<string | undefined>(initialUrl);
    const [progress, setProgress] = useState<number>(0);
    const [showCropper, setShowCropper] = useState(false);
    const [pendingSrc, setPendingSrc] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);

    // Sync internal state when initialUrl changes
    useEffect(() => {
        setImageUrl(initialUrl);
    }, [initialUrl]);

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            if (progressTimeoutRef.current) {
                clearTimeout(progressTimeoutRef.current);
                progressTimeoutRef.current = null;
            }
        };
    }, []);

    const openFile = () => inputRef.current?.click();

    const upload = async (file: File) => {
        // Delete old image if it belongs to this entity (non-blocking)
        if (imageUrl && isVercelBlobUrl(imageUrl) && entityId) {
            deleteBlobForEntity(imageUrl, entityId).catch(error => {
                console.warn('Failed to delete old image:', error);
            });
        }

        const form = new FormData();
        form.append("file", file);
        form.append("folder", folder);
        if (entityId) form.append("entityId", entityId);

        setProgress(1);
        let current = 1;

        // Clear any existing timer
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        timerRef.current = setInterval(() => {
            current = Math.min(90, current + 2);
            setProgress(current);
        }, 120);

        try {
            const response = await fetch("/api/blob", { method: "POST", body: form });
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            if (!response.ok) {
                setProgress(0);
                return;
            }
            const json = (await response.json()) as UploadResult;

            setProgress(100);
            // Add cache-busting timestamp to force refresh
            const cacheBustedUrl = `${json.url}?t=${Date.now()}`;
            setImageUrl(cacheBustedUrl);
            onUploaded?.({ ...json, url: json.url }); // Send original URL to backend
            clearError?.(name); // Clear any previous errors if clearError function is available
        } catch (e) {
            console.error(e);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            setProgress(0);
        } finally {
            // Clear any existing progress timeout
            if (progressTimeoutRef.current) {
                clearTimeout(progressTimeoutRef.current);
            }
            progressTimeoutRef.current = setTimeout(() => {
                setProgress(0);
                progressTimeoutRef.current = null;
            }, 500);
        }
    };

    const onFiles = (files?: FileList | null) => {
        if (!files || files.length === 0) return;
        const file = files[0];
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = String(reader.result || "");
            setPendingSrc(dataUrl);
            setShowCropper(true);
        };
        reader.readAsDataURL(file);
    };

    const remove = async () => {
        // Immediately update UI
        setImageUrl(undefined);

        // Delete from blob storage in background (non-blocking)
        if (imageUrl && isVercelBlobUrl(imageUrl) && entityId) {
            deleteBlobForEntity(imageUrl, entityId).catch(error => {
                console.warn('Failed to delete image:', error);
            });
        }
    };

    return (
        <div className={className}>
            <input type="hidden" name={name} value={imageUrl || ""} />
            <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => onFiles(e.target.files)} />

            {/* Full width container that maintains perfect circle */}
            <div className="w-full flex justify-center">
                <div
                    className="relative group aspect-square"
                    style={{
                        width: 'min(100%, 300px)',
                        minWidth: '160px'
                    }}
                >
                    {/* Animated background glow */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl -z-10"></div>

                    {/* Main upload area */}
                    <button
                        type="button"
                        onClick={openFile}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDragOver(false);
                            onFiles(e.dataTransfer.files);
                        }}
                        className={`relative w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center border-2 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/25 transform hover:scale-[1.01] active:scale-[0.99] ${dragOver
                            ? 'border-solid border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : imageUrl
                                ? 'border-solid border-blue-300/30 dark:border-blue-600/30'
                                : 'border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                            }`}
                        style={{
                            background: imageUrl && !dragOver ? 'transparent' : undefined
                        }}
                        aria-label={label}
                    >
                        {imageUrl ? (
                            <>
                                <Image
                                    src={imageUrl}
                                    alt="avatar"
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    unoptimized={true}
                                    key={imageUrl}
                                    priority={true}
                                />
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                {/* Corner accent */}
                                <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </>
                        ) : (
                            <div className="text-center p-8 w-full h-full">
                                {/* Full height layout that scales with container */}
                                <div className="flex flex-col items-center justify-center h-full">
                                    {/* Responsive icon container */}
                                    <div className="relative w-20 h-20 mx-auto mb-6">
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 animate-pulse"></div>
                                        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        {/* Floating particles */}
                                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0s' }}></div>
                                        <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                                        <div className="absolute top-1/2 -left-2 w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '1s' }}></div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className={`text-xl font-semibold transition-colors ${dragOver
                                            ? 'text-blue-700 dark:text-blue-300'
                                            : 'text-gray-800 dark:text-gray-200'
                                            }`}>
                                            {dragOver ? 'Drop image here' : label}
                                        </div>
                                        <div className={`text-sm transition-colors ${dragOver
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-gray-600 dark:text-gray-400'
                                            }`}>
                                            {dragOver ? 'Release to upload' : 'Click to browse or drag & drop'}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-500">
                                            JPG, PNG, WebP supported • Perfect square recommended
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Enhanced hover overlay */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-pink-900/40 flex items-center justify-center rounded-full backdrop-blur-sm">
                            <div className="text-center text-white">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div className="text-base font-semibold">
                                    {imageUrl ? 'Change Avatar' : 'Upload Avatar'}
                                </div>
                                <div className="text-sm opacity-80 mt-2">
                                    {imageUrl ? 'Click to replace your photo' : 'Drag & drop or click to browse'}
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* Enhanced delete button */}
                    {imageUrl && (
                        <button
                            type="button"
                            onClick={remove}
                            aria-label="Remove image"
                            className="absolute right-3 top-3 h-10 w-10 grid place-items-center rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all duration-300 transform hover:scale-110 active:scale-95 z-20 backdrop-blur-sm border border-red-400/50"
                            title="Remove image"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}

                    {/* Enhanced progress overlay */}
                    {progress > 0 && (
                        <div className="absolute inset-0 grid place-items-center bg-white/95 dark:bg-gray-900/95 rounded-full backdrop-blur-md">
                            <div className="text-center">
                                <div className="relative">
                                    {/* Simplified progress visualization */}
                                    <div className="relative w-20 h-20 mx-auto mb-4">
                                        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                                            <circle
                                                cx="18"
                                                cy="18"
                                                r="16"
                                                fill="none"
                                                stroke="rgba(0,0,0,0.1)"
                                                strokeWidth="3"
                                            />
                                            <circle
                                                cx="18"
                                                cy="18"
                                                r="16"
                                                fill="none"
                                                stroke="url(#avatarProgressGradient)"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeDasharray={`${Math.round((progress / 100) * 2 * Math.PI * 16)} ${Math.round(2 * Math.PI * 16)}`}
                                                className="transition-all duration-300"
                                            />
                                            <defs>
                                                <linearGradient id="avatarProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#3b82f6" />
                                                    <stop offset="50%" stopColor="#8b5cf6" />
                                                    <stop offset="100%" stopColor="#ec4899" />
                                                </linearGradient>
                                            </defs>
                                        </svg>

                                        {/* Center content */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-700 dark:text-gray-300">
                                                    {progress}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-base font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                            Uploading
                                        </div>
                                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Processing your avatar...
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success state indicator */}
                    {imageUrl && !progress && (
                        <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    )}
                </div>
            </div>

            {showCropper && pendingSrc && (
                <ImageCropper
                    open={showCropper}
                    src={pendingSrc}
                    aspect={1}
                    title="Crop avatar"
                    filename={entityId ? `${entityId.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg` : "avatar.jpg"}
                    onCancel={() => setShowCropper(false)}
                    onCropped={(file) => {
                        setShowCropper(false);
                        upload(file);
                    }}
                />
            )}
        </div>
    );
}
