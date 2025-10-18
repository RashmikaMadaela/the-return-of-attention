# Session Time Controls - Testing Guide 🧪

## Quick Start
The development server is running on **http://localhost:3002**

---

## 🎯 What to Test

### 1. Regular Timer (Stage 1)
**URL:** http://localhost:3002/stage-1/session-setup

**Test Steps:**
1. ✅ Go to Stage 1 session setup
2. ✅ Configure a session (any duration, posture)
3. ✅ Click "Start Session"
4. ✅ **Start the meditation timer**
5. ✅ Verify **Time Skip** button appears (blue, ⏭️)
6. ✅ Verify **Fast Forward** button appears (green, ⏩)
7. ✅ Click **Fast Forward**
   - Button should turn **orange**
   - Text should change to "Normal Speed"
   - Timer should speed up 10x (10 seconds per tick)
8. ✅ Click **Fast Forward** again
   - Button should turn **green**
   - Text should change to "Fast Forward (10x)"
   - Timer should return to normal speed
9. ✅ Click **Time Skip**
   - Confirm dialog should appear
   - Click "Cancel" - session continues
   - Click **Time Skip** again
   - Click "OK" - session completes immediately
   - Should redirect to reflection page

---

### 2. PAHM Timer (Stages 2-6)
**URL:** http://localhost:3002/pahm-session-setup?stage=2

**Test Steps:**
1. ✅ Go to PAHM session setup (Stage 2, 3, 4, 5, or 6)
2. ✅ Configure a session (any duration, posture)
3. ✅ Click "Start Session"
4. ✅ **Start the meditation timer**
5. ✅ Verify **Time Skip** button appears
6. ✅ Verify **Fast Forward** button appears
7. ✅ Click some PAHM matrix buttons (Nostalgia, Likes, etc.)
   - Clicks should register normally
   - Counters should update
8. ✅ Click **Fast Forward** (activate 10x speed)
   - Button should turn orange
   - Timer speeds up
9. ✅ **While in fast-forward**, click PAHM matrix buttons
   - Clicks should still work
   - Timestamps should be accurate
   - Visual feedback should appear
10. ✅ Return to normal speed
11. ✅ Click **Time Skip** to complete session
12. ✅ Verify all PAHM data is saved
13. ✅ Check reflection page shows correct click counts

---

### 3. Mind Recovery Sessions
**URL:** http://localhost:3002/mind-recovery

**Test Steps:**
1. ✅ Navigate to Mind Recovery page
2. ✅ Select any exercise (e.g., "Life's Anticipations")
3. ✅ Configure and start session
4. ✅ Verify time controls appear (same as PAHM timer)
5. ✅ Test Fast Forward functionality
6. ✅ Test PAHM matrix clicks during fast-forward
7. ✅ Test Time Skip to completion
8. ✅ Verify session data is saved

---

## 🎨 Visual Verification

### Time Skip Button
**Expected Appearance:**
- Color: Blue background
- Icon: ⏭️
- Text: "Time Skip"
- Hover: Darker blue
- Only visible when session is **running**
- Hidden when session is **paused**

### Fast Forward Button (Inactive)
**Expected Appearance:**
- Color: Green background
- Icon: ⏩
- Text: "Fast Forward (10x)"
- Hover: Darker green
- Only visible when session is **running**

### Fast Forward Button (Active)
**Expected Appearance:**
- Color: Orange background
- Icon: ⏩
- Text: "Normal Speed"
- Hover: Darker orange
- Indicates 10x speed is active

---

## 📱 Responsive Testing

### Mobile (< 640px)
**Test on:**
- iPhone 12/13/14
- Samsung Galaxy
- iPad (portrait)

**Expected:**
- Buttons stack vertically
- Full width buttons
- Touch-friendly spacing
- No horizontal scrolling
- All functionality works

### Desktop (≥ 640px)
**Test on:**
- Chrome
- Firefox
- Safari
- Edge

**Expected:**
- Buttons side by side
- Proper spacing
- Hover effects work
- Smooth transitions
- Responsive layout

---

## 🔍 Edge Cases to Test

### 1. Fast Forward Near End
1. Start a 10-minute session
2. Let it run to 30 seconds remaining
3. Activate fast forward
4. **Expected:** Timer completes in ~3 seconds (30s ÷ 10)
5. Session should complete normally
6. Reflection page should load

### 2. Pause During Fast Forward
1. Start a session
2. Activate fast forward (orange button)
3. Click **Pause**
4. **Expected:** 
   - Timer stops
   - Fast forward button disappears
   - Time Skip button disappears
5. Click **Resume**
6. **Expected:**
   - Buttons reappear
   - Fast forward still active (orange)
   - Timer continues at 10x speed

### 3. Time Skip With Very Little Time
1. Start a session with 1-2 minutes
2. Let it run until < 10 seconds
3. Click Time Skip
4. **Expected:**
   - Confirm dialog appears
   - Session completes immediately
   - No errors
   - Redirects correctly

### 4. Multiple Fast Forward Toggles
1. Start a session
2. Click Fast Forward → Orange
3. Wait 5 seconds
4. Click again → Green
5. Wait 5 seconds
6. Click again → Orange
7. Click again → Green
8. **Expected:**
   - Smooth transitions
   - No lag or stuttering
   - Timer accuracy maintained
   - No console errors

### 5. PAHM Clicks During Fast Forward
1. Start a PAHM session
2. Activate fast forward (10x speed)
3. Rapidly click PAHM matrix buttons
4. Complete session
5. Go to reflection page
6. **Expected:**
   - All clicks recorded
   - Correct timestamps
   - Accurate coordinates
   - Proper click counts displayed

---

## 🐛 Common Issues to Watch For

### Timer Issues
- ❌ Timer speeds up but never slows down
- ❌ Timer jumps or skips numbers
- ❌ Timer goes negative
- ❌ Timer doesn't stop at 00:00

**Fix:** Check `timeMultiplier` state updates

### Button Issues
- ❌ Buttons don't appear
- ❌ Buttons don't hide when paused
- ❌ Wrong colors
- ❌ Text doesn't update

**Fix:** Check `isActive` prop and conditional rendering

### State Issues
- ❌ Fast forward state doesn't toggle
- ❌ Multiple clicks cause issues
- ❌ State resets unexpectedly

**Fix:** Check `fastForwardActive` state management

### Navigation Issues
- ❌ Time Skip doesn't redirect
- ❌ Session data not saved
- ❌ Wrong reflection page

**Fix:** Check `handleTimerComplete()` call

---

## ✅ Success Criteria

### Functionality
- [x] Time Skip completes session
- [x] Fast Forward speeds up timer 10x
- [x] Normal speed restores 1x
- [x] Buttons only show when active
- [x] PAHM clicks work during fast-forward
- [x] Confirmation dialog appears
- [x] Session data saves correctly
- [x] Redirects to reflection page

### User Experience
- [x] Clear visual feedback
- [x] Intuitive button labels
- [x] Smooth animations
- [x] Responsive on all devices
- [x] No lag or stuttering
- [x] Accessible color contrast

### Technical Quality
- [x] No TypeScript errors
- [x] No console errors
- [x] No runtime warnings
- [x] Clean code structure
- [x] Reusable component
- [x] Type-safe implementation

---

## 🚀 Test Scenarios

### Scenario 1: Quick Session Test
**Goal:** Verify basic functionality  
**Time:** 2 minutes

1. Start a 10-minute Stage 1 session
2. Click Fast Forward immediately
3. Wait for timer to reach ~5 minutes
4. Click Normal Speed
5. Wait a few seconds
6. Click Time Skip
7. Confirm and complete

**Expected:** Session completes with correct data

---

### Scenario 2: PAHM Matrix Test
**Goal:** Verify PAHM clicks during fast-forward  
**Time:** 3 minutes

1. Start a Stage 2 PAHM session (30 minutes)
2. Click 5 different PAHM buttons
3. Activate Fast Forward
4. Click 10 more PAHM buttons rapidly
5. Deactivate Fast Forward
6. Click 5 more buttons
7. Complete session normally
8. Check reflection page

**Expected:** All 20 clicks recorded accurately

---

### Scenario 3: Mind Recovery Test
**Goal:** Verify mind recovery integration  
**Time:** 2 minutes

1. Go to Mind Recovery
2. Select "Life's Anticipations"
3. Start session
4. Verify PAHM matrix appears
5. Activate Fast Forward
6. Click some PAHM buttons
7. Time Skip to complete

**Expected:** Session completes as mind_recovery type

---

### Scenario 4: Mobile Responsive Test
**Goal:** Verify mobile experience  
**Time:** 3 minutes

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone 12 Pro
4. Start any session
5. Test all buttons
6. Verify layout
7. Test portrait/landscape

**Expected:** Perfect mobile experience

---

## 📊 Test Report Template

```markdown
## Test Results - [Date]

### Environment
- Browser: [Chrome/Firefox/Safari/Edge]
- Device: [Desktop/Mobile/Tablet]
- Screen Size: [1920x1080 / iPhone 12 / etc]
- OS: [Windows/Mac/Linux/iOS/Android]

### Test Results

#### Stage 1 Timer
- [ ] Time Skip works
- [ ] Fast Forward activates
- [ ] Normal Speed restores
- [ ] Buttons appear/hide correctly
- [ ] Session completes properly
- [ ] Reflection page loads

#### PAHM Timer
- [ ] Time controls work
- [ ] PAHM clicks during fast-forward
- [ ] All clicks recorded
- [ ] Data saves correctly
- [ ] Reflection shows data

#### Mind Recovery
- [ ] Time controls available
- [ ] Sessions complete
- [ ] Data tracked correctly

#### Responsive Design
- [ ] Mobile layout correct
- [ ] Desktop layout correct
- [ ] All buttons accessible
- [ ] No layout issues

### Issues Found
1. [Issue description]
2. [Issue description]

### Screenshots
[Attach screenshots if needed]

### Overall Status
✅ PASS / ❌ FAIL

### Notes
[Any additional observations]
```

---

## 🎓 For Testers

### What You're Testing
A new feature that allows ALL users (not just admins) to control session time:
- **Time Skip** = Instantly complete the session
- **Fast Forward** = Make time go 10x faster

### Why It's Important
- Helps users test features quickly
- Allows flexible practice sessions
- Improves user experience
- Makes the app more convenient

### Where to Find It
1. Start any meditation session (Stage 1-6 or Mind Recovery)
2. Click "Start Meditation" to begin timer
3. Look for two new buttons below the timer controls
4. Blue button = Time Skip
5. Green/Orange button = Fast Forward

### How to Report Issues
1. Note which page/stage you were on
2. Describe what you did (steps)
3. Describe what happened (actual result)
4. Describe what should have happened (expected result)
5. Include browser and device info
6. Screenshots if possible

---

## 📞 Support

### Documentation
- `SESSION_TIME_CONTROLS_IMPLEMENTATION.md` - Technical guide
- `SESSION_TIME_CONTROLS_SUMMARY.md` - Feature summary
- `SESSION_TIME_CONTROLS_INTEGRATION_COMPLETE.md` - Complete overview

### Code Files
- `src/components/SessionTimeControls.tsx` - Main component
- `src/components/TimerPage.tsx` - Stage 1 integration
- `src/components/PAHMTimerPage.tsx` - Stages 2-6 integration

---

**Happy Testing! 🎉**

Remember: The goal is to make sessions more flexible and user-friendly. Test thoroughly and report any issues!
