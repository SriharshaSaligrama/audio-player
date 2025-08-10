import { UniversalLayout } from '@/components/layout/universal-layout';
import { Library, Music, Heart, Clock } from 'lucide-react';

export default function LibraryPage() {
    return (
        <UniversalLayout>
            <div className="space-y-6 fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Your Library</h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Your saved music, playlists, and albums.
                        </p>
                    </div>
                </div>

                {/* Library Categories */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 card-hover theme-transition">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                <Music className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Playlists</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">0 playlists</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 card-hover theme-transition">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                                <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Liked Songs</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">0 songs</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 card-hover theme-transition">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recently Played</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">0 tracks</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Empty State */}
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 theme-transition">
                    <Library className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Your library is empty</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Start by liking songs or creating playlists.</p>
                </div>
            </div>
        </UniversalLayout>
    );
}