'use client';

import { ReactNode } from 'react';
import { useSidebar } from './sidebar-context';

type UniversalMainContentProps = {
    children: ReactNode;
}

export function UniversalMainContent({ children }: UniversalMainContentProps) {
    const { isCollapsed, isMobileMenuOpen, setIsMobileMenuOpen } = useSidebar();

    return (
        <>
            {/* Mobile overlay when menu is open */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <main
                className={`
                    h-full bg-gray-50 dark:bg-gray-900 theme-transition main-content-transition overflow-auto
                    ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
                `}
            >
                <div className="p-6 min-h-full">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </>
    );
}