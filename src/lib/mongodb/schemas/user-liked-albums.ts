import {
    JsonSchemaValidator,
    objectIdField,
    dateField,
} from '@/lib/mongodb/types';

export const userLikedAlbumsSchemaValidator: JsonSchemaValidator = {
    $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'albumId', 'likedAt'],
        properties: {
            _id: objectIdField(),
            userId: { bsonType: 'string', description: 'Clerk User ID' },
            albumId: objectIdField('Reference to Album document'),
            likedAt: dateField('Timestamp when the user liked the album'),
        },
    },
};

export type UserLikedAlbum = {
    _id: string;
    userId: string;
    albumId: string;
    likedAt: Date;
};
