/**
 * Utility functions for managing blob storage cleanup
 */

import { urlBelongsToEntity } from './image-cache';

/**
 * Delete a blob by its URL
 */
export async function deleteBlob(url: string): Promise<boolean> {
    try {
        const pathname = new URL(url).pathname;
        const response = await fetch('/api/blob', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pathname }),
        });

        return response.ok;
    } catch (error) {
        console.error('Failed to delete blob:', error);
        return false;
    }
}

/**
 * Delete a blob if it belongs to a specific entity (ignoring timestamp)
 */
export async function deleteBlobForEntity(url: string, entityId: string): Promise<boolean> {
    if (!isVercelBlobUrl(url)) {
        console.warn('Attempted to delete non-Vercel blob URL:', url);
        return false;
    }

    if (!urlBelongsToEntity(url, entityId)) {
        console.warn('URL does not belong to entity, skipping deletion:', url, entityId);
        return false;
    }

    return deleteBlob(url);
}

/**
 * Extract pathname from blob URL
 */
export function getBlobPathname(url: string): string | null {
    try {
        return new URL(url.split('?')[0]).pathname;
    } catch {
        return null;
    }
}

/**
 * Check if a URL is a Vercel blob URL
 */
export function isVercelBlobUrl(url: string): boolean {
    return url.includes('blob.vercel-storage.com');
}