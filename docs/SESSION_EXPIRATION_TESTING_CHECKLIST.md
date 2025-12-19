# Session Expiration Testing Checklist

## Pre-Testing Setup

- [ ] Ensure dev server is running: `npm run dev`
- [ ] Clear browser cache and cookies
- [ ] Open browser DevTools Console to monitor logs

## Test 1: Basic Session Flow ✓

**Steps:**
1. [ ] Navigate to http://localhost:3000
2. [ ] Sign in with valid credentials
3. [ ] Verify you're redirected to /home
4. [ ] Check console for "Session started" logs

**Expected Result:** ✓ Successfully signed in and redirected

---

## Test 2: Activity Tracking ✓

**Steps:**
1. [ ] After signing in, perform various activities:
   - [ ] Move the mouse
   - [ ] Click buttons
   - [ ] Type in input fields
   - [ ] Scroll the page
2. [ ] Check console for activity logs (if you added debug logs)

**Expected Result:** ✓ Activities are detected and timer resets

---

## Test 3: Warning Notification (Quick Test) ⚠️

**For quick testing, temporarily modify the timeout:**

**In `src/hooks/useSessionTimeout.ts`:**
```typescript
// Change line 10 from:
const INACTIVITY_TIMEOUT = 60 * 60 * 1000 // 1 hour

// To (for testing):
const INACTIVITY_TIMEOUT = 2 * 60 * 1000 // 2 minutes
const WARNING_TIME = 30 * 1000 // 30 seconds warning
```

**Steps:**
1. [ ] Save the file and let the dev server reload
2. [ ] Sign in
3. [ ] Do NOT interact with the page for 1.5 minutes
4. [ ] Watch for yellow warning notification
5. [ ] Verify notification shows correct countdown

**Expected Result:** ✓ Warning appears after 1.5 minutes

**⚠️ IMPORTANT: Revert timeout changes after testing!**

---

## Test 4: Stay Logged In Button ✓

**Prerequisites:** Complete Test 3 to see the warning

**Steps:**
1. [ ] When warning appears, click "Stay Logged In" button
2. [ ] Verify warning disappears
3. [ ] Check console for "Activity reset" message
4. [ ] Warning should not reappear if you continue using the site

**Expected Result:** ✓ Timer resets and warning disappears

---

## Test 5: Automatic Logout (Quick Test) ⚠️

**Using the modified timeout from Test 3:**

**Steps:**
1. [ ] Sign in
2. [ ] Do NOT interact with the page for 2+ minutes
3. [ ] Wait for warning (1.5 min)
4. [ ] Do NOT click anything
5. [ ] Wait additional 30+ seconds
6. [ ] Verify automatic redirect to /signin?expired=true
7. [ ] Check that yellow expiry message is shown

**Expected Result:** ✓ Automatically logged out and redirected

**⚠️ IMPORTANT: Revert timeout changes after testing!**

---

## Test 6: Session Expiry on Page Return (Production Timing) ✓

**Prerequisites:** Revert timeout to 1 hour

**Quick test method:**

**Option A - Modify for quick testing:**
In `src/lib/auth.ts`, temporarily change line ~145:
```typescript
// Change from:
if (timeSinceLastActivity > 60 * 60) {

// To:
if (timeSinceLastActivity > 2 * 60) { // 2 minutes for testing
```

**Steps:**
1. [ ] Sign in
2. [ ] Close browser completely (or close tab)
3. [ ] Wait 3+ minutes
4. [ ] Open browser and navigate to site
5. [ ] Verify immediate redirect to /signin?expired=true
6. [ ] Check expiry message appears

**Expected Result:** ✓ Expired session detected, redirected to signin

**⚠️ IMPORTANT: Revert auth.ts changes after testing!**

**Option B - Production test (requires 1+ hour wait):**
- Sign in, wait real 1+ hour, return to site

---

## Test 7: Dismiss Warning ✓

**Prerequisites:** Using modified timeout for quick testing

**Steps:**
1. [ ] Sign in
2. [ ] Wait for warning to appear
3. [ ] Click "Dismiss" or X button
4. [ ] Verify warning closes
5. [ ] Warning should reappear if inactivity continues
6. [ ] After dismissing, interact with page to reset timer

**Expected Result:** ✓ Warning can be dismissed but timer continues

---

## Test 8: Multiple Tabs Behavior ℹ️

**Steps:**
1. [ ] Sign in on Tab 1
2. [ ] Open Tab 2 to same site
3. [ ] Keep Tab 1 inactive
4. [ ] Use Tab 2 actively
5. [ ] Check if both tabs stay logged in

**Expected Result:** ℹ️ Each tab tracks independently; active tab stays logged in

**Note:** This is expected behavior with client-side tracking

---

## Test 9: Page Visibility Change ✓

**Steps:**
1. [ ] Sign in
2. [ ] Wait ~55 minutes (or use modified timeout)
3. [ ] Switch to different tab or minimize browser
4. [ ] Wait for session to expire
5. [ ] Return to tab
6. [ ] Verify session check happens immediately

**Expected Result:** ✓ Session validated when returning to page

---

## Test 10: Middleware Protection ✓

**Test protected routes without session:**

**Steps:**
1. [ ] Make sure you're logged out
2. [ ] Try to access directly:
   - [ ] http://localhost:3000/home
   - [ ] http://localhost:3000/personal-info
   - [ ] http://localhost:3000/stage-1
   - [ ] http://localhost:3000/user-profile
3. [ ] Verify redirect to /signin?expired=true for each

**Expected Result:** ✓ All protected routes redirect to signin

---

## Test 11: Auth Route Redirect ✓

**Test that signed-in users can't access auth pages:**

**Steps:**
1. [ ] Sign in successfully
2. [ ] Try to navigate to:
   - [ ] http://localhost:3000/signin
   - [ ] http://localhost:3000/signup
3. [ ] Verify redirect to /home

**Expected Result:** ✓ Auth pages redirect to home when logged in

---

## Test 12: API Routes Excluded ✓

**Verify API routes work without middleware interference:**

**Steps:**
1. [ ] Sign in
2. [ ] Open DevTools Network tab
3. [ ] Navigate to pages that make API calls
4. [ ] Verify API requests complete successfully
5. [ ] Check that API routes return data, not redirects

**Expected Result:** ✓ API routes function normally

---

## Test 13: Mobile/Touch Events ✓

**If you have mobile device or emulator:**

**Steps:**
1. [ ] Sign in on mobile
2. [ ] Perform touch interactions:
   - [ ] Tap buttons
   - [ ] Scroll with finger
   - [ ] Swipe gestures
3. [ ] Verify activity is tracked
4. [ ] Session should stay active

**Expected Result:** ✓ Touch events reset inactivity timer

---

## Test 14: Network Interruption 🌐

**Test behavior during network issues:**

**Steps:**
1. [ ] Sign in
2. [ ] Disconnect network/wifi
3. [ ] Try to interact with site
4. [ ] Reconnect network
5. [ ] Check if session is still valid or expired

**Expected Result:** ℹ️ Behavior depends on timing; session may expire during disconnection

---

## Test 15: Console Logging ℹ️

**Verify proper logging for debugging:**

**Steps:**
1. [ ] Open browser console
2. [ ] Sign in
3. [ ] Look for logs:
   - [ ] Session started
   - [ ] Activity tracked
   - [ ] Warning triggered
   - [ ] Session expired

**Expected Result:** ℹ️ Helpful logs appear for debugging

---

## Production Testing Checklist

**Before deploying to production:**

- [ ] All timeout values are set to production values (1 hour)
- [ ] Debug console.logs are removed or conditional
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices (iOS, Android)
- [ ] Test with slow network (throttle in DevTools)
- [ ] Verify analytics/monitoring captures logout events
- [ ] Check that error boundaries handle unexpected issues
- [ ] Load test with multiple concurrent users

---

## Rollback Plan

**If issues occur in production:**

1. **Quick disable:** Remove `<SessionMonitor />` from layout.tsx
2. **Partial disable:** Set timeout to very long duration (24 hours)
3. **Full rollback:** 
   - Revert all changes in git
   - Redeploy previous version
   - Run: `git revert <commit-hash>`

---

## Common Issues & Solutions

### Issue: Warning appears immediately after signin
**Solution:** Check that lastActivity is properly initialized in JWT callback

### Issue: Session never expires
**Solution:** Verify INACTIVITY_TIMEOUT constant value and middleware configuration

### Issue: Too many logouts
**Solution:** Increase timeout duration or adjust WARNING_TIME

### Issue: Warning doesn't dismiss
**Solution:** Check SessionMonitor state management and resetActivity function

### Issue: API calls fail after implementing
**Solution:** Verify middleware matcher excludes /api/* routes

---

## Test Environment Variables

Ensure these are set in `.env.local`:

```bash
NEXTAUTH_SECRET=<your-secret>
NEXTAUTH_URL=http://localhost:3000
# ... other vars
```

---

## Quick Test Script

**For rapid testing, use this sequence:**

1. Modify timeouts to 2 minutes
2. Run through Tests 1-7 in sequence
3. Revert all timeout changes
4. Commit changes
5. Deploy to staging
6. Run full production checklist

---

## Sign-Off Checklist

**Before marking complete:**

- [ ] All tests passed
- [ ] Production values configured
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Tested on multiple browsers
- [ ] Tested on mobile devices
- [ ] Error handling verified
- [ ] User feedback collected
- [ ] Analytics tracking added
- [ ] Monitoring alerts configured

---

**Testing Date:** _______________

**Tester:** _______________

**Build Version:** _______________

**Notes:**
________________________________
________________________________
________________________________
