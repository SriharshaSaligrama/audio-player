'use client';

import { SerializedUser } from '@/lib/types/profile';

// Test component to verify serialized user data structure
export function ProfileTest() {
    const mockUser: SerializedUser = {
        id: 'test-user-id',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        imageUrl: 'https://example.com/avatar.jpg',
        emailAddresses: [
            {
                id: 'email-1',
                emailAddress: 'john@example.com'
            }
        ],
        createdAt: Date.now(),
        lastSignInAt: Date.now(),
        twoFactorEnabled: false,
        passwordEnabled: true,
        banned: false,
        locked: false,
        publicMetadata: {
            role: 'user'
        }
    };

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Profile Data Test</h3>
            <pre className="text-sm bg-white dark:bg-gray-900 p-4 rounded overflow-auto">
                {JSON.stringify(mockUser, null, 2)}
            </pre>
        </div>
    );
}