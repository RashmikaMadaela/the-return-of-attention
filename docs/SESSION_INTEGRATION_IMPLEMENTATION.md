# Session Frontend Integration - Implementation Summary

**Date:** October 14, 2025  
**Status:** ✅ API Service Created, Ready for Component Integration

---

## ✅ Completed

### 1. API Service Module Created
**File:** `src/lib/api/sessions.ts`

**Exported Functions:**
- ✅ `startSession()` - Start any session type with full typing
- ✅ `completeSession()` - Complete session with PAHM data & challenges
- ✅ `updateSession()` - Update in-progress session
- ✅ `getPahmSession()` - Get PAHM session details
- ✅ `getSessionHistory()` - Get user's past sessions
- ✅ `getStageProgress()` - Get stage progression data

**Helper Functions:**
- ✅ `calculateClickCounts()` - Calculate PAHM click distribution
- ✅ `formatDuration()` - Format minutes to readable string
- ✅ `getExerciseName()` - Get exercise display name
- ✅ `getExerciseDuration()` - Get recommended duration
- ✅ `validateSessionData()` - Validate before submission

**Type Definitions:**
- ✅ Complete TypeScript interfaces for all requests/responses
- ✅ Proper typing for PAHM data, challenges, audio settings
- ✅ Union types for session types, postures, positions

---

## 📝 Integration Guide for Each Component

### TimerPage.tsx Integration

**Import:**
```typescript
import { startSession, completeSession, type StartSessionRequest } from '@/lib/api/sessions'
```

**State to Add:**
```typescript
const [sessionId, setSessionId] = useState<string | null>(null)
const [isStarting, setIsStarting] = useState(false)
const [startError, setStartError] = useState<string | null>(null)
```

**Modified startTimer():**
```typescript
const startTimer = async () => {
  setIsStarting(true)
  setStartError(null)

  // Prepare session start request
  const request: StartSessionRequest = {
    stageNumber: parseInt(stageId || '1'),
    subStage: subStage,
    sessionType: 'timer_only',
    duration: sessionSettings.duration,
    posture: sessionSettings.posture || 'sitting',
    meditationBells: sessionSettings.meditationBells ?? true,
    voiceCommands: sessionSettings.voiceCommands ?? true,
  }

  // Call API to start session
  const response = await startSession(request)

  if (!response.success) {
    setStartError(response.message)
    setIsStarting(false)
    return
  }

  // Save session ID
  setSessionId(response.data!.id)
  sessionStorage.setItem('activeSessionId', response.data!.id)

  // Start timer UI
  setTimer(prev => ({ ...prev, isRunning: true, timeLeft: sessionSettings.duration * 60 }))
  setIsStarting(false)
}
```

**Modified handleTimerComplete():**
```typescript
const handleTimerComplete = async () => {
  // Navigate to reflection with sessionId
  router.push(`/reflection?sessionId=${sessionId}&stageId=${stageId}&subStage=${subStage}`)
}
```

---

### ReflectionPage.tsx Integration

**Import:**
```typescript
import { completeSession, type CompleteSessionRequest, type SessionChallenges } from '@/lib/api/sessions'
```

**Get sessionId from URL:**
```typescript
const searchParams = useSearchParams()
const sessionId = searchParams.get('sessionId')
```

**Modified saveReflection():**
```typescript
const saveReflection = async () => {
  if (!sessionId) {
    alert('No active session found')
    return
  }

  setIsSaving(true)

  // Prepare challenges
  const challenges: SessionChallenges = {
    mindWandering: reflection.challenges.includes('Mind Wandering'),
    physicalDiscomfort: reflection.challenges.includes('Physical Discomfort'),
    sleepiness: reflection.challenges.includes('Sleepiness'),
    restlessness: reflection.challenges.includes('Restlessness'),
    strongEmotions: reflection.challenges.includes('Strong Emotions'),
    externalDistractions: reflection.challenges.includes('External Distractions'),
    notes: reflection.insights
  }

  // Complete session
  const request: CompleteSessionRequest = {
    sessionId,
    qualityRating: reflection.qualityRating,
    insights: reflection.insights,
    challenges
  }

  const response = await completeSession(request)

  if (!response.success) {
    alert(response.message)
    setIsSaving(false)
    return
  }

  // Show success and navigate
  const progress = response.data!.progress
  if (progress.isStageCompleted) {
    // Show stage completion celebration
    alert('🎉 Stage Completed!')
  }

  // Clear storage and navigate
  sessionStorage.removeItem('activeSessionId')
  router.push('/')
}
```

---

### PAHMTimerPage.tsx Integration

**Import:**
```typescript
import { startSession, type StartSessionRequest, type PAHMClick } from '@/lib/api/sessions'
```

**State to Add:**
```typescript
const [sessionId, setSessionId] = useState<string | null>(null)
const [pahmSessionId, setPahmSessionId] = useState<string | null>(null)
const [pahmClicks, setPahmClicks] = useState<PAHMClick[]>([])
const [sessionStartTime, setSessionStartTime] = useState<number>(0)
```

**Modified startSession():**
```typescript
const startSession = async () => {
  setIsStarting(true)

  const request: StartSessionRequest = {
    stageNumber: parseInt(stageId || '2'),
    sessionType: 'pahm_matrix',
    duration: sessionSettings.duration,
    posture: sessionSettings.posture || 'sitting',
    meditationBells: sessionSettings.meditationBells ?? true,
    voiceCommands: sessionSettings.voiceCommands ?? true,
  }

  const response = await startSession(request)

  if (!response.success) {
    alert(response.message)
    setIsStarting(false)
    return
  }

  // Save IDs and start time
  setSessionId(response.data!.id)
  setPahmSessionId(response.data!.pahmSessionId)
  setSessionStartTime(Date.now())
  sessionStorage.setItem('activeSessionId', response.data!.id)
  sessionStorage.setItem('pahmSessionId', response.data!.pahmSessionId || '')

  // Start timer
  setIsRunning(true)
  setIsStarting(false)
}
```

**Modified handleMatrixClick():**
```typescript
const handleMatrixClick = (position: PAHMPosition, event: React.MouseEvent) => {
  const rect = event.currentTarget.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  const click: PAHMClick = {
    position,
    timestamp: Date.now(),
    timeFromStart: Math.floor((Date.now() - sessionStartTime) / 1000),
    coordinates: { x, y }
  }

  setPahmClicks(prev => [...prev, click])
}
```

**Navigate to reflection:**
```typescript
const handleComplete = () => {
  // Save PAHM data to sessionStorage for reflection page
  sessionStorage.setItem('pahmClickData', JSON.stringify(pahmClicks))
  
  router.push(`/pahm-reflection?sessionId=${sessionId}&stageId=${stageId}`)
}
```

---

### PAHMReflectionPage.tsx Integration

**Import:**
```typescript
import { completeSession, type CompleteSessionRequest, type PAHMData, type SessionChallenges } from '@/lib/api/sessions'
```

**Get data from URL and storage:**
```typescript
const sessionId = searchParams.get('sessionId')
const pahmClicksStr = sessionStorage.getItem('pahmClickData')
const pahmClicks = pahmClicksStr ? JSON.parse(pahmClicksStr) : []
```

**Modified saveReflection():**
```typescript
const saveReflection = async () => {
  if (!sessionId) {
    alert('No active session found')
    return
  }

  setIsSaving(true)

  // Prepare PAHM data
  const pahmData: PAHMData = {
    totalClicks: pahmClicks.length,
    clickData: pahmClicks,
    patternNotes: reflection.insights
  }

  // Prepare challenges
  const challenges: SessionChallenges = {
    mindWandering: reflection.challenges.includes('Mind Wandering'),
    physicalDiscomfort: reflection.challenges.includes('Physical Discomfort'),
    sleepiness: reflection.challenges.includes('Sleepiness'),
    restlessness: reflection.challenges.includes('Restlessness'),
    strongEmotions: reflection.challenges.includes('Strong Emotions'),
    externalDistractions: reflection.challenges.includes('External Distractions'),
    notes: reflection.insights
  }

  // Complete session with PAHM data
  const request: CompleteSessionRequest = {
    sessionId,
    qualityRating: reflection.qualityRating,
    insights: reflection.insights,
    pahmData,
    challenges
  }

  const response = await completeSession(request)

  if (!response.success) {
    alert(response.message)
    setIsSaving(false)
    return
  }

  // Clear storage and navigate
  sessionStorage.removeItem('activeSessionId')
  sessionStorage.removeItem('pahmSessionId')
  sessionStorage.removeItem('pahmClickData')
  router.push('/')
}
```

---

### MindRecoveryPage.tsx Integration

**Import:**
```typescript
import { startSession, type StartSessionRequest, type PAHMClick, type ExerciseType } from '@/lib/api/sessions'
import { getExerciseName, getExerciseDuration } from '@/lib/api/sessions'
```

**State to Add:**
```typescript
const [sessionId, setSessionId] = useState<string | null>(null)
const [pahmClicks, setPahmClicks] = useState<PAHMClick[]>([])
const [sessionStartTime, setSessionStartTime] = useState<number>(0)
```

**Modified startExercise():**
```typescript
const startExercise = async (exerciseType: ExerciseType) => {
  setIsStarting(true)

  const duration = getExerciseDuration(exerciseType)

  const request: StartSessionRequest = {
    stageNumber: currentStageNumber, // Get from user progress
    sessionType: 'mind_recovery',
    duration,
    posture: 'sitting', // Default for recovery
    exerciseType,
    meditationBells: settings.meditationBells ?? true,
    voiceCommands: settings.voiceCommands ?? true,
  }

  const response = await startSession(request)

  if (!response.success) {
    alert(response.message)
    setIsStarting(false)
    return
  }

  // Save IDs and start
  setSessionId(response.data!.id)
  setSessionStartTime(Date.now())
  sessionStorage.setItem('activeSessionId', response.data!.id)
  sessionStorage.setItem('recoveryExerciseType', exerciseType)

  // Start timer/session
  setIsRunning(true)
  setIsStarting(false)
}
```

**Complete similar to PAHM:**
- Track PAHM clicks during session
- Save to sessionStorage
- Navigate to pahm-reflection with sessionId
- Reflection page handles completion with PAHM data

---

## 🎨 UI Enhancements Needed

### Loading States
```typescript
{isStarting && (
  <div className="flex items-center gap-2">
    <div className="animate-spin h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full" />
    <span>Starting session...</span>
  </div>
)}

{isSaving && (
  <div className="flex items-center gap-2">
    <div className="animate-spin h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full" />
    <span>Saving session...</span>
  </div>
)}
```

### Error Handling
```typescript
{startError && (
  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
    <p className="font-semibold">Error Starting Session</p>
    <p className="text-sm">{startError}</p>
    <button 
      onClick={() => setStartError(null)}
      className="mt-2 text-sm underline"
    >
      Dismiss
    </button>
  </div>
)}
```

### Success Feedback
```typescript
{sessionCompleted && (
  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
    <p className="font-semibold">✅ Session Completed!</p>
    {stageCompleted && <p className="text-sm">🎉 You've completed this stage!</p>}
    <p className="text-sm mt-2">Sessions: {progress.sessionsCompleted} | Hours: {progress.hoursCompleted.toFixed(1)}</p>
  </div>
)}
```

---

## 🧪 Testing Checklist

Before marking each item complete:

### Timer-Only Sessions
- [ ] Start session - API called, sessionId saved
- [ ] Timer countdown works
- [ ] Audio settings applied (bells, voice)
- [ ] Navigate to reflection with sessionId
- [ ] Complete session with quality rating
- [ ] Complete session with challenges
- [ ] Progress updated in database
- [ ] Stage completion detected

### PAHM Sessions
- [ ] Start PAHM session - API called
- [ ] PAHM matrix clicks tracked
- [ ] Click data includes timestamp, position, coordinates
- [ ] Navigate to reflection with sessionId + click data
- [ ] Complete with PAHM data
- [ ] Server calculates click counts correctly
- [ ] PAHM analysis returned

### Mind Recovery
- [ ] Start recovery session with exercise type
- [ ] Duration set based on exercise type
- [ ] PAHM clicks tracked during recovery
- [ ] Complete with recovery + PAHM data
- [ ] Exercise type saved correctly

### Error Handling
- [ ] Network error - show retry
- [ ] Session already in progress - show error
- [ ] Invalid session ID - show error
- [ ] Validation errors - show field errors

---

## 📊 Benefits of This Integration

1. ✅ **Data Persistence** - Sessions saved to database, not lost on refresh
2. ✅ **Progress Tracking** - Real-time stage progress calculation
3. ✅ **Analytics Ready** - All session data available for happiness calculation
4. ✅ **Multi-device** - Session history accessible across devices
5. ✅ **Audio Settings** - Per-session audio preferences saved
6. ✅ **PAHM Analysis** - Server-side click analysis and insights
7. ✅ **Stage Completion** - Automatic detection and celebration

---

## 🚀 Next Steps

1. ✅ **Update SessionSetupPage.tsx** - API integration complete
2. ✅ **Update PAHMSessionSetupPage.tsx** - API integration complete
3. ✅ **Update TimerPage.tsx** - sessionId tracking complete
4. ✅ **Update PAHMTimerPage.tsx** - sessionId + PAHM click tracking complete
5. ✅ **Update ReflectionPage.tsx** - Handle session completion with API - COMPLETE
6. ✅ **Update PAHMReflectionPage.tsx** - Submit PAHM data with API - COMPLETE
7. **Test Each Flow** - End-to-end testing
8. **Polish UI** - Loading states, errors, success messages (✅ Done for reflection pages)
9. **Deploy** - Push to production

---

**Status:** ✅ Frontend-Backend Integration Complete  
**Last Updated:** October 14, 2025  
**Next:** End-to-end testing and deployment  
**Priority:** High - Ready for testing

---

## 📊 Progress Summary

### ✅ Completed (Full Session Lifecycle)

**Session Start Flow:**
- ✅ Setup pages call API and create session in database
- ✅ sessionId generated and passed via URL
- ✅ Timer pages receive and track sessionId
- ✅ PAHM clicks tracked with full data (timestamp, coordinates, timeFromStart)
- ✅ Session data flows through entire start process

**Session Complete Flow:**
- ✅ ReflectionPage.tsx calls completeSession API
- ✅ PAHMReflectionPage.tsx calls completeSession API with PAHM data
- ✅ Quality rating, insights, challenges submitted
- ✅ PAHM click data (full array) submitted for PAHM sessions
- ✅ Progress updates received and displayed
- ✅ Stage completion detection and celebration
- ✅ UI with loading states, error display, success messages
- ✅ SessionStorage cleanup after completion
- ✅ Navigation to appropriate pages (stage-1, home-qa, mind-recovery)

**Complete Integration:**
- ✅ All 6 components connected to API endpoints
- ✅ Full session lifecycle: setup → API → timer → tracking → reflection → API → database
- ✅ Error handling throughout
- ✅ Loading states and success feedback
- ✅ Type-safe with comprehensive TypeScript interfaces
