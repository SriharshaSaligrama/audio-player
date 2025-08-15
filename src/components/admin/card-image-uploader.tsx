"use client";

import { useRef, useState, useEffect } from "react";
import { ImageCropper } from "@/components/admin/image-cropper";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { deleteBlobForEntity, isVercelBlobUrl } from "@/lib/utils/blob-cleanup";

export type UploadResult = { url: string; pathname: string };

type Props = {
    name: string; // hidden input name
    folder: string;
    ratio?: number; // width/height, default 1
    initialUrl?: string;
    onUploaded?: (res: UploadResult) => void;
    className?: string;
    label?: string;
    size?: number;
    entityId?: string;

    clearError?: (name: string) => void; // to clear form errors
};

export function CardImageUploader({ name, folder, ratio = 1, initialUrl, onUploaded, className, label = "Upload image", entityId, clearError }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const progressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const mountedRef = useRef(true);
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
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
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
        if (!mountedRef.current) return;

        // Delete old image if it belongs to this entity (non-blocking)
        if (imageUrl && isVercelBlobUrl(imageUrl) && entityId) {
            deleteBlobForEntity(imageUrl, entityId).catch(error => {
                console.warn('Failed to delete old image:', error);
            });
        }

        if (!mountedRef.current) return;

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
            if (mountedRef.current) {
                current = Math.min(90, current + 2);
                setProgress(current);
            }
        }, 120);

        try {
            const response = await fetch("/api/blob", { method: "POST", body: form });
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            if (!response.ok) {
                if (mountedRef.current) {
                    setProgress(0);
                }
                return;
            }
            const json = (await response.json()) as UploadResult;

            if (mountedRef.current) {
                setProgress(100);
            }
            if (mountedRef.current) {
                // Add cache-busting timestamp to force refresh
                const cacheBustedUrl = `${json.url}?t=${Date.now()}`;
                setImageUrl(cacheBustedUrl);
                onUploaded?.({ ...json, url: json.url }); // Send original URL to backend
                clearError?.(name); // Clear any previous errors
            }
        } catch (e) {
            console.error(e);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            if (mountedRef.current) {
                setProgress(0);
            }
        } finally {
            // Clear any existing progress timeout
            if (progressTimeoutRef.current) {
                clearTimeout(progressTimeoutRef.current);
            }
            progressTimeoutRef.current = setTimeout(() => {
                if (mountedRef.current) {
                    setProgress(0);
                    progressTimeoutRef.current = null;
                }
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
        if (!mountedRef.current) return;

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

            {/* Full width container that maintains aspect ratio */}
            <div className="w-full">
                <div
                    className="relative group w-full"
                    style={{
                        aspectRatio: ratio.toString(),
                        minHeight: '160px',
                        maxHeight: '300px'
                    }}
                >
                    {/* Animated background glow */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl -z-10"></div>

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
                        className={`relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center border-2 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/25 transform hover:scale-[1.01] active:scale-[0.99] ${dragOver
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
                                    alt="cover"
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
                                <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </>
                        ) : (
                            <div className="text-center p-6 w-full h-full">
                                {/* Full height layout that scales with container */}
                                <div className="flex flex-col items-center justify-center h-full">
                                    {/* Responsive icon container */}
                                    <div className="relative w-16 h-16 mx-auto mb-4">
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 animate-pulse"></div>
                                        <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        {/* Floating particles */}
                                        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0s' }}></div>
                                        <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className={`text-base font-semibold transition-colors ${dragOver
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
                                            JPG, PNG, WebP supported
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Enhanced hover overlay */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-pink-900/40 flex items-center justify-center rounded-2xl backdrop-blur-sm">
                            <div className="text-center text-white">
                                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div className="text-sm font-semibold">
                                    {imageUrl ? 'Change Image' : 'Upload Image'}
                                </div>
                                <div className="text-xs opacity-80 mt-1">
                                    {imageUrl ? 'Click to replace' : 'Drag & drop or click'}
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
                            className="absolute right-2 top-2 h-8 w-8 grid place-items-center rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all duration-300 transform hover:scale-110 active:scale-95 z-20 backdrop-blur-sm border border-red-400/50"
                            title="Remove image"
                        >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                    )}

                    {/* Enhanced progress overlay */}
                    {progress > 0 && (
                        <div className="absolute inset-0 grid place-items-center bg-white/95 dark:bg-gray-900/95 rounded-2xl backdrop-blur-md">
                            <div className="text-center">
                                <div className="relative">
                                    {/* Simplified progress visualization */}
                                    <div className="relative w-16 h-16 mb-3 mx-auto">
                                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
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
                                                stroke="url(#cardProgressGradient)"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeDasharray={`${Math.round((progress / 100) * 2 * Math.PI * 16)} ${Math.round(2 * Math.PI * 16)}`}
                                                className="transition-all duration-300"
                                            />
                                            <defs>
                                                <linearGradient id="cardProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#3b82f6" />
                                                    <stop offset="50%" stopColor="#8b5cf6" />
                                                    <stop offset="100%" stopColor="#ec4899" />
                                                </linearGradient>
                                            </defs>
                                        </svg>

                                        {/* Center content */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                                    {progress}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-sm font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                            Uploading
                                        </div>
                                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                            Processing image...
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success state indicator */}
                    {imageUrl && !progress && (
                        <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    aspect={ratio}
                    title="Crop image"
                    filename={entityId ? `${entityId.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg` : "image.jpg"}
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
