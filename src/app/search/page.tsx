import { UniversalLayout } from '@/components/layout/universal-layout';
import { Search } from 'lucide-react';

export default function SearchPage() {
    return (
        <UniversalLayout>
            <div className="space-y-6 fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Search</h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Discover new music, artists, and albums.
                        </p>
                    </div>
                </div>

                {/* Search Interface */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 theme-transition">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for songs, artists, or albums..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-transition"
                        />
                    </div>
                </div>

                {/* Search Results Placeholder */}
                <div className="text-center py-12">
                    <Search className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Start searching</h3>
                    <p className="text-gray-600 dark:text-gray-400">Enter a search term to find music.</p>
                </div>
            </div>
        </UniversalLayout>
    );
}