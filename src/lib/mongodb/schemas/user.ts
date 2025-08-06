import { JsonSchemaValidator } from '@/lib/mongodb/types';

export const userSchemaValidator: JsonSchemaValidator = {
    $jsonSchema: {
        bsonType: 'object',
        required: ['clerkId', 'email', 'displayName', 'role', 'isActive'],
        properties: {
            _id: {
                bsonType: 'objectId'
            },
            clerkId: {
                bsonType: 'string',
                description: 'Clerk user ID is required'
            },
            email: {
                bsonType: 'string',
                description: 'Email address from Clerk is required'
            },
            username: {
                bsonType: 'string'
            },
            displayName: {
                bsonType: 'string',
                description: 'Display name (combination of firstName and lastName from Clerk)'
            },
            avatar: {
                bsonType: 'string',
                description: 'Profile image URL from Clerk or custom uploaded image'
            },
            role: {
                bsonType: 'string',
                enum: ['user', 'admin'],
                description: 'User role from Clerk public metadata'
            },
            subscription: {
                bsonType: 'object',
                properties: {
                    type: {
                        bsonType: 'string',
                        enum: ['free', 'premium']
                    },
                    expiresAt: {
                        bsonType: 'date'
                    }
                }
            },
            preferences: {
                bsonType: 'object',
                properties: {
                    theme: {
                        bsonType: 'string'
                    },
                    language: {
                        bsonType: 'string'
                    },
                    notifications: {
                        bsonType: 'bool'
                    }
                }
            },
            stats: {
                bsonType: 'object',
                properties: {
                    totalPlays: {
                        bsonType: 'number',
                        minimum: 0
                    },
                    totalLikes: {
                        bsonType: 'number',
                        minimum: 0
                    },
                    storageUsed: {
                        bsonType: 'number',
                        minimum: 0
                    }
                }
            },
            createdAt: {
                bsonType: 'date'
            },
            updatedAt: {
                bsonType: 'date'
            },
            lastActiveAt: {
                bsonType: 'date'
            },
            isActive: {
                bsonType: 'bool'
            },
            isBanned: {
                bsonType: 'bool'
            }
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
    lastActiveAt: Date;
    isActive: boolean;
    isBanned: boolean;
}

export type CreateUser = Omit<User, '_id'>;
