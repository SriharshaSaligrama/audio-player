/**
 * Utility functions for handling images in the application
 */

/**
 * Checks if an image URL is from Clerk's CDN
 */
export function isClerkImageUrl(url: string): boolean {
    const clerkDomains = [
        'img.clerk.com',
        'images.clerk.dev',
        'images.clerk.com',
        'clerk.com'
    ];

    return clerkDomains.some(domain => url.includes(domain));
}

/**
 * Validates if an image URL is accessible and valid
 */
export function isValidImageUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;

    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Gets the appropriate image props for Next.js Image component
 */
export function getImageProps(url: string, size: number) {
    const isClerkImage = isClerkImageUrl(url);

    return {
        src: url,
        width: size,
        height: size,
        unoptimized: isClerkImage, // Clerk images are already optimized
        priority: false,
        className: "w-full h-full object-cover",
    };
}

/**
 * Validates file for image upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
        return { valid: false, error: 'Please select an image file' };
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        return { valid: false, error: 'Image size must be less than 5MB' };
    }

    // Check file dimensions (optional - can be added later)
    return { valid: true };
}