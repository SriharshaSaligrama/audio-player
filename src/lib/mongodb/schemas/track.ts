import {
    JsonSchemaValidator,
    stringField,
    intField,
    dateField,
    objectIdField,
    arrayField,
    objectField
} from '@/lib/mongodb/types';
import { Artist } from './artist';
import { Album } from './album';
import { Collections } from '@/lib/constants/collections';

export const trackSchemaValidator: JsonSchemaValidator = {
    $jsonSchema: {
        bsonType: 'object',
        required: ['title', 'artists', 'albums', 'defaultAlbum', 'releaseDate', 'fileUrl'],
        properties: {
            _id: objectIdField(),
            title: stringField('Track title is required'),
            artists: arrayField(
                objectIdField(undefined, { refCollection: Collections.ARTISTS }),
                'References to artist documents'
            ),
            albums: arrayField(
                objectIdField(undefined, { refCollection: Collections.ALBUMS }),
                'References to album documents this track appears in'
            ),
            defaultAlbum: objectIdField(
                'Reference to the primary album this track belongs to',
                { refCollection: Collections.ALBUMS }
            ),
            genre: stringField('Primary genre of the track'),
            releaseDate: dateField('Track release date'),
            duration: intField('Track duration in seconds', { minimum: 0 }),
            fileUrl: stringField('Vercel Blob URL for the audio file'),
            fileSize: intField('Size of the audio file in bytes', { minimum: 0 }),
            coverImage: stringField('Vercel Blob URL for track-specific cover image (inherits from album if not set)'),
            lyrics: stringField('Track lyrics'),
            stats: objectField({
                plays: intField('Number of times the track has been played', { minimum: 0 }),
                likes: intField('Number of likes received', { minimum: 0 }),
                shares: intField('Number of times the track has been shared', { minimum: 0 }),
                downloads: intField('Number of times the track has been downloaded', { minimum: 0 }),
            }),
            tags: arrayField(stringField(), 'List of tags associated with the track'),
            createdAt: dateField(),
            updatedAt: dateField(),
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
