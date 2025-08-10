'use client';

import { useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { Camera, Loader2, User } from 'lucide-react';
import Image from 'next/image';
import { validateImageFile, getImageProps, isValidImageUrl } from '@/lib/utils/image';

interface ProfileImageUploadProps {
    currentImageUrl?: string;
    size?: number;
}

export function ProfileImageUpload({
    currentImageUrl,
    size = 96
}: ProfileImageUploadProps) {
    const { user } = useUser();
    const [isUploading, setIsUploading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        // Validate file
        const validation = validateImageFile(file);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        setIsUploading(true);
        try {
            await user.setProfileImage({ file });
            // Reset image error state and refresh
            setImageError(false);
            window.location.reload();
        } catch (error) {
            console.error('Failed to upload image:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="relative">
            <div
                className="rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700"
                style={{ width: size, height: size }}
            >
                {currentImageUrl && isValidImageUrl(currentImageUrl) && !imageError ? (
                    <Image
                        {...getImageProps(currentImageUrl, size)}
                        alt="Profile"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <User className="text-gray-400" style={{ width: size * 0.4, height: size * 0.4 }} />
                    </div>
                )}
            </div>

            <button
                onClick={triggerFileInput}
                disabled={isUploading}
                className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-full shadow-lg transition-colors"
                title="Change profile picture"
            >
                {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Camera className="w-4 h-4" />
                )}
            </button>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
            />
        </div>
    );
}