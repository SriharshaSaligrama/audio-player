'use server';

import { getDb } from "@/lib/mongodb/client";
import { ClerkUserPublicMetadata } from "@/lib/types/clerk";
import { transformClerkUser } from "@/lib/utils/user";
import { clerkClient, DeletedObjectJSON, UserJSON } from "@clerk/nextjs/server";

export async function createClerkUser(email: string, metadata: ClerkUserPublicMetadata) {
    const client = await clerkClient();
    const user = await client.users.createUser({
        emailAddress: [email],
        publicMetadata: metadata,
    });
    return user;
}

export async function getClerkUsers() {
    const client = await clerkClient();
    const users = await client.users.getUserList();
    return users;
}

export async function getClerkUserById(userId: string) {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return user;
}

export async function updateClerkUserMetadata(userId: string, metadata: ClerkUserPublicMetadata) {
    const client = await clerkClient();
    const user = await client.users.updateUser(userId, {
        publicMetadata: metadata,
    });
    return user;
}

export async function updateClerkUserProfileImage(userId: string, image: File) {
    const client = await clerkClient();
    const user = await client.users.updateUserProfileImage(userId, {
        file: image,
    });
    return user;
}

export async function banClerkUser(userId: string) {
    const client = await clerkClient();
    const user = await client.users.banUser(userId);
    return user;
}

export async function unbanClerkUser(userId: string) {
    const client = await clerkClient();
    const user = await client.users.unbanUser(userId);
    return user;
}

export async function deleteClerkUser(userId: string) {
    const client = await clerkClient();
    await client.users.deleteUser(userId);
    return { success: true, message: 'User deleted successfully' };
}

export async function createMongoUser(evt: UserJSON) {
    const user = evt;
    if (!user) {
        return { success: false, message: 'Invalid user data' };
    }

    const mongoUser = transformClerkUser(evt);

    const db = await getDb()
    const result = await db.collection('users').insertOne(mongoUser);

    return { success: result.acknowledged, message: `User created with ID: ${result.insertedId}` };
}

export async function updateMongoUser(evt: UserJSON) {
    const db = await getDb();
    const userId = evt.id;
    const userData = evt;

    const updatedUser = transformClerkUser(userData);
    const result = await db.collection('users').updateOne({ clerkId: userId }, { $set: updatedUser }, { upsert: true });

    return { success: result.acknowledged, message: 'User updated successfully' };
}

export async function deleteMongoUser(evt: DeletedObjectJSON) {
    const db = await getDb();
    const userId = evt.id;

    const result = await db.collection('users').deleteOne({ clerkId: userId });

    return { success: result.acknowledged, message: 'User deleted successfully' };
}