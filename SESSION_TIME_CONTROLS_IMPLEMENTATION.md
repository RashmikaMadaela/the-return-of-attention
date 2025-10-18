# Session Time Skip & Fast Forward Implementation Guide

## Overview
Add Time Skip and Fast Forward controls to ALL session types (timer, PAHM, mind recovery) for regular users during active sessions.

## Requirements

### Features to Add
1. **Time Skip Button** - Skip to the end of current session immediately
2. **Fast Forward Button** - Speed up time (e.g., 10x faster)

### Where to Add
- ✅ Regular Timer Sessions (Stage 1)
- ✅ PAHM Timer Sessions (Stages 2-6)
- ✅ Mind Recovery Sessions
- ❌ **Removed from Admin Stage Testing Page**

## UI Design (Based on Image)

### Button Layout
```
┌─────────────────────────────────────┐
│                                     │
│         Session Content             │
│                                     │
│  ┌─────────┐  ┌────────┐  ┌──────┐│
│  │ Unlock  │  │ Reset  │  │      ││
│  └─────────┘  └────────┘  └──────┘│
│                                     │
│     (Time Skip button removed)     │
└─────────────────────────────────────┘
```

### Session Controls (For Users)
```
During Active Session:
┌─────────────────────────────────┐
│         Timer: 5:30             │
│                                 │
│   ┌──────────┐  ┌───────────┐ │
│   │Time Skip │  │Fast Forward││
│   │   ⏭️     │  │    ⏩      ││
│   └──────────┘  └───────────┘ │
└─────────────────────────────────┘
```

## Implementation Steps

### 1. Admin Stage Testing Page ✅
**File:** `src/components/AdminStageTestingPage.tsx`

**Changes:**
- ✅ Removed "Time Skip" button
- ✅ Removed timeskip handler logic
- ✅ Updated control definitions (removed Time Skip description)
- ✅ Now shows only: Unlock & Reset buttons

### 2. Timer Page Component (Stage 1 Sessions)
**File:** `src/components/TimerPage.tsx`

**Add:**
```typescript
// State for time controls
const [timeMultiplier, setTimeMultiplier] = useState(1) // 1x, 10x
const [fastForwardActive, setFastForwardActive] = useState(false)

// Time Skip Handler
const handleTimeSkip = () => {
  if (confirm('Skip to the end of this session?')) {
    setRemainingTime(0)
    // Trigger session end
  }
}

// Fast Forward Handler
const handleFastForward = () => {
  if (fastForwardActive) {
    setTimeMultiplier(1)
    setFastForwardActive(false)
  } else {
    setTimeMultiplier(10)
    setFastForwardActive(true)
  }
}

// Update timer logic
useEffect(() => {
  const interval = setInterval(() => {
    setRemainingTime(prev => {
      const newTime = prev - timeMultiplier
      return Math.max(0, newTime)
    })
  }, 1000)
  
  return () => clearInterval(interval)
}, [timeMultiplier])
```

**UI Component:**
```tsx
{/* Time Controls - Show during active session */}
{isActive && (
  <div className="flex gap-4 justify-center mt-6">
    <button
      onClick={handleTimeSkip}
      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 flex items-center gap-2"
    >
      <span>⏭️</span>
      <span>Time Skip</span>
    </button>
    
    <button
      onClick={handleFastForward}
      className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 ${
        fastForwardActive 
          ? 'bg-orange-500 hover:bg-orange-600' 
          : 'bg-green-500 hover:bg-green-600'
      } text-white`}
    >
      <span>⏩</span>
      <span>{fastForwardActive ? 'Normal Speed' : 'Fast Forward (10x)'}</span>
    </button>
  </div>
)}
```

### 3. PAHM Timer Page Component (Stages 2-6)
**File:** `src/components/PAHMTimerPage.tsx`

**Same implementation as TimerPage:**
- Add time controls state
- Add handlers for Time Skip and Fast Forward
- Update timer interval logic
- Add UI buttons

### 4. Mind Recovery Component
**File:** `src/components/MindRecoveryPage.tsx` (if exists) or within PAHMTimerPage

**Same implementation**

## Button Styling

### Time Skip Button
- **Color:** Blue (#3B82F6)
- **Icon:** ⏭️
- **Hover:** Darker blue
- **Action:** Instant skip to end

### Fast Forward Button
- **Normal State:** 
  - Color: Green (#10B981)
  - Text: "Fast Forward (10x)"
  - Icon: ⏩
  
- **Active State:**
  - Color: Orange (#F97316)
  - Text: "Normal Speed"
  - Icon: ⏩

## Behavior

### Time Skip
1. Show confirmation dialog
2. If confirmed, set remaining time to 0
3. Trigger session completion
4. Save session data
5. Navigate to results/reflection

### Fast Forward
1. Toggle multiplier between 1x and 10x
2. Update timer countdown speed
3. Visual indicator of active fast forward
4. Works with all audio and visual elements

## Security Considerations

### Admin vs User
- **Admin Stage Testing:** No time skip button (removed)
- **User Sessions:** Time skip & fast forward available
- All actions logged in session data
- Fast forward state saved in session

### Data Integrity
- Session duration should reflect ACTUAL time (not fast-forwarded)
- Or mark sessions as "fast-forwarded" in metadata
- Consider separate field: `actualDuration` vs `displayDuration`

## Database Updates

### Session Table
```typescript
// Optional: Track if session used time controls
{
  usedTimeSkip: boolean
  usedFastForward: boolean
  fastForwardDuration: number  // seconds spent in fast-forward
  actualDuration: number       // real-world time
}
```

## Testing Checklist

### Admin Stage Testing
- [ ] Time Skip button removed
- [ ] Only Unlock and Reset buttons visible
- [ ] Unlock functionality works
- [ ] Reset functionality works

### Timer Sessions (Stage 1)
- [ ] Time Skip button appears during session
- [ ] Time Skip confirmation works
- [ ] Fast Forward toggles correctly
- [ ] 10x speed works
- [ ] Normal speed restores
- [ ] Session completes properly
- [ ] Data saves correctly

### PAHM Sessions (Stages 2-6)
- [ ] Time Skip button appears
- [ ] Fast Forward works with matrix
- [ ] Clicks still register during fast forward
- [ ] Session data saves properly

### Mind Recovery
- [ ] Time controls appear
- [ ] Works with all exercise types
- [ ] Proper data tracking

## File Summary

### Files Modified
1. ✅ `src/components/AdminStageTestingPage.tsx` - Removed Time Skip
2. ⏳ `src/components/TimerPage.tsx` - Add time controls
3. ⏳ `src/components/PAHMTimerPage.tsx` - Add time controls
4. ⏳ `src/components/MindRecoveryPage.tsx` - Add time controls (if separate)

### New Files (Optional)
- `src/components/SessionTimeControls.tsx` - Reusable component

## Notes

- Time Skip and Fast Forward are for USER convenience during testing
- Admin no longer needs separate Time Skip in stage testing
- All sessions should have these controls
- Consider adding keyboard shortcuts (T for Time Skip, F for Fast Forward)
- Visual feedback is important for fast forward state

---

**Status:** Admin changes complete ✅  
**Next:** Implement user session controls  
**Priority:** High - User Experience Feature
