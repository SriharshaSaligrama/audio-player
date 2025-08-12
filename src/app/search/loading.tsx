export default function SearchLoading() {
    return (
        <div className="space-y-6 fade-in">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2"></div>
                </div>
            </div>

            {/* Search interface skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            </div>

            {/* Search results placeholder skeleton */}
            <div className="text-center py-12">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto mb-4"></div>
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto mb-2"></div>
                <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
            </div>
        </div>
    );
}