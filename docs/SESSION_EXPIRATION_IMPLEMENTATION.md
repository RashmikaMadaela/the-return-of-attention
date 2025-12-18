# Session Expiration Implementation

## Overview
This document describes the session expiration and inactivity timeout system implemented to automatically log out users after 1 hour of inactivity.

## Implementation Date
December 18, 2025

## Features Implemented

### 1. **Session Expiration (1 Hour)**
- Sessions now expire after **1 hour of inactivity**
- Previous behavior: Sessions persisted indefinitely (30 days)
- Activity is tracked on both client and server side

### 2. **Activity Tracking**
- User activity is monitored through:
  - Mouse movements
  - Mouse clicks
  - Keyboard input
  - Scrolling
  - Touch events
- Each activity resets the inactivity timer

### 3. **Warning Notification**
- Users receive a visual warning **5 minutes before** session expiry
- Notification shows:
  - Time remaining until logout
  - Option to "Stay Logged In" (resets timer)
  - Option to dismiss (timer continues)

### 4. **Automatic Logout**
- When the 1-hour timeout is reached:
  - User is automatically logged out
  - Session is destroyed
  - User is redirected to signin page with expiry message

### 5. **Page Return Detection**
- If user returns to the site after days:
  - Middleware validates session on server
  - Expired sessions are immediately logged out
  - User sees "Your session has expired" message

## Files Modified/Created

### Created Files

1. **`src/hooks/useSessionTimeout.ts`**
   - Custom React hook for tracking user activity
   - Monitors inactivity timer
   - Triggers warnings and logout

2. **`src/components/SessionExpiryNotification.tsx`**
   - Visual notification component
   - Shows countdown timer
   - Provides user actions

3. **`src/components/SessionMonitor.tsx`**
   - Client-side session monitoring wrapper
   - Integrates hook and notification

4. **`src/components/SessionProvider.tsx`**
   - NextAuth SessionProvider wrapper
   - Configures session refresh behavior

5. **`src/middleware.ts`**
   - Server-side session validation
   - Protects routes requiring authentication
   - Redirects expired sessions to signin

6. **`docs/SESSION_EXPIRATION_IMPLEMENTATION.md`**
   - This documentation file

### Modified Files

1. **`src/lib/auth.ts`**
   - Changed `maxAge` from 30 days to 1 hour
   - Added `lastActivity` tracking to JWT
   - Updated JWT callback to check inactivity
   - Expires token if > 1 hour of inactivity

2. **`src/app/layout.tsx`**
   - Added SessionProvider wrapper
   - Added SessionMonitor component
   - Monitors all pages for activity

3. **`src/components/SignInPage.tsx`**
   - Added session expiration message display
   - Shows yellow notification when redirected due to expiry
   - Reads `?expired=true` query parameter

## Technical Details

### Session Configuration
```typescript
session: {
  strategy: 'jwt',
  maxAge: 60 * 60, // 1 hour
  updateAge: 0, // Update on every request
}
```

### JWT Token Structure
```typescript
interface JWT {
  id?: string
  isActive?: boolean
  rememberMe?: boolean
  lastActivity?: number  // Timestamp of last activity
  exp?: number           // Expiry timestamp
}
```

### Activity Detection
- **Check interval**: Every 60 seconds
- **Inactivity timeout**: 3600 seconds (1 hour)
- **Warning time**: 300 seconds (5 minutes) before expiry

### Server-Side Protection
- Middleware runs on all routes except:
  - `/api/auth/*` (NextAuth endpoints)
  - Static files
  - Public assets
- Validates JWT token on each request
- Checks `lastActivity` timestamp
- Redirects expired sessions to `/signin?expired=true`

## User Experience

### Normal Flow
1. User signs in → Session starts
2. User interacts with site → Activity tracked
3. Each activity resets 1-hour timer
4. User continues using site normally

### Approaching Timeout
1. After 55 minutes of inactivity → Warning appears
2. User sees: "Session expiring in 5 minutes"
3. User options:
   - **Click "Stay Logged In"** → Resets timer, continues session
   - **Click "Dismiss"** → Warning closes, timer continues
   - **Do nothing** → Auto logout after 5 more minutes

### Session Expired
1. Timer reaches 1 hour → Automatic logout
2. User sees: "Your session has expired due to inactivity"
3. User must sign in again

### Returning After Days
1. User opens site after long absence
2. Middleware detects expired session
3. Immediate redirect to signin page
4. Message: "Your session has expired due to inactivity. Please sign in again."

## Security Benefits

1. **Reduced session hijacking risk**: Short-lived sessions
2. **Automatic cleanup**: Abandoned sessions expire automatically
3. **User notification**: Users aware of security timeout
4. **Server-side validation**: Cannot bypass with client manipulation
5. **Activity-based**: Only logs out truly inactive users

## Configuration

### To Change Timeout Duration
Modify these constants:

**In `src/hooks/useSessionTimeout.ts`:**
```typescript
const INACTIVITY_TIMEOUT = 60 * 60 * 1000 // Change this (in milliseconds)
const WARNING_TIME = 5 * 60 * 1000 // Warning time before expiry
```

**In `src/lib/auth.ts`:**
```typescript
session: {
  maxAge: 60 * 60, // Change this (in seconds)
}
```

**In `src/middleware.ts`:**
```typescript
const ONE_HOUR = 60 * 60 // Change this (in seconds)
```

### To Disable Warnings
In `src/components/SessionMonitor.tsx`, remove or comment out the notification component.

## Testing

### Test Scenarios

1. **Normal Activity**
   - Sign in and use the site
   - Verify session stays active

2. **Inactivity Warning**
   - Sign in, wait 55 minutes without interaction
   - Verify warning notification appears

3. **Automatic Logout**
   - Sign in, wait 60 minutes without interaction
   - Verify automatic logout and redirect

4. **Stay Logged In**
   - Trigger warning notification
   - Click "Stay Logged In"
   - Verify timer resets

5. **Return After Days**
   - Sign in, close browser
   - Wait more than 1 hour
   - Return to site
   - Verify immediate redirect to signin

## Browser Compatibility
- Tested on modern browsers (Chrome, Firefox, Safari, Edge)
- Uses standard Web APIs
- Gracefully degrades if features unavailable

## Performance Impact
- Minimal: Single interval check every 60 seconds
- Event listeners use passive mode
- No database queries for activity tracking
- Efficient JWT-based validation

## Future Enhancements
- [ ] Configurable timeout per user role
- [ ] Remember last page for redirect after reauth
- [ ] Session activity logging
- [ ] Analytics for session duration
- [ ] "Keep me signed in for X hours" option

## Troubleshooting

### Session expires too quickly
- Check system clock accuracy
- Verify `INACTIVITY_TIMEOUT` constant
- Check if multiple tabs are open (each tracks independently)

### Warning doesn't appear
- Check browser console for errors
- Verify SessionMonitor is rendered
- Check if notifications are blocked

### Immediate logout on signin
- Verify `NEXTAUTH_SECRET` environment variable
- Check JWT token generation
- Verify middleware configuration

## Conclusion
The session expiration system provides a balance between security and user convenience, automatically logging out inactive users while warning active users before taking action.
