/**
 * AUTO-TRIGGER UTILITY FOR HAPPINESS SCORE CALCULATION
 * Reusable function to automatically recalculate happiness score
 * after data changes (self-assessment, sessions, daily notes, etc.)
 */

import { prisma } from '@/lib/prisma'
import { calculateHappinessScore } from './happiness-calculation'

export interface AutoTriggerResult {
  success: boolean
  calculated: boolean
  reason?: string
  happinessScoreId?: string
  finalScore?: number
  userLevel?: string
}

/**
 * Automatically calculate and save happiness score for a user
 * Only calculates if STRICT mode requirements are met (questionnaire + self-assessment)
 * 
 * @param userId - User ID to calculate happiness score for
 * @param triggerSource - What triggered the calculation (for logging)
 * @returns Result object indicating success and calculation details
 */
export async function autoTriggerHappinessCalculation(
  userId: string,
  triggerSource: 'self-assessment' | 'session' | 'daily-note' | 'manual'
): Promise<AutoTriggerResult> {
  try {
    // Check STRICT mode requirement: Questionnaire must be completed
    const questionnaire = await prisma.questionnaire.findUnique({
      where: { userId }
    })

    if (!questionnaire || !questionnaire.isCompleted) {
      return {
        success: true,
        calculated: false,
        reason: 'Questionnaire not completed - STRICT mode requirement not met'
      }
    }

    // Check STRICT mode requirement: Self-assessment must exist
    const selfAssessment = await prisma.selfAssessment.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    if (!selfAssessment) {
      return {
        success: true,
        calculated: false,
        reason: 'Self-assessment not completed - STRICT mode requirement not met'
      }
    }

    // Fetch all data required for calculation
    const [sessions, pahmSessions, stageProgress, dailyNotes] = await Promise.all([
      prisma.session.findMany({
        where: { userId, status: 'completed' },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.pAHMSession.findMany({
        where: { userId },
        include: { session: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.userStageProgress.findMany({
        where: { userId }
      }),
      prisma.dailyNote.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 60 // Last 60 notes for mood average
      })
    ])

    // Calculate happiness score
    const result = calculateHappinessScore(
      questionnaire,
      selfAssessment,
      sessions,
      pahmSessions,
      stageProgress,
      dailyNotes
    )

    // Save to database
    const happinessScore = await prisma.happinessScore.create({
      data: {
        userId,
        currentStateScore: result.components.currentStateScore,
        attachmentScore: result.components.attachmentScore,
        pahmScore: result.components.pahmScore,
        emotionalStabilityScore: result.components.emotionalStabilityScore,
        mindRecoveryScore: result.components.mindRecoveryScore,
        emotionalRegulationScore: result.components.emotionalRegulationScore,
        practiceConsistencyScore: result.components.practiceConsistencyScore,
        socialConnectionScore: result.components.socialConnectionScore,
        finalScore: result.finalScore,
        userLevel: result.userLevel,
        questionnaireBased: true,
        selfAssessmentBased: true,
        practiceEnhanced: sessions.length > 0
      }
    })

    console.log(`✅ Happiness score auto-calculated for user ${userId} (trigger: ${triggerSource})`)

    return {
      success: true,
      calculated: true,
      happinessScoreId: happinessScore.id,
      finalScore: Number(happinessScore.finalScore),
      userLevel: happinessScore.userLevel
    }

  } catch (error) {
    console.error(`❌ Failed to auto-calculate happiness score for user ${userId}:`, error)
    return {
      success: false,
      calculated: false,
      reason: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Check if user meets STRICT mode requirements for happiness calculation
 * 
 * @param userId - User ID to check
 * @returns Boolean indicating if requirements are met
 */
export async function canCalculateHappinessScore(userId: string): Promise<{
  canCalculate: boolean
  questionnaireDone: boolean
  selfAssessmentDone: boolean
}> {
  const [questionnaire, selfAssessment] = await Promise.all([
    prisma.questionnaire.findUnique({
      where: { userId },
      select: { isCompleted: true }
    }),
    prisma.selfAssessment.findFirst({
      where: { userId },
      select: { id: true }
    })
  ])

  const questionnaireDone = !!(questionnaire?.isCompleted)
  const selfAssessmentDone = !!selfAssessment

  return {
    canCalculate: questionnaireDone && selfAssessmentDone,
    questionnaireDone,
    selfAssessmentDone
  }
}
