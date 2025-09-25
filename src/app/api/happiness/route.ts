import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Happiness score calculation schema (PAHM system)
const HappinessCalculationSchema = z.object({
  currentStateScore: z.number().min(0).max(100),
  attachmentScore: z.number().min(0).max(100),
  pahmScore: z.number().min(0).max(100),
  practiceScore: z.number().min(0).max(100),
  progressScore: z.number().min(0).max(100),
  consistencyScore: z.number().min(0).max(100),
  reflectionScore: z.number().min(0).max(100),
  dailyLifeScore: z.number().min(0).max(100),
  questionnaireBased: z.boolean().default(false),
  selfAssessmentBased: z.boolean().default(false),
  practiceEnhanced: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Validate happiness score data
    const validatedData = HappinessCalculationSchema.parse(body);

    // Calculate final score using PAHM weighted system
    const calculateFinalScore = (data: typeof validatedData) => {
      const weights = {
        currentStateScore: 0.12,   // 12%
        attachmentScore: 0.20,     // 20%
        pahmScore: 0.25,          // 25%
        practiceScore: 0.15,      // 15%
        progressScore: 0.10,      // 10%
        consistencyScore: 0.08,   // 8%
        reflectionScore: 0.05,    // 5%
        dailyLifeScore: 0.05,     // 5%
      };

      return (
        data.currentStateScore * weights.currentStateScore +
        data.attachmentScore * weights.attachmentScore +
        data.pahmScore * weights.pahmScore +
        data.practiceScore * weights.practiceScore +
        data.progressScore * weights.progressScore +
        data.consistencyScore * weights.consistencyScore +
        data.reflectionScore * weights.reflectionScore +
        data.dailyLifeScore * weights.dailyLifeScore
      );
    };

    const finalScore = calculateFinalScore(validatedData);

    // Determine user level based on final score
    const getUserLevel = (score: number) => {
      if (score >= 90) return 'Liberation Master';
      if (score >= 80) return 'Advanced Practitioner';
      if (score >= 70) return 'PAHM Expert';
      if (score >= 60) return 'PAHM Intermediate';
      if (score >= 50) return 'PAHM Beginner';
      if (score >= 40) return 'PAHM Trainee';
      if (score >= 30) return 'Aware Seeker';
      return 'Seeker';
    };

    const userLevel = getUserLevel(finalScore);

    // Create happiness score record
    const happinessScore = await prisma.happinessScore.create({
      data: {
        userId: session.user.id,
        currentStateScore: validatedData.currentStateScore,
        attachmentScore: validatedData.attachmentScore,
        pahmScore: validatedData.pahmScore,
        practiceScore: validatedData.practiceScore,
        progressScore: validatedData.progressScore,
        consistencyScore: validatedData.consistencyScore,
        reflectionScore: validatedData.reflectionScore,
        dailyLifeScore: validatedData.dailyLifeScore,
        finalScore,
        userLevel,
        questionnaireBased: validatedData.questionnaireBased,
        selfAssessmentBased: validatedData.selfAssessmentBased,
        practiceEnhanced: validatedData.practiceEnhanced,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Happiness score calculated and saved successfully',
      data: {
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
          dailyLifeScore: Number(happinessScore.dailyLifeScore),
        },
        calculatedAt: happinessScore.calculatedAt,
      }
    });

  } catch (error) {
    console.error('Happiness score calculation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid happiness score data',
          details: error.issues 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

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
        userId: session.user.id,
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

    return NextResponse.json({
      success: true,
      data: {
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
      }
    });

  } catch (error) {
    console.error('Get happiness scores error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}