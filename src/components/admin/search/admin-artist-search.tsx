'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { searchAdminArtists } from '@/actions/admin-search';
import type { Artist } from '@/lib/mongodb/schemas';

type AdminArtistSearchProps = {
    allArtists: Artist[];
    onSearchResults: (results: Artist[], isSearching: boolean) => void;
};

export function AdminArtistSearch({ allArtists, onSearchResults }: AdminArtistSearchProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Memoize the search function to prevent infinite re-renders
    const performSearch = useCallback(async (query: string) => {
        if (!query.trim()) {
            onSearchResults(allArtists, false);
            return;
        }

        setIsSearching(true);
        try {
            const searchResults = await searchAdminArtists(query, 50);
            onSearchResults(searchResults, true);
        } catch (error) {
            console.error('Search error:', error);
            onSearchResults([], true);
        } finally {
            setIsSearching(false);
        }
    }, [allArtists, onSearchResults]);

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            performSearch(searchQuery);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, performSearch]);

    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
                type="text"
                placeholder="Search artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
            />
            {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                </div>
            )}
        </div>
    );
}