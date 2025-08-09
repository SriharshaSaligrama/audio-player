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
import { Collections } from '@/lib/constants/collections';
import { REASONS_BY_ENTITY, TakedownReason } from '@/lib/constants/enums';

export const artistSchemaValidator: JsonSchemaValidator = {
    $jsonSchema: {
        bsonType: 'object',
        required: ['name'],
        properties: {
            _id: objectIdField(),
            name: stringField('Artist name is required'),
            bio: stringField('Artist biography'),
            avatar: stringField('Artist profile picture URL'),
            coverImage: stringField('Artist cover image URL'),
            genres: arrayField(stringField(), 'List of music genres'),
            socialLinks: objectField({
                spotify: stringField(),
                twitter: stringField(),
                instagram: stringField(),
            }),
            stats: objectField({
                followers: intField(undefined, { minimum: 0 }),
                totalPlays: intField(undefined, { minimum: 0 }),
                totalTracks: intField(undefined, { minimum: 0 }),
                totalAlbums: intField(undefined, { minimum: 0 }),
            }),
            createdAt: dateField(),
            updatedAt: dateField(),
            isDeleted: boolField('Soft delete flag'),
            deletedAt: { bsonType: ['date', 'null'] },
            takedownReason: stringField('Reason for deletion', { enum: REASONS_BY_ENTITY[Collections.ARTISTS] }),
            replacedBy: objectIdField('Replaced by another artist'),
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
    isDeleted?: boolean;
    deletedAt?: Date | null;
    takedownReason?: TakedownReason;
    replacedBy?: string;
}