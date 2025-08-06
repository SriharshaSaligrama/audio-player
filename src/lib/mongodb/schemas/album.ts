import { JsonSchemaValidator } from '@/lib/mongodb/types';
import { Artist } from '@/lib/mongodb/schemas/artist';

export const albumSchemaValidator: JsonSchemaValidator = {
    $jsonSchema: {
        bsonType: 'object',
        required: ['title', 'artists', 'releaseDate', 'totalTracks', 'totalDuration'],
        properties: {
            _id: {
                bsonType: 'objectId'
            },
            title: {
                bsonType: 'string',
                description: 'Album title is required'
            },
            artists: {
                bsonType: 'array',
                items: {
                    bsonType: 'objectId'
                },
                description: 'References to artist documents'
            },
            releaseDate: {
                bsonType: 'date',
                description: 'Album release date'
            },
            coverImage: {
                bsonType: 'string',
                description: 'Album cover image URL'
            },
            description: {
                bsonType: 'string',
                description: 'Album description or background information'
            },
            genres: {
                bsonType: 'array',
                items: {
                    bsonType: 'string'
                },
                description: 'List of music genres for the album'
            },
            label: {
                bsonType: 'string',
                description: 'Record label that published the album'
            },
            totalTracks: {
                bsonType: 'number',
                minimum: 1,
                description: 'Total number of tracks in the album'
            },
            totalDuration: {
                bsonType: 'number',
                minimum: 0,
                description: 'Total duration of the album in seconds'
            },
            stats: {
                bsonType: 'object',
                properties: {
                    plays: {
                        bsonType: 'number',
                        minimum: 0,
                        description: 'Number of times the album has been played'
                    },
                    likes: {
                        bsonType: 'number',
                        minimum: 0,
                        description: 'Number of likes received'
                    },
                    shares: {
                        bsonType: 'number',
                        minimum: 0,
                        description: 'Number of times the album has been shared'
                    }
                }
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

export type Album = {
    _id: string;
    title: string;
    artists: Artist[];
    releaseDate: Date;
    coverImage?: string;
    description?: string;
    genres: string[];
    label?: string;
    totalTracks: number;
    totalDuration: number; // in seconds
    stats: {
        plays: number;
        likes: number;
        shares: number;
    };
    createdAt: Date;
    updatedAt: Date;
}
