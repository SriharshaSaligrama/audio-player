import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ProfileErrorProps {
    error?: string;
    onRetry?: () => void;
}

export function ProfileError({
    error = 'Failed to load profile information',
    onRetry
}: ProfileErrorProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Something went wrong
                </h3>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {error}
                </p>

                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
}