import { Heart } from 'lucide-react';

export default function LikedSongsPage() {
    return (
        <div className="space-y-6 fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Liked Songs</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Your favorite tracks in one place.
                    </p>
                </div>
            </div>

            {/* Liked Songs Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-8 text-white">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                        <Heart className="h-8 w-8 text-white fill-current" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold">Liked Songs</h2>
                        <p className="text-white/80">0 songs</p>
                    </div>
                </div>
            </div>

            {/* Empty State */}
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 theme-transition">
                <Heart className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No liked songs yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Songs you like will appear here.</p>
            </div>
        </div>
    );
}