'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { UniversalLayout } from './universal-layout';

type ConditionalLayoutProps = {
    children: ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
    const pathname = usePathname();

    // Don't wrap admin pages since they have their own layout
    if (pathname.startsWith('/admin')) {
        return <>{children}</>;
    }

    // Wrap all other pages with UniversalLayout
    return (
        <UniversalLayout>
            {children}
        </UniversalLayout>
    );
}