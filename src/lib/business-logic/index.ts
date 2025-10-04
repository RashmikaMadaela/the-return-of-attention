/**
 * CORE BUSINESS LOGIC UTILITIES
 * Contains all business logic calculations and utility functions
 * for the PAHM methodology implementation
 */

import { SelfAssessment, Questionnaire, Session, PAHMSession, UserStageProgress } from '@prisma/client'

// ============================================================================
// SELF-ASSESSMENT SCORING SYSTEM
// ============================================================================

/**
 * Calculate self-assessment score based on attachment levels
 * Scoring: "none" (+12), "some" (-7), "strong" (-15) per category
 */
export function calculateSelfAssessmentScore(assessment: {
  foodTaste: string
  scentsAromas: string
  soundsMusic: string
  visualBeauty: string
  touchTextures: string
  thoughtsImages: string
}): number {
  const scoreMap = {
    'none': 12,
    'some': -7,
    'strong': -15
  }

  const categories = [
    assessment.foodTaste,
    assessment.scentsAromas,
    assessment.soundsMusic,
    assessment.visualBeauty,
    assessment.touchTextures,
    assessment.thoughtsImages
  ]

  return categories.reduce((total, category) => {
    return total + (scoreMap[category as keyof typeof scoreMap] || 0)
  }, 0)
}

// ============================================================================
// HAPPINESS SCORE CALCULATION ENGINE
// ============================================================================

export interface HappinessScoreComponents {
  currentStateScore: number    // Component 1: 12% weight
  attachmentScore: number      // Component 2: 20% weight
  pahmScore: number           // Component 3: 25% weight
  practiceScore: number       // Component 4: 15% weight
  progressScore: number       // Component 5: 10% weight
  consistencyScore: number    // Component 6: 8% weight
  reflectionScore: number     // Component 7: 5% weight
  dailyLifeScore: number      // Component 8: 5% weight
}

export function calculateHappinessScore(
  questionnaire: Questionnaire,
  selfAssessment: SelfAssessment,
  sessions: Session[],
  pahmSessions: PAHMSession[],
  stageProgress: UserStageProgress[]
): { components: HappinessScoreComponents; finalScore: number; userLevel: string } {
  
  // Component 1: Current State Score (12% weight)
  const currentStateScore = calculateCurrentStateScore(questionnaire)
  
  // Component 2: Attachment Score (20% weight) - from self-assessment
  const attachmentScore = Math.max(0, Math.min(100, selfAssessment.totalScore + 50)) // Normalize to 0-100
  
  // Component 3: PAHM Score (25% weight) - from PAHM sessions
  const pahmScore = calculatePAHMScore(pahmSessions)
  
  // Component 4: Practice Score (15% weight) - from sessions
  const practiceScore = calculatePracticeScore(sessions)
  
  // Component 5: Progress Score (10% weight) - from stage progression
  const progressScore = calculateProgressScore(stageProgress)
  
  // Component 6: Consistency Score (8% weight) - from session regularity
  const consistencyScore = calculateConsistencyScore(sessions)
  
  // Component 7: Reflection Score (5% weight) - from session insights
  const reflectionScore = calculateReflectionScore(sessions)
  
  // Component 8: Daily Life Score (5% weight) - from questionnaire integration
  const dailyLifeScore = calculateDailyLifeScore(questionnaire)

  const components: HappinessScoreComponents = {
    currentStateScore,
    attachmentScore,
    pahmScore,
    practiceScore,
    progressScore,
    consistencyScore,
    reflectionScore,
    dailyLifeScore
  }

  // Calculate weighted final score
  const finalScore = Math.round(
    (currentStateScore * 0.12) +
    (attachmentScore * 0.20) +
    (pahmScore * 0.25) +
    (practiceScore * 0.15) +
    (progressScore * 0.10) +
    (consistencyScore * 0.08) +
    (reflectionScore * 0.05) +
    (dailyLifeScore * 0.05)
  )

  // Determine user level based on final score
  const userLevel = determineUserLevel(finalScore)

  return { components, finalScore, userLevel }
}

// ============================================================================
// INDIVIDUAL COMPONENT CALCULATIONS
// ============================================================================

function calculateCurrentStateScore(questionnaire: Questionnaire): number {
  let score = 50 // Base score

  // Factor in key questionnaire responses
  if (questionnaire.experienceLevel) {
    score += questionnaire.experienceLevel * 2 // 0-20 points
  }

  if (questionnaire.emotionalAwareness) {
    score += questionnaire.emotionalAwareness * 2 // 0-18 points
  }

  if (questionnaire.sleepPattern) {
    score += questionnaire.sleepPattern * 1.5 // 0-15 points
  }

  // Adjust based on stress triggers (fewer = better)
  const stressTriggerCount = questionnaire.stressTrigers?.length || 0
  score -= stressTriggerCount * 2

  return Math.max(0, Math.min(100, score))
}

function calculatePAHMScore(pahmSessions: PAHMSession[]): number {
  if (pahmSessions.length === 0) return 0

  let totalScore = 0
  let sessionCount = 0

  pahmSessions.forEach(session => {
    const centerClicks = session.presentClicks || 0
    const totalClicks = session.totalClicks || 1
    const centerRatio = centerClicks / totalClicks

    // Higher center ratio = better awareness = higher score
    const sessionScore = Math.min(100, centerRatio * 100 + (totalClicks > 50 ? 20 : 0))
    
    totalScore += sessionScore
    sessionCount++
  })

  return sessionCount > 0 ? totalScore / sessionCount : 0
}

function calculatePracticeScore(sessions: Session[]): number {
  if (sessions.length === 0) return 0

  const completedSessions = sessions.filter(s => s.status === 'completed')
  const totalMinutes = completedSessions.reduce((sum, s) => sum + s.duration, 0)
  
  // Calculate score based on total practice time and consistency
  let score = Math.min(100, (totalMinutes / 60) * 2) // 2 points per hour
  
  // Bonus for quality ratings
  const ratedSessions = completedSessions.filter(s => s.qualityRating)
  if (ratedSessions.length > 0) {
    const avgQuality = ratedSessions.reduce((sum, s) => sum + (s.qualityRating || 0), 0) / ratedSessions.length
    score += avgQuality * 2 // Up to 20 bonus points
  }

  return Math.max(0, Math.min(100, score))
}

function calculateProgressScore(stageProgress: UserStageProgress[]): number {
  const completedStages = stageProgress.filter(p => p.isCompleted).length
  const totalStages = 6

  // Base score from completed stages
  let score = (completedStages / totalStages) * 80

  // Bonus for current stage progress
  const currentStage = stageProgress.find(p => !p.isCompleted)
  if (currentStage) {
    const progressRatio = Math.min(1, Number(currentStage.hoursCompleted) / 15) // Assume 15 hours average per stage
    score += progressRatio * 20
  }

  return Math.max(0, Math.min(100, score))
}

function calculateConsistencyScore(sessions: Session[]): number {
  if (sessions.length < 7) return sessions.length * 10 // Not enough data yet

  const completedSessions = sessions.filter(s => s.status === 'completed')
  const last30Days = completedSessions.filter(s => {
    const sessionDate = new Date(s.createdAt)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    return sessionDate >= thirtyDaysAgo
  })

  // Calculate consistency based on recent activity
  const recentSessionDays = last30Days.length
  const consistencyRatio = Math.min(1, recentSessionDays / 20) // Ideal: 20 sessions in 30 days
  
  return Math.round(consistencyRatio * 100)
}

function calculateReflectionScore(sessions: Session[]): number {
  const sessionsWithInsights = sessions.filter(s => s.insights && s.insights.trim().length > 0)
  const totalSessions = sessions.length

  if (totalSessions === 0) return 0

  const reflectionRatio = sessionsWithInsights.length / totalSessions
  return Math.round(reflectionRatio * 100)
}

function calculateDailyLifeScore(questionnaire: Questionnaire): number {
  let score = 50 // Base score

  // Factor in mindfulness integration
  const mindfulnessFactors = [
    questionnaire.mindfulnessInDailyLife,
    questionnaire.thoughtPatterns,
    questionnaire.stressResponse,
    questionnaire.workLifeBalance
  ]

  // Score based on positive responses (simplified - would need actual response mapping)
  const positiveResponses = mindfulnessFactors.filter(f => 
    f && (f.includes('awareness') || f.includes('mindful') || f.includes('peaceful'))
  ).length

  score += positiveResponses * 12.5 // Up to 50 additional points

  return Math.max(0, Math.min(100, score))
}

function determineUserLevel(score: number): string {
  if (score >= 90) return 'PAHM Illuminator'
  if (score >= 80) return 'PAHM Master'
  if (score >= 70) return 'PAHM Practitioner'
  if (score >= 60) return 'PAHM Beginner'
  if (score >= 50) return 'PAHM Trainee'
  if (score >= 40) return 'Aware Seeker'
  return 'Seeker'
}

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