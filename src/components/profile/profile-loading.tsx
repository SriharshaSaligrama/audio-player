import { Loader2 } from 'lucide-react';

export function ProfileLoading() {
    return (
        <div className="space-y-8">
            {/* Profile Header Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                    <div className="flex-1 space-y-3">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
                        <div className="flex space-x-4">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-40"></div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Loading indicator */}
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading profile...</span>
            </div>
        </div>
    );
}