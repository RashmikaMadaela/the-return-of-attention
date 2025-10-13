/**
 * CORE BUSINESS LOGIC UTILITIES
 * Contains all business logic calculations and utility functions
 * for the PAHM methodology implementation
 */

import { Session, UserStageProgress } from '@prisma/client'

// ============================================================================
// RE-EXPORT HAPPINESS CALCULATION FROM NEW MODULE
// ============================================================================

export {
  calculateHappinessScore,
  calculateSelfAssessmentScore,
  type HappinessScoreComponents,
  type HappinessCalculationResult
} from './happiness-calculation'

// ============================================================================
// STAGE PROGRESSION UTILITIES
// ============================================================================

export interface StageRequirements {
  minSessions: number
  minHours: number
  sessionType: 'timer_only' | 'pahm_matrix'
  hasSubStages: boolean
  subStages?: Array<{
    name: string
    minSessions: number
    minDuration: number
  }>
}

export const STAGE_REQUIREMENTS: Record<number, StageRequirements> = {
  1: {
    minSessions: 29,
    minHours: 11.5,
    sessionType: 'timer_only',
    hasSubStages: true,
    subStages: [
      { name: 'T1', minSessions: 3, minDuration: 10 },
      { name: 'T2', minSessions: 4, minDuration: 15 },
      { name: 'T3', minSessions: 6, minDuration: 20 },
      { name: 'T4', minSessions: 6, minDuration: 25 },
      { name: 'T5', minSessions: 10, minDuration: 30 }
    ]
  },
  2: { minSessions: 30, minHours: 15, sessionType: 'pahm_matrix', hasSubStages: false },
  3: { minSessions: 30, minHours: 15, sessionType: 'pahm_matrix', hasSubStages: false },
  4: { minSessions: 40, minHours: 20, sessionType: 'pahm_matrix', hasSubStages: false },
  5: { minSessions: 50, minHours: 25, sessionType: 'pahm_matrix', hasSubStages: false },
  6: { minSessions: 60, minHours: 30, sessionType: 'pahm_matrix', hasSubStages: false }
}

export function checkStageUnlockRequirements(
  stageNumber: number,
  userProgress: UserStageProgress[]
): { canUnlock: boolean; reason?: string } {
  // Stage 1 is always unlocked
  if (stageNumber === 1) {
    return { canUnlock: true }
  }

  // Check if previous stage is completed
  const previousStageProgress = userProgress.find(p => p.stageNumber === stageNumber - 1)
  
  if (!previousStageProgress || !previousStageProgress.isCompleted) {
    return { 
      canUnlock: false, 
      reason: `Complete Stage ${stageNumber - 1} first` 
    }
  }

  // Additional requirements for specific stages
  if (stageNumber === 3) {
    // Require mid self-assessment after stage 2
    // This would be checked in the API layer
  }

  if (stageNumber === 7) {
    // Require final self-assessment after stage 6
    // This would be checked in the API layer
  }

  return { canUnlock: true }
}

export function calculateStageProgress(
  stageNumber: number,
  sessions: Session[],
  currentSubStage?: string
): { 
  sessionsCompleted: number
  hoursCompleted: number
  progressPercentage: number
  nextRequirement?: string
} {
  const requirements = STAGE_REQUIREMENTS[stageNumber]
  if (!requirements) {
    return { sessionsCompleted: 0, hoursCompleted: 0, progressPercentage: 0 }
  }

  const stageSessions = sessions.filter(s => 
    s.stageNumber === stageNumber && 
    s.status === 'completed' &&
    (!currentSubStage || s.subStage === currentSubStage)
  )

  const sessionsCompleted = stageSessions.length
  const hoursCompleted = stageSessions.reduce((sum, s) => sum + s.duration / 60, 0)

  const sessionProgress = Math.min(100, (sessionsCompleted / requirements.minSessions) * 100)
  const hourProgress = Math.min(100, (hoursCompleted / requirements.minHours) * 100)
  const progressPercentage = Math.min(sessionProgress, hourProgress)

  let nextRequirement: string | undefined
  if (sessionsCompleted < requirements.minSessions) {
    nextRequirement = `Complete ${requirements.minSessions - sessionsCompleted} more sessions`
  } else if (hoursCompleted < requirements.minHours) {
    const remainingHours = Math.ceil((requirements.minHours - hoursCompleted) * 10) / 10
    nextRequirement = `Practice ${remainingHours} more hours`
  }

  return {
    sessionsCompleted,
    hoursCompleted,
    progressPercentage,
    nextRequirement
  }
}

// ============================================================================
// MIND RECOVERY EXERCISES DATA
// ============================================================================

export const MIND_RECOVERY_EXERCISES = [
  {
    name: 'Morning Recharge',
    type: 'morning_recharge',
    description: 'Start your day with present moment awareness and positive intention setting.',
    purpose: 'Establishes mindful awareness from the beginning of the day and sets positive intentions.',
    bestTime: 'First thing in the morning, before checking phone or starting daily activities',
    duration: 5,
    isActive: true,
    sortOrder: 1
  },
  {
    name: 'Mid-Day Reset',
    type: 'midday_reset',
    description: 'Brief reset to return to present moment awareness during busy day.',
    purpose: 'Breaks the autopilot mode and returns attention to the present moment.',
    bestTime: 'Mid-day when feeling scattered or overwhelmed',
    duration: 3,
    isActive: true,
    sortOrder: 2
  },
  {
    name: 'Emotional Reset',
    type: 'emotional_reset',
    description: 'Process and release difficult emotions through mindful observation.',
    purpose: 'Helps process difficult emotions and return to emotional balance.',
    bestTime: 'When experiencing strong negative emotions',
    duration: 5,
    isActive: true,
    sortOrder: 3
  },
  {
    name: 'Work-Home Transition',
    type: 'work_home_transition',
    description: 'Mindful transition from work mindset to personal life presence.',
    purpose: 'Creates clear boundary between work and personal life.',
    bestTime: 'After work, before engaging with family or personal activities',
    duration: 5,
    isActive: true,
    sortOrder: 4
  },
  {
    name: 'Bedtime Wind Down',
    type: 'bedtime_wind_down',
    description: 'Gentle preparation for restful sleep through mindful relaxation.',
    purpose: 'Prepares the mind and body for restful sleep.',
    bestTime: '30-60 minutes before intended sleep time',
    duration: 8,
    isActive: true,
    sortOrder: 5
  }
]

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`
  }
  return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function isValidStageTransition(fromStage: number, toStage: number): boolean {
  return toStage === fromStage + 1 || toStage === fromStage
}

export function calculateStreakDays(sessions: Session[]): number {
  const completedSessions = sessions
    .filter(s => s.status === 'completed')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  if (completedSessions.length === 0) return 0

  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  for (const session of completedSessions) {
    const sessionDate = new Date(session.createdAt)
    sessionDate.setHours(0, 0, 0, 0)

    const daysDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff === streak) {
      streak++
    } else if (daysDiff > streak) {
      break
    }

    currentDate = new Date(sessionDate)
    currentDate.setDate(currentDate.getDate() - 1)
  }

  return streak
}