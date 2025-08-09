import {
  JsonSchemaValidator,
  objectIdField,
  dateField,
} from '@/lib/mongodb/types';

export const userLikedArtistsSchemaValidator: JsonSchemaValidator = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['userId', 'artistId', 'likedAt'],
    properties: {
      _id: objectIdField(),
      userId: objectIdField('Reference to User document'),
      artistId: objectIdField('Reference to Artist document'),
      likedAt: dateField('Timestamp when the user liked the artist'),
    },
  },
};

export type UserLikedArtist = {
  _id: string;
  userId: string;
  artistId: string;
  likedAt: Date;
};
