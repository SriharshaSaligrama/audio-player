# Profile Components

This directory contains all components related to user profile management.

## Components

### Core Components
- **ProfileTabs**: Main tabbed type for organizing profile sections
- **ProfileForm**: Editable form for personal information
- **ProfileImageUpload**: Profile picture upload functionality
- **ProfileSettings**: Security and account settings management

### UI Components
- **ProfileToast**: Success/error notifications
- **ProfileLoading**: Loading skeleton states
- **ProfileError**: Error handling with retry functionality

## Usage

```tsx
import { ProfileTabs } from '@/components/profile';
import { SerializedUser } from '@/lib/types/profile';

function ProfilePage({ user }: { user: SerializedUser }) {
    return <ProfileTabs user={user} />;
}
```

## Data Flow

1. Server Component fetches Clerk user data
2. User data is serialized using `serializeClerkUser()`
3. Serialized data is passed to Client Components
4. Client Components use `useUser()` hook for updates

## Security

- All sensitive operations redirect to Clerk's secure pages
- File uploads are validated for type and size
- Profile updates use Clerk's built-in validation
- Only permitted fields can be updated

## Features

- ✅ View profile information
- ✅ Edit personal details (name, username)
- ✅ Upload profile pictures
- ✅ Manage security settings
- ✅ View account status
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error handling
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Image optimization for Clerk CDN
- ✅ Fallback handling for failed images

## Image Configuration

The profile components support images from various sources:

- **Clerk CDN**: `img.clerk.com`, `images.clerk.dev`, `images.clerk.com`
- **Vercel Blob Storage**: For uploaded assets
- **Placeholder Services**: For development and testing

### Next.js Image Configuration

Make sure your `next.config.ts` includes the required domains:

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'img.clerk.com',
    },
    {
      protocol: 'https',
      hostname: 'images.clerk.dev',
    },
    // ... other domains
  ],
}
```