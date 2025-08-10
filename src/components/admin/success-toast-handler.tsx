'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';

const SUCCESS_MESSAGES = {
    artist_created: 'Artist created successfully!',
    artist_updated: 'Artist updated successfully!',
    artist_deleted: 'Artist deleted successfully!',
    album_created: 'Album created successfully!',
    album_updated: 'Album updated successfully!',
    album_deleted: 'Album deleted successfully!',
    track_created: 'Track created successfully!',
    track_updated: 'Track updated successfully!',
    track_deleted: 'Track deleted successfully!',
} as const;

export function SuccessToastHandler() {
    const searchParams = useSearchParams();
    const toast = useToast();
    const router = useRouter();

    useEffect(() => {
        // First, check URL parameters
        const success = searchParams.get('success');
        
        if (success && success in SUCCESS_MESSAGES) {
            toast.success(SUCCESS_MESSAGES[success as keyof typeof SUCCESS_MESSAGES]);
            
            // Clear the URL params
            setTimeout(() => {
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.delete('success');
                router.replace(currentUrl.pathname + (currentUrl.search || ''));
            }, 100);
            return;
        }

        // Check cookies for success message
        const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
            return null;
        };
        
        const cookieSuccess = getCookie('admin_success_message');
        
        if (cookieSuccess && cookieSuccess in SUCCESS_MESSAGES) {
            toast.success(SUCCESS_MESSAGES[cookieSuccess as keyof typeof SUCCESS_MESSAGES]);
            
            // Clear the cookie
            document.cookie = 'admin_success_message=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
            return;
        }

        // Also check sessionStorage as backup
        const sessionSuccess = sessionStorage.getItem('admin_success_message');
        
        if (sessionSuccess && sessionSuccess in SUCCESS_MESSAGES) {
            toast.success(SUCCESS_MESSAGES[sessionSuccess as keyof typeof SUCCESS_MESSAGES]);
            sessionStorage.removeItem('admin_success_message');
        }
    }, [searchParams, toast, router]);

    return null;
}
