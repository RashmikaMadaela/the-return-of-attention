import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/happiness/trends
 * Analyze happiness score trends over time
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
    const period = parseInt(searchParams.get('period') || '90'); // days
    const granularity = searchParams.get('granularity') || 'weekly'; // daily, weekly, monthly
    const includeComponents = searchParams.get('includeComponents') === 'true';

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    // Get happiness scores within the period
    const happinessScores = await prisma.happinessScore.findMany({
      where: {
        userId: user.id,
        calculatedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        calculatedAt: 'asc'
      },
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
        calculatedAt: true
      }
    });

    if (happinessScores.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          period: `${period} days`,
          granularity,
          dateRange: {
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0]
          },
          trends: [],
          analysis: {
            totalScores: 0,
            trend: 'no_data',
            message: 'No happiness scores found in the specified period'
          }
        }
      });
    }

    // Group scores by time period
    const groupedScores = groupScoresByPeriod(happinessScores, granularity);

    // Calculate trend analysis
    const trendAnalysis = calculateTrendAnalysis(happinessScores);

    // Component trend analysis (if requested)
    let componentTrends = null;
    if (includeComponents) {
      componentTrends = calculateComponentTrends(happinessScores);
    }

    // Level progression analysis
    const levelProgression = analyzeLevelProgression(happinessScores);

    // Calculate volatility (score stability)
    const volatility = calculateVolatility(happinessScores);

    return NextResponse.json({
      success: true,
      data: {
        period: `${period} days`,
        granularity,
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        },
        trends: groupedScores,
        analysis: {
          totalScores: happinessScores.length,
          ...trendAnalysis,
          volatility,
          levelProgression
        },
        ...(componentTrends && { componentTrends })
      }
    });

  } catch (error) {
    console.error('Error analyzing happiness trends:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to group scores by time period
 */
function groupScoresByPeriod(scores: any[], granularity: string) {
  const groups: Record<string, any[]> = {};

  scores.forEach(score => {
    let periodKey: string;
    const date = new Date(score.calculatedAt);

    switch (granularity) {
      case 'daily':
        periodKey = date.toISOString().split('T')[0];
        break;
      case 'monthly':
        periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default: // weekly
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        periodKey = weekStart.toISOString().split('T')[0];
    }

    if (!groups[periodKey]) {
      groups[periodKey] = [];
    }
    groups[periodKey].push(score);
  });

  // Calculate averages for each period
  return Object.entries(groups)
    .map(([period, periodScores]) => ({
      period,
      count: periodScores.length,
      averageScore: Number((periodScores.reduce((sum, s) => sum + Number(s.finalScore), 0) / periodScores.length).toFixed(1)),
      highestScore: Math.max(...periodScores.map(s => Number(s.finalScore))),
      lowestScore: Math.min(...periodScores.map(s => Number(s.finalScore))),
      mostCommonLevel: getMostCommonLevel(periodScores),
      scores: periodScores.map(s => ({
        id: s.id,
        finalScore: Number(s.finalScore),
        userLevel: s.userLevel,
        calculatedAt: s.calculatedAt
      }))
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * Helper function to calculate overall trend analysis
 */
function calculateTrendAnalysis(scores: any[]) {
  if (scores.length < 2) {
    return {
      trend: 'insufficient_data',
      change: 0,
      percentage: 0,
      message: 'Need at least 2 scores to analyze trends'
    };
  }

  const firstScore = Number(scores[0].finalScore);
  const lastScore = Number(scores[scores.length - 1].finalScore);
  const change = Number((lastScore - firstScore).toFixed(1));
  const percentage = Number(((change / firstScore) * 100).toFixed(1));

  let trend: string;
  let message: string;

  if (change > 5) {
    trend = 'improving';
    message = `Your happiness score has improved by ${change} points (${percentage}%)`;
  } else if (change < -5) {
    trend = 'declining';
    message = `Your happiness score has decreased by ${Math.abs(change)} points (${Math.abs(percentage)}%)`;
  } else {
    trend = 'stable';
    message = `Your happiness score has remained relatively stable (${change > 0 ? '+' : ''}${change} points)`;
  }

  // Calculate growth rate
  const timeSpan = (new Date(scores[scores.length - 1].calculatedAt).getTime() - 
                   new Date(scores[0].calculatedAt).getTime()) / (1000 * 60 * 60 * 24); // days
  const growthRate = timeSpan > 0 ? Number((change / timeSpan).toFixed(2)) : 0;

  return {
    trend,
    change,
    percentage,
    message,
    growthRate: `${growthRate} points/day`,
    firstScore,
    lastScore,
    peak: Math.max(...scores.map(s => Number(s.finalScore))),
    lowest: Math.min(...scores.map(s => Number(s.finalScore)))
  };
}

/**
 * Helper function to calculate component trends
 */
function calculateComponentTrends(scores: any[]) {
  if (scores.length < 2) return null;

  const components = [
    'currentStateScore', 'attachmentScore', 'pahmScore', 'emotionalStabilityScore',
    'mindRecoveryScore', 'emotionalRegulationScore', 'practiceConsistencyScore', 'socialConnectionScore'
  ];

  return components.reduce((trends, component) => {
    const firstValue = Number(scores[0][component]);
    const lastValue = Number(scores[scores.length - 1][component]);
    const change = Number((lastValue - firstValue).toFixed(1));
    const percentage = Number(((change / firstValue) * 100).toFixed(1));

    trends[component] = {
      change,
      percentage,
      trend: change > 2 ? 'improving' : change < -2 ? 'declining' : 'stable',
      firstValue,
      lastValue,
      average: Number((scores.reduce((sum, s) => sum + Number(s[component]), 0) / scores.length).toFixed(1))
    };

    return trends;
  }, {} as Record<string, any>);
}

/**
 * Helper function to analyze level progression
 */
function analyzeLevelProgression(scores: any[]) {
  const levelCounts = scores.reduce((acc, score) => {
    acc[score.userLevel] = (acc[score.userLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueLevels = Array.from(new Set(scores.map(s => s.userLevel)));
  const hasProgressed = uniqueLevels.length > 1;

  return {
    currentLevel: scores[scores.length - 1].userLevel,
    levelsAchieved: uniqueLevels,
    levelDistribution: levelCounts,
    hasProgressed,
    progressionPath: hasProgressed ? scores.map(s => ({
      level: s.userLevel,
      date: s.calculatedAt.toISOString().split('T')[0]
    })) : null
  };
}

/**
 * Helper function to calculate volatility (score stability)
 */
function calculateVolatility(scores: any[]) {
  if (scores.length < 2) return null;

  const finalScores = scores.map(s => Number(s.finalScore));
  const mean = finalScores.reduce((a, b) => a + b, 0) / finalScores.length;
  const variance = finalScores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / finalScores.length;
  const standardDeviation = Math.sqrt(variance);

  let stability: string;
  if (standardDeviation < 5) {
    stability = 'very_stable';
  } else if (standardDeviation < 10) {
    stability = 'stable';
  } else if (standardDeviation < 15) {
    stability = 'moderate';
  } else {
    stability = 'volatile';
  }

  return {
    standardDeviation: Number(standardDeviation.toFixed(2)),
    stability,
    message: `Your happiness scores show ${stability.replace('_', ' ')} patterns`
  };
}

/**
 * Helper function to find most common level in a period
 */
function getMostCommonLevel(scores: any[]) {
  const levelCounts = scores.reduce((acc, score) => {
    acc[score.userLevel] = (acc[score.userLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(levelCounts).reduce((a, b) => 
    levelCounts[a[0]] > levelCounts[b[0]] ? a : b
  )[0];
}