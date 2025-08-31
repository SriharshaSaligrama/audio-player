'use server';

import { clientPromise } from '@/lib/mongodb/client';
import { auth } from '@clerk/nextjs/server';
import { CustomError, handleActionError, validateRequiredFields } from '@/lib/utils/error-handler';
import { MongoClient } from 'mongodb';

export async function requireAdmin() {
    const { sessionClaims } = await auth();
    if (!sessionClaims) {
        throw new CustomError({ message: 'Authentication required', statusCode: 401, type: 'AuthenticationError' });
    }
    if (sessionClaims?.metadata?.role !== 'admin') {
        throw new CustomError({ message: 'Admin access required', statusCode: 403, type: 'AuthorizationError' });
    }
}

export async function withTransaction<T>(fn: (args: { client: MongoClient; session: import('mongodb').ClientSession }) => Promise<T>) {
    const client: MongoClient = await clientPromise;
    const session = client.startSession();

    try {
        let result = null as unknown as T;
        await session.withTransaction(async () => {
            result = await fn({ client, session });
        });
        return result;
    } catch (error) {
        handleActionError({ error, source: 'withTransaction' });
    } finally {
        await session.endSession();
    }
}

export { handleActionError, validateRequiredFields, CustomError };
