"use client";

import { useRef, useState } from "react";
import { Upload, FileAudio, CheckCircle, AlertCircle } from "lucide-react";

type UploadResult = { url: string; pathname: string };

type Props = {
    folder: string;
    onUploaded: (res: UploadResult) => void;
    accept?: string;
    className?: string;
    label?: string;
};

export function UploadDropzone({ folder, onUploaded, accept, className, label = "Drop file or click to upload" }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [progress, setProgress] = useState<number>(0);
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadComplete, setUploadComplete] = useState(false);

    const upload = (file: File) => {
        setError(null);
        setUploadComplete(false);
        const form = new FormData();
        form.append("file", file);
        form.append("folder", folder);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/blob");
        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                setProgress(Math.round((e.loaded / e.total) * 100));
            }
        };
        xhr.onload = () => {
            try {
                const json = JSON.parse(xhr.responseText);
                if (xhr.status >= 200 && xhr.status < 300) {
                    setUploadComplete(true);
                    onUploaded(json as UploadResult);
                    setTimeout(() => {
                        setProgress(0);
                        setUploadComplete(false);
                    }, 2000);
                } else {
                    setError(json?.error?.message || "Upload failed");
                }
            } catch (e) {
                console.error(e);
                setError("Upload failed");
            } finally {
                if (!uploadComplete) {
                    setTimeout(() => setProgress(0), 1000);
                }
            }
        };
        xhr.onerror = () => {
            setError("Network error during upload");
            setProgress(0);
        };
        xhr.send(form);
    };

    const onFiles = (files?: FileList | null) => {
        if (!files || files.length === 0) return;
        const file = files[0];
        if (accept && !file.type.match(accept.replace(".*", ".*"))) {
            setError("Unsupported file type");
            return;
        }
        upload(file);
    };

    const isAudio = accept?.includes('audio');

    return (
        <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${dragOver
                ? "border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-500"
                : error
                    ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-500"
                    : uploadComplete
                        ? "border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-500"
                        : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                } ${className ?? ""}`}
            onClick={() => inputRef.current?.click()}
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
        >
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                hidden
                onChange={(e) => onFiles(e.target.files)}
            />

            {progress > 0 && !uploadComplete ? (
                <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Uploading... {progress}%
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            ) : uploadComplete ? (
                <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-green-500 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-green-700 dark:text-green-400">
                            Upload Complete!
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-500">
                            File uploaded successfully
                        </div>
                    </div>
                </div>
            ) : error ? (
                <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-red-500 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
                            Upload Failed
                        </div>
                        <div className="text-sm text-red-600 dark:text-red-500 mb-4">
                            {error}
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setError(null);
                            }}
                            className="px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${dragOver
                        ? "bg-green-500 scale-110"
                        : "bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-500 dark:to-gray-600"
                        } transition-all duration-200`}>
                        {isAudio ? (
                            <FileAudio className="w-8 h-8 text-white" />
                        ) : (
                            <Upload className="w-8 h-8 text-white" />
                        )}
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {dragOver ? "Drop file here" : label}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {isAudio ? "Supports MP3, WAV, FLAC and other audio formats" : "Click to browse or drag and drop"}
                        </div>
                        {accept && (
                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                                Accepted: {accept.replace(/\*/g, '').replace(/\//g, ', ').toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
