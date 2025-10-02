import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/notes/trends
 * Analyze mood trends and patterns
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
    const period = searchParams.get('period') || '30'; // days
    const granularity = searchParams.get('granularity') || 'daily'; // daily, weekly, monthly

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get mood trends over time
    const moodTrends = await getMoodTrends(user.id, startDate, endDate, granularity);

    // Get emotion frequency
    const emotionFrequency = await prisma.dailyNote.groupBy({
      by: ['emotion'],
      where: {
        userId: user.id,
        emotion: { not: null },
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        emotion: true
      },
      _avg: {
        intensity: true
      },
      orderBy: {
        _count: {
          emotion: 'desc'
        }
      }
    });

    // Get trigger analysis
    const triggerAnalysis = await prisma.dailyNote.groupBy({
      by: ['trigger'],
      where: {
        userId: user.id,
        trigger: { not: null },
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        trigger: true
      },
      _avg: {
        moodRating: true,
        intensity: true
      },
      orderBy: {
        _count: {
          trigger: 'desc'
        }
      }
    });

    // Calculate pattern insights
    const insights = await calculateInsights(user.id, startDate, endDate);

    return NextResponse.json({
      success: true,
      data: {
        period: `${period} days`,
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        },
        moodTrends,
        emotionFrequency: emotionFrequency.map(item => ({
          emotion: item.emotion,
          count: item._count.emotion,
          averageIntensity: item._avg.intensity ? Number(item._avg.intensity.toFixed(1)) : null
        })),
        triggerAnalysis: triggerAnalysis.map(item => ({
          trigger: item.trigger,
          count: item._count.trigger,
          averageMoodRating: item._avg.moodRating ? Number(item._avg.moodRating.toFixed(1)) : null,
          averageIntensity: item._avg.intensity ? Number(item._avg.intensity.toFixed(1)) : null
        })),
        insights
      }
    });

  } catch (error) {
    console.error('Error analyzing mood trends:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to get mood trends based on granularity
 */
async function getMoodTrends(userId: string, startDate: Date, endDate: Date, granularity: string) {
  let dateFormat: string;
  let groupingQuery: string;

  switch (granularity) {
    case 'weekly':
      // Group by week
      dateFormat = 'YYYY-"W"WW';
      groupingQuery = `DATE_TRUNC('week', "createdAt")`;
      break;
    case 'monthly':
      // Group by month
      dateFormat = 'YYYY-MM';
      groupingQuery = `DATE_TRUNC('month', "createdAt")`;
      break;
    default:
      // Daily (default)
      dateFormat = 'YYYY-MM-DD';
      groupingQuery = `DATE_TRUNC('day', "createdAt")`;
  }

  // Use raw query for date grouping
  const trends = await prisma.$queryRaw`
    SELECT 
      ${groupingQuery} as period,
      AVG("moodRating")::numeric(3,1) as avg_mood_rating,
      AVG("intensity")::numeric(3,1) as avg_intensity,
      COUNT(*) as note_count
    FROM "daily_notes"
    WHERE "userId" = ${userId}
      AND ("moodRating" IS NOT NULL OR "intensity" IS NOT NULL)
      AND "createdAt" >= ${startDate}
      AND "createdAt" <= ${endDate}
    GROUP BY ${groupingQuery}
    ORDER BY period ASC
  ` as any[];

  return trends.map(trend => ({
    period: trend.period.toISOString().split('T')[0],
    averageMoodRating: trend.avg_mood_rating ? Number(trend.avg_mood_rating) : null,
    averageIntensity: trend.avg_intensity ? Number(trend.avg_intensity) : null,
    noteCount: Number(trend.note_count)
  }));
}

/**
 * Helper function to calculate insights and patterns
 */
async function calculateInsights(userId: string, startDate: Date, endDate: Date) {
  // Get overall statistics
  const stats = await prisma.dailyNote.aggregate({
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    _avg: {
      moodRating: true,
      intensity: true
    },
    _count: {
      id: true
    }
  });

  // Get best and worst days
  const bestDay = await prisma.dailyNote.findFirst({
    where: {
      userId,
      moodRating: { not: null },
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: {
      moodRating: 'desc'
    },
    select: {
      moodRating: true,
      emotion: true,
      context: true,
      createdAt: true
    }
  });

  const worstDay = await prisma.dailyNote.findFirst({
    where: {
      userId,
      moodRating: { not: null },
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: {
      moodRating: 'asc'
    },
    select: {
      moodRating: true,
      emotion: true,
      context: true,
      createdAt: true
    }
  });

  // Calculate mood stability (standard deviation)
  const moodRatings = await prisma.dailyNote.findMany({
    where: {
      userId,
      moodRating: { not: null },
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      moodRating: true
    }
  });

  let moodStability = null;
  if (moodRatings.length > 1) {
    const ratings = moodRatings.map(r => r.moodRating!);
    const mean = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    const variance = ratings.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / ratings.length;
    moodStability = Number(Math.sqrt(variance).toFixed(2));
  }

  return {
    totalNotes: stats._count.id,
    averageMoodRating: stats._avg.moodRating ? Number(stats._avg.moodRating.toFixed(1)) : null,
    averageIntensity: stats._avg.intensity ? Number(stats._avg.intensity.toFixed(1)) : null,
    moodStability, // Lower values indicate more stable mood
    bestDay: bestDay ? {
      date: bestDay.createdAt.toISOString().split('T')[0],
      moodRating: bestDay.moodRating,
      emotion: bestDay.emotion,
      context: bestDay.context
    } : null,
    worstDay: worstDay ? {
      date: worstDay.createdAt.toISOString().split('T')[0],
      moodRating: worstDay.moodRating,
      emotion: worstDay.emotion,
      context: worstDay.context
    } : null
  };
}