'use server';

import { getDb } from "@/lib/mongodb/client";
import { ClerkUserPublicMetadata } from "@/lib/types/clerk";
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
        console.error('Error creating Clerk user:', error);
        const errMsg = error instanceof Error ? error.message : String(error);
        return { success: false, message: 'Clerk error: ' + errMsg };
    }
}

export async function getClerkUsers() {
    try {
        const client = await clerkClient();
        const users = await client.users.getUserList();
        return users;
    } catch (error) {
        console.error('Error getting Clerk users:', error);
        return [];
    }
}

export async function getClerkUserById(userId: string) {
    try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        return user;
    } catch (error) {
        console.error('Error getting Clerk user by ID:', error);
        return null;
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
        console.error('Error updating Clerk user metadata:', error);
        const errMsg = error instanceof Error ? error.message : String(error);
        return { success: false, message: 'Clerk error: ' + errMsg };
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
        console.error('Error updating Clerk user profile image:', error);
        const errMsg = error instanceof Error ? error.message : String(error);
        return { success: false, message: 'Clerk error: ' + errMsg };
    }
}

export async function banClerkUser(userId: string) {
    try {
        const client = await clerkClient();
        const user = await client.users.banUser(userId);
        return user;
    } catch (error) {
        console.error('Error banning Clerk user:', error);
        const errMsg = error instanceof Error ? error.message : String(error);
        return { success: false, message: 'Clerk error: ' + errMsg };
    }
}

export async function unbanClerkUser(userId: string) {
    try {
        const client = await clerkClient();
        const user = await client.users.unbanUser(userId);
        return user;
    } catch (error) {
        console.error('Error unbanning Clerk user:', error);
        const errMsg = error instanceof Error ? error.message : String(error);
        return { success: false, message: 'Clerk error: ' + errMsg };
    }
}

export async function deleteClerkUser(userId: string) {
    try {
        const client = await clerkClient();
        await client.users.deleteUser(userId);
        return { success: true, message: 'User deleted successfully' };
    } catch (error) {
        console.error('Error deleting Clerk user:', error);
        const errMsg = error instanceof Error ? error.message : String(error);
        return { success: false, message: 'Clerk error: ' + errMsg };
    }
}

export async function createMongoUser(evt: UserJSON) {
    try {
        if (!evt) {
            return { success: false, message: 'Invalid user data' };
        }
        const mongoUser = transformClerkUser(evt);
        // Validate required fields
        if (!mongoUser.clerkId) {
            return { success: false, message: 'clerkId is required' };
        }
        if (!mongoUser.email) {
            return { success: false, message: 'Email is required' };
        }
        if (!mongoUser.displayName) {
            return { success: false, message: 'Display name is required' };
        }
        if (!mongoUser.role) {
            return { success: false, message: 'Role is required' };
        }
        if (typeof mongoUser.isActive !== 'boolean') {
            return { success: false, message: 'isActive is required' };
        }
        const db = await getDb();
        const result = await db.collection('users').insertOne(mongoUser);
        return { success: result.acknowledged, message: `User created with ID: ${result.insertedId}` };
    } catch (error) {
        console.error('Error creating user:', error);
        const errMsg = error instanceof Error ? error.message : String(error);
        return { success: false, message: 'Database error: ' + errMsg };
    }
}

export async function updateMongoUser(evt: UserJSON) {
    try {
        if (!evt || !evt.id) {
            return { success: false, message: 'Invalid user data or missing user ID' };
        }
        const updatedUser = transformClerkUser(evt);
        // Validate required fields
        if (!updatedUser.clerkId) {
            return { success: false, message: 'clerkId is required' };
        }
        if (!updatedUser.email) {
            return { success: false, message: 'Email is required' };
        }
        if (!updatedUser.displayName) {
            return { success: false, message: 'Display name is required' };
        }
        if (!updatedUser.role) {
            return { success: false, message: 'Role is required' };
        }
        if (typeof updatedUser.isActive !== 'boolean') {
            return { success: false, message: 'isActive is required' };
        }
        const db = await getDb();
        const result = await db.collection('users').updateOne({ clerkId: evt.id }, { $set: updatedUser }, { upsert: true });
        return { success: result.acknowledged, message: 'User updated successfully' };
    } catch (error) {
        console.error('Error updating user:', error);
        const errMsg = error instanceof Error ? error.message : String(error);
        return { success: false, message: 'Database error: ' + errMsg };
    }
}

export async function deleteMongoUser(evt: DeletedObjectJSON) {
    try {
        if (!evt || !evt.id) {
            return { success: false, message: 'Invalid user data or missing user ID' };
        }
        const db = await getDb();
        const result = await db.collection('users').deleteOne({ clerkId: evt.id });
        return { success: result.acknowledged, message: 'User deleted successfully' };
    } catch (error) {
        console.error('Error deleting user:', error);
        const errMsg = error instanceof Error ? error.message : String(error);
        return { success: false, message: 'Database error: ' + errMsg };
    }
}