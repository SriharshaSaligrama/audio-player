import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { UniversalLayout } from '@/components/layout/universal-layout';
import { ProfileTabs } from '@/components/profile/profile-tabs';
import { ProfileLoading } from '@/components/profile/profile-loading';
import { ProfileError } from '@/components/profile/profile-error';
import { serializeClerkUser } from '@/lib/types/profile';

export const metadata = {
    title: 'Profile - Audio Player',
    description: 'Manage your account information and preferences',
};

async function ProfileContent() {
    try {
        const user = await currentUser();

        if (!user) {
            redirect('/sign-in');
        }

        const serializedUser = serializeClerkUser(user);
        return <ProfileTabs user={serializedUser} />;
    } catch (error) {
        console.error('Profile page error:', error);
        return <ProfileError error="Failed to load your profile. Please try again." />;
    }
}

export default function ProfilePage() {
    return (
        <UniversalLayout>
            <div className="max-w-4xl mx-auto p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Profile
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Manage your account information and preferences
                    </p>
                </div>

                <Suspense fallback={<ProfileLoading />}>
                    <ProfileContent />
                </Suspense>
            </div>
        </UniversalLayout>
    );
}