/**
 * HAPPINESS SCORE CALCULATION ENGINE
 * Single-Point v3 Strict Mode Implementation
 * Based on Present Attention Happiness Model (PAHM) Documentation
 * 
 * Architecture: Both questionnaire AND self-assessment required (STRICT mode)
 * Enhancement: Practice sessions provide score multipliers
 */

import { Questionnaire, SelfAssessment, Session, PAHMSession, UserStageProgress, DailyNote } from '@prisma/client'

// ============================================================================
// SELF-ASSESSMENT SCORING
// ============================================================================

/**
 * Calculate self-assessment total score based on attachment levels
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
  const scoreMap: Record<string, number> = {
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
// TYPE DEFINITIONS
// ============================================================================

export interface HappinessScoreComponents {
  currentStateScore: number          // Component 1: 12% weight
  attachmentScore: number            // Component 2: 20% weight
  pahmScore: number                  // Component 3: 25% weight (PRIMARY)
  emotionalStabilityScore: number    // Component 4: 18% weight
  mindRecoveryScore: number          // Component 5: 8% weight
  emotionalRegulationScore: number   // Component 6: 10% weight
  practiceConsistencyScore: number   // Component 7: 3% weight
  socialConnectionScore: number      // Component 8: 4% weight
}

export interface HappinessCalculationResult {
  components: HappinessScoreComponents
  finalScore: number
  userLevel: string
}

// ============================================================================
// MAIN CALCULATION FUNCTION
// ============================================================================

export function calculateHappinessScore(
  questionnaire: Questionnaire,
  selfAssessment: SelfAssessment,
  sessions: Session[],
  pahmSessions: (PAHMSession & { session?: Session | null })[],
  stageProgress: UserStageProgress[],
  dailyNotes: DailyNote[] = []
): HappinessCalculationResult {
  
  // Calculate all 8 components
  const currentStateScore = calculateCurrentStateScore(questionnaire, dailyNotes)
  const attachmentScore = calculateAttachmentScore(selfAssessment)
  const socialConnectionScore = calculateSocialConnectionScore(questionnaire)
  const emotionalStabilityScore = calculateEmotionalStabilityScore(questionnaire, sessions)
  const mindRecoveryScore = calculateMindRecoveryScore(sessions)
  const emotionalRegulationScore = calculateEmotionalRegulationScore(questionnaire, sessions)
  const practiceConsistencyScore = calculatePracticeConsistencyScore(sessions)
  const pahmScore = calculatePAHMScore(questionnaire, pahmSessions)

  const components: HappinessScoreComponents = {
    currentStateScore,
    attachmentScore,
    pahmScore,
    emotionalStabilityScore,
    mindRecoveryScore,
    emotionalRegulationScore,
    practiceConsistencyScore,
    socialConnectionScore
  }

  // Calculate weighted final score (must total 100%)
  const finalScore = Math.round(
    (currentStateScore * 0.12) +           // 12%
    (attachmentScore * 0.20) +             // 20%
    (pahmScore * 0.25) +                   // 25% PRIMARY
    (emotionalStabilityScore * 0.18) +     // 18%
    (mindRecoveryScore * 0.08) +           // 8%
    (emotionalRegulationScore * 0.10) +    // 10%
    (practiceConsistencyScore * 0.03) +    // 3%
    (socialConnectionScore * 0.04)         // 4%
  )

  const userLevel = determineUserLevel(finalScore)

  return { components, finalScore, userLevel }
}

// ============================================================================
// COMPONENT 1: CURRENT STATE ASSESSMENT (12% weight)
// ============================================================================

function calculateCurrentStateScore(
  questionnaire: Questionnaire,
  dailyNotes: DailyNote[]
): number {
  let score = 0

  // Emotional Awareness (1-10 scale) × 8
  score += (questionnaire.emotionalAwareness || 0) * 8

  // Sleep Pattern (1-10 scale) × 6
  // If sleepPattern is a number (1-10), use it directly
  // If it's a string (old format), map it
  let sleepValue = 0
  if (typeof questionnaire.sleepPattern === 'number') {
    sleepValue = questionnaire.sleepPattern
  } else {
    const sleepScoreMap: Record<string, number> = {
      'excellent': 10,
      'good': 7,
      'fair': 4,
      'poor': 1
    }
    const sleepPattern = String(questionnaire.sleepPattern || 'fair')
    sleepValue = sleepScoreMap[sleepPattern] || 5
  }
  score += sleepValue * 6

  // Physical Activity Bonus
  const activityBonusMap: Record<string, number> = {
    'very_active': 25,
    'moderate': 15,
    'light': 8,
    'sedentary': 0
  }
  score += activityBonusMap[questionnaire.physicalActivity as string] || 0

  // Work-Life Balance
  const workLifeBalanceMap: Record<string, number> = {
    'excellent': 20,
    'good': 12,
    'struggle': -10
  }
  score += workLifeBalanceMap[questionnaire.workLifeBalance as string] || 0

  // Stress Response
  const stressResponseMap: Record<string, number> = {
    'manage_well': 15,
    'usually_manage': 8,
    'overwhelmed': -15
  }
  score += stressResponseMap[questionnaire.stressResponse as string] || 0

  // Recent Mood Average from daily notes × 8
  if (dailyNotes.length > 0) {
    const recent30Days = dailyNotes.filter(note => {
      const noteDate = new Date(note.createdAt)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      return noteDate >= thirtyDaysAgo
    })

    if (recent30Days.length > 0) {
      const avgMood = recent30Days.reduce((sum, note) => {
        // Use moodRating (1-10) or intensity (1-10) from daily notes
        const moodValue = note.moodRating || note.intensity || 5
        return sum + moodValue
      }, 0) / recent30Days.length
      
      score += (avgMood / 2) * 8 // Normalize 1-10 scale to 1-5 equivalent
    }
  }

  return Math.max(0, Math.min(100, Math.round(score)))
}

// ============================================================================
// COMPONENT 2: ATTACHMENT-BASED HAPPINESS (20% weight)
// ============================================================================

function calculateAttachmentScore(selfAssessment: SelfAssessment): number {
  // Scoring per category: none (+12), some (-7), strong (-15)
  const scoreMap: Record<string, number> = {
    'none': 12,
    'some': -7,
    'strong': -15
  }

  const categories = [
    selfAssessment.foodTaste,
    selfAssessment.scentsAromas,
    selfAssessment.soundsMusic,
    selfAssessment.visualBeauty,
    selfAssessment.touchTextures,
    selfAssessment.thoughtsImages
  ]

  // Count non-attachment categories for bonus
  const nonAttachmentCount = categories.filter(cat => cat === 'none').length
  const nonAttachmentBonus = nonAttachmentCount * 12

  // Sum attachment penalties
  const attachmentPenalty = categories.reduce((total, category) => {
    if (category === 'some') return total - 7
    if (category === 'strong') return total - 15
    return total
  }, 0)

  const finalScore = nonAttachmentBonus + attachmentPenalty + 50 // Base of 50 for normalization

  return Math.max(0, Math.min(100, Math.round(finalScore)))
}

// ============================================================================
// COMPONENT 3: PAHM DEVELOPMENT (25% weight - PRIMARY COMPONENT)
// ============================================================================

function calculatePAHMScore(
  questionnaire: Questionnaire,
  pahmSessions: (PAHMSession & { session?: Session | null })[]
): number {
  // Assessment Foundation = (Experience Level × 2.5) + (Mindfulness Experience × 2)
  // Both are on 1-10 scale, so the multipliers remain the same
  const experienceLevel = questionnaire.experienceLevel || 0
  const mindfulnessExperience = questionnaire.mindfulnessExperience || 0
  const assessmentFoundation = (experienceLevel * 2.5) + (mindfulnessExperience * 2)

  // Calculate practice realization bonuses
  let practiceRealization = 0

  if (pahmSessions.length > 0) {
    // Session Count Bonus
    const sessionCount = pahmSessions.length
    if (sessionCount >= 100) practiceRealization += 35
    else if (sessionCount >= 50) practiceRealization += 30
    else if (sessionCount >= 25) practiceRealization += 25
    else if (sessionCount >= 15) practiceRealization += 20
    else if (sessionCount >= 10) practiceRealization += 15
    else if (sessionCount >= 5) practiceRealization += 10
    else if (sessionCount >= 1) practiceRealization += 5

    // For total hours, duration, and quality - we need the parent Session data
    // This requires fetching PAHMSession with session relation included
    const sessionsWithData = pahmSessions.filter(ps => ps.session)
    
    if (sessionsWithData.length > 0) {
      // Total Hours Bonus
      const totalMinutes = sessionsWithData.reduce((sum, ps) => sum + (ps.session?.duration || 0), 0)
      const totalHours = totalMinutes / 60
      if (totalHours >= 100) practiceRealization += 40
      else if (totalHours >= 50) practiceRealization += 35
      else if (totalHours >= 25) practiceRealization += 30
      else if (totalHours >= 10) practiceRealization += 25
      else if (totalHours >= 5) practiceRealization += 20
      else if (totalHours >= 2) practiceRealization += 15
      else if (totalHours >= 0.5) practiceRealization += 10

      // Quality Bonus (from parent Session)
      const ratedSessions = sessionsWithData.filter(ps => 
        ps.session?.qualityRating && ps.session.qualityRating > 0
      )
      if (ratedSessions.length > 0) {
        const avgQuality = ratedSessions.reduce((sum, ps) => 
          sum + (ps.session?.qualityRating || 0), 0
        ) / ratedSessions.length
        if (avgQuality >= 4.5) practiceRealization += 25
        else if (avgQuality >= 4.0) practiceRealization += 20
        else if (avgQuality >= 3.5) practiceRealization += 15
        else if (avgQuality >= 3.0) practiceRealization += 10
        else if (avgQuality >= 2.5) practiceRealization += 5
      }

      // Duration Bonus (average session duration)
      const avgDuration = totalMinutes / sessionsWithData.length
      if (avgDuration >= 45) practiceRealization += 20
      else if (avgDuration >= 30) practiceRealization += 15
      else if (avgDuration >= 20) practiceRealization += 12
      else if (avgDuration >= 15) practiceRealization += 10
      else if (avgDuration >= 10) practiceRealization += 8
      else if (avgDuration >= 5) practiceRealization += 5
    }

    // Recent Activity Bonus (last 30 days) - can use PAHMSession directly
    const recent30Days = pahmSessions.filter(s => {
      const sessionDate = new Date(s.createdAt)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      return sessionDate >= thirtyDaysAgo
    })
    const recentCount = recent30Days.length
    if (recentCount >= 20) practiceRealization += 15
    else if (recentCount >= 15) practiceRealization += 12
    else if (recentCount >= 10) practiceRealization += 10
    else if (recentCount >= 5) practiceRealization += 8
    else if (recentCount >= 1) practiceRealization += 5
  }

  const pahmScore = assessmentFoundation + practiceRealization

  return Math.max(0, Math.min(100, Math.round(pahmScore)))
}

// ============================================================================
// COMPONENT 4: EMOTIONAL STABILITY PROGRESS (18% weight)
// ============================================================================

function calculateEmotionalStabilityScore(
  questionnaire: Questionnaire,
  sessions: Session[]
): number {
  let score = 0

  // Emotional Awareness × 7
  score += (questionnaire.emotionalAwareness || 0) * 7

  // Stress Response
  const stressResponseMap: Record<string, number> = {
    'observe_let_go': 25,
    'manage_well': 15,
    'usually_manage': 8,
    'overwhelmed': -20
  }
  score += stressResponseMap[questionnaire.stressResponse as string] || 0

  // Thought Patterns
  const thoughtPatternMap: Record<string, number> = {
    'peaceful': 15,
    'anxious': -15,
    'neutral': 0
  }
  score += thoughtPatternMap[questionnaire.thoughtPatterns as string] || 0

  // Practice Bonus (min 20, sessions × 1.5)
  const completedSessions = sessions.filter(s => s.status === 'completed')
  const practiceBonus = Math.max(20, Math.min(50, completedSessions.length * 1.5))
  score += practiceBonus

  // Quality Bonus ((avg_quality - 3) × 5)
  const ratedSessions = completedSessions.filter(s => s.qualityRating && s.qualityRating > 0)
  if (ratedSessions.length > 0) {
    const avgQuality = ratedSessions.reduce((sum, s) => sum + (s.qualityRating || 0), 0) / ratedSessions.length
    const qualityBonus = (avgQuality - 3) * 5
    score += qualityBonus
  }

  return Math.max(0, Math.min(100, Math.round(score)))
}

// ============================================================================
// COMPONENT 5: MIND RECOVERY EFFECTIVENESS (8% weight)
// ============================================================================

function calculateMindRecoveryScore(sessions: Session[]): number {
  const completedSessions = sessions.filter(s => s.status === 'completed')
  
  if (completedSessions.length === 0) return 0

  let score = 0

  // Duration Bonus (average session duration)
  const totalMinutes = completedSessions.reduce((sum, s) => sum + s.duration, 0)
  const avgDuration = totalMinutes / completedSessions.length
  if (avgDuration >= 30) score += 50
  else if (avgDuration >= 20) score += 40
  else if (avgDuration >= 15) score += 30
  else if (avgDuration >= 10) score += 20
  else if (avgDuration >= 5) score += 12

  // Hour Bonus (total practice hours)
  const totalHours = totalMinutes / 60
  if (totalHours >= 50) score += 45
  else if (totalHours >= 25) score += 35
  else if (totalHours >= 15) score += 25
  else if (totalHours >= 5) score += 18
  else if (totalHours >= 1) score += 10

  // Recent Activity (30 days)
  const recent30Days = completedSessions.filter(s => {
    const sessionDate = new Date(s.createdAt)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    return sessionDate >= thirtyDaysAgo
  })
  const recentCount = recent30Days.length
  if (recentCount >= 20) score += 25
  else if (recentCount >= 15) score += 20
  else if (recentCount >= 10) score += 15
  else if (recentCount >= 5) score += 10
  else if (recentCount >= 1) score += 5

  // Quality Bonus
  const ratedSessions = completedSessions.filter(s => s.qualityRating && s.qualityRating > 0)
  if (ratedSessions.length > 0) {
    const avgQuality = ratedSessions.reduce((sum, s) => sum + (s.qualityRating || 0), 0) / ratedSessions.length
    if (avgQuality >= 4.5) score += 20
    else if (avgQuality >= 4.0) score += 15
    else if (avgQuality >= 3.5) score += 10
    else if (avgQuality >= 3.0) score += 5
  }

  return Math.max(0, Math.min(100, Math.round(score)))
}

// ============================================================================
// COMPONENT 6: EMOTIONAL REGULATION (10% weight)
// ============================================================================

function calculateEmotionalRegulationScore(
  questionnaire: Questionnaire,
  sessions: Session[]
): number {
  let score = 0

  // Emotional Awareness × 6.5
  score += (questionnaire.emotionalAwareness || 0) * 6.5

  // Decision Making
  const decisionMakingMap: Record<string, number> = {
    'intuitive_mindful': 20,
    'mindful': 12,
    'balanced': 8,
    'overthink': -12
  }
  score += decisionMakingMap[questionnaire.decisionMaking as string] || 0

  // Daily Mindfulness
  const dailyMindfulnessMap: Record<string, number> = {
    'constant': 18,
    'try_to_be': 8,
    'autopilot': -15
  }
  score += dailyMindfulnessMap[questionnaire.mindfulnessInDailyLife as string] || 0

  // Practice Weeks × 2 (max 15)
  const completedSessions = sessions.filter(s => s.status === 'completed')
  if (completedSessions.length > 0) {
    const firstSession = new Date(completedSessions[completedSessions.length - 1].createdAt)
    const now = new Date()
    const weeks = Math.floor((now.getTime() - firstSession.getTime()) / (7 * 24 * 60 * 60 * 1000))
    score += Math.min(15, weeks * 2)
  }

  // Quality Sessions Ratio × 12
  const ratedSessions = completedSessions.filter(s => s.qualityRating && s.qualityRating >= 4)
  if (completedSessions.length > 0) {
    const qualityRatio = ratedSessions.length / completedSessions.length
    score += qualityRatio * 12
  }

  return Math.max(0, Math.min(100, Math.round(score)))
}

// ============================================================================
// COMPONENT 7: PRACTICE CONSISTENCY (3% weight)
// ============================================================================

function calculatePracticeConsistencyScore(sessions: Session[]): number {
  const completedSessions = sessions.filter(s => s.status === 'completed')
  
  if (completedSessions.length === 0) return 0

  let score = 0

  // Recent Sessions (30 days)
  const recent30Days = completedSessions.filter(s => {
    const sessionDate = new Date(s.createdAt)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    return sessionDate >= thirtyDaysAgo
  })
  const recentCount = recent30Days.length
  if (recentCount >= 28) score += 80
  else if (recentCount >= 25) score += 70
  else if (recentCount >= 20) score += 60
  else if (recentCount >= 15) score += 45
  else if (recentCount >= 10) score += 30
  else if (recentCount >= 5) score += 18
  else if (recentCount >= 1) score += 8

  // Current Streak
  const streak = calculateStreakDays(completedSessions)
  if (streak >= 30) score += 35
  else if (streak >= 21) score += 30
  else if (streak >= 14) score += 25
  else if (streak >= 7) score += 20
  else if (streak >= 3) score += 12
  else if (streak >= 1) score += 6

  // Total Sessions
  const totalCount = completedSessions.length
  if (totalCount >= 100) score += 25
  else if (totalCount >= 50) score += 20
  else if (totalCount >= 25) score += 15
  else if (totalCount >= 10) score += 10
  else if (totalCount >= 5) score += 5

  return Math.max(0, Math.min(100, Math.round(score)))
}

// ============================================================================
// COMPONENT 8: SOCIAL CONNECTION (4% weight)
// ============================================================================

function calculateSocialConnectionScore(questionnaire: Questionnaire): number {
  let score = 0

  // Base score by social connections response
  const socialConnectionMap: Record<string, number> = {
    'deep_meaningful': 85,
    'few_but_close': 70,
    'good': 55,
    'average': 35,
    'mostly_isolated': 10
  }
  score += socialConnectionMap[questionnaire.socialConnections as string] || 0

  // Work-life balance bonus
  if (questionnaire.workLifeBalance === 'excellent' || questionnaire.workLifeBalance === 'good') {
    score += 10
  }

  // Service motivation bonus (if exists in questionnaire - using motivation field)
  const serviceMotivationMap: Record<string, number> = {
    'very_motivated': 12,
    'somewhat_motivated': 8,
    'neutral': 4,
    'not_motivated': 0
  }
  const motivation = String(questionnaire.motivation || 'neutral')
  score += serviceMotivationMap[motivation] || 0

  return Math.max(0, Math.min(100, Math.round(score)))
}

// ============================================================================
// USER LEVEL DETERMINATION
// ============================================================================

function determineUserLevel(score: number): string {
  if (score >= 80) return 'Enlightened Seeker'
  if (score >= 65) return 'Advanced Seeker'
  if (score >= 50) return 'Progressing Seeker'
  if (score >= 35) return 'Awakening Seeker'
  if (score >= 20) return 'Active Seeker'
  return 'Seeker'
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateStreakDays(sessions: Session[]): number {
  const sortedSessions = sessions
    .filter(s => s.status === 'completed')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  if (sortedSessions.length === 0) return 0

  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  // Check if there's a session today or yesterday
  const mostRecentSession = new Date(sortedSessions[0].createdAt)
  mostRecentSession.setHours(0, 0, 0, 0)
  const daysSinceLastSession = Math.floor(
    (currentDate.getTime() - mostRecentSession.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysSinceLastSession > 1) {
    return 0 // Streak broken
  }

  // Count consecutive days
  const uniqueDays = new Set<string>()
  sortedSessions.forEach(session => {
    const sessionDate = new Date(session.createdAt)
    sessionDate.setHours(0, 0, 0, 0)
    uniqueDays.add(sessionDate.toISOString().split('T')[0])
  })

  const sortedDays = Array.from(uniqueDays).sort().reverse()
  
  streak = 1
  for (let i = 0; i < sortedDays.length - 1; i++) {
    const current = new Date(sortedDays[i])
    const next = new Date(sortedDays[i + 1])
    const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}
