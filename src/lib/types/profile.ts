import { User } from "@clerk/nextjs/server";

// Serialized user data that can be safely passed to client components
export interface SerializedUser {
    id: string;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    imageUrl: string;
    emailAddresses: Array<{
        id: string;
        emailAddress: string;
    }>;
    createdAt: number;
    lastSignInAt: number | null;
    twoFactorEnabled: boolean;
    passwordEnabled: boolean;
    banned: boolean;
    locked: boolean;
    publicMetadata: {
        role?: 'user' | 'admin';
        [key: string]: unknown;
    };
}

export function serializeClerkUser(user: User): SerializedUser {
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        imageUrl: user.imageUrl,
        emailAddresses: user.emailAddresses.map((email) => ({
            id: email.id,
            emailAddress: email.emailAddress,
        })),
        createdAt: user.createdAt,
        lastSignInAt: user.lastSignInAt,
        twoFactorEnabled: user.twoFactorEnabled,
        passwordEnabled: user.passwordEnabled,
        banned: user.banned,
        locked: user.locked,
        publicMetadata: user.publicMetadata,
    };
}

export function validateSerializedUser(user: SerializedUser): boolean {
    return !!(
        user &&
        typeof user.id === 'string' &&
        user.id.length > 0 &&
        Array.isArray(user.emailAddresses) &&
        user.emailAddresses.length > 0
    );
}