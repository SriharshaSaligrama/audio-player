'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Music,
    Disc3,
    Users,
    Menu,
    X,
    Sun,
    Moon,
    LogOut,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSidebar } from '../layout/sidebar-context';
import { useClerk } from '@clerk/nextjs';

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Tracks', href: '/admin/tracks', icon: Music },
    { name: 'Albums', href: '/admin/albums', icon: Disc3 },
    { name: 'Artists', href: '/admin/artists', icon: Users },
];

export function AdminSidebar() {
    const [mounted, setMounted] = useState(false);
    const { isCollapsed, setIsCollapsed, isMobileMenuOpen, setIsMobileMenuOpen } = useSidebar();
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const { signOut } = useClerk();

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <>
            {/* Mobile menu button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 theme-transition"
                >
                    {isMobileMenuOpen ? (
                        <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    ) : (
                        <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    )}
                </button>
            </div>

            {/* Mobile backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 z-40 h-screen 
                    bg-white dark:bg-gray-800 
                    border-r border-gray-200 dark:border-gray-700 
                    shadow-xl theme-transition sidebar-transition
                    ${isCollapsed ? 'w-16' : 'w-64'}
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                <div className="flex flex-col h-full sidebar-scroll overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                        {!isCollapsed && (
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Music className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Audio Admin
                                    </h1>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Management Panel
                                    </p>
                                </div>
                            </div>
                        )}

                        {isCollapsed && (
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mx-auto">
                                <Music className="h-6 w-6 text-white" />
                            </div>
                        )}

                        {/* Collapse button - desktop only */}
                        {!isCollapsed && (
                            <button
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className="hidden lg:flex p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 theme-transition shadow-sm"
                                title="Collapse sidebar"
                            >
                                <ChevronLeft className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </button>
                        )}

                        {isCollapsed && (
                            <button
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className="hidden lg:flex p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 theme-transition shadow-lg absolute top-4 -right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50"
                                title="Expand sidebar"
                            >
                                <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </button>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-6 space-y-2">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`
                                        flex items-center px-3 py-3 text-sm font-medium rounded-xl theme-transition group relative
                                        ${isActive
                                            ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 shadow-sm'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:shadow-sm'
                                        }
                                    `}
                                    title={isCollapsed ? item.name : undefined}
                                >
                                    <Icon className={`
                                        h-5 w-5 flex-shrink-0 transition-colors
                                        ${isActive
                                            ? 'text-blue-700 dark:text-blue-300'
                                            : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                                        }
                                    `} />
                                    {!isCollapsed && (
                                        <span className="ml-3 truncate font-medium">{item.name}</span>
                                    )}
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 transform w-1 h-8 bg-blue-600 dark:bg-blue-400 rounded-r-full"></div>
                                    )}
                                    {isActive && !isCollapsed && (
                                        <div className="ml-auto w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse"></div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-2 bg-gray-50/50 dark:bg-gray-800/50">
                        {/* Theme toggle */}
                        {mounted && (
                            <button
                                onClick={toggleTheme}
                                className={`
                                    w-full flex items-center px-3 py-3 text-sm font-medium rounded-xl theme-transition group
                                    text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm
                                `}
                                title={isCollapsed ? 'Toggle theme' : undefined}
                            >
                                {theme === 'dark' ? (
                                    <Sun className="h-5 w-5 flex-shrink-0 text-amber-500 group-hover:text-amber-600" />
                                ) : (
                                    <Moon className="h-5 w-5 flex-shrink-0 text-indigo-500 group-hover:text-indigo-600" />
                                )}
                                {!isCollapsed && (
                                    <span className="ml-3 truncate font-medium">
                                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                                    </span>
                                )}
                            </button>
                        )}

                        {/* Logout */}
                        <button
                            onClick={() => signOut()}
                            className={`
                                w-full flex items-center px-3 py-3 text-sm font-medium rounded-xl theme-transition group
                                text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:shadow-sm
                            `}
                            title={isCollapsed ? 'Logout' : undefined}
                        >
                            <LogOut className="h-5 w-5 flex-shrink-0 group-hover:text-red-700 dark:group-hover:text-red-300" />
                            {!isCollapsed && (
                                <span className="ml-3 truncate font-medium">Logout</span>
                            )}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}