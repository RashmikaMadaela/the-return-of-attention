# Session Expiration Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER SIGNS IN                                │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SESSION STARTS                                    │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ • JWT Token Created with lastActivity timestamp            │    │
│  │ • Session expiry set to 1 hour                            │    │
│  │ • SessionMonitor component starts tracking                 │    │
│  └────────────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   USER ACTIVITY DETECTED                             │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ Events: Mouse, Keyboard, Scroll, Touch, Click              │    │
│  │ Action: Reset inactivity timer to 0                        │    │
│  └────────────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ (User continues using site)
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
        ▼                                         ▼
┌──────────────────┐                    ┌──────────────────────┐
│   ACTIVE USER    │                    │   INACTIVE USER      │
│   (< 55 mins)    │                    │   (55+ mins)         │
└────────┬─────────┘                    └──────────┬───────────┘
         │                                         │
         │ Each activity                           ▼
         │ resets timer                  ┌──────────────────────┐
         │                               │   WARNING SHOWN      │
         │                               │   (55-60 mins)       │
         │                               │                      │
         │                               │ ┌──────────────────┐ │
         │                               │ │ Yellow Popup     │ │
         │                               │ │ "Expiring in X   │ │
         │                               │ │  minutes"        │ │
         │                               │ │                  │ │
         │                               │ │ [Stay Logged In] │ │
         │                               │ │ [Dismiss]        │ │
         │                               │ └──────────────────┘ │
         │                               └──────┬───────┬───────┘
         │                                      │       │
         │ ┌────────────────────────────────────┘       │
         │ │ User clicks                                 │
         │ │ "Stay Logged In"                            │
         │ │                                             │
         ▼ ▼                                             ▼
┌──────────────────────┐                       ┌─────────────────┐
│  TIMER RESET         │                       │  NO ACTION      │
│  Continue session    │                       │  Dismiss/Ignore │
└──────────┬───────────┘                       └────────┬────────┘
           │                                            │
           │ Loop back to                               │
           │ activity tracking                          │
           │                                            ▼
           │                              ┌──────────────────────┐
           │                              │   60 MINUTES REACHED  │
           │                              │   AUTO LOGOUT         │
           │                              └──────────┬───────────┘
           │                                         │
           │                                         ▼
           │                           ┌──────────────────────────┐
           │                           │ 1. Session Destroyed      │
           │                           │ 2. JWT Token Invalidated  │
           │                           │ 3. Redirect to /signin    │
           │                           │ 4. Show expiry message    │
           │                           └──────────┬───────────────┘
           │                                      │
           └──────────────────────────────────────┘
                                                  │
                                                  ▼
                                    ┌───────────────────────────┐
                                    │   USER MUST SIGN IN AGAIN  │
                                    └───────────────────────────┘


═══════════════════════════════════════════════════════════════════════

RETURNING AFTER DAYS SCENARIO:

┌─────────────────────────────────────────────────────────────────────┐
│              USER RETURNS AFTER 1+ HOURS (OR DAYS)                   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    MIDDLEWARE CHECKS                                 │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ 1. Read JWT token from cookies                             │    │
│  │ 2. Check lastActivity timestamp                            │    │
│  │ 3. Calculate: now - lastActivity                           │    │
│  │ 4. If > 1 hour: EXPIRED                                    │    │
│  └────────────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│              IMMEDIATE REDIRECT TO /signin?expired=true              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SIGNIN PAGE DISPLAYS                              │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ Yellow notification banner:                                 │    │
│  │ "Your session has expired due to inactivity.               │    │
│  │  Please sign in again."                                     │    │
│  └────────────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────────┐
                    │  USER SIGNS IN     │
                    │  AGAIN             │
                    └────────────────────┘


═══════════════════════════════════════════════════════════════════════

COMPONENT ARCHITECTURE:

┌───────────────────────────────────────────────────────────────────┐
│                         ROOT LAYOUT                                │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    SessionProvider                           │ │
│  │  ┌───────────────────────────────────────────────────────┐  │ │
│  │  │              SessionMonitor (Client)                   │  │ │
│  │  │  ┌─────────────────────────────────────────────────┐  │  │ │
│  │  │  │     useSessionTimeout Hook                       │  │  │ │
│  │  │  │  • Tracks activity events                        │  │  │ │
│  │  │  │  • Checks timeout every 60s                      │  │  │ │
│  │  │  │  • Triggers warnings                             │  │  │ │
│  │  │  │  • Forces logout                                 │  │  │ │
│  │  │  └─────────────────────────────────────────────────┘  │  │ │
│  │  │  ┌─────────────────────────────────────────────────┐  │  │ │
│  │  │  │   SessionExpiryNotification (Popup)             │  │  │ │
│  │  │  │  • Shows 5 min before expiry                    │  │  │ │
│  │  │  │  • Countdown timer                              │  │  │ │
│  │  │  │  • Stay/Dismiss buttons                         │  │  │ │
│  │  │  └─────────────────────────────────────────────────┘  │  │ │
│  │  └───────────────────────────────────────────────────────┘  │ │
│  │                                                               │ │
│  │                    Page Content                              │ │
│  └─────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘

SERVER SIDE:

┌───────────────────────────────────────────────────────────────────┐
│                         MIDDLEWARE                                 │
│  • Runs on every request                                          │
│  • Validates JWT token                                            │
│  • Checks lastActivity                                            │
│  • Redirects expired sessions                                     │
│  • Excludes: /api/*, static files                                 │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                         NextAuth                                   │
│  • JWT callback: Updates lastActivity on every request            │
│  • Extends token expiry on activity                               │
│  • Returns empty token if expired                                 │
└───────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════

KEY TIMING VALUES:

┌──────────────────────────────┬─────────────────────────────────────┐
│ CONSTANT                     │ VALUE                               │
├──────────────────────────────┼─────────────────────────────────────┤
│ INACTIVITY_TIMEOUT          │ 60 minutes (3600 seconds)           │
│ WARNING_TIME                 │ 5 minutes (300 seconds)             │
│ CHECK_INTERVAL              │ 60 seconds                          │
│ Session maxAge              │ 3600 seconds (1 hour)               │
└──────────────────────────────┴─────────────────────────────────────┘

TIMELINE:

0:00 ─────────────────────────────────────── 55:00 ────────── 60:00
 ↑                                              ↑               ↑
Sign In                                      Warning         Logout
                                           Appears
```

## Summary

- **Active Monitoring**: Client-side hook tracks user activity in real-time
- **Server Validation**: Middleware validates session on each page load
- **Graceful UX**: 5-minute warning before forced logout
- **Security**: Expired sessions cannot be revived
- **Performance**: Minimal overhead with 60-second check interval
