# Session Setup Integration - Completed

**Date:** October 14, 2025  
**Status:** ✅ Complete

---

## 🎯 What Was Implemented

Both session setup pages now call the backend API to create a session record in the database before starting the timer.

### Files Modified

1. ✅ **SessionSetupPage.tsx** (Stage 1 timer-only sessions)
2. ✅ **PAHMSessionSetupPage.tsx** (PAHM & Mind Recovery sessions)

---

## 📊 Data Flow - Session Start

### Before (Old Flow)
```
User configures → Click "Start" → Store in sessionStorage → Navigate to timer
```

### After (New Flow)
```
User configures → Click "Start" → 
  ↓
API: POST /api/session/start
  ↓
Create Session record in database
  ↓
Return sessionId
  ↓
Store sessionId + data in sessionStorage
  ↓
Navigate to timer with sessionId in URL
```

---

## 🔧 Technical Implementation

### SessionSetupPage.tsx Changes

**1. Imports Added:**
```typescript
import { startSession, type StartSessionRequest } from '@/lib/api/sessions'
```

**2. State Added:**
```typescript
const [isStarting, setIsStarting] = useState(false)
const [startError, setStartError] = useState<string | null>(null)
```

**3. API Call in handleStart():**
```typescript
const request: StartSessionRequest = {
  stageNumber: 1,
  subStage: stage.name, // T1, T2, T3, T4, T5
  sessionType: 'timer_only',
  duration: sessionSettings.duration,
  posture: sessionSettings.posture,
  meditationBells: sessionSettings.bells,
  voiceCommands: sessionSettings.voiceCommands,
}

const response = await startSession(request)
```

**4. Session Data Stored:**
```typescript
const sessionData = {
  sessionId: response.data!.id,
  stageNumber: response.data!.stageNumber,
  subStage: response.data!.subStage,
  sessionType: response.data!.sessionType,
  duration: response.data!.duration,
  posture: response.data!.posture,
  startedAt: response.data!.startedAt,
  settings: sessionSettings,
  title: `${stage.name}: Physical Stillness Training`
}

sessionStorage.setItem('activeSession', JSON.stringify(sessionData))
```

**5. Navigation:**
```typescript
router.push(`/timer?stage=${stageId}&sessionId=${response.data!.id}`)
```

**6. UI Enhancements:**
- Loading spinner during API call
- Error message display
- Disabled buttons during loading

---

### PAHMSessionSetupPage.tsx Changes

**1. Imports Added:**
```typescript
import { startSession, type StartSessionRequest, type ExerciseType } from '@/lib/api/sessions'
```

**2. State Added:**
```typescript
const [isStarting, setIsStarting] = useState(false)
const [startError, setStartError] = useState<string | null>(null)
```

**3. Exercise Type Mapping:**
```typescript
const exerciseTypeMap: { [key: string]: ExerciseType } = {
  'morning': 'morning_recharge',
  'midday': 'midday_reset',
  'emotional': 'emotional_reset',
  'transition': 'work_home_transition',
  'bedtime': 'bedtime_wind_down'
}
```

**4. API Call with Session Type Detection:**
```typescript
const sessionTypeValue = isMindRecoverySession ? 'mind_recovery' : 'pahm_matrix'

const request: StartSessionRequest = {
  stageNumber: parseInt(stageId || '2'),
  sessionType: sessionTypeValue,
  duration: sessionSettings.duration,
  posture: sessionSettings.posture,
  meditationBells: sessionSettings.bells,
  voiceCommands: sessionSettings.voiceCommands,
}

// Add exercise type for mind recovery
if (isMindRecoverySession && mindRecoverySession) {
  request.exerciseType = exerciseTypeMap[mindRecoverySession]
}
```

**5. PAHM Session ID Stored:**
```typescript
const sessionData = {
  sessionId: response.data!.id,
  pahmSessionId: response.data!.pahmSessionId, // For PAHM tracking
  // ... other data
}
```

**6. Navigation with Session Type:**
- PAHM: `/pahm-timer?stage=${stageId}&sessionId=${sessionId}`
- Mind Recovery: `/pahm-timer?stage=mind-recovery&session=${mindRecoverySession}&sessionId=${sessionId}`

---

## 📝 Database Records Created

### Stage 1 Timer Sessions
```sql
INSERT INTO sessions (
  id,
  userId,
  stageId,
  stageNumber,
  subStage,
  sessionType,
  duration,
  status,
  posture,
  meditationBells,
  voiceCommands,
  startedAt
) VALUES (
  'generated-uuid',
  'user-id',
  'stage-id',
  1,
  'T1', -- or T2, T3, T4, T5
  'timer_only',
  10, -- minutes
  'in_progress',
  'sitting',
  true,
  true,
  NOW()
)
```

### PAHM Sessions
```sql
-- Session record
INSERT INTO sessions (...) VALUES (..., 'pahm_matrix', ...)

-- PAHM session record
INSERT INTO pahm_sessions (
  id,
  userId,
  sessionId,
  stageNumber
) VALUES (
  'generated-uuid',
  'user-id',
  'session-id',
  2 -- or 3, 4, 5, 6
)
```

### Mind Recovery Sessions
```sql
-- Session record
INSERT INTO sessions (...) VALUES (..., 'mind_recovery', ...)

-- PAHM session record (for tracking)
INSERT INTO pahm_sessions (...) VALUES (...)
```

---

## ✅ What Works Now

1. **Database Persistence:** Sessions are created in the database immediately when started
2. **Session ID Tracking:** Unique ID generated and passed through the flow
3. **Audio Settings:** User preferences saved to database
4. **Posture Selection:** Captured and stored
5. **Duration Settings:** Saved with session
6. **Session Type Detection:** Correctly identifies timer_only, pahm_matrix, or mind_recovery
7. **Stage Tracking:** Stage number and sub-stage recorded
8. **Error Handling:** Network errors and validation errors displayed to user
9. **Loading States:** Visual feedback during API calls
10. **Mind Recovery Exercises:** Exercise type properly mapped and stored

---

## 🔄 Session Lifecycle

```
1. Setup Page → User configures session
   ↓
2. API Call → POST /api/session/start
   ↓
3. Database → Session record created (status: 'in_progress')
   ↓
4. Response → sessionId returned
   ↓
5. Storage → sessionId + data saved to sessionStorage
   ↓
6. Navigation → Timer page with sessionId in URL
   ↓
7. Timer Page → Read sessionId, display timer (NEXT STEP)
   ↓
8. Complete → Navigate to reflection with sessionId (NEXT STEP)
   ↓
9. API Call → POST /api/session/complete (NEXT STEP)
   ↓
10. Database → Session updated (status: 'completed') (NEXT STEP)
```

---

## 🎨 UI Improvements

### Loading State
```tsx
{isStarting ? (
  <>
    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
    <span>Starting...</span>
  </>
) : (
  'Start'
)}
```

### Error Display
```tsx
{startError && (
  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
    <p className="font-semibold">⚠️ Error</p>
    <p className="text-sm">{startError}</p>
    <button onClick={() => setStartError(null)}>Dismiss</button>
  </div>
)}
```

### Disabled State
```tsx
<button
  onClick={handleStart}
  disabled={isStarting}
  className="... disabled:opacity-50 disabled:cursor-not-allowed"
>
```

---

## 🧪 Testing Checklist

### SessionSetupPage.tsx (Stage 1)
- [x] API call made on "Start" button click
- [x] Loading spinner shown during API call
- [x] sessionId returned and stored
- [x] Navigation includes sessionId in URL
- [x] Audio settings sent to API
- [x] Posture selection sent to API
- [x] Duration sent to API
- [x] Sub-stage (T1-T5) included
- [ ] Error handling tested (network offline)
- [ ] Test with all postures
- [ ] Test with all durations
- [ ] Test with bells off
- [ ] Test with voice commands off

### PAHMSessionSetupPage.tsx (PAHM & Mind Recovery)
- [x] API call made for PAHM sessions
- [x] API call made for Mind Recovery sessions
- [x] Exercise type mapping correct
- [x] pahmSessionId returned and stored
- [x] Loading spinner shown
- [x] sessionId in navigation URL
- [x] Session type detection (pahm_matrix vs mind_recovery)
- [ ] Error handling tested
- [ ] Test all mind recovery exercises
- [ ] Test PAHM sessions for stages 2-6
- [ ] Test fixed durations for mind recovery
- [ ] Test flexible durations for PAHM

---

## 🚀 Next Steps

### Immediate Next: Update Timer Pages

**TimerPage.tsx:**
1. Read sessionId from URL params
2. Read session data from sessionStorage
3. Display timer with correct duration
4. When timer completes, navigate to reflection with sessionId

**PAHMTimerPage.tsx:**
1. Read sessionId and pahmSessionId from URL
2. Read session data from sessionStorage
3. Display timer + PAHM matrix
4. Track PAHM clicks with timestamps
5. When timer completes, navigate to reflection with sessionId + PAHM data

---

## 📋 API Request Examples

### Stage 1 Timer Session
```json
POST /api/session/start
{
  "stageNumber": 1,
  "subStage": "T1",
  "sessionType": "timer_only",
  "duration": 10,
  "posture": "sitting",
  "meditationBells": true,
  "voiceCommands": true
}
```

### PAHM Session (Stage 2)
```json
POST /api/session/start
{
  "stageNumber": 2,
  "sessionType": "pahm_matrix",
  "duration": 30,
  "posture": "cushion",
  "meditationBells": true,
  "voiceCommands": false
}
```

### Mind Recovery Session
```json
POST /api/session/start
{
  "stageNumber": 2,
  "sessionType": "mind_recovery",
  "duration": 5,
  "posture": "sitting",
  "exerciseType": "morning_recharge",
  "meditationBells": true,
  "voiceCommands": true
}
```

---

## 📊 Success Metrics

**What's Tracked:**
- ✅ Session start time (timestamp in database)
- ✅ User preferences (posture, audio settings)
- ✅ Session type (timer_only, pahm_matrix, mind_recovery)
- ✅ Stage and sub-stage
- ✅ Exercise type (for mind recovery)
- ✅ Duration setting

**Not Yet Tracked (Coming in Next Steps):**
- ⏳ Actual session duration (start to complete)
- ⏳ Quality rating
- ⏳ User insights/notes
- ⏳ PAHM click data
- ⏳ Session challenges
- ⏳ Progress updates

---

## 🎉 Summary

**Status:** ✅ Complete  
**Files Modified:** 2 (SessionSetupPage.tsx, PAHMSessionSetupPage.tsx)  
**API Integration:** Session start endpoint connected  
**Database:** Sessions now persisted immediately  
**User Experience:** Loading states and error handling added  

**Ready for:** Timer page integration (receive sessionId, display timer, track PAHM clicks)
