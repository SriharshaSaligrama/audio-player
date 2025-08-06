import { JsonSchemaValidator } from '@/lib/mongodb/types';

export const artistSchemaValidator: JsonSchemaValidator = {
    $jsonSchema: {
        bsonType: 'object',
        required: ['name'],
        properties: {
            _id: {
                bsonType: 'objectId'
            },
            name: {
                bsonType: 'string',
                description: 'Artist name is required'
            },
            bio: {
                bsonType: 'string',
                description: 'Artist biography'
            },
            avatar: {
                bsonType: 'string',
                description: 'Artist profile picture URL'
            },
            coverImage: {
                bsonType: 'string',
                description: 'Artist cover image URL'
            },
            genres: {
                bsonType: 'array',
                items: { bsonType: 'string' },
                description: 'List of music genres'
            },
            socialLinks: {
                bsonType: 'object',
                properties: {
                    spotify: { bsonType: 'string' },
                    twitter: { bsonType: 'string' },
                    instagram: { bsonType: 'string' }
                }
            },
            stats: {
                bsonType: 'object',
                properties: {
                    followers: {
                        bsonType: 'number',
                        minimum: 0
                    },
                    totalPlays: {
                        bsonType: 'number',
                        minimum: 0
                    },
                    totalTracks: {
                        bsonType: 'number',
                        minimum: 0
                    },
                    totalAlbums: {
                        bsonType: 'number',
                        minimum: 0
                    }
                }
            },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' }
        }
    }
};

export type Artist = {
    _id: string;
    name: string;
    bio?: string;
    avatar?: string;
    coverImage?: string;
    genres: string[];
    socialLinks?: {
        spotify?: string;
        twitter?: string;
        instagram?: string;
    };
    stats: {
        followers: number;
        totalPlays: number;
        totalTracks: number;
        totalAlbums: number;
    };
    createdAt: Date;
    updatedAt: Date;
}