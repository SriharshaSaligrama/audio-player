import {
    JsonSchemaValidator,
    stringField,
    intField,
    boolField,
    dateField,
    objectIdField,
    arrayField,
    objectField
} from '@/lib/mongodb/types';
import { Track } from './track';
import { User } from './user';
import { Collections } from '@/lib/constants/collections';
import { REASONS_BY_ENTITY, TakedownReason } from '@/lib/constants/enums';

export const playlistSchemaValidator: JsonSchemaValidator = {
    $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'isPublic', 'isCollaborative'],
        properties: {
            _id: objectIdField(),
            name: stringField('Playlist name is required'),
            description: stringField('Description of the playlist'),
            coverImage: stringField('Playlist cover image URL'),
            tracks: arrayField(
                objectIdField(),
                'Array of Track IDs in the playlist'
            ),
            isPublic: boolField('Whether the playlist is publicly visible'),
            isCollaborative: boolField('Whether other users can modify the playlist'),
            collaborators: arrayField(
                objectIdField(),
                'Array of User IDs who can collaborate on this playlist'
            ),
            tags: arrayField(stringField(), 'List of tags associated with the playlist'),
            stats: objectField({
                plays: intField('Number of times the playlist has been played', { minimum: 0 }),
                likes: intField('Number of likes received', { minimum: 0 }),
                followers: intField('Number of users following this playlist', { minimum: 0 }),
            }),
            createdAt: dateField(),
            updatedAt: dateField(),
            isDeleted: boolField('Soft delete flag'),
            deletedAt: { bsonType: ['date', 'null'] },
            takedownReason: stringField('Reason for deletion', { enum: REASONS_BY_ENTITY[Collections.PLAYLISTS] }),
            replacedBy: objectIdField('Replaced by another playlist'),
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
    isDeleted?: boolean;
    deletedAt?: Date | null;
    takedownReason?: TakedownReason;
    replacedBy?: string;
}
