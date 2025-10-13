import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { happinessCalculationSchema, validateRequestBody } from '@/lib/validation'
import { getAuthenticatedUser } from '@/lib/auth/middleware'
import { handleApiError, createSuccessResponse } from '@/lib/errors'
import { calculateHappinessScore } from '@/lib/business-logic'

/**
 * POST /api/happiness
 * Calculate and save happiness score using PAHM methodology
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser(request)

    // Validate request body
    const body = await request.json()
    const validation = validateRequestBody(happinessCalculationSchema, body)
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      }, { status: 400 })
    }

    // Calculate final score using PAHM weighted system
    const finalScore = (
      validation.data.currentStateScore * 0.12 +
      validation.data.attachmentScore * 0.20 +
      validation.data.pahmScore * 0.25 +
      validation.data.practiceScore * 0.15 +
      validation.data.progressScore * 0.10 +
      validation.data.consistencyScore * 0.08 +
      validation.data.reflectionScore * 0.05 +
      validation.data.dailyLifeScore * 0.05
    )

    // Determine user level based on final score
    const getUserLevel = (score: number) => {
      if (score >= 90) return 'Liberation Master'
      if (score >= 80) return 'Advanced Practitioner'
      if (score >= 70) return 'PAHM Expert'
      if (score >= 60) return 'PAHM Intermediate'
      if (score >= 50) return 'PAHM Beginner'
      if (score >= 40) return 'PAHM Trainee'
      if (score >= 30) return 'Aware Seeker'
      return 'Seeker'
    }

    const userLevel = getUserLevel(finalScore)

    // Create happiness score record
    const happinessScore = await prisma.happinessScore.create({
      data: {
        userId: user.id,
        ...validation.data,
        finalScore,
        userLevel
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
        practiceScore: Number(happinessScore.practiceScore),
        progressScore: Number(happinessScore.progressScore),
        consistencyScore: Number(happinessScore.consistencyScore),
        reflectionScore: Number(happinessScore.reflectionScore),
        dailyLifeScore: Number(happinessScore.dailyLifeScore)
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
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '30');
    const startDate = url.searchParams.get('start');
    const endDate = url.searchParams.get('end');

    // Build date filter
    let dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.calculatedAt = {};
      if (startDate) dateFilter.calculatedAt.gte = new Date(startDate);
      if (endDate) dateFilter.calculatedAt.lte = new Date(endDate);
    } else {
      // Default to last N days
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - days);
      dateFilter.calculatedAt = { gte: pastDate };
    }

    // Get happiness scores
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
        practiceScore: true,
        progressScore: true,
        consistencyScore: true,
        reflectionScore: true,
        dailyLifeScore: true,
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
    });

    // Calculate statistics
    const stats = scores.length > 0 ? {
      totalCalculations: scores.length,
      averageFinalScore: Math.round((scores.reduce((sum: number, score) => sum + Number(score.finalScore), 0) / scores.length) * 10) / 10,
      highestScore: Math.max(...scores.map(s => Number(s.finalScore))),
      lowestScore: Math.min(...scores.map(s => Number(s.finalScore))),
      currentLevel: scores[0].userLevel,
      levelDistribution: scores.reduce((acc: Record<string, number>, score) => {
        acc[score.userLevel] = (acc[score.userLevel] || 0) + 1;
        return acc;
      }, {}),
      trend: scores.length >= 2 ? (() => {
        const latest = Number(scores[0].finalScore);
        const previous = Number(scores[1].finalScore);
        const diff = latest - previous;
        return diff > 5 ? 'improving' : diff < -5 ? 'declining' : 'stable';
      })() : 'insufficient_data',
      componentAverages: {
        currentStateScore: Math.round((scores.reduce((sum: number, s) => sum + Number(s.currentStateScore), 0) / scores.length) * 10) / 10,
        attachmentScore: Math.round((scores.reduce((sum: number, s) => sum + Number(s.attachmentScore), 0) / scores.length) * 10) / 10,
        pahmScore: Math.round((scores.reduce((sum: number, s) => sum + Number(s.pahmScore), 0) / scores.length) * 10) / 10,
        practiceScore: Math.round((scores.reduce((sum: number, s) => sum + Number(s.practiceScore), 0) / scores.length) * 10) / 10,
        progressScore: Math.round((scores.reduce((sum: number, s) => sum + Number(s.progressScore), 0) / scores.length) * 10) / 10,
        consistencyScore: Math.round((scores.reduce((sum: number, s) => sum + Number(s.consistencyScore), 0) / scores.length) * 10) / 10,
        reflectionScore: Math.round((scores.reduce((sum: number, s) => sum + Number(s.reflectionScore), 0) / scores.length) * 10) / 10,
        dailyLifeScore: Math.round((scores.reduce((sum: number, s) => sum + Number(s.dailyLifeScore), 0) / scores.length) * 10) / 10,
      },
    } : null;

    return createSuccessResponse({
      scores: scores.map(score => ({
        ...score,
        finalScore: Number(score.finalScore),
        currentStateScore: Number(score.currentStateScore),
        attachmentScore: Number(score.attachmentScore),
        pahmScore: Number(score.pahmScore),
        practiceScore: Number(score.practiceScore),
        progressScore: Number(score.progressScore),
        consistencyScore: Number(score.consistencyScore),
        reflectionScore: Number(score.reflectionScore),
        dailyLifeScore: Number(score.dailyLifeScore),
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