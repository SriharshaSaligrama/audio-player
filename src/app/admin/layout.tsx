import { type ReactNode, Suspense } from 'react';
import { redirect } from 'next/navigation';
import { checkRole } from '@/utils/roles';
import { SuccessToastHandler } from '@/components/admin/success-toast-handler';
import { UniversalLayout } from '@/components/layout/universal-layout';

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const isAdmin = await checkRole('admin');
    if (!isAdmin) redirect('/');

    return (
        <UniversalLayout
            isAdmin={true}
            showToasts={true}
            toastComponent={
                <Suspense fallback={null}>
                    <SuccessToastHandler />
                </Suspense>
            }
        >
            {children}
        </UniversalLayout>
    );
}
