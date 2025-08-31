/**
 * Audio metadata extraction utilities
 */

export type AudioMetadata = {
    duration: number; // in seconds
    fileSize: number; // in bytes
    title?: string;
    artist?: string;
    album?: string;
}

/**
 * Extract metadata from an audio file using the Web Audio API
 * This is a client-side approach that works in the browser
 */
export async function extractAudioMetadata(file: File): Promise<AudioMetadata> {
    return new Promise((resolve, reject) => {
        const audio = new Audio();
        const url = URL.createObjectURL(file);

        audio.addEventListener('loadedmetadata', () => {
            const metadata: AudioMetadata = {
                duration: Math.round(audio.duration),
                fileSize: file.size,
            };

            URL.revokeObjectURL(url);
            resolve(metadata);
        });

        audio.addEventListener('error', () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load audio metadata'));
        });

        audio.src = url;
    });
}

/**
 * Extract metadata from an audio file URL (server-side approach)
 * This fetches the file and uses basic analysis
 */
export async function extractAudioMetadataFromUrl(url: string): Promise<Partial<AudioMetadata>> {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        const contentLength = response.headers.get('content-length');

        return {
            fileSize: contentLength ? parseInt(contentLength, 10) : 0,
        };
    } catch (error) {
        console.error('Failed to extract metadata from URL:', error);
        return {};
    }
}

/**
 * Format duration from seconds to MM:SS format
 */
export function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Convert duration from MM:SS format to seconds
 */
export function parseDuration(duration: string): number {
    const parts = duration.split(':');
    if (parts.length !== 2) return 0;

    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);

    if (isNaN(minutes) || isNaN(seconds)) return 0;

    return minutes * 60 + seconds;
}