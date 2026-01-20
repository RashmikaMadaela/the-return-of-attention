/**
 * SESSION API SERVICE
 * Centralized API service for all session operations
 * Handles Timer-only, PAHM Matrix, and Mind Recovery sessions
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type SessionType = 'timer_only' | 'pahm_matrix' | 'mind_recovery'
export type Posture = 'sitting' | 'lying' | 'walking' | 'custom'
export type PAHMPosition = 'regret' | 'past' | 'nostalgia' | 'dislikes' | 'present' | 'likes' | 'worry' | 'future' | 'anticipation'
export type ExerciseType = 'morning_recharge' | 'midday_reset' | 'emotional_reset' | 'work_home_transition' | 'bedtime_wind_down'

export interface StartSessionRequest {
  stageNumber: number
  subStage?: string
  sessionType: SessionType
  duration: number
  posture: Posture
  exerciseType?: ExerciseType
  meditationBells?: boolean
  voiceCommands?: boolean
  useRemote?: boolean
}

export interface StartSessionResponse {
  id: string
  stageNumber: number
  subStage?: string
  sessionType: SessionType
  duration: number
  posture: string
  status: string
  startedAt: string
  stage: {
    name: string
    description: string
    sessionType: string
  }
  pahmSessionId?: string
}

export interface PAHMClick {
  position: PAHMPosition
  timestamp: string // ISO datetime string
  timeFromStart: number
  coordinates?: { x: number; y: number }
}

export interface PAHMData {
  totalClicks: number
  clickData: PAHMClick[]
  patternNotes?: string
}

export interface SessionChallenges {
  mindWandering: boolean
  physicalDiscomfort: boolean
  sleepiness: boolean
  restlessness: boolean
  strongEmotions: boolean
  externalDistractions: boolean
  notes?: string
}

export interface CompleteSessionRequest {
  sessionId: string
  qualityRating?: number
  insights?: string
  pahmData?: PAHMData
  challenges?: SessionChallenges
  duration?: number // planned duration in minutes (optional)
  actualDuration?: number // actual practiced duration in minutes (optional)
  shouldCountAsSession?: boolean // whether session meets minimum duration requirement
}

export interface CompleteSessionResponse {
  session: {
    id: string
    stageNumber: number
    sessionType: string
    duration: number
    actualDuration: number
    status: string
    qualityRating?: number
    completedAt: string
  }
  progress: {
    sessionsCompleted: number
    hoursCompleted: number
    isStageCompleted: boolean
    completedAt?: string
  }
  pahmSession?: {
    id: string
    totalClicks: number
    clickCounts: {
      regret: number
      past: number
      nostalgia: number
      dislikes: number
      present: number
      likes: number
      worry: number
      future: number
      anticipation: number
    }
  }
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  error?: string
  errors?: Record<string, string[]>
}

// ============================================================================
// API SERVICE FUNCTIONS
// ============================================================================

/**
 * Start a new meditation session
 * @param request - Session start parameters
 * @returns Session data including sessionId
 */
export async function startSession(
  request: StartSessionRequest
): Promise<ApiResponse<StartSessionResponse>> {
  try {
    const response = await fetch('/api/session/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to start session',
        error: data.error,
        errors: data.errors,
      }
    }

    return {
      success: true,
      message: data.message || 'Session started successfully',
      data: data.data,
    }
  } catch (error) {
    console.error('Start session error:', error)
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Complete a meditation session
 * @param request - Session completion data
 * @returns Completed session and progress data
 */
export async function completeSession(
  request: CompleteSessionRequest
): Promise<ApiResponse<CompleteSessionResponse>> {
  try {
    const response = await fetch('/api/session/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to complete session',
        error: data.error,
        errors: data.errors,
      }
    }

    return {
      success: true,
      message: data.message || 'Session completed successfully',
      data: data.data,
    }
  } catch (error) {
    console.error('Complete session error:', error)
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Update an in-progress session
 * @param sessionId - Session ID
 * @param updates - Fields to update
 * @returns Updated session data
 */
export async function updateSession(
  sessionId: string,
  updates: {
    qualityRating?: number
    insights?: string
    posture?: Posture
    duration?: number
  }
): Promise<ApiResponse<any>> {
  try {
    const response = await fetch('/api/session/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        ...updates,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to update session',
        error: data.error,
        errors: data.errors,
      }
    }

    return {
      success: true,
      message: data.message || 'Session updated successfully',
      data: data.session,
    }
  } catch (error) {
    console.error('Update session error:', error)
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get PAHM session details and analysis
 * @param pahmSessionId - PAHM session ID
 * @returns Detailed PAHM session data with analysis
 */
export async function getPahmSession(
  pahmSessionId: string
): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`/api/pahm/session/${pahmSessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to get PAHM session',
        error: data.error,
      }
    }

    return {
      success: true,
      message: 'PAHM session retrieved successfully',
      data: data.pahmSession,
    }
  } catch (error) {
    console.error('Get PAHM session error:', error)
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get user's session history
 * @param limit - Number of sessions to retrieve (optional)
 * @returns List of past sessions
 */
export async function getSessionHistory(
  limit?: number
): Promise<ApiResponse<any>> {
  try {
    const url = limit 
      ? `/api/session/history?limit=${limit}`
      : '/api/session/history'
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to get session history',
        error: data.error,
      }
    }

    return {
      success: true,
      message: 'Session history retrieved successfully',
      data: data.sessions,
    }
  } catch (error) {
    console.error('Get session history error:', error)
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get user's stage progress
 * @returns Current stage progress across all stages
 */
export async function getStageProgress(): Promise<ApiResponse<any>> {
  try {
    const response = await fetch('/api/session/progress', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to get stage progress',
        error: data.error,
      }
    }

    return {
      success: true,
      message: 'Stage progress retrieved successfully',
      data: data.progress,
    }
  } catch (error) {
    console.error('Get stage progress error:', error)
    return {
      success: false,
      message: 'Network error. Please check your connection.',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate click counts by position from click data array
 * @param clicks - Array of PAHM clicks
 * @returns Object with counts per position
 */
export function calculateClickCounts(clicks: PAHMClick[]): Record<PAHMPosition, number> {
  const counts: Record<PAHMPosition, number> = {
    regret: 0,
    past: 0,
    nostalgia: 0,
    dislikes: 0,
    present: 0,
    likes: 0,
    worry: 0,
    future: 0,
    anticipation: 0,
  }

  clicks.forEach(click => {
    if (click.position in counts) {
      counts[click.position]++
    }
  })

  return counts
}

/**
 * Format session duration for display
 * @param minutes - Duration in minutes
 * @returns Formatted string (e.g., "5 min", "1h 30min")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (mins === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${mins}min`
}

/**
 * Get exercise type display name
 * @param exerciseType - Exercise type code
 * @returns Human-readable name
 */
export function getExerciseName(exerciseType: ExerciseType): string {
  const names: Record<ExerciseType, string> = {
    morning_recharge: 'Morning Recharge',
    midday_reset: 'Mid-Day Reset',
    emotional_reset: 'Emotional Reset',
    work_home_transition: 'Work-Home Transition',
    bedtime_wind_down: 'Bedtime Wind Down',
  }
  
  return names[exerciseType] || exerciseType
}

/**
 * Get recommended duration for exercise type
 * @param exerciseType - Exercise type code
 * @returns Duration in minutes
 */
export function getExerciseDuration(exerciseType: ExerciseType): number {
  const durations: Record<ExerciseType, number> = {
    morning_recharge: 5,
    midday_reset: 3,
    emotional_reset: 5,
    work_home_transition: 5,
    bedtime_wind_down: 8,
  }
  
  return durations[exerciseType] || 5
}

/**
 * Validate session data before submission
 * @param sessionType - Type of session
 * @param data - Session data to validate
 * @returns Validation result with errors
 */
export function validateSessionData(
  sessionType: SessionType,
  data: Partial<CompleteSessionRequest>
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.sessionId) {
    errors.push('Session ID is required')
  }

  if (data.qualityRating !== undefined) {
    if (data.qualityRating < 1 || data.qualityRating > 10) {
      errors.push('Quality rating must be between 1 and 10')
    }
  }

  if ((sessionType === 'pahm_matrix' || sessionType === 'mind_recovery') && !data.pahmData) {
    errors.push('PAHM data is required for this session type')
  }

  if (data.pahmData) {
    if (data.pahmData.totalClicks < 0) {
      errors.push('Total clicks must be non-negative')
    }
    if (!Array.isArray(data.pahmData.clickData)) {
      errors.push('Click data must be an array')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
