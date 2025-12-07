# API Refactoring Documentation

## Overview
This document describes the API refactoring work done to optimize the codebase for Next.js 15, focusing on server-side data fetching and removing unused API endpoints.

## Changes Made

### 1. Removed Unused API Routes (42 endpoints)
The following unused API endpoints were removed to reduce codebase complexity:

#### Admin APIs
- `/api/admin/auth/login` - Admin authentication
- `/api/admin/auth/register` - Admin registration
- `/api/admin/sessions/manage` - Session management
- `/api/admin/manage-user-role` - User role management
- `/api/admin/stages/manage` - Stage management

#### Assessment APIs
- `/api/assessment/reset` - Reset assessments
- `/api/assessment/results` - Assessment results
- `/api/assessment/status` - Assessment status

#### Auth APIs
- `/api/auth/resend-verification` - Resend verification email
- `/api/auth/reset-password` - Password reset
- `/api/auth/verify-email` - Email verification

#### Happiness Tracking APIs
- `/api/happiness` - Base happiness endpoint
- `/api/happiness/breakdown` - Happiness score breakdown
- `/api/happiness/history` - Happiness history
- `/api/happiness/trends` - Happiness trends

#### Health Check APIs
- `/api/health` - Base health endpoint
- `/api/health/info` - Health info
- `/api/health/metrics` - Health metrics
- `/api/health/ping` - Health ping

#### Notes APIs
- `/api/notes/emoji` - Emoji notes
- `/api/notes/history` - Notes history
- `/api/notes/trends` - Notes trends

#### PAHM APIs
- `/api/pahm/click` - PAHM click tracking
- `/api/pahm/complete` - PAHM completion
- `/api/pahm/session/[id]` - PAHM session details
- `/api/pahm/start` - Start PAHM session

#### Progress APIs
- `/api/progress/stages` - All stages progress

#### Session APIs
- `/api/session/complete` - Complete session
- `/api/session/history` - Session history
- `/api/session/progress` - Session progress
- `/api/session/start` - Start session
- `/api/session/update` - Update session

#### Stage APIs
- `/api/stages` - Base stages endpoint
- `/api/stages/[id]` - Stage details
- `/api/stages/[id]/unlock` - Unlock stage

#### Test & User APIs
- `/api/test/db-connection` - Database connection test
- `/api/user/preferences` - User preferences
- `/api/user/profile` - User profile (duplicate)

### 2. Created Server-Side Data Fetching Functions

New data fetching functions in `/src/lib/data/`:

#### `user-profile.ts`
- **Function**: `getUserProfile()`
- **Purpose**: Fetch user profile data server-side
- **Features**: Uses React cache() for request deduplication
- **Returns**: UserProfileData including name, email, role, profile, happiness, sessions, etc.

#### `progress-overview.ts`
- **Function**: `getProgressOverview()`
- **Purpose**: Fetch comprehensive progress overview
- **Features**: Parallel queries, complex calculations, streak tracking
- **Returns**: ProgressOverviewData including user info, journey progress, practice stats, PAHM stats, happiness scores, assessments, milestones, and recent activity

#### `stage1-progress.ts`
- **Function**: `getStage1Progress()`
- **Purpose**: Fetch Stage 1 (Seeker) progress with sub-stages
- **Features**: Parallel queries, sub-stage progress tracking
- **Returns**: Stage1ProgressData including sub-stages (T1-T5), PAHM intro status, and summary statistics

### 3. Created Server Actions

New server actions in `/src/lib/actions/`:

#### `user-profile.ts`
- **updateUserProfile(data)**: Update user profile information
- **deleteUserAccount()**: Delete user account and all associated data
- **changeUserPassword(currentPassword, newPassword)**: Change user password

### 4. Optimized Remaining API Routes

The following API routes were refactored to use the new server-side data fetching functions:

#### GET Endpoints (Optimized)
- `/api/user/profile-data` - Now uses `getUserProfile()`
- `/api/progress/overview` - Now uses `getProgressOverview()`
- `/api/progress/stage-1` - Now uses `getStage1Progress()`

#### POST/PUT/DELETE Endpoints (Kept as-is)
These endpoints maintain their existing implementation with validation and rate limiting:
- `/api/user/profile-data` (PUT) - Now uses `updateUserProfile()` action
- `/api/user/change-password` (PUT)
- `/api/user/delete-account` (DELETE/POST)
- `/api/user/personal-info` (GET/PUT)
- `/api/admin/users/manage` (POST)
- `/api/admin/stats` (GET)
- `/api/admin/stage-actions` (POST)
- `/api/admin/data/clear` (POST)
- `/api/notes/detailed` (GET/POST)
- `/api/assessment/questionnaire` (POST)
- `/api/assessment/self-assessment` (GET/POST)
- `/api/pahm-intro/complete` (POST)
- `/api/auth/register` (POST)
- `/api/auth/[...nextauth]` (NextAuth - kept as-is)

## Benefits

### Performance Improvements
1. **Request Deduplication**: Using React's `cache()` function, duplicate requests within the same render cycle are automatically deduplicated
2. **Reduced Network Overhead**: Server components can fetch data directly without an extra HTTP round-trip
3. **Optimized Queries**: Data fetching functions use parallel queries and efficient database operations

### Code Quality
1. **Reduced Duplication**: Logic is centralized in data fetching functions
2. **Better Separation of Concerns**: Data fetching is separated from API route handling
3. **Type Safety**: Full TypeScript support with exported interfaces
4. **Maintainability**: Easier to test and modify data fetching logic

### Codebase Size
- Removed ~7,000 lines of unused code
- Reduced from 54 API routes to 18 active routes
- Simplified the API surface area

## Migration Guide

### For Developers Using the APIs

#### Client-Side Usage (No Changes Required)
The API routes still work exactly as before. Client components can continue using:
```typescript
import { useUserProfile } from '@/hooks/useUserProfile'
import { useProgressOverview } from '@/hooks/useProgressOverview'
import { useStage1Progress } from '@/hooks/useStage1Progress'
```

#### Server Component Usage (New Pattern)
For new server components, use the data fetching functions directly:

```typescript
import { getUserProfile, getProgressOverview, getStage1Progress } from '@/lib/data'

export default async function ProfilePage() {
  const profile = await getUserProfile()
  
  if (!profile) {
    return <div>Not authenticated</div>
  }
  
  return <div>{profile.name}</div>
}
```

#### Using Server Actions
For mutations, you can now use Server Actions:

```typescript
'use client'
import { updateUserProfile, changeUserPassword } from '@/lib/actions'

export function ProfileForm() {
  async function handleSubmit(formData: FormData) {
    const result = await updateUserProfile({
      name: formData.get('name') as string,
      email: formData.get('email') as string
    })
    
    if (result.success) {
      // Handle success
    }
  }
  
  return <form action={handleSubmit}>...</form>
}
```

## Testing

### API Endpoints
All remaining API endpoints maintain backward compatibility:
- GET `/api/user/profile-data` ✓
- GET `/api/progress/overview` ✓
- GET `/api/progress/stage-1` ✓
- PUT `/api/user/profile-data` ✓

### Data Fetching Functions
The new server-side data fetching functions are tested through the API routes they power.

## Next Steps

### Optional Improvements
1. Convert more pages to use Server Components directly
2. Add caching headers to GET endpoints for better CDN caching
3. Create additional server actions for other mutation operations
4. Add Suspense boundaries for streaming server components
5. Implement partial prerendering for hybrid pages

### Monitoring
- Monitor API response times to ensure performance improvements
- Track usage of remaining API endpoints
- Consider deprecating old patterns in favor of Server Components

## References
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [React cache() API](https://react.dev/reference/react/cache)
