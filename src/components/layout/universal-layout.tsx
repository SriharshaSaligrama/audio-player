'use client';

import { ReactNode, Suspense } from 'react';
import { SidebarProvider } from './sidebar-context';
import { UniversalSidebar } from './universal-sidebar';
import { UniversalMainContent } from './universal-main-content';

interface UniversalLayoutProps {
    children: ReactNode;
    isAdmin?: boolean;
    showToasts?: boolean;
    toastComponent?: ReactNode;
}

export function UniversalLayout({
    children,
    isAdmin = false,
    showToasts = false,
    toastComponent
}: UniversalLayoutProps) {
    return (
        <SidebarProvider>
            <div className="universal-layout fixed inset-0 z-10 overflow-hidden">
                <style jsx global>{`
                    body:has(.universal-layout) > div > header {
                        display: none !important;
                    }
                `}</style>

                <div className="h-full bg-gray-50 dark:bg-gray-900 theme-transition overflow-auto">
                    <UniversalSidebar isAdmin={isAdmin} />
                    <UniversalMainContent>
                        {showToasts && toastComponent}
                        <Suspense fallback={
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                            </div>
                        }>
                            {children}
                        </Suspense>
                    </UniversalMainContent>
                </div>
            </div>
        </SidebarProvider>
    );
}