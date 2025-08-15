export default function TracksLoading() {
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

            {/* Tracks grid skeleton */}
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="relative bg-gradient-to-br from-white via-gray-50/50 to-blue-50/60 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/50 rounded-3xl border-2 border-gray-200/80 dark:border-gray-700/60 shadow-lg shadow-gray-200/40 dark:shadow-none overflow-hidden backdrop-blur-sm">
                        {/* Status Badge Skeleton */}
                        <div className="absolute top-4 right-4 z-20">
                            <div className="w-16 h-7 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                        </div>

                        {/* Header Section with Cover and Title */}
                        <div className="relative p-6 pb-4">
                            <div className="flex items-start gap-4">
                                {/* Cover Art Skeleton */}
                                <div className="relative flex-shrink-0">
                                    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse shadow-xl"></div>
                                </div>

                                {/* Track Info Skeleton */}
                                <div className="flex-1 min-w-0 max-w-full">
                                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4 mb-2"></div>

                                    {/* Artists Skeleton */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3"></div>
                                    </div>

                                    {/* Album Skeleton */}
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Metadata Section Skeleton */}
                        <div className="px-6 pb-4">
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-blue-100/90 dark:bg-blue-900/20 rounded-xl p-3 border-2 border-blue-200/70 dark:border-blue-800/30">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-3.5 h-3.5 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-12"></div>
                                    </div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-10"></div>
                                </div>

                                <div className="bg-emerald-100/90 dark:bg-emerald-900/20 rounded-xl p-3 border-2 border-emerald-200/70 dark:border-emerald-800/30">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-3.5 h-3.5 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-14"></div>
                                    </div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-16"></div>
                                </div>
                            </div>

                            {/* Genres Skeleton */}
                            <div className="flex flex-wrap gap-2 justify-center">
                                <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                                <div className="h-7 w-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                                <div className="h-7 w-14 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                            </div>
                        </div>

                        {/* Stats Section Skeleton */}
                        <div className="mx-4 sm:mx-6 mb-4 bg-gradient-to-r from-gray-100/90 to-gray-200/90 dark:from-gray-700/50 dark:to-gray-800/50 rounded-2xl p-3 sm:p-4 border-2 border-gray-300/60 dark:border-gray-600/50">
                            <div className="flex items-center justify-center gap-4 sm:gap-8">
                                {/* Plays Skeleton */}
                                <div className="flex items-center gap-2 sm:gap-4">
                                    <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse flex-shrink-0"></div>
                                    <div className="min-w-0">
                                        <div className="h-5 sm:h-6 w-6 sm:w-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-1"></div>
                                        <div className="h-2.5 sm:h-3 w-8 sm:w-10 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                                    </div>
                                </div>

                                {/* Likes Skeleton */}
                                <div className="flex items-center gap-2 sm:gap-4">
                                    <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse flex-shrink-0"></div>
                                    <div className="min-w-0">
                                        <div className="h-5 sm:h-6 w-6 sm:w-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-1"></div>
                                        <div className="h-2.5 sm:h-3 w-8 sm:w-10 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Action Button Skeleton */}
                        <div className="absolute bottom-4 right-4">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}