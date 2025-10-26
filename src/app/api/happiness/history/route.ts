import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/happiness/history
 * Retrieve complete happiness score history with detailed breakdown
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const includeDetails = searchParams.get('includeDetails') === 'true';

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Retrieve happiness scores
    const happinessScores = await prisma.happinessScore.findMany({
      where: {
        userId: user.id,
        ...(Object.keys(dateFilter).length > 0 && { calculatedAt: dateFilter })
      },
      orderBy: { calculatedAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        finalScore: true,
        userLevel: true,
        currentStateScore: true,
        attachmentScore: true,
        pahmScore: true,
        emotionalStabilityScore: true,
        mindRecoveryScore: true,
        emotionalRegulationScore: true,
        practiceConsistencyScore: true,
        socialConnectionScore: true,
        questionnaireBased: true,
        selfAssessmentBased: true,
        practiceEnhanced: true,
        calculatedAt: true,
        ...(includeDetails && { 
          updatedAt: true
        })
      }
    });

    // Get total count for pagination
    const totalCount = await prisma.happinessScore.count({
      where: {
        userId: user.id,
        ...(Object.keys(dateFilter).length > 0 && { calculatedAt: dateFilter })
      }
    });

    // Calculate improvement over time
    let improvement = null;
    if (happinessScores.length >= 2) {
      const latest = Number(happinessScores[0].finalScore);
      const earliest = Number(happinessScores[happinessScores.length - 1].finalScore);
      improvement = {
        change: Number((latest - earliest).toFixed(1)),
        percentage: Number(((latest - earliest) / earliest * 100).toFixed(1)),
        direction: latest > earliest ? 'improving' : latest < earliest ? 'declining' : 'stable'
      };
    }

    // Calculate level progression
    const levelProgression = happinessScores.reduce((acc: Record<string, number>, score) => {
      acc[score.userLevel] = (acc[score.userLevel] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        scores: happinessScores.map(score => ({
          id: score.id,
          finalScore: Number(score.finalScore),
          userLevel: score.userLevel,
          components: {
            currentStateScore: Number(score.currentStateScore),
            attachmentScore: Number(score.attachmentScore),
            pahmScore: Number(score.pahmScore),
            emotionalStabilityScore: Number(score.emotionalStabilityScore),
            mindRecoveryScore: Number(score.mindRecoveryScore),
            emotionalRegulationScore: Number(score.emotionalRegulationScore),
            practiceConsistencyScore: Number(score.practiceConsistencyScore),
            socialConnectionScore: Number(score.socialConnectionScore)
          },
          calculationBasis: {
            questionnaireBased: score.questionnaireBased,
            selfAssessmentBased: score.selfAssessmentBased,
            practiceEnhanced: score.practiceEnhanced
          },
          calculatedAt: score.calculatedAt,
          ...(includeDetails && { updatedAt: score.updatedAt })
        })),
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        },
        analysis: {
          totalCalculations: totalCount,
          improvement,
          levelProgression,
          currentLevel: happinessScores.length > 0 ? happinessScores[0].userLevel : null,
          averageScore: happinessScores.length > 0 ? 
            Number((happinessScores.reduce((sum, score) => sum + Number(score.finalScore), 0) / happinessScores.length).toFixed(1)) : null
        }
      }
    });

  } catch (error) {
    console.error('Error retrieving happiness score history:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}