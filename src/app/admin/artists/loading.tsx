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
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="relative bg-gradient-to-br from-white via-gray-50/50 to-purple-50/60 dark:from-gray-800 dark:via-gray-800 dark:to-purple-900/20 rounded-3xl border-2 border-gray-200/80 dark:border-gray-700/60 shadow-lg shadow-gray-200/40 dark:shadow-none overflow-hidden backdrop-blur-sm">
                        {/* Status Badge Skeleton */}
                        <div className="absolute top-4 right-4 z-20">
                            <div className="w-16 h-7 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                        </div>

                        {/* Artist Profile Section */}
                        <div className="relative p-6 pb-4">
                            <div className="flex flex-col items-center">
                                {/* Avatar Skeleton */}
                                <div className="relative mb-3">
                                    <div className="w-25 h-25 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse shadow-2xl"></div>
                                </div>

                                {/* Artist Name Skeleton */}
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4 mb-2"></div>

                                {/* Bio Skeleton */}
                                <div className="h-[2rem] flex items-center px-4 max-w-full">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full"></div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid Skeleton */}
                        <div className="mx-4 sm:mx-6 mb-4 bg-gradient-to-r from-gray-100/90 to-gray-200/90 dark:from-gray-700/50 dark:to-gray-800/50 rounded-2xl p-3 sm:p-4 border-2 border-gray-300/60 dark:border-gray-600/50">
                            <div className="grid grid-cols-2 gap-3 sm:gap-6">
                                {/* Total Plays Skeleton */}
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse flex-shrink-0"></div>
                                    <div className="min-w-0">
                                        <div className="h-4 sm:h-5 w-6 sm:w-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-1"></div>
                                        <div className="h-2.5 sm:h-3 w-12 sm:w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                                    </div>
                                </div>

                                {/* Followers Skeleton */}
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse flex-shrink-0"></div>
                                    <div className="min-w-0">
                                        <div className="h-4 sm:h-5 w-6 sm:w-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-1"></div>
                                        <div className="h-2.5 sm:h-3 w-12 sm:w-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                                    </div>
                                </div>

                                {/* Tracks Skeleton */}
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse flex-shrink-0"></div>
                                    <div className="min-w-0">
                                        <div className="h-4 sm:h-5 w-6 sm:w-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-1"></div>
                                        <div className="h-2.5 sm:h-3 w-10 sm:w-12 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                                    </div>
                                </div>

                                {/* Albums Skeleton */}
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse flex-shrink-0"></div>
                                    <div className="min-w-0">
                                        <div className="h-4 sm:h-5 w-6 sm:w-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-1"></div>
                                        <div className="h-2.5 sm:h-3 w-10 sm:w-12 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Links Section Skeleton */}
                        <div className="mx-4 sm:mx-6 mb-6">
                            <div className="flex items-center justify-center gap-2 sm:gap-3">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
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