export type ClerkUser = {
    id: string;
    passwordEnabled: boolean;
    totpEnabled: boolean;
    backupCodeEnabled: boolean;
    twoFactorEnabled: boolean;
    banned: boolean;
    locked: boolean;
    createdAt: number;
    updatedAt: number;
    imageUrl: string;
    hasImage: boolean;
    primaryEmailAddressId: string;
    primaryPhoneNumberId: string | null;
    primaryWeb3WalletId: string | null;
    lastSignInAt: number;
    externalId: string | null;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    publicMetadata: {
        role?: 'user' | 'admin';
        [key: string]: unknown;
    };
    privateMetadata: Record<string, unknown>;
    unsafeMetadata: Record<string, unknown>;
    emailAddresses: Array<{
        id: string;
        emailAddress: string;
        verification: {
            status: string;
            strategy: string;
            externalVerificationRedirectURL: string | null;
            attempts: number | null;
            expireAt: number | null;
            nonce: string | null;
            message: string | null;
        };
        linkedTo: Array<{
            id: string;
            type: string;
        }>;
    }>;
    lastActiveAt: number;
    createOrganizationEnabled: boolean;
    deleteSelfEnabled: boolean;
    externalAccounts: Array<{
        id: string;
        provider: string;
        identificationId: string;
        externalId: string;
        emailAddress: string;
        firstName: string | null;
        lastName: string | null;
        imageUrl: string | null;
        username: string | null;
        publicMetadata: Record<string, unknown>;
        label: string | null;
        verification: {
            status: string;
            strategy: string;
            externalVerificationRedirectURL: string | null;
            attempts: number | null;
            expireAt: number | null;
            nonce: string | null;
            message: string | null;
        };
    }>;
}

export type ClerkUserPublicMetadata = {
    role?: 'user' | 'admin';
}
