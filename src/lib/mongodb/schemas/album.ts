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
import { Artist } from '@/lib/mongodb/schemas/artist';
import { Collections } from '@/lib/constants/collections';
import { REASONS_BY_ENTITY, TakedownReason } from '@/lib/constants/enums';

export const albumSchemaValidator: JsonSchemaValidator = {
    $jsonSchema: {
        bsonType: 'object',
        required: ['title', 'artists', 'releaseDate', 'totalTracks', 'totalDuration'],
        properties: {
            _id: objectIdField(),
            title: stringField('Album title is required'),
            artists: arrayField(
                objectIdField(undefined, { refCollection: Collections.ARTISTS }),
                'References to artist documents'
            ),
            releaseDate: dateField('Album release date'),
            coverImage: stringField('Album cover image URL'),
            description: stringField('Album description or background information'),
            genres: arrayField(stringField(), 'List of music genres for the album'),
            label: stringField('Record label that published the album'),
            totalTracks: intField('Total number of tracks in the album', { minimum: 1 }),
            totalDuration: intField('Total duration of the album in seconds', { minimum: 0 }),
            stats: objectField({
                plays: intField('Number of times the album has been played', { minimum: 0 }),
                likes: intField('Number of likes received', { minimum: 0 }),
                shares: intField('Number of times the album has been shared', { minimum: 0 })
            }),
            createdAt: dateField(),
            updatedAt: dateField(),
            isDeleted: boolField('Soft delete flag'),
            deletedAt: { bsonType: ['date', 'null'] },
            takedownReason: stringField('Reason for deletion', { enum: REASONS_BY_ENTITY[Collections.ALBUMS] }),
            replacedBy: objectIdField('Replaced by another album', { refCollection: Collections.ALBUMS }),
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
    isDeleted?: boolean;
    deletedAt?: Date | null;
    takedownReason?: TakedownReason;
    replacedBy?: string;
}
