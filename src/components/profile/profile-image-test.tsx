'use client';

import { useState } from 'react';
import Image from 'next/image';
import { isClerkImageUrl, isValidImageUrl } from '@/lib/utils/image';

export function ProfileImageTest() {
    const [testUrl, setTestUrl] = useState('');
    const [imageError, setImageError] = useState(false);

    const testUrls = [
        'https://img.clerk.com/test-image',
        'https://images.clerk.dev/test-image',
        'https://placehold.co/96x96',
    ];

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Image Configuration Test
            </h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Test Image URL
                    </label>
                    <input
                        type="url"
                        value={testUrl}
                        onChange={(e) => {
                            setTestUrl(e.target.value);
                            setImageError(false);
                        }}
                        placeholder="Enter image URL to test"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">URL Analysis</h4>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span>Valid URL:</span>
                                <span className={isValidImageUrl(testUrl) ? 'text-green-600' : 'text-red-600'}>
                                    {isValidImageUrl(testUrl) ? 'Yes' : 'No'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Clerk Image:</span>
                                <span className={isClerkImageUrl(testUrl) ? 'text-blue-600' : 'text-gray-500'}>
                                    {isClerkImageUrl(testUrl) ? 'Yes' : 'No'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Image Preview</h4>
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                            {testUrl && isValidImageUrl(testUrl) && !imageError ? (
                                <Image
                                    src={testUrl}
                                    alt="Test"
                                    width={96}
                                    height={96}
                                    className="w-full h-full object-cover"
                                    onError={() => setImageError(true)}
                                    unoptimized={isClerkImageUrl(testUrl)}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                    {imageError ? 'Failed to load' : 'No image'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Quick Test URLs</h4>
                    <div className="flex flex-wrap gap-2">
                        {testUrls.map((url, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setTestUrl(url);
                                    setImageError(false);
                                }}
                                className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                            >
                                Test {index + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}