import { JsonSchemaValidator } from '@/lib/mongodb/types';
import { Artist } from './artist';
import { Album } from './album';

export const trackSchemaValidator: JsonSchemaValidator = {
    $jsonSchema: {
        bsonType: 'object',
        required: ['title', 'artists', 'albums', 'defaultAlbum', 'releaseDate', 'fileUrl',],
        properties: {
            _id: {
                bsonType: 'objectId'
            },
            title: {
                bsonType: 'string',
                description: 'Track title is required'
            },
            artists: {
                bsonType: 'array',
                items: {
                    bsonType: 'objectId'
                },
                description: 'References to artist documents'
            },
            albums: {
                bsonType: 'array',
                items: {
                    bsonType: 'objectId'
                },
                description: 'References to album documents this track appears in'
            },
            defaultAlbum: {
                bsonType: 'objectId',
                description: 'Reference to the primary album this track belongs to'
            },
            genre: {
                bsonType: 'string',
                description: 'Primary genre of the track'
            },
            releaseDate: {
                bsonType: 'date',
                description: 'Track release date'
            },
            duration: {
                bsonType: 'number',
                minimum: 0,
                description: 'Track duration in seconds'
            },
            fileUrl: {
                bsonType: 'string',
                description: 'Vercel Blob URL for the audio file'
            },
            fileSize: {
                bsonType: 'number',
                minimum: 0,
                description: 'Size of the audio file in bytes'
            },
            coverImage: {
                bsonType: 'string',
                description: 'Vercel Blob URL for track-specific cover image (inherits from album if not set)'
            },
            lyrics: {
                bsonType: 'string',
                description: 'Track lyrics'
            },
            stats: {
                bsonType: 'object',
                properties: {
                    plays: {
                        bsonType: 'number',
                        minimum: 0,
                        description: 'Number of times the track has been played'
                    },
                    likes: {
                        bsonType: 'number',
                        minimum: 0,
                        description: 'Number of likes received'
                    },
                    shares: {
                        bsonType: 'number',
                        minimum: 0,
                        description: 'Number of times the track has been shared'
                    },
                    downloads: {
                        bsonType: 'number',
                        minimum: 0,
                        description: 'Number of times the track has been downloaded'
                    }
                }
            },
            tags: {
                bsonType: 'array',
                items: {
                    bsonType: 'string'
                },
                description: 'List of tags associated with the track'
            },
            createdAt: {
                bsonType: 'date'
            },
            updatedAt: {
                bsonType: 'date'
            }
        }
    }
};

export type Track = {
    _id: string;
    title: string;
    artists: Artist[];
    albums: Album[];
    defaultAlbum: string;
    genre: string;
    releaseDate: Date;
    duration: number; // in seconds
    fileUrl: string; // Vercel Blob URL
    fileSize: number; // in bytes
    coverImage?: string; // Vercel Blob URL (inherits from album if not set)
    lyrics?: string;
    stats: {
        plays: number;
        likes: number;
        shares: number;
        downloads: number;
    };
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}
