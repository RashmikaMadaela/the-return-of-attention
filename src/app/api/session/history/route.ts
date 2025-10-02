import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Validation schema for query parameters
const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  stageNumber: z.coerce.number().int().min(1).max(6).optional(),
  sessionType: z.enum(['timer_only', 'pahm_matrix', 'mind_recovery']).optional(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'abandoned']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const validatedQuery = querySchema.parse(queryParams);

    // Build filter conditions
    const where: any = {
      userId: session.user.id,
    };

    if (validatedQuery.stageNumber) {
      where.stageNumber = validatedQuery.stageNumber;
    }

    if (validatedQuery.sessionType) {
      where.sessionType = validatedQuery.sessionType;
    }

    if (validatedQuery.status) {
      where.status = validatedQuery.status;
    }

    if (validatedQuery.dateFrom || validatedQuery.dateTo) {
      where.createdAt = {};
      if (validatedQuery.dateFrom) {
        where.createdAt.gte = new Date(validatedQuery.dateFrom);
      }
      if (validatedQuery.dateTo) {
        where.createdAt.lte = new Date(validatedQuery.dateTo);
      }
    }

    // Calculate pagination
    const skip = (validatedQuery.page - 1) * validatedQuery.limit;

    // Get total count for pagination
    const totalCount = await prisma.session.count({ where });

    // Fetch sessions with related data
    const sessions = await prisma.session.findMany({
      where,
      include: {
        stage: {
          select: {
            name: true,
            description: true,
            sessionType: true
          }
        },
        pahmSession: {
          select: {
            id: true,
            totalClicks: true,
            exerciseType: true,
            regretClicks: true,
            pastClicks: true,
            nostalgiaClicks: true,
            dislikesClicks: true,
            presentClicks: true,
            likesClicks: true,
            worryClicks: true,
            futureClicks: true,
            anticipationClicks: true,
            patternNotes: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: validatedQuery.limit
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / validatedQuery.limit);
    const hasNextPage = validatedQuery.page < totalPages;
    const hasPrevPage = validatedQuery.page > 1;

    // Format session data
    const formattedSessions = sessions.map(session => ({
      id: session.id,
      stageNumber: session.stageNumber,
      subStage: session.subStage,
      sessionType: session.sessionType,
      duration: session.duration,
      status: session.status,
      posture: session.posture,
      qualityRating: session.qualityRating,
      insights: session.insights,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      stage: session.stage,
      pahmSession: session.pahmSession ? {
        id: session.pahmSession.id,
        totalClicks: session.pahmSession.totalClicks,
        exerciseType: session.pahmSession.exerciseType,
        patternNotes: session.pahmSession.patternNotes,
        clickBreakdown: {
          regret: session.pahmSession.regretClicks,
          past: session.pahmSession.pastClicks,
          nostalgia: session.pahmSession.nostalgiaClicks,
          dislikes: session.pahmSession.dislikesClicks,
          present: session.pahmSession.presentClicks,
          likes: session.pahmSession.likesClicks,
          worry: session.pahmSession.worryClicks,
          future: session.pahmSession.futureClicks,
          anticipation: session.pahmSession.anticipationClicks,
        }
      } : null
    }));

    // Calculate session statistics
    const stats = await prisma.session.aggregate({
      where: { userId: session.user.id, status: 'completed' },
      _count: { id: true },
      _sum: { duration: true },
      _avg: { qualityRating: true }
    });

    return NextResponse.json({
      success: true,
      sessions: formattedSessions,
      pagination: {
        currentPage: validatedQuery.page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit: validatedQuery.limit
      },
      statistics: {
        totalSessions: stats._count.id || 0,
        totalHours: stats._sum.duration ? Math.round((stats._sum.duration / 60) * 100) / 100 : 0,
        averageQuality: stats._avg.qualityRating ? Math.round(stats._avg.qualityRating * 100) / 100 : null
      },
      filters: {
        stageNumber: validatedQuery.stageNumber,
        sessionType: validatedQuery.sessionType,
        status: validatedQuery.status,
        dateFrom: validatedQuery.dateFrom,
        dateTo: validatedQuery.dateTo
      }
    });

  } catch (error) {
    console.error('Session history error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid query parameters',
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