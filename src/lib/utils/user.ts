import { CreateUser } from '@/lib/mongodb/schemas/user';
import { UserJSON } from '@clerk/nextjs/server';

export function transformClerkUser(clerkUser: UserJSON): CreateUser {
    return {
        clerkId: clerkUser.id || '',
        email: clerkUser.email_addresses[0].email_address || '',
        username: clerkUser.username || `${clerkUser.first_name || ''} ${clerkUser.last_name || ''}`.trim() || '',
        displayName: `${clerkUser.first_name || ''} ${clerkUser.last_name || ''}`.trim(),
        avatar: clerkUser.image_url || '',
        role: clerkUser.public_metadata.role === 'admin' ? 'admin' : 'user',
        stats: {
            totalPlays: 0,
            totalLikes: 0,
            storageUsed: 0
        },
        subscription: {
            type: 'free',
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
        },
        isActive: true,
        isBanned: Boolean(clerkUser.banned),
        createdAt: clerkUser.created_at ? new Date(clerkUser.created_at) : new Date(),
        updatedAt: clerkUser.updated_at ? new Date(clerkUser.updated_at) : new Date(),
        lastActiveAt: clerkUser.last_active_at ? new Date(clerkUser.last_active_at) : new Date(),
    };
}
