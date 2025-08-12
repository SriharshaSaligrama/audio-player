export default function ArtistsLoading() {
    return (
        <div className="space-y-6 fade-in">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2"></div>
                </div>
                <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>

            {/* Artists grid skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {/* Header with cover */}
                        <div className="relative h-32 bg-gray-200 dark:bg-gray-700 animate-pulse">
                            {/* Avatar placeholder */}
                            <div className="absolute bottom-4 left-4 w-[60px] h-[60px] bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                            {/* Name placeholder */}
                            <div className="absolute bottom-6 left-20 right-4">
                                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-3/4"></div>
                                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-1/2 mt-1"></div>
                            </div>
                        </div>

                        {/* Stats section */}
                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                            </div>
                        </div>

                        {/* Social links section */}
                        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-12 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                                <div className="flex gap-2">
                                    <div className="w-5 h-5 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                                    <div className="w-5 h-5 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}