/**
 * Utility functions for handling image caching issues
 */

/**
 * Generates a unique filename with entity name and timestamp for blob storage
 * @param entityId - The entity identifier (artist name, album title, etc.)
 * @param folder - The folder type (artists, albums, tracks)
 * @param extension - File extension (default: 'jpg')
 * @returns Unique filename with entity name and timestamp
 */
export function generateUniqueFilename(entityId: string | undefined, folder: string, extension: string = 'jpg'): string {
    const timestamp = Date.now();
    const cleanEntityId = entityId
        ? entityId.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
        : 'unknown';

    return `${folder}/${cleanEntityId}-${timestamp}.${extension}`;
}

/**
 * Extracts entity name from a blob filename
 * @param url - Blob URL or filename
 * @returns Entity name or null if not found
 */
export function extractEntityFromFilename(url: string | undefined): string | null {
    if (!url) return null;

    // Extract filename from URL
    const filename = url.split('/').pop()?.split('?')[0];
    if (!filename) return null;

    // Extract entity name (everything before the last dash and timestamp)
    const match = filename.match(/^(.+)-\d+\./);
    return match ? match[1] : null;
}

/**
 * Checks if a URL belongs to a specific entity (ignoring timestamp)
 * @param url - Blob URL to check
 * @param entityId - Entity identifier to match
 * @returns True if URL belongs to the entity
 */
export function urlBelongsToEntity(url: string | undefined, entityId: string | undefined): boolean {
    if (!url || !entityId) return false;

    const extractedEntity = extractEntityFromFilename(url);
    const cleanEntityId = entityId.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    return extractedEntity === cleanEntityId;
}

/**
 * Adds a cache-busting timestamp to an image URL for display
 * @param url - The original image URL
 * @param forceRefresh - Whether to force a new timestamp (default: false)
 * @returns URL with cache-busting parameter
 */
export function addCacheBuster(url: string | undefined, forceRefresh: boolean = true): string {
    if (!url) return '';

    // Don't add cache buster to external URLs (non-blob URLs)
    if (!url.includes('blob.vercel-storage.com') && !url.includes('localhost')) {
        return url;
    }

    const separator = url.includes('?') ? '&' : '?';
    const timestamp = forceRefresh ? Date.now() : Math.floor(Date.now() / 60000); // Cache for 1 minute

    return `${url}${separator}t=${timestamp}`;
}

/**
 * Removes cache-busting parameters from a URL
 * @param url - URL with potential cache-busting parameters
 * @returns Clean URL without cache-busting parameters
 */
export function removeCacheBuster(url: string | undefined): string {
    if (!url) return '';

    return url.split('?')[0];
}

/**
 * Creates a unique key for React components based on URL and ID
 * @param url - Image URL
 * @param id - Unique identifier
 * @returns Unique key string
 */
export function createImageKey(url: string | undefined, id: string | undefined): string {
    if (!url || !id) return `fallback-${Date.now()}`;

    const cleanUrl = removeCacheBuster(url);
    return `${cleanUrl}-${id}`;
}