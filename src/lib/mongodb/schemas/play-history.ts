import {
    JsonSchemaValidator,
    stringField,
    intField,
    boolField,
    dateField,
    objectIdField,
    objectField
} from '@/lib/mongodb/types';
import { Collections } from '@/lib/constants/collections';

export const playHistorySchemaValidator: JsonSchemaValidator = {
    $jsonSchema: {
        bsonType: 'object',
        required: ['userId', 'trackId', 'playedAt'],
        properties: {
            _id: objectIdField(),
            userId: objectIdField('Reference to User document', { refCollection: Collections.USERS }),
            trackId: objectIdField('Reference to Track document', { refCollection: Collections.TRACKS }),
            playedAt: dateField('Timestamp when the track was played'),

            // Discovery/context
            source: stringField('How the user accessed this track', {
                enum: ['playlist', 'album', 'search', 'recommendation', 'direct', 'shuffle']
            }),
            playlistId: objectIdField('If source is playlist, the playlist ID', { refCollection: Collections.PLAYLISTS }),
            albumId: objectIdField('If source is album, the album ID', { refCollection: Collections.ALBUMS }),

            // Engagement metrics
            durationListened: intField('Duration listened in seconds', { minimum: 0 }),
            completionPercentage: intField('Percentage of track completed', { minimum: 0, maximum: 100 }),
            completed: boolField('Whether playback reached the end of the track'),

            // Device/session
            device: objectField({
                type: stringField(undefined, { enum: ['mobile', 'desktop', 'tablet', 'web', 'smart_speaker', 'tv', 'car'] }),
                platform: stringField(),
                appVersion: stringField(),
                browser: stringField(),
                os: stringField(),
            }, 'Device/platform information used for playback'),
            ipAddress: stringField('Optional IP address for location/device analytics'),

            metadata: objectField({
                isSkipped: boolField(),
                skipPosition: intField(undefined, { minimum: 0 }),
                isRepeat: boolField(),
                sessionId: stringField(),
                offline: boolField(),
            }, 'Additional playback metadata'),

            createdAt: dateField('Insertion timestamp')
        }
    }
};

export type PlayHistory = {
    _id: string;
    userId: string; // ObjectId
    trackId: string; // ObjectId
    playedAt: Date;
    source?: 'playlist' | 'album' | 'search' | 'recommendation' | 'direct' | 'shuffle';
    playlistId?: string; // ObjectId
    albumId?: string; // ObjectId
    durationListened?: number;
    completionPercentage?: number; // 0-100
    completed?: boolean;
    device?: {
        type?: 'mobile' | 'desktop' | 'tablet' | 'web' | 'smart_speaker' | 'tv' | 'car';
        platform?: string;
        appVersion?: string;
        browser?: string;
        os?: string;
    };
    ipAddress?: string;
    metadata?: {
        isSkipped?: boolean;
        skipPosition?: number;
        isRepeat?: boolean;
        sessionId?: string;
        offline?: boolean;
    };
    createdAt?: Date;
}

export type CreatePlayHistory = Omit<PlayHistory, '_id'>;
