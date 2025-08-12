export default function LikedLoading() {
    return (
        <div className="space-y-6 fade-in">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2"></div>
                </div>
            </div>

            {/* Liked Songs Header skeleton */}
            <div className="bg-gray-200 dark:bg-gray-700 rounded-xl p-8 animate-pulse">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
                    <div>
                        <div className="h-8 w-32 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                        <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                </div>
            </div>

            {/* Empty State skeleton */}
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto mb-4"></div>
                <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto mb-2"></div>
                <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
            </div>
        </div>
    );
}