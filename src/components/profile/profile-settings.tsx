'use client';

import {
    Shield,
    Key,
    Smartphone,
    Mail,
    AlertTriangle,
    CheckCircle,
    ExternalLink
} from 'lucide-react';
import { SerializedUser } from '@/lib/types/profile';

type ProfileSettingsProps = {
    user: SerializedUser;
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
    if (!user) return null;

    const handlePasswordChange = () => {
        // Open Clerk's user profile for password management
        if (typeof window !== 'undefined') {
            window.open('/user-profile#/security', '_blank');
        }
    };

    const handleTwoFactorSetup = () => {
        // Open Clerk's user profile for 2FA management
        if (typeof window !== 'undefined') {
            window.open('/user-profile#/security', '_blank');
        }
    };

    const handleEmailSettings = () => {
        // Open Clerk's user profile for email management
        if (typeof window !== 'undefined') {
            window.open('/user-profile#/email-address', '_blank');
        }
    };

    return (
        <div className="space-y-6">
            {/* Security Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span>Security Settings</span>
                </h3>

                <div className="space-y-4">
                    {/* Password */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <Key className="w-5 h-5 text-gray-500" />
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">Password</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {user.passwordEnabled ? 'Password is set' : 'No password set'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`}>
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Disabled
                            </span>
                            <button
                                disabled
                                onClick={handlePasswordChange}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center space-x-2"
                            >
                                <span>{user.passwordEnabled ? 'Change' : 'Set'} Password</span>
                                <ExternalLink className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <Smartphone className="w-5 h-5 text-gray-500" />
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Add an extra layer of security to your account
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.twoFactorEnabled
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                {user.twoFactorEnabled ? (
                                    <>
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Enabled
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle className="w-3 h-3 mr-1" />
                                        Disabled
                                    </>
                                )}
                            </span>
                            <button
                                disabled
                                onClick={handleTwoFactorSetup}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center space-x-2"
                            >
                                <span>{user.twoFactorEnabled ? 'Manage' : 'Setup'}</span>
                                <ExternalLink className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Email Settings */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <Mail className="w-5 h-5 text-gray-500" />
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">Email Settings</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Manage your email addresses and verification
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`}>
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Disabled
                            </span>
                            <button
                                disabled
                                onClick={handleEmailSettings}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center space-x-2"
                            >
                                <span>Manage</span>
                                <ExternalLink className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Account Status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Account Status
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${!user.banned ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                            }`}>
                            {!user.banned ? (
                                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                            ) : (
                                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            )}
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Account Status</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {!user.banned ? 'Active' : 'Banned'}
                        </p>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${!user.locked ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                            }`}>
                            {!user.locked ? (
                                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                            ) : (
                                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            )}
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Account Access</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {!user.locked ? 'Unlocked' : 'Locked'}
                        </p>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mb-3">
                            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Role</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {user.publicMetadata.role || 'user'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}