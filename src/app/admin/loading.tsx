export default function AdminLoading() {
    return (
        <div className="space-y-6 fade-in">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2"></div>
                </div>
                <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>

            {/* Grid skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {/* Header section */}
                        <div className="h-32 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>

                        {/* Content section */}
                        <div className="p-4 space-y-3">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                            <div className="flex gap-2">
                                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                                <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                            </div>
                        </div>

                        {/* Stats section */}
                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}