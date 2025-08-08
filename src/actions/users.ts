'use server';

import { getDb } from "@/lib/mongodb/client";
import { ClerkUserPublicMetadata } from "@/lib/types/clerk";
import { CustomError, handleActionError, validateRequiredFields } from "@/lib/utils/error-handler";
import { transformClerkUser } from "@/lib/utils/user";
import { clerkClient, DeletedObjectJSON, UserJSON } from "@clerk/nextjs/server";

export async function createClerkUser(email: string, metadata: ClerkUserPublicMetadata) {
    try {
        const client = await clerkClient();
        const user = await client.users.createUser({
            emailAddress: [email],
            publicMetadata: metadata,
        });
        return user;
    } catch (error) {
        handleActionError({
            error,
            source: 'createClerkUser',
            details: { email, metadata },
            defaultType: 'ClerkError',
        });
    }
}

export async function getClerkUsers() {
    try {
        const client = await clerkClient();
        const users = await client.users.getUserList();
        return users;
    } catch (error) {
        handleActionError({
            error,
            source: 'getClerkUsers',
            defaultType: 'ClerkError',
        });
    }
}

export async function getClerkUserById(userId: string) {
    try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        return user;
    } catch (error) {
        handleActionError({
            error,
            source: 'getClerkUserById',
            details: { userId },
            defaultType: 'ClerkError',
        });
    }
}

export async function updateClerkUserMetadata(userId: string, metadata: ClerkUserPublicMetadata) {
    try {
        const client = await clerkClient();
        const user = await client.users.updateUser(userId, {
            publicMetadata: metadata,
        });
        return user;
    } catch (error) {
        handleActionError({
            error,
            source: 'updateClerkUserMetadata',
            details: { userId, metadata },
            defaultType: 'ClerkError',
        });
    }
}

export async function updateClerkUserProfileImage(userId: string, image: File) {
    try {
        const client = await clerkClient();
        const user = await client.users.updateUserProfileImage(userId, {
            file: image,
        });
        return user;
    } catch (error) {
        handleActionError({
            error,
            source: 'updateClerkUserProfileImage',
            details: { userId },
            defaultType: 'ClerkError',
        });
    }
}

export async function banClerkUser(userId: string) {
    try {
        const client = await clerkClient();
        const user = await client.users.banUser(userId);
        return user;
    } catch (error) {
        handleActionError({
            error,
            source: 'banClerkUser',
            details: { userId },
            defaultType: 'ClerkError',
        });
    }
}

export async function unbanClerkUser(userId: string) {
    try {
        const client = await clerkClient();
        const user = await client.users.unbanUser(userId);
        return user;
    } catch (error) {
        handleActionError({
            error,
            source: 'unbanClerkUser',
            details: { userId },
            defaultType: 'ClerkError',
        });
    }
}

export async function deleteClerkUser(userId: string) {
    try {
        const client = await clerkClient();
        await client.users.deleteUser(userId);
        return { success: true, message: 'User deleted successfully' };
    } catch (error) {
        handleActionError({
            error,
            source: 'deleteClerkUser',
            details: { userId },
            defaultType: 'ClerkError',
        });
    }
}

export async function createMongoUser(evt: UserJSON) {
    try {
        if (!evt) {
            throw new CustomError({
                message: 'Invalid user data',
                statusCode: 400,
                type: 'ValidationError',
                details: { evt }
            });
        }
        const mongoUser = transformClerkUser(evt);
        // Validate required fields
        validateRequiredFields({
            obj: mongoUser,
            fields: ['clerkId', 'email', 'displayName', 'role', 'isActive'],
            errorMessages: {
                clerkId: 'clerkId is required',
                email: 'Email is required',
                displayName: 'Display name is required',
                role: 'Role is required',
                isActive: 'isActive is required',
            },
            errorContext: { evt },
        });
        const db = await getDb();
        const result = await db.collection('users').insertOne(mongoUser);
        return { success: result.acknowledged, message: `User created with ID: ${result.insertedId}` };
    } catch (error) {
        handleActionError({
            error,
            source: 'createMongoUser',
            details: { evt },
        });
    }
}

export async function updateMongoUser(evt: UserJSON) {
    try {
        if (!evt || !evt.id) {
            throw new CustomError({
                message: 'Invalid user data or missing user ID',
                statusCode: 400,
                type: 'ValidationError',
                details: { evt }
            });
        }
        const updatedUser = transformClerkUser(evt);
        // Validate required fields
        validateRequiredFields({
            obj: updatedUser,
            fields: ['clerkId', 'email', 'displayName', 'role', 'isActive'],
            errorMessages: {
                clerkId: 'clerkId is required',
                email: 'Email is required',
                displayName: 'Display name is required',
                role: 'Role is required',
                isActive: 'isActive is required',
            },
            errorContext: { evt },
        });
        const db = await getDb();
        const result = await db.collection('users').updateOne({ clerkId: evt.id }, { $set: updatedUser }, { upsert: true });
        return { success: result.acknowledged, message: 'User updated successfully' };
    } catch (error) {
        handleActionError({
            error,
            source: 'updateMongoUser',
            details: { evt },
        });
    }
}

export async function deleteMongoUser(evt: DeletedObjectJSON) {
    try {
        if (!evt || !evt.id) {
            throw new CustomError({
                message: 'Invalid user data or missing user ID',
                statusCode: 400,
                type: 'ValidationError'
            });
        }
        const db = await getDb();
        const result = await db.collection('users').deleteOne({ clerkId: evt.id });
        return { success: result.acknowledged, message: 'User deleted successfully' };
    } catch (error) {
        handleActionError({
            error,
            source: 'deleteMongoUser',
            details: { evt },
        });
    }
}