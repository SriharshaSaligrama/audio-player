import {
    JsonSchemaValidator,
    stringField,
    intField,
    boolField,
    dateField,
    objectIdField,
    objectField
} from '@/lib/mongodb/types';

export const userSchemaValidator: JsonSchemaValidator = {
    $jsonSchema: {
        bsonType: 'object',
        required: ['clerkId', 'email', 'displayName', 'role', 'isActive'],
        properties: {
            _id: objectIdField(),
            clerkId: stringField('Clerk user ID is required'),
            email: stringField('Email address from Clerk is required'),
            username: stringField(),
            displayName: stringField('Display name (combination of firstName and lastName from Clerk)'),
            avatar: stringField('Profile image URL from Clerk or custom uploaded image'),
            role: stringField('User role from Clerk public metadata', { enum: ['user', 'admin'] }),
            subscription: objectField({
                type: stringField(undefined, { enum: ['free', 'premium'] }),
                expiresAt: dateField(),
            }),
            preferences: objectField({
                theme: stringField(),
                language: stringField(),
                notifications: boolField(),
            }),
            stats: objectField({
                totalPlays: intField(undefined, { minimum: 0 }),
                totalLikes: intField(undefined, { minimum: 0 }),
                storageUsed: intField(undefined, { minimum: 0 }),
            }),
            createdAt: dateField(),
            updatedAt: dateField(),
            lastActiveAt: { bsonType: ['date', 'null'] },
            isActive: boolField(),
            isBanned: boolField(),
        }
    }
};

export type User = {
    _id: string;
    clerkId: string;
    email: string;
    username?: string;
    displayName: string;
    avatar?: string;
    role: 'user' | 'admin';
    subscription?: {
        type: 'free' | 'premium';
        expiresAt: Date;
    };
    preferences?: {
        theme?: string;
        language?: string;
        notifications?: boolean;
    };
    stats: {
        totalPlays: number;
        totalLikes: number;
        storageUsed: number;
    };
    createdAt: Date;
    updatedAt: Date;
    lastActiveAt: Date | null;
    isActive: boolean;
    isBanned: boolean;
}

export type CreateUser = Omit<User, '_id'>;
