/**
 * Migration script to add fileSize to existing tracks
 * This script can be run to update tracks that don't have fileSize
 */

import { getDb } from '@/lib/mongodb/client';
import { Collections } from '@/lib/constants/collections';
import { extractAudioMetadataFromUrl } from '@/lib/utils/audio';

export async function migrateTrackFileSize() {
    try {
        const db = await getDb();

        // Find tracks without fileSize
        const tracksWithoutFileSize = await db.collection(Collections.TRACKS).find({
            $or: [
                { fileSize: { $exists: false } },
                { fileSize: 0 }
            ],
            fileUrl: { $exists: true, $ne: '' },
            $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
        }).toArray();

        console.log(`Found ${tracksWithoutFileSize.length} tracks without fileSize`);

        let updated = 0;
        for (const track of tracksWithoutFileSize) {
            try {
                const metadata = await extractAudioMetadataFromUrl(track.fileUrl);
                if (metadata.fileSize && metadata.fileSize > 0) {
                    await db.collection(Collections.TRACKS).updateOne(
                        { _id: track._id },
                        {
                            $set: {
                                fileSize: metadata.fileSize,
                                updatedAt: new Date()
                            }
                        }
                    );
                    updated++;
                    console.log(`Updated track ${track.title} with fileSize: ${metadata.fileSize}`);
                }
            } catch (error) {
                console.error(`Failed to update track ${track.title}:`, error);
            }
        }

        console.log(`Successfully updated ${updated} tracks`);
        return { success: true, updated };
    } catch (error) {
        console.error('Migration failed:', error);
        return { success: false, error: error.message };
    }
}

// Run migration if this file is executed directly
if (require.main === module) {
    migrateTrackFileSize()
        .then(result => {
            console.log('Migration result:', result);
            process.exit(0);
        })
        .catch(error => {
            console.error('Migration error:', error);
            process.exit(1);
        });
}