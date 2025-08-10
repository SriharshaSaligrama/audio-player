'use client';

import { useState } from 'react';
import { User as UserIcon, Settings, Shield } from 'lucide-react';
import { SerializedUser } from '@/lib/types/profile';
import { ProfileForm } from './profile-form';
import { ProfileSettings } from './profile-settings';

interface ProfileTabsProps {
    user: SerializedUser;
}

type TabType = 'profile' | 'settings' | 'security';

export function ProfileTabs({ user }: ProfileTabsProps) {
    const [activeTab, setActiveTab] = useState<TabType>('profile');

    const tabs = [
        {
            id: 'profile' as TabType,
            name: 'Profile Information',
            icon: UserIcon,
            description: 'Update your personal details'
        },
        {
            id: 'settings' as TabType,
            name: 'Account Settings',
            icon: Settings,
            description: 'Manage your account preferences'
        },
        {
            id: 'security' as TabType,
            name: 'Security',
            icon: Shield,
            description: 'Security and authentication settings'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1">
                <nav className="flex space-x-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium rounded-lg transition-all
                                    ${isActive
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                    }
                                `}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{tab.name}</span>
                                <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Description */}
            <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">
                    {tabs.find(tab => tab.id === activeTab)?.description}
                </p>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'profile' && <ProfileForm user={user} />}
                {activeTab === 'settings' && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Account Preferences
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Additional account settings will be available here in future updates.
                        </p>
                    </div>
                )}
                {activeTab === 'security' && <ProfileSettings user={user} />}
            </div>
        </div>
    );
}