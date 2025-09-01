'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { searchAdminTracks } from '@/actions/admin-search';
import type { TrackWithDetails } from '@/app/admin/tracks/page';

type AdminTrackSearchProps = {
    allTracks: TrackWithDetails[];
    onSearchResults: (results: TrackWithDetails[], isSearching: boolean) => void;
};

export function AdminTrackSearch({ allTracks, onSearchResults }: AdminTrackSearchProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (searchQuery.trim()) {
                setIsSearching(true);
                try {
                    const searchResults = await searchAdminTracks(searchQuery, 50);
                    onSearchResults(searchResults, true);
                } catch (error) {
                    console.error('Search error:', error);
                    onSearchResults([], true);
                } finally {
                    setIsSearching(false);
                }
            } else {
                onSearchResults(allTracks, false);
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, allTracks, onSearchResults]);

    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
                type="text"
                placeholder="Search tracks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
            {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
            )}
        </div>
    );
}