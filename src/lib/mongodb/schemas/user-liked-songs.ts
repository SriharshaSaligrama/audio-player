import {
    JsonSchemaValidator,
    objectIdField,
    dateField,
} from '@/lib/mongodb/types';

export const userLikedSongsSchemaValidator: JsonSchemaValidator = {
    $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'trackId', 'likedAt'],
        properties: {
            _id: objectIdField(),
            userId: objectIdField('Reference to User document'),
            trackId: objectIdField('Reference to Track document'),
            likedAt: dateField('Timestamp when the user liked the track'),
        },
    },
};

export type UserLike = {
    _id: string;
    userId: string;
    trackId: string;
    likedAt: Date;
};
