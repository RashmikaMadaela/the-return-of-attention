# Session Timeout Infinite Loop Fix

## Problem

After the 1-hour inactivity timeout expired, the application was stuck in an infinite loop making continuous requests:

```
GET /api/auth/session 200
GET /api/auth/csrf 200  
POST /api/auth/signout 200
[Repeats infinitely]
```

This caused:
- Excessive server load
- Network congestion
- Browser performance degradation
- User unable to properly reach signin page

## Root Cause

The `useSessionTimeout` hook continued to run its interval checks even after calling `signOut()`, resulting in:

1. Session expires → `checkTimeout()` called
2. `signOut()` initiated
3. Hook still active, `checkTimeout()` runs again
4. Detects expired session → calls `signOut()` again
5. Loop repeats infinitely

The hook had no mechanism to prevent multiple signout attempts or disable itself after signout began.

## Solution

Added a `isSigningOutRef` ref flag to track signout state and prevent the infinite loop:

### Key Changes in `src/hooks/useSessionTimeout.ts`:

**1. Added signout tracking flag:**
```typescript
const isSigningOutRef = useRef<boolean>(false) // Prevent infinite signout loop
```

**2. Guard all checks with the flag:**
```typescript
const checkTimeout = useCallback(async () => {
  // Don't check if already signing out or not authenticated
  if (isSigningOutRef.current || status !== 'authenticated' || !session) {
    return
  }
  // ... rest of timeout logic
}, [status, session, router, options])
```

**3. Set flag immediately when signout begins:**
```typescript
if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
  // Prevent multiple signout attempts
  if (isSigningOutRef.current) {
    return
  }
  
  console.log('Session expired due to inactivity - initiating logout')
  isSigningOutRef.current = true // Set flag first
  
  // Clear interval immediately to prevent further checks
  if (checkIntervalRef.current) {
    clearInterval(checkIntervalRef.current)
    checkIntervalRef.current = null
  }
  
  // ... signout logic
}
```

**4. Protected activity listener setup:**
```typescript
useEffect(() => {
  // Don't set up if already signing out or not authenticated
  if (isSigningOutRef.current || status !== 'authenticated') {
    return
  }
  // ... setup listeners and interval
}, [status, handleActivity, checkTimeout])
```

**5. Protected visibility change handler:**
```typescript
useEffect(() => {
  // Don't check if already signing out or not authenticated
  if (isSigningOutRef.current || status !== 'authenticated') {
    return
  }

  const handleVisibilityChange = () => {
    // Don't check if already signing out
    if (isSigningOutRef.current) {
      return
    }
    // ... visibility logic
  }
}, [status, checkTimeout])
```

**6. Reset flag when user logs out:**
```typescript
// Clean up when component unmounts or user logs out
useEffect(() => {
  if (status === 'unauthenticated') {
    // Clear the signing out flag when logged out
    isSigningOutRef.current = false
  }
}, [status])
```

## How It Works Now

1. ✅ User inactive for 1 hour
2. ✅ `checkTimeout()` detects expiration
3. ✅ `isSigningOutRef.current` set to `true`
4. ✅ Interval cleared immediately
5. ✅ `signOut()` called once
6. ✅ User redirected to `/signin?expired=true`
7. ✅ All subsequent `checkTimeout()` calls exit early (flag is true)
8. ✅ No more signout requests
9. ✅ Flag resets when status becomes 'unauthenticated'

## Testing Checklist

### 1. Normal Session Timeout
- [ ] Leave page inactive for 1 hour
- [ ] Verify warning shows at 55 minutes
- [ ] Wait for full timeout
- [ ] Verify single signout request in Network tab (not repeated)
- [ ] Verify redirect to `/signin?expired=true`
- [ ] Verify "Your session has expired" message displays

### 2. Manual Signout
- [ ] Click logout button
- [ ] Verify single signout request
- [ ] Verify redirect to signin page
- [ ] No repeated API calls

### 3. Activity During Warning
- [ ] Trigger warning (wait 55 minutes)
- [ ] Click "Stay Logged In"
- [ ] Verify warning dismisses
- [ ] Continue using app normally
- [ ] Verify no unexpected signouts

### 4. Tab Visibility
- [ ] Leave page inactive for 1 hour
- [ ] Switch to different tab
- [ ] Switch back after timeout
- [ ] Verify single signout (no loop)
- [ ] Verify proper redirect

### 5. Multiple Tabs
- [ ] Open app in 2 tabs
- [ ] Leave both inactive for 1 hour
- [ ] Verify both tabs sign out cleanly
- [ ] No infinite loops in either tab

### 6. Browser Console
- [ ] Monitor console during timeout
- [ ] Should see: "Session expired due to inactivity - initiating logout"
- [ ] Should NOT see repeated signout messages

## Performance Impact

### Before Fix:
- 🔴 Infinite API requests after timeout
- 🔴 Server load continuously increasing
- 🔴 Browser memory leak from repeated redirects
- 🔴 Network tab showing 100+ requests/second

### After Fix:
- ✅ Single signout request on timeout
- ✅ Clean redirect to signin page
- ✅ No repeated API calls
- ✅ Minimal server load

## Related Files

- `src/hooks/useSessionTimeout.ts` - Main timeout logic (FIXED)
- `src/components/SessionMonitor.tsx` - Mounts the timeout hook
- `src/components/SessionExpiryNotification.tsx` - Warning UI
- `src/app/layout.tsx` - Renders SessionMonitor globally
- `src/lib/auth.ts` - NextAuth session configuration

## Next Steps

1. **Test thoroughly** using checklist above
2. **Monitor production** for any timeout-related issues
3. **Consider enhancements**:
   - Add server-side session validation
   - Implement session refresh token rotation
   - Add logging for timeout events (analytics)
   - Consider graceful degradation for offline scenarios

## Security Considerations

- ✅ Session still expires after 1 hour server-side (JWT token)
- ✅ Client-side timeout now properly enforces logout
- ✅ No security regression from the fix
- ✅ Prevents client from staying in zombie state

## Architecture Decision

**Why use a ref instead of state?**
- Refs don't trigger re-renders
- Immediate value update (no React render cycle delay)
- Survives re-renders but resets on unmount
- Perfect for tracking internal hook state

**Why not disable the entire hook?**
- Hook needs to stay mounted for proper cleanup
- Other state (warning, timeRemaining) still needed
- Only the timeout checking needs to stop

---

**Fix Date**: December 18, 2025
**Issue**: Infinite signout loop after session timeout
**Status**: ✅ Fixed - Ready for Testing
