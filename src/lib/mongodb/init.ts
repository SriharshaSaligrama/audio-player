import { Db } from 'mongodb';
import { getDb } from '@/lib/mongodb/client';
import { Collections } from '@/lib/constants/collections';
import { JsonSchemaValidator } from '@/lib/mongodb/types';
import { albumSchemaValidator, artistSchemaValidator, playlistSchemaValidator, trackSchemaValidator, userSchemaValidator } from '@/lib/mongodb/schemas';


async function createCollectionIfNotExists(db: Db, collectionName: string, validator: JsonSchemaValidator) {
    const collections = await db.listCollections({ name: collectionName }).toArray();

    // Create collection if it doesn't exist
    if (collections.length === 0) {
        console.log(`Creating collection: ${collectionName}`);
        await db.createCollection(collectionName, { validator });
    } else {
        console.log(`Collection ${collectionName} already exists`);

        // Update validator for existing collection
        try {
            await db.command({
                collMod: collectionName,
                validator
            });
        } catch (error) {
            console.warn(`Warning: Could not update validator for collection ${collectionName}. This may require elevated database permissions.`);
            // Continue execution despite validator update failure
        }
    }

    // Add or update indexes for all collections, whether new or existing
    console.log(`Ensuring indexes for collection: ${collectionName}`);
    if (collectionName === Collections.ARTISTS) {
        // For text search on artist names
        await db.collection(collectionName).createIndex({ name: 1 });
        // For sorting by popularity
        await db.collection(collectionName).createIndex({ "stats.followers": -1, name: 1 });
    } else if (collectionName === Collections.ALBUMS) {
        // Compound index for artist's albums with release date
        await db.collection(collectionName).createIndex({ artists: 1, releaseDate: -1 });
        // For text search on title
        await db.collection(collectionName).createIndex({ title: 1 });
        // For trending/popular albums
        await db.collection(collectionName).createIndex({ "stats.plays": -1, releaseDate: -1 });
    } else if (collectionName === Collections.TRACKS) {
        // Compound index for artist's tracks
        await db.collection(collectionName).createIndex({ artists: 1, title: 1 });
        // For album tracks
        await db.collection(collectionName).createIndex({ defaultAlbum: 1, "stats.plays": -1 });
        // For recent/trending tracks
        await db.collection(collectionName).createIndex({ releaseDate: -1, "stats.plays": -1 });
    } else if (collectionName === Collections.USERS) {
        // Essential unique identifiers
        await db.collection(collectionName).createIndex({ clerkId: 1 }, { unique: true });
        await db.collection(collectionName).createIndex({ email: 1 }, { unique: true });
        await db.collection(collectionName).createIndex({ username: 1 }, { sparse: true });
        // Compound index for active users by role
        await db.collection(collectionName).createIndex({ isActive: 1, role: 1 });
    } else if (collectionName === Collections.PLAYLISTS) {
        // Compound index for public playlist discovery
        await db.collection(collectionName).createIndex({ isPublic: 1, "stats.followers": -1 });
        // For user's collaborative playlists
        await db.collection(collectionName).createIndex({ collaborators: 1, name: 1 });
        // For playlist search
        await db.collection(collectionName).createIndex({ name: 1 });
    }
}

export async function initializeDatabase() {
    try {
        console.log('Starting database initialization...');
        const db = await getDb();

        // Initialize collections with validation
        await createCollectionIfNotExists(db, Collections.USERS, userSchemaValidator);
        await createCollectionIfNotExists(db, Collections.ARTISTS, artistSchemaValidator);
        await createCollectionIfNotExists(db, Collections.ALBUMS, albumSchemaValidator);
        await createCollectionIfNotExists(db, Collections.TRACKS, trackSchemaValidator);
        await createCollectionIfNotExists(db, Collections.PLAYLISTS, playlistSchemaValidator);

        console.log('Database initialization completed');
    } catch (error) {
        console.error('Database initialization failed:', error);
        throw error;
    }
}

// Use global flag to track initialization across module reloads
declare global {
    var __dbInitialized: boolean;
}

export async function ensureDbInitialized() {
    if (!global.__dbInitialized) {
        await initializeDatabase();
        global.__dbInitialized = true;
        console.log('Database initialized and cached globally');
    } else {
        console.log('Using cached database initialization');
    }
}