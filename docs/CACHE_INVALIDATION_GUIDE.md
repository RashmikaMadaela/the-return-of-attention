# Cache Invalidation Guide

## Overview

The application uses **SWR (stale-while-revalidate)** for data fetching with aggressive caching to minimize unnecessary database queries. Data is only refetched when:

1. **First load** (no cache exists)
2. **Cache expires** (10-15 minutes depending on data type)
3. **Manual invalidation** (after database mutations)

## Key Principle

**Only fetch when the database has actually changed.**

## Configuration

### Homepage (Progress Overview)
- **Cache Duration**: 10 minutes
- **Auto-revalidate**: Disabled
- **Hook**: `useProgressOverview()`

### User Profile
- **Cache Duration**: 15 minutes  
- **Auto-revalidate**: Disabled
- **Hook**: `useUserProfile()`

## When to Invalidate Cache

### After Session Completion
```typescript
import { useCacheInvalidation } from '@/hooks/useCacheInvalidation'

const { invalidateProgress } = useCacheInvalidation()

// After completing a session
await completeSession()
await invalidateProgress() // ✅ Refetch progress data
```

### After Profile Update
```typescript
const { invalidateProfile } = useCacheInvalidation()

// After updating profile
await updateProfile(data)
await invalidateProfile() // ✅ Refetch profile data
```

### After Assessment Completion
```typescript
const { invalidateAll } = useCacheInvalidation()

// After completing assessment (affects both profile and progress)
await submitAssessment()
await invalidateAll() // ✅ Refetch all data
```

### After PAHM Practice
```typescript
const { invalidateProgress } = useCacheInvalidation()

// After PAHM session
await savePAHMSession()
await invalidateProgress() // ✅ Refetch progress data
```

### After Happiness Assessment
```typescript
const { invalidateAll } = useCacheInvalidation()

// After happiness score update
await submitHappinessAssessment()
await invalidateAll() // ✅ Refetch all data
```

## Usage Examples

### In React Components

```typescript
'use client'

import { useCacheInvalidation } from '@/hooks/useCacheInvalidation'

export default function SomePage() {
  const { invalidateProgress, invalidateProfile, invalidateAll } = useCacheInvalidation()

  const handleSessionComplete = async () => {
    try {
      await fetch('/api/sessions/complete', { method: 'POST' })
      await invalidateProgress() // ✅ Refresh homepage data
      router.push('/home')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <button onClick={handleSessionComplete}>
      Complete Session
    </button>
  )
}
```

### In Non-React Contexts

```typescript
import { cacheInvalidation } from '@/hooks/useCacheInvalidation'

// In API route handlers or utility functions
export async function saveSession(data: SessionData) {
  await db.session.create({ data })
  
  // Invalidate cache after mutation
  await cacheInvalidation.invalidateProgress()
}
```

## Benefits

### ✅ Performance
- **Instant loads** from cache (no loading spinners on revisit)
- **Reduced database queries** (only when data actually changes)
- **Better user experience** (no flickering or unnecessary loading states)

### ✅ Cost Savings
- **Fewer database reads** = lower database costs
- **Reduced API calls** = lower bandwidth usage
- **Better scalability** = can handle more users

### ✅ Fresh Data
- **Always up-to-date** after mutations
- **Manual control** over when to refetch
- **Predictable behavior** (no surprise refetches)

## Migration Checklist

When adding new features that modify data:

- [ ] Identify which data changes (progress, profile, or both)
- [ ] Import `useCacheInvalidation` or `cacheInvalidation`
- [ ] Call appropriate invalidation function after successful mutation
- [ ] Test that data refreshes correctly

## Common Patterns

### Pattern 1: Form Submission with Cache Invalidation
```typescript
const { invalidateProfile } = useCacheInvalidation()

const handleSubmit = async (formData: FormData) => {
  setIsLoading(true)
  try {
    await fetch('/api/profile/update', {
      method: 'POST',
      body: JSON.stringify(formData)
    })
    await invalidateProfile() // ✅ Refresh profile
    showSuccess('Profile updated!')
  } catch (error) {
    showError('Failed to update')
  } finally {
    setIsLoading(false)
  }
}
```

### Pattern 2: Navigation After Data Change
```typescript
const { invalidateProgress } = useCacheInvalidation()

const handleComplete = async () => {
  await completeTask()
  await invalidateProgress() // ✅ Refresh before navigation
  router.push('/home') // User sees fresh data
}
```

### Pattern 3: Optimistic Updates
```typescript
const { data, mutate } = useProgressOverview()
const { invalidateProgress } = useCacheInvalidation()

const handleUpdate = async (newData: Partial<Progress>) => {
  // Optimistic update (instant UI)
  mutate({ ...data!, ...newData }, false)
  
  try {
    await fetch('/api/update', { 
      method: 'POST', 
      body: JSON.stringify(newData) 
    })
    // Revalidate from server
    await invalidateProgress()
  } catch (error) {
    // Rollback on error
    mutate(data)
  }
}
```

## Debugging

### Check if cache is being used:
1. Open DevTools Network tab
2. Navigate to HomePage or UserProfile
3. If no API calls = ✅ cache is working
4. Navigate away and back
5. Still no API calls = ✅ cache is fresh

### Force refresh cache:
```typescript
// In browser console
localStorage.clear()
sessionStorage.clear()
location.reload()
```

### Monitor cache invalidation:
```typescript
// Add logging to invalidation functions
const invalidateProgress = async () => {
  console.log('🔄 Invalidating progress cache')
  await mutate('/api/progress/overview')
  console.log('✅ Progress cache invalidated')
}
```

## Best Practices

1. **Always invalidate after mutations** - Don't wait for auto-revalidation
2. **Use specific invalidation** - Don't call `invalidateAll()` unless necessary
3. **Invalidate before navigation** - Ensures fresh data on destination page
4. **Test cache behavior** - Verify data refreshes correctly after changes
5. **Document invalidation points** - Comment where and why you invalidate

## Questions?

- **Q: Why not just revalidate on focus?**
  - A: Saves unnecessary API calls when data hasn't changed

- **Q: What if I forget to invalidate?**
  - A: Cache will expire after 10-15 minutes and refetch automatically

- **Q: Can I force immediate refetch?**
  - A: Yes, call the invalidation function or set dedupingInterval to 0

- **Q: Does this work offline?**
  - A: Yes, SWR serves cached data when offline
