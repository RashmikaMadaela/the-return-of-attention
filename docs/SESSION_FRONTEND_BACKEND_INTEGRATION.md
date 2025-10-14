# Session Frontend-Backend Integration Plan

**Date:** October 14, 2025  
**Status:** 🚧 Implementation In Progress

---

## 📋 Overview

This document outlines the plan to connect all session types (Timer-only, PAHM Matrix, Mind Recovery) with the backend API endpoints.

---

## 🎯 Session Types

### 1. **Timer-Only Sessions** (Stage 1)
- **Component:** `TimerPage.tsx`
- **Session Type:** `'timer_only'`
- **API Endpoints:**
  - `POST /api/session/start` - Start session
  - `POST /api/session/complete` - Complete session (no PAHM data)
  - `PUT /api/session/update` - Update session settings

### 2. **PAHM Matrix Sessions** (Stages 2-6)
- **Component:** `PAHMTimerPage.tsx`
- **Session Type:** `'pahm_matrix'`
- **API Endpoints:**
  - `POST /api/session/start` - Start session with PAHM
  - `POST /api/session/complete` - Complete session with PAHM click data
  - `GET /api/pahm/session/[id]` - Get PAHM session details

### 3. **Mind Recovery Sessions** (All stages)
- **Component:** `MindRecoveryPage.tsx`
- **Session Type:** `'mind_recovery'`
- **API Endpoints:**
  - `POST /api/session/start` - Start recovery session
  - `POST /api/session/complete` - Complete with PAHM data + exercise type

---

## 📡 API Endpoint Details

### POST /api/session/start

**Request Body:**
```typescript
{
  stageNumber: number          // 1-6
  subStage?: string           // 'T1', 'T2', etc. (Stage 1 only)
  sessionType: 'timer_only' | 'pahm_matrix' | 'mind_recovery'
  duration: number            // minutes
  posture: 'sitting' | 'lying' | 'walking' | 'custom'
  exerciseType?: string       // For mind_recovery: 'morning_recharge', 'midday_reset', etc.
  meditationBells?: boolean   // Audio setting (default: true)
  voiceCommands?: boolean     // Audio setting (default: true)
}
```

**Response:**
```typescript
{
  success: true,
  message: "Session started successfully",
  data: {
    id: string                 // Session ID (use for completion)
    stageNumber: number
    subStage?: string
    sessionType: string
    duration: number
    posture: string
    status: 'in_progress'
    startedAt: Date
    pahmSessionId?: string     // Present if sessionType is 'pahm_matrix' or 'mind_recovery'
  }
}
```

---

### POST /api/session/complete

**Request Body:**
```typescript
{
  sessionId: string            // From start response
  qualityRating?: number       // 1-10 (optional)
  insights?: string           // User notes (optional)
  
  // Only for PAHM/Mind Recovery sessions:
  pahmData?: {
    totalClicks: number
    clickData: Array<{
      position: 'regret' | 'past' | 'nostalgia' | 'dislikes' | 'present' | 'likes' | 'worry' | 'future' | 'anticipation'
      timestamp: number        // Unix timestamp
      timeFromStart: number    // Seconds from session start
      coordinates?: { x: number, y: number }
    }>
    patternNotes?: string
  }
  
  // Session challenges (all session types):
  challenges?: {
    mindWandering: boolean
    physicalDiscomfort: boolean
    sleepiness: boolean
    restlessness: boolean
    strongEmotions: boolean
    externalDistractions: boolean
    notes?: string
  }
}
```

**Response:**
```typescript
{
  success: true,
  message: "Session completed successfully",
  data: {
    session: {
      id: string
      stageNumber: number
      sessionType: string
      duration: number
      actualDuration: number   // Calculated from start/complete times
      status: 'completed'
      qualityRating?: number
      completedAt: Date
    },
    progress: {
      sessionsCompleted: number
      hoursCompleted: number
      isStageCompleted: boolean
      completedAt?: Date
    },
    pahmSession?: {
      id: string
      totalClicks: number
      clickCounts: {
        regret: number
        past: number
        // ... all 9 positions
      }
    }
  }
}
```

---

## 🔌 Integration Steps

### Step 1: Create API Service Module
**File:** `src/lib/api/sessions.ts`

Centralized API service with typed functions:
- `startSession()` - Start any session type
- `completeSession()` - Complete any session type
- `updateSession()` - Update session settings
- `getPahmSession()` - Get PAHM details
- `getSessionHistory()` - Get user's session history

---

### Step 2: Update TimerPage.tsx

**Changes Needed:**
1. Import API service functions
2. Replace `localStorage` with API calls
3. Call `startSession()` when timer starts
4. Call `completeSession()` when timer ends
5. Save `sessionId` in component state
6. Handle audio settings from API
7. Handle loading states and errors

**Current Flow:**
```
User starts → Timer runs → Timer ends → Navigate to reflection → Save locally
```

**New Flow:**
```
User starts → API: startSession() → Save sessionId → Timer runs → 
Timer ends → Navigate to reflection → API: completeSession()
```

---

### Step 3: Update PAHMTimerPage.tsx

**Changes Needed:**
1. Import API service functions
2. Call `startSession()` with `sessionType: 'pahm_matrix'`
3. Track PAHM click data during session
4. Call `completeSession()` with PAHM data
5. Include audio settings
6. Handle PAHM session ID for analytics

**PAHM Data Collection:**
```typescript
const [pahmClicks, setPahmClicks] = useState<PAHMClick[]>([])

const handleMatrixClick = (position: PAHMPosition, x: number, y: number) => {
  const click = {
    position,
    timestamp: Date.now(),
    timeFromStart: elapsedSeconds,
    coordinates: { x, y }
  }
  setPahmClicks(prev => [...prev, click])
}
```

---

### Step 4: Update MindRecoveryPage.tsx

**Changes Needed:**
1. Import API service functions
2. Call `startSession()` with `sessionType: 'mind_recovery'` and `exerciseType`
3. Track PAHM clicks (same as PAHM sessions)
4. Call `completeSession()` with PAHM data
5. Show exercise-specific guidance

**Exercise Types:**
- `'morning_recharge'` - 5 min
- `'midday_reset'` - 3 min
- `'emotional_reset'` - 5 min
- `'work_home_transition'` - 5 min
- `'bedtime_wind_down'` - 8 min

---

### Step 5: Update ReflectionPage.tsx & PAHMReflectionPage.tsx

**Changes Needed:**
1. Receive `sessionId` from URL params
2. Call `completeSession()` with reflection data
3. Submit challenges data
4. Navigate to home on success
5. Show completion success message

**URL Format:**
```
/reflection?sessionId=abc123&stageId=1&subStage=T1
/pahm-reflection?sessionId=abc123&stageId=2
```

---

## 🎨 UI/UX Enhancements

### Loading States
- Show spinner during API calls
- Disable buttons during submission
- Show "Saving..." message

### Error Handling
- Network errors: Show retry button
- Validation errors: Show field-specific messages
- Session conflicts: Handle gracefully

### Success Feedback
- Toast notification on session start
- Celebration animation on completion
- Progress update visualization

---

## 🧪 Testing Checklist

### Timer-Only Sessions (Stage 1)
- [ ] Start session via API
- [ ] Timer runs correctly
- [ ] Complete session via API
- [ ] Progress updates correctly
- [ ] Audio settings applied
- [ ] Quality rating saved
- [ ] Challenges saved
- [ ] Stage completion detected

### PAHM Matrix Sessions (Stages 2-6)
- [ ] Start PAHM session via API
- [ ] PAHM clicks tracked correctly
- [ ] Complete with PAHM data
- [ ] Click counts calculated correctly
- [ ] Pattern analysis working
- [ ] Progress updates correctly

### Mind Recovery Sessions
- [ ] Start recovery session via API
- [ ] Exercise type set correctly
- [ ] PAHM tracking works
- [ ] Complete with recovery data
- [ ] Duration matches exercise type

### Edge Cases
- [ ] Network offline handling
- [ ] Duplicate session prevention
- [ ] Abandoned session cleanup
- [ ] Browser refresh during session
- [ ] Multiple tabs handling

---

## 📊 Data Flow

### Session Start
```
TimerPage → startSession() → API → Database → Return sessionId → Store in state
```

### During Session
```
Timer updates → PAHM clicks (if applicable) → Local state only (no API calls)
```

### Session Complete
```
ReflectionPage → Collect data → completeSession() → API → Database → 
Update progress → Return success → Navigate home
```

---

## 🚀 Implementation Order

1. ✅ **Create API service module** (`src/lib/api/sessions.ts`)
2. ✅ **Update TimerPage.tsx** - Simplest, no PAHM data
3. ✅ **Update ReflectionPage.tsx** - Handle timer completion
4. ✅ **Update PAHMTimerPage.tsx** - Add PAHM tracking
5. ✅ **Update PAHMReflectionPage.tsx** - Handle PAHM completion
6. ✅ **Update MindRecoveryPage.tsx** - Recovery sessions
7. ✅ **Test all flows** - End-to-end testing
8. ✅ **Error handling** - Add comprehensive error handling
9. ✅ **UI polish** - Loading states, animations, feedback

---

## 📝 Notes

- **Session IDs are critical** - Store in component state, pass via URL params
- **Audio settings** - Include in session start, apply during session
- **PAHM data format** - Must match API schema exactly
- **Progress calculation** - Server-side, don't duplicate logic
- **Challenges** - Collect in reflection, submit with completion
- **Quality rating** - Required for happiness calculation

---

**Status:** Ready for implementation  
**Next Step:** Create API service module
