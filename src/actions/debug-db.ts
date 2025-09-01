'use server';

import { getDb } from '@/lib/mongodb/client';
import { Collections } from '@/lib/constants/collections';
import { auth } from '@clerk/nextjs/server';
import { ObjectId } from 'mongodb';

export async function debugCollections() {
    try {
        const db = await getDb();
        const { userId } = await auth();

        // Check all user interaction collections
        const collections = [
            Collections.USER_LIKED_SONGS,
            Collections.USER_LIKED_ALBUMS,
            Collections.USER_LIKED_ARTISTS
        ];

        const results: Record<string, Record<string, unknown>> = {};

        for (const collectionName of collections) {
            console.log(`\n=== ${collectionName} ===`);

            // Get collection info
            const collectionInfo = await db.listCollections({ name: collectionName }).toArray();
            console.log('Collection info:', JSON.stringify(collectionInfo[0], null, 2));

            // Get sample documents
            const sampleDocs = await db.collection(collectionName).find({}).limit(3).toArray();
            console.log('Sample documents:', JSON.stringify(sampleDocs, null, 2));

            // Get document count
            const count = await db.collection(collectionName).countDocuments();
            console.log('Document count:', count);

            // Test validation by trying to insert test documents with different formats
            if (userId) {
                console.log(`Testing validation for ${collectionName}...`);

                // Test 1: With ObjectId instances (correct format according to schema)
                let testDoc1: {
                    userId: string;
                    trackId: ObjectId;
                    likedAt: Date;
                } | {
                    userId: string;
                    albumId: ObjectId;
                    likedAt: Date;
                } | {
                    userId: string;
                    artistId: ObjectId;
                    likedAt: Date;
                } | undefined;

                if (collectionName === Collections.USER_LIKED_SONGS) {
                    testDoc1 = {
                        userId: userId,
                        trackId: new ObjectId(), // ObjectId instance
                        likedAt: new Date()
                    };
                } else if (collectionName === Collections.USER_LIKED_ALBUMS) {
                    testDoc1 = {
                        userId: userId,
                        albumId: new ObjectId(), // ObjectId instance
                        likedAt: new Date()
                    };
                } else if (collectionName === Collections.USER_LIKED_ARTISTS) {
                    testDoc1 = {
                        userId: userId,
                        artistId: new ObjectId(), // ObjectId instance
                        likedAt: new Date()
                    };
                }

                if (testDoc1) {
                    console.log('Test document (ObjectId):', testDoc1);

                    try {
                        // Try to insert test document with ObjectId
                        const insertResult1 = await db.collection(collectionName).insertOne(testDoc1);
                        console.log(`✅ Test insert with ObjectId successful for ${collectionName}:`, insertResult1.insertedId);

                        // Clean up test document
                        await db.collection(collectionName).deleteOne({ _id: insertResult1.insertedId });
                        console.log(`🧹 Cleaned up test document for ${collectionName}`);

                        results[collectionName] = {
                            ...(results[collectionName] || {}),
                            objectIdTest: 'SUCCESS'
                        };
                    } catch (validationError) {
                        console.error(`❌ Validation failed with ObjectId for ${collectionName}:`, validationError);

                        results[collectionName] = {
                            ...(results[collectionName] || {}),
                            objectIdTest: 'FAILED',
                            objectIdError: validationError instanceof Error ? validationError.message : String(validationError)
                        };
                    }
                }
            }

            results[collectionName] = {
                ...(results[collectionName] || {}),
                exists: collectionInfo.length > 0,
                count,
                sampleDocs: sampleDocs.length,
                validator: (collectionInfo[0] as { options?: { validator?: unknown } })?.options?.validator || null
            };
        }

        return { success: true, message: 'Debug info logged to console', results };
    } catch (error) {
        console.error('Debug error:', error);
        return {
            success: false,
            message: 'Debug failed',
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

export async function recreateUserCollections() {
    try {
        const db = await getDb();

        // Drop and recreate user interaction collections without validators
        const collections = [
            Collections.USER_LIKED_SONGS,
            Collections.USER_LIKED_ALBUMS,
            Collections.USER_LIKED_ARTISTS
        ];

        for (const collectionName of collections) {
            console.log(`Recreating ${collectionName}...`);

            try {
                await db.collection(collectionName).drop();
                console.log(`Dropped ${collectionName}`);
            } catch (dropError) {
                console.log(`Collection ${collectionName} didn't exist or couldn't be dropped`, dropError);
            }

            // Create without validator
            await db.createCollection(collectionName);
            console.log(`Created ${collectionName} without validator`);

            // Add indexes
            if (collectionName === Collections.USER_LIKED_SONGS) {
                await db.collection(collectionName).createIndex({ userId: 1, likedAt: -1 });
                await db.collection(collectionName).createIndex({ trackId: 1 });
                await db.collection(collectionName).createIndex({ userId: 1, trackId: 1 }, { unique: true });
            } else if (collectionName === Collections.USER_LIKED_ALBUMS) {
                await db.collection(collectionName).createIndex({ userId: 1, likedAt: -1 });
                await db.collection(collectionName).createIndex({ albumId: 1 });
                await db.collection(collectionName).createIndex({ userId: 1, albumId: 1 }, { unique: true });
            } else if (collectionName === Collections.USER_LIKED_ARTISTS) {
                await db.collection(collectionName).createIndex({ userId: 1, likedAt: -1 });
                await db.collection(collectionName).createIndex({ artistId: 1 });
                await db.collection(collectionName).createIndex({ userId: 1, artistId: 1 }, { unique: true });
            }
        }

        return { success: true, message: 'Collections recreated without validators' };
    } catch (error) {
        console.error('Recreate error:', error);
        return {
            success: false,
            message: 'Recreate failed',
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

export async function updateCollectionValidators() {
    try {
        const db = await getDb();

        // Import the correct schema validators
        const { userLikedSongsSchemaValidator } = await import('@/lib/mongodb/schemas/user-liked-songs');
        const { userLikedAlbumsSchemaValidator } = await import('@/lib/mongodb/schemas/user-liked-albums');
        const { userLikedArtistsSchemaValidator } = await import('@/lib/mongodb/schemas/user-liked-artists');

        // Update validators for each collection
        const updates = [
            {
                collection: Collections.USER_LIKED_SONGS,
                validator: userLikedSongsSchemaValidator
            },
            {
                collection: Collections.USER_LIKED_ALBUMS,
                validator: userLikedAlbumsSchemaValidator
            },
            {
                collection: Collections.USER_LIKED_ARTISTS,
                validator: userLikedArtistsSchemaValidator
            }
        ];

        for (const { collection, validator } of updates) {
            console.log(`Updating validator for ${collection}...`);

            try {
                await db.command({
                    collMod: collection,
                    validator: validator,
                    validationLevel: 'strict',
                    validationAction: 'error'
                });
                console.log(`✅ Updated validator for ${collection}`);
            } catch (error) {
                console.error(`❌ Failed to update validator for ${collection}:`, error);
            }
        }

        return { success: true, message: 'Collection validators updated with correct schemas' };
    } catch (error) {
        console.error('Update validators error:', error);
        return {
            success: false,
            message: 'Failed to update validators',
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

export async function recreateCollectionsWithCorrectValidators() {
    try {
        const db = await getDb();

        // Import the correct schema validators
        const { userLikedSongsSchemaValidator } = await import('@/lib/mongodb/schemas/user-liked-songs');
        const { userLikedAlbumsSchemaValidator } = await import('@/lib/mongodb/schemas/user-liked-albums');
        const { userLikedArtistsSchemaValidator } = await import('@/lib/mongodb/schemas/user-liked-artists');

        // Drop and recreate user interaction collections with correct validators
        const collections = [
            {
                name: Collections.USER_LIKED_SONGS,
                validator: userLikedSongsSchemaValidator,
                indexes: [
                    { keys: { userId: 1, likedAt: -1 } as Record<string, 1 | -1> },
                    { keys: { trackId: 1 } as Record<string, 1 | -1> },
                    { keys: { userId: 1, trackId: 1 } as Record<string, 1 | -1>, options: { unique: true } }
                ]
            },
            {
                name: Collections.USER_LIKED_ALBUMS,
                validator: userLikedAlbumsSchemaValidator,
                indexes: [
                    { keys: { userId: 1, likedAt: -1 } as Record<string, 1 | -1> },
                    { keys: { albumId: 1 } as Record<string, 1 | -1> },
                    { keys: { userId: 1, albumId: 1 } as Record<string, 1 | -1>, options: { unique: true } }
                ]
            },
            {
                name: Collections.USER_LIKED_ARTISTS,
                validator: userLikedArtistsSchemaValidator,
                indexes: [
                    { keys: { userId: 1, likedAt: -1 } as Record<string, 1 | -1> },
                    { keys: { artistId: 1 } as Record<string, 1 | -1> },
                    { keys: { userId: 1, artistId: 1 } as Record<string, 1 | -1>, options: { unique: true } }
                ]
            }
        ];

        for (const { name, validator, indexes } of collections) {
            console.log(`Recreating ${name} with correct validator...`);

            try {
                await db.collection(name).drop();
                console.log(`Dropped ${name}`);
            } catch (dropError) {
                console.log(`Collection ${name} didn't exist or couldn't be dropped`, dropError);
            }

            // Create with correct validator
            await db.createCollection(name, {
                validator: validator,
                validationLevel: 'strict',
                validationAction: 'error'
            });
            console.log(`Created ${name} with correct validator (userId as string)`);

            // Add indexes
            for (const index of indexes) {
                await db.collection(name).createIndex(index.keys, index.options || {});
            }
            console.log(`Added indexes for ${name}`);
        }

        return { success: true, message: 'Collections recreated with correct validators (userId as string)' };
    } catch (error) {
        console.error('Recreate with validators error:', error);
        return {
            success: false,
            message: 'Failed to recreate with validators',
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

export async function fixTrackLikeCounts() {
    try {
        const { recalculateTrackStatistics } = await import('@/actions/admin/tracks');
        const result = await recalculateTrackStatistics();
        return result;
    } catch (error) {
        console.error('Fix track like counts error:', error);
        return {
            success: false,
            message: 'Failed to fix track like counts',
            error: error instanceof Error ? error.message : String(error)
        };
    }
}