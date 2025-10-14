# Mind Recovery Complete Button Fix

**Date:** October 14, 2025  
**Issue:** Mind recovery sessions redirected to mind-recovery page instead of reflection page when clicking Complete button

---

## 🐛 Problem

When clicking the "Complete" button in a mind recovery session, it redirected users to `/mind-recovery` instead of `/pahm-reflection`, preventing them from saving their session reflections.

### Root Cause
The manual "Complete" button was missing the `sessionId` parameter in the navigation URL, which caused the reflection page to redirect back (because it checks for sessionId).

**Broken URL:**
```typescript
router.push(`/pahm-reflection?stage=mind-recovery&session=${mindRecoverySession}`)
// Missing: sessionId parameter!
```

**Reflection page logic:**
```typescript
if (!sessionId) {
  // Redirects back to mind-recovery
  router.push('/mind-recovery')
  return
}
```

---

## ✅ Solution

Updated the Complete button to:
1. Include `sessionId` in the navigation URL
2. Save both `pahmClickData` (full array) and `pahmTracking` (counts) to sessionStorage
3. Match the behavior of automatic timer completion

### Changes Made

**File:** `src/components/PAHMTimerPage.tsx`

**Before:**
```typescript
onClick={() => {
  // Calculate actual session duration
  const actualDuration = Math.floor(((sessionSettings?.duration || 30) * 60 - timer.totalSeconds) / 60)
  // Save current PAHM data and navigate appropriately
  sessionStorage.setItem('pahmData', JSON.stringify(pahmTracking))
  sessionStorage.setItem('sessionDuration', actualDuration.toString())
  sessionStorage.setItem('actualSessionDuration', actualDuration.toString())
  
  if (isMindRecovery) {
    // ❌ Missing sessionId!
    router.push(`/pahm-reflection?stage=mind-recovery&session=${mindRecoverySession}`)
  } else {
    // ❌ Missing sessionId!
    router.push(`/pahm-reflection?stage=${stageId}`)
  }
}}
```

**After:**
```typescript
onClick={() => {
  // Calculate actual session duration
  const actualDuration = Math.floor(((sessionSettings?.duration || 30) * 60 - timer.totalSeconds) / 60)
  // Save PAHM click data for reflection page (both full data and simple counts)
  sessionStorage.setItem('pahmClickData', JSON.stringify(pahmClicks)) // ✅ Added
  sessionStorage.setItem('pahmTracking', JSON.stringify(pahmTracking)) // ✅ Added
  sessionStorage.setItem('pahmData', JSON.stringify(pahmTracking))
  sessionStorage.setItem('sessionDuration', actualDuration.toString())
  sessionStorage.setItem('actualSessionDuration', actualDuration.toString())
  
  if (isMindRecovery) {
    // ✅ Now includes sessionId with fallback
    if (sessionId) {
      router.push(`/pahm-reflection?sessionId=${sessionId}&stage=mind-recovery&session=${mindRecoverySession}`)
    } else {
      router.push(`/pahm-reflection?stage=mind-recovery&session=${mindRecoverySession}`)
    }
  } else {
    // ✅ Now includes sessionId with fallback
    if (sessionId) {
      router.push(`/pahm-reflection?sessionId=${sessionId}&stage=${stageId}`)
    } else {
      router.push(`/pahm-reflection?stage=${stageId}`)
    }
  }
}}
```

---

## 🔄 Complete Flow (After Fix)

### Mind Recovery Session Flow

1. **Setup Page** (`/pahm-session-setup?type=mind-recovery&session=morning_recharge`)
   - User selects posture and audio settings
   - Clicks "Start Session"
   - API creates session, returns `sessionId`
   - Saves `sessionId` to state

2. **Timer Page** (`/pahm-timer?stage=mind-recovery&session=morning_recharge&sessionId=...`)
   - User clicks PAHM matrix during session
   - `pahmClicks` array tracks full data (timestamp, coordinates, position)
   - User clicks "Complete" button (or timer finishes)

3. **Complete Button Click** ✅ NOW FIXED
   - Saves `pahmClickData` (full click array)
   - Saves `pahmTracking` (simple counts for display)
   - Navigates to: `/pahm-reflection?sessionId=...&stage=mind-recovery&session=morning_recharge`
   - **sessionId is now included!** ✅

4. **Reflection Page** (`/pahm-reflection?sessionId=...&stage=mind-recovery&session=...`)
   - Checks for sessionId ✅ Found!
   - Loads session data from sessionStorage
   - User enters reflection, quality rating, challenges
   - Clicks "Save Reflection & Continue"
   - API saves complete session with PAHM data
   - Redirects to `/mind-recovery`

---

## 📊 Navigation Flow Comparison

### Before Fix ❌

```
Timer Page (Complete button clicked)
  ↓
/pahm-reflection?stage=mind-recovery&session=morning_recharge
  ↓
useEffect checks: !sessionId → TRUE
  ↓
Redirects to /mind-recovery
  ↓
User never sees reflection page!
```

### After Fix ✅

```
Timer Page (Complete button clicked)
  ↓
/pahm-reflection?sessionId=xyz&stage=mind-recovery&session=morning_recharge
  ↓
useEffect checks: !sessionId → FALSE
  ↓
Loads reflection page
  ↓
User enters reflection
  ↓
API saves session
  ↓
Redirects to /mind-recovery
```

---

## 🧪 Testing

### Test Mind Recovery Complete Button

1. **Start a mind recovery session:**
   ```
   Navigate to: /mind-recovery
   Click any exercise (e.g., "Morning Recharge")
   Set posture and start session
   ```

2. **During session:**
   ```
   Click a few PAHM buttons
   Click "Complete" button (before timer finishes)
   ```

3. **Expected behavior:**
   - ✅ Should navigate to reflection page
   - ✅ Should show session summary
   - ✅ Should allow entering reflection
   - ✅ Should save to database when clicking "Save Reflection & Continue"
   - ✅ Should redirect to /mind-recovery after saving

4. **Verify in database:**
   ```sql
   SELECT * FROM sessions WHERE id = 'session-id';
   -- Should have completedAt timestamp
   
   SELECT * FROM pahm_sessions WHERE sessionId = 'session-id';
   -- Should have click data saved
   
   SELECT * FROM session_challenges WHERE sessionId = 'session-id';
   -- Should have challenges saved
   ```

### Test Regular PAHM Complete Button

Also verify the fix works for regular PAHM sessions (not just mind recovery):

1. **Start a Stage 2+ PAHM session**
2. **Click Complete button**
3. **Expected:** Should navigate to reflection page with sessionId

---

## 📝 Additional Improvements Made

1. **Added `pahmClickData` to sessionStorage**
   - This is the full PAHMClick[] array needed for API submission
   - Previously only saved `pahmData` (simple counts)

2. **Added `pahmTracking` to sessionStorage**
   - This is the simple counts object for UI display
   - Ensures reflection page has both data structures

3. **Consistent with automatic completion**
   - Manual complete button now matches automatic timer completion behavior
   - Both save the same sessionStorage items
   - Both include sessionId in navigation

---

## 🎯 Impact

### Before
- ❌ Mind recovery sessions could not be completed manually
- ❌ Users couldn't save reflections if they clicked Complete early
- ❌ Session data was lost

### After
- ✅ Mind recovery sessions can be completed anytime
- ✅ Users can save reflections whether timer finishes or they click Complete
- ✅ All session data is saved to database

---

**Status:** ✅ **Fixed**  
**Files Modified:** 1 (`src/components/PAHMTimerPage.tsx`)  
**Lines Changed:** ~25 lines  
**Testing:** Ready for testing
