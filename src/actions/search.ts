'use server';

import { getDb } from '@/lib/mongodb/client';
import { Collections } from '@/lib/constants/collections';
import { searchTracks, TrackWithDetails, TrackWithLikeStatus } from './tracks';
import { searchAlbums, AlbumWithDetails, AlbumWithLikeStatus } from './albums';
import { searchArtists, ArtistWithFollowStatus } from './artists';
import { Artist } from '@/lib/mongodb/schemas';

export type SearchResults = {
    tracks: TrackWithDetails[];
    albums: AlbumWithDetails[];
    artists: Artist[];
    totalResults: number;
};

export async function globalSearch(query: string, limit = 10): Promise<SearchResults> {
    try {
        if (!query.trim()) {
            return {
                tracks: [],
                albums: [],
                artists: [],
                totalResults: 0
            };
        }

        const { serializeForClient } = await import('@/lib/utils/serialization');

        // Search in parallel for better performance
        const [tracks, albums, artists] = await Promise.all([
            searchTracks(query, limit),
            searchAlbums(query, limit),
            searchArtists(query, limit)
        ]);

        // Serialize the results to ensure they're safe for client components
        const serializedResults = {
            tracks: serializeForClient(tracks),
            albums: serializeForClient(albums),
            artists: serializeForClient(artists),
            totalResults: tracks.length + albums.length + artists.length
        };

        return serializedResults;
    } catch (error) {
        console.error('Error performing global search:', error);
        return {
            tracks: [],
            albums: [],
            artists: [],
            totalResults: 0
        };
    }
}

export async function getGenres(): Promise<string[]> {
    try {
        const db = await getDb();

        // Get unique genres from tracks, albums, and artists
        const [trackGenres, albumGenres, artistGenres] = await Promise.all([
            db.collection(Collections.TRACKS).distinct('genres', {
                $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
            }),
            db.collection(Collections.ALBUMS).distinct('genres', {
                $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
            }),
            db.collection(Collections.ARTISTS).distinct('genres', {
                $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
            })
        ]);

        // Combine and deduplicate genres
        const allGenres = [...new Set([...trackGenres, ...albumGenres, ...artistGenres])];

        // Filter out empty strings and sort
        return allGenres
            .filter(genre => genre && typeof genre === 'string' && genre.trim().length > 0)
            .sort();
    } catch (error) {
        console.error('Error fetching genres:', error);
        return [];
    }
}

export async function getTracksByGenre(genre: string, limit = 50): Promise<TrackWithDetails[]> {
    try {
        const db = await getDb();
        const { serializeForClient } = await import('@/lib/utils/serialization');

        const tracks = await db.collection(Collections.TRACKS).aggregate<TrackWithDetails>([
            {
                $match: {
                    $and: [
                        { $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }] },
                        { genres: { $regex: genre, $options: 'i' } }
                    ]
                }
            },
            {
                $lookup: {
                    from: Collections.ARTISTS,
                    localField: 'artists',
                    foreignField: '_id',
                    as: 'artistDetails',
                    pipeline: [
                        {
                            $match: {
                                $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
                            }
                        },
                        { $project: { _id: 1, name: 1, avatar: 1 } }
                    ]
                }
            },
            {
                $lookup: {
                    from: Collections.ALBUMS,
                    localField: 'albums',
                    foreignField: '_id',
                    as: 'albumDetails',
                    pipeline: [
                        {
                            $match: {
                                $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
                            }
                        },
                        { $project: { _id: 1, title: 1, coverImage: 1 } }
                    ]
                }
            },
            {
                $lookup: {
                    from: Collections.ALBUMS,
                    localField: 'defaultAlbum',
                    foreignField: '_id',
                    as: 'defaultAlbumDetails',
                    pipeline: [
                        {
                            $match: {
                                $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }]
                            }
                        },
                        { $project: { _id: 1, title: 1, coverImage: 1 } }
                    ]
                }
            },
            {
                $addFields: {
                    defaultAlbumDetails: { $arrayElemAt: ['$defaultAlbumDetails', 0] }
                }
            },
            {
                $match: {
                    artistDetails: { $ne: [] },
                    albumDetails: { $ne: [] }
                }
            },
            { $sort: { 'stats.plays': -1, releaseDate: -1 } },
            { $limit: limit }
        ]).toArray();

        return serializeForClient(tracks);
    } catch (error) {
        console.error('Error fetching tracks by genre:', error);
        return [];
    }
}

export async function getFeaturedContent(limits?: {
    tracks?: number;
    albums?: number;
    artists?: number;
}): Promise<{
    featuredTracks: TrackWithLikeStatus[];
    featuredAlbums: AlbumWithLikeStatus[];
    featuredArtists: ArtistWithFollowStatus[];
}> {
    try {
        const { getTrendingTracksWithLikeStatus } = await import('./tracks');
        const { getFeaturedAlbumsWithLikeStatus } = await import('./albums');
        const { getFeaturedArtistsWithFollowStatus } = await import('./artists');
        const { serializeForClient } = await import('@/lib/utils/serialization');

        // Use provided limits or defaults
        const trackLimit = limits?.tracks ?? 8;
        const albumLimit = limits?.albums ?? 6;
        const artistLimit = limits?.artists ?? 8;

        // Get featured content in parallel
        const [featuredTracks, featuredAlbums, featuredArtists] = await Promise.all([
            getTrendingTracksWithLikeStatus(trackLimit),
            getFeaturedAlbumsWithLikeStatus(albumLimit),
            getFeaturedArtistsWithFollowStatus(artistLimit)
        ]);

        // Serialize the results to ensure they're safe for client components
        return {
            featuredTracks: serializeForClient(featuredTracks),
            featuredAlbums: serializeForClient(featuredAlbums),
            featuredArtists: serializeForClient(featuredArtists)
        };
    } catch (error) {
        console.error('Error fetching featured content:', error);
        return {
            featuredTracks: [],
            featuredAlbums: [],
            featuredArtists: []
        };
    }
}

export type SearchResultsWithStatus = {
    tracks: TrackWithLikeStatus[];
    albums: AlbumWithLikeStatus[];
    artists: ArtistWithFollowStatus[];
    totalResults: number;
};

export async function globalSearchWithStatus(query: string, limit = 10): Promise<SearchResultsWithStatus> {
    try {
        if (!query.trim()) {
            return {
                tracks: [],
                albums: [],
                artists: [],
                totalResults: 0
            };
        }

        const { searchTracksWithLikeStatus } = await import('./tracks');
        const { searchAlbumsWithLikeStatus } = await import('./albums');
        const { searchArtistsWithFollowStatus } = await import('./artists');
        const { serializeForClient } = await import('@/lib/utils/serialization');

        // Search in parallel for better performance
        const [tracks, albums, artists] = await Promise.all([
            searchTracksWithLikeStatus(query, limit),
            searchAlbumsWithLikeStatus(query, limit),
            searchArtistsWithFollowStatus(query, limit)
        ]);

        // Serialize the results to ensure they're safe for client components
        const serializedResults = {
            tracks: serializeForClient(tracks),
            albums: serializeForClient(albums),
            artists: serializeForClient(artists),
            totalResults: tracks.length + albums.length + artists.length
        };

        return serializedResults;
    } catch (error) {
        console.error('Error performing global search with status:', error);
        return {
            tracks: [],
            albums: [],
            artists: [],
            totalResults: 0
        };
    }
}

export async function getSearchSuggestions(query: string, limit = 5): Promise<{
    tracks: string[];
    albums: string[];
    artists: string[];
}> {
    try {
        if (!query.trim()) {
            return { tracks: [], albums: [], artists: [] };
        }

        const db = await getDb();

        // Get suggestions in parallel
        const [trackTitles, albumTitles, artistNames] = await Promise.all([
            db.collection(Collections.TRACKS).distinct('title', {
                $and: [
                    { $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }] },
                    { title: { $regex: query, $options: 'i' } }
                ]
            }),
            db.collection(Collections.ALBUMS).distinct('title', {
                $and: [
                    { $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }] },
                    { title: { $regex: query, $options: 'i' } }
                ]
            }),
            db.collection(Collections.ARTISTS).distinct('name', {
                $and: [
                    { $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }] },
                    { name: { $regex: query, $options: 'i' } }
                ]
            })
        ]);

        return {
            tracks: trackTitles.slice(0, limit),
            albums: albumTitles.slice(0, limit),
            artists: artistNames.slice(0, limit)
        };
    } catch (error) {
        console.error('Error fetching search suggestions:', error);
        return { tracks: [], albums: [], artists: [] };
    }
}