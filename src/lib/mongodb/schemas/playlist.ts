import { JsonSchemaValidator } from '@/lib/mongodb/types';
import { Track } from './track';
import { User } from './user';

export const playlistSchemaValidator: JsonSchemaValidator = {
    $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'isPublic', 'isCollaborative'],
        properties: {
            _id: {
                bsonType: 'objectId'
            },
            name: {
                bsonType: 'string',
                description: 'Playlist name is required'
            },
            description: {
                bsonType: 'string',
                description: 'Description of the playlist'
            },
            coverImage: {
                bsonType: 'string',
                description: 'Playlist cover image URL'
            },
            tracks: {
                bsonType: 'array',
                items: {
                    bsonType: 'objectId'
                },
                description: 'Array of Track IDs in the playlist'
            },
            isPublic: {
                bsonType: 'bool',
                description: 'Whether the playlist is publicly visible'
            },
            isCollaborative: {
                bsonType: 'bool',
                description: 'Whether other users can modify the playlist'
            },
            collaborators: {
                bsonType: 'array',
                items: {
                    bsonType: 'objectId'
                },
                description: 'Array of User IDs who can collaborate on this playlist'
            },
            tags: {
                bsonType: 'array',
                items: {
                    bsonType: 'string'
                },
                description: 'List of tags associated with the playlist'
            },
            stats: {
                bsonType: 'object',
                properties: {
                    plays: {
                        bsonType: 'number',
                        minimum: 0,
                        description: 'Number of times the playlist has been played'
                    },
                    likes: {
                        bsonType: 'number',
                        minimum: 0,
                        description: 'Number of likes received'
                    },
                    followers: {
                        bsonType: 'number',
                        minimum: 0,
                        description: 'Number of users following this playlist'
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

export type Playlist = {
    _id: string;
    name: string;
    description?: string;
    coverImage?: string;
    tracks: Track[];
    isPublic: boolean;
    isCollaborative: boolean;
    collaborators: User[];
    tags?: string[];
    stats: {
        plays: number;
        likes: number;
        followers: number;
    };
    createdAt: Date;
    updatedAt: Date;
}
