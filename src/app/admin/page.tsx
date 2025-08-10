import { redirect } from 'next/navigation'
import { checkRole } from '@/utils/roles'

export default async function AdminDashboard() {
    const isAdmin = await checkRole('admin');
    if (!isAdmin) {
        redirect('/')
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-foreground">Admin Dashboard</h1>
                    <p className="mt-2 text-sm text-foreground/70">
                        This is the protected admin dashboard restricted to users with the admin role.
                    </p>
                </div>
            </div>
        </div>
    );
}