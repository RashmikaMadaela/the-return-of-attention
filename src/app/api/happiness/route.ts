import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/auth/middleware'
import { handleApiError, createSuccessResponse } from '@/lib/errors'
import { calculateHappinessScore } from '@/lib/business-logic'

/**
 * POST /api/happiness
 * Automatically calculate and save happiness score using PAHM methodology v3 STRICT mode
 * Requires both questionnaire AND self-assessment to be completed
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser(request)

    // STRICT MODE VALIDATION: Check that both questionnaire AND self-assessment exist
    const questionnaire = await prisma.questionnaire.findUnique({
      where: { userId: user.id }
    })

    if (!questionnaire || !questionnaire.isCompleted) {
      return NextResponse.json({
        success: false,
        message: 'Questionnaire must be completed before calculating happiness score (STRICT mode requirement)'
      }, { status: 400 })
    }

    // Get latest self-assessment
    const selfAssessment = await prisma.selfAssessment.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    if (!selfAssessment) {
      return NextResponse.json({
        success: false,
        message: 'Self-assessment must be completed before calculating happiness score (STRICT mode requirement)'
      }, { status: 400 })
    }

    // Fetch all required data for calculation
    const sessions = await prisma.session.findMany({
      where: { 
        userId: user.id,
        status: 'COMPLETED'
      },
      orderBy: { createdAt: 'desc' }
    })

    const pahmSessions = await prisma.pAHMSession.findMany({
      where: { userId: user.id },
      include: { session: true }, // Include parent session for duration and quality
      orderBy: { createdAt: 'desc' }
    })

    const stageProgress = await prisma.userStageProgress.findMany({
      where: { userId: user.id }
    })

    const dailyNotes = await prisma.dailyNote.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 60 // Last 60 notes for mood average
    })

    // Calculate happiness score using the v3 strict algorithm
    const result = calculateHappinessScore(
      questionnaire,
      selfAssessment,
      sessions,
      pahmSessions,
      stageProgress,
      dailyNotes
    )

    // Save happiness score to database
    const happinessScore = await prisma.happinessScore.create({
      data: {
        userId: user.id,
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

    return createSuccessResponse({
      id: happinessScore.id,
      finalScore: Number(happinessScore.finalScore),
      userLevel: happinessScore.userLevel,
      components: {
        currentStateScore: Number(happinessScore.currentStateScore),
        attachmentScore: Number(happinessScore.attachmentScore),
        pahmScore: Number(happinessScore.pahmScore),
        emotionalStabilityScore: Number(happinessScore.emotionalStabilityScore),
        mindRecoveryScore: Number(happinessScore.mindRecoveryScore),
        emotionalRegulationScore: Number(happinessScore.emotionalRegulationScore),
        practiceConsistencyScore: Number(happinessScore.practiceConsistencyScore),
        socialConnectionScore: Number(happinessScore.socialConnectionScore)
      },
      metadata: {
        questionnaireBased: happinessScore.questionnaireBased,
        selfAssessmentBased: happinessScore.selfAssessmentBased,
        practiceEnhanced: happinessScore.practiceEnhanced
      },
      calculatedAt: happinessScore.calculatedAt
    }, 'Happiness score calculated and saved successfully', 201)

  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * GET /api/happiness
 * Retrieve user's happiness score history with statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser(request)

    // Get query parameters
    const url = new URL(request.url)
    const days = parseInt(url.searchParams.get('days') || '30')
    const startDate = url.searchParams.get('start')
    const endDate = url.searchParams.get('end')

    // Build date filter
    let dateFilter: any = {}
    if (startDate || endDate) {
      dateFilter.calculatedAt = {}
      if (startDate) dateFilter.calculatedAt.gte = new Date(startDate)
      if (endDate) dateFilter.calculatedAt.lte = new Date(endDate)
    } else {
      // Default to last N days
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - days)
      dateFilter.calculatedAt = { gte: pastDate }
    }

    // Get happiness scores with new component names
    const scores = await prisma.happinessScore.findMany({
      where: {
        userId: user.id,
        ...dateFilter,
      },
      select: {
        id: true,
        currentStateScore: true,
        attachmentScore: true,
        pahmScore: true,
        emotionalStabilityScore: true,
        mindRecoveryScore: true,
        emotionalRegulationScore: true,
        practiceConsistencyScore: true,
        socialConnectionScore: true,
        finalScore: true,
        userLevel: true,
        questionnaireBased: true,
        selfAssessmentBased: true,
        practiceEnhanced: true,
        calculatedAt: true,
      },
      orderBy: {
        calculatedAt: 'desc'
      }
    })

    // Calculate statistics
    const stats = scores.length > 0 ? {
      totalCalculations: scores.length,
      averageFinalScore: Math.round((scores.reduce((sum, score) => sum + Number(score.finalScore), 0) / scores.length) * 10) / 10,
      highestScore: Math.max(...scores.map(s => Number(s.finalScore))),
      lowestScore: Math.min(...scores.map(s => Number(s.finalScore))),
      currentLevel: scores[0].userLevel,
      levelDistribution: scores.reduce((acc: Record<string, number>, score) => {
        acc[score.userLevel] = (acc[score.userLevel] || 0) + 1
        return acc
      }, {}),
      trend: scores.length >= 2 ? (() => {
        const latest = Number(scores[0].finalScore)
        const previous = Number(scores[1].finalScore)
        const diff = latest - previous
        return diff > 5 ? 'improving' : diff < -5 ? 'declining' : 'stable'
      })() : 'insufficient_data',
      componentAverages: {
        currentStateScore: Math.round((scores.reduce((sum, s) => sum + Number(s.currentStateScore), 0) / scores.length) * 10) / 10,
        attachmentScore: Math.round((scores.reduce((sum, s) => sum + Number(s.attachmentScore), 0) / scores.length) * 10) / 10,
        pahmScore: Math.round((scores.reduce((sum, s) => sum + Number(s.pahmScore), 0) / scores.length) * 10) / 10,
        emotionalStabilityScore: Math.round((scores.reduce((sum, s) => sum + Number(s.emotionalStabilityScore), 0) / scores.length) * 10) / 10,
        mindRecoveryScore: Math.round((scores.reduce((sum, s) => sum + Number(s.mindRecoveryScore), 0) / scores.length) * 10) / 10,
        emotionalRegulationScore: Math.round((scores.reduce((sum, s) => sum + Number(s.emotionalRegulationScore), 0) / scores.length) * 10) / 10,
        practiceConsistencyScore: Math.round((scores.reduce((sum, s) => sum + Number(s.practiceConsistencyScore), 0) / scores.length) * 10) / 10,
        socialConnectionScore: Math.round((scores.reduce((sum, s) => sum + Number(s.socialConnectionScore), 0) / scores.length) * 10) / 10,
      },
    } : null

    return createSuccessResponse({
      scores: scores.map(score => ({
        ...score,
        finalScore: Number(score.finalScore),
        currentStateScore: Number(score.currentStateScore),
        attachmentScore: Number(score.attachmentScore),
        pahmScore: Number(score.pahmScore),
        emotionalStabilityScore: Number(score.emotionalStabilityScore),
        mindRecoveryScore: Number(score.mindRecoveryScore),
        emotionalRegulationScore: Number(score.emotionalRegulationScore),
        practiceConsistencyScore: Number(score.practiceConsistencyScore),
        socialConnectionScore: Number(score.socialConnectionScore),
      })),
      statistics: stats,
      period: {
        days,
        startDate: startDate || null,
        endDate: endDate || null,
      }
    }, 'Happiness scores retrieved successfully')

  } catch (error) {
    return handleApiError(error)
  }
}
