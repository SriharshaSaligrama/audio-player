import { ObjectId } from 'mongodb';

// Serialize MongoDB ObjectId to string
export function serializeObjectId(id: ObjectId | string): string {
    if (!id) return '';
    return typeof id === 'string' ? id : id.toString();
}

// Helper function to serialize dates
function serializeDate(date: Date | string | undefined | null): string | Date {
    if (!date) return date as string | Date;
    if (typeof date === 'string') return date;
    return date.toISOString();
}

// Serialize any object with MongoDB ObjectIds and Dates to be JSON-safe
export function serializeForClient<T>(obj: T): T {
    if (!obj) return obj;

    if (Array.isArray(obj)) {
        return obj.map(item => serializeForClient(item)) as T;
    }

    if (typeof obj === 'object' && obj !== null) {
        const serialized = { ...obj } as Record<string, unknown>;

        // Handle common MongoDB fields
        if ('_id' in serialized) {
            serialized._id = serializeObjectId(serialized._id as ObjectId | string);
        }

        // Handle date fields
        ['createdAt', 'updatedAt', 'deletedAt', 'releaseDate'].forEach(field => {
            if (field in serialized && serialized[field]) {
                serialized[field] = serializeDate(serialized[field] as Date | string);
            }
        });

        // Handle nested objects with _id fields
        ['artistDetails', 'albumDetails', 'defaultAlbumDetails'].forEach(field => {
            if (field in serialized && Array.isArray(serialized[field])) {
                serialized[field] = (serialized[field] as Record<string, ObjectId | string | Date | number | boolean | null>[]).map(item => serializeForClient(item));
            } else if (field in serialized && serialized[field] && typeof serialized[field] === 'object') {
                serialized[field] = serializeForClient(serialized[field]);
            }
        });

        // Handle ObjectId arrays
        ['artists', 'albums'].forEach(field => {
            if (field in serialized && Array.isArray(serialized[field])) {
                serialized[field] = (serialized[field] as (ObjectId | string)[]).map(id => serializeObjectId(id));
            }
        });

        // Handle single ObjectId fields
        ['defaultAlbum', 'artistId', 'albumId'].forEach(field => {
            if (field in serialized && serialized[field]) {
                serialized[field] = serializeObjectId(serialized[field] as ObjectId | string);
            }
        });

        return serialized as T;
    }

    return obj;
}

// Legacy functions for backward compatibility
export function serializeTrack<T>(track: T): T {
    return serializeForClient(track);
}

export function serializeTracks<T>(tracks: T[]): T[] {
    return serializeForClient(tracks);
}

export function serializeAlbum<T>(album: T): T {
    return serializeForClient(album);
}

export function serializeAlbums<T>(albums: T[]): T[] {
    return serializeForClient(albums);
}

export function serializeArtist<T>(artist: T): T {
    return serializeForClient(artist);
}

export function serializeArtists<T>(artists: T[]): T[] {
    return serializeForClient(artists);
}