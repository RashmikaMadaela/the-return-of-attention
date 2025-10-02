import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

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

    // Get user's stage progress with stage details
    const stageProgress = await prisma.userStageProgress.findMany({
      where: { userId: session.user.id },
      include: {
        stage: {
          select: {
            id: true,
            stageNumber: true,
            name: true,
            description: true,
            minSessions: true,
            minHours: true,
            sessionType: true,
            hasSubStages: true,
            subStages: true
          }
        }
      },
      orderBy: { stageNumber: 'asc' }
    });

    // Get overall session statistics
    const sessionStats = await prisma.session.aggregate({
      where: { 
        userId: session.user.id,
        status: 'completed'
      },
      _count: { id: true },
      _sum: { duration: true },
      _avg: { qualityRating: true }
    });

    // Get current active session
    const activeSession = await prisma.session.findFirst({
      where: {
        userId: session.user.id,
        status: 'in_progress'
      },
      include: {
        stage: {
          select: {
            name: true,
            sessionType: true
          }
        },
        pahmSession: {
          select: {
            id: true,
            totalClicks: true,
            exerciseType: true
          }
        }
      }
    });

    // Get recent sessions for activity tracking
    const recentSessions = await prisma.session.findMany({
      where: {
        userId: session.user.id,
        status: 'completed'
      },
      select: {
        id: true,
        stageNumber: true,
        sessionType: true,
        duration: true,
        completedAt: true,
        qualityRating: true
      },
      orderBy: { completedAt: 'desc' },
      take: 10
    });

    // Calculate streak information
    const streak = await calculateStreak(session.user.id);

    // Get all stages for progress calculation
    const allStages = await prisma.stage.findMany({
      select: {
        id: true,
        stageNumber: true,
        name: true,
        minSessions: true,
        minHours: true,
        hasSubStages: true,
        subStages: true
      },
      orderBy: { stageNumber: 'asc' }
    });

    // Format progress data
    const formattedProgress = allStages.map(stage => {
      // For stages with sub-stages, get all sub-stage progress
      if (stage.hasSubStages && stage.subStages) {
        const subStagesArray = Array.isArray(stage.subStages) ? stage.subStages : [];
        const subStageProgress = subStagesArray.map((subStage: any) => {
          const progress = stageProgress.find(p => 
            p.stageId === stage.id && p.subStage === subStage.id
          );
          return {
            subStage: subStage.id,
            name: subStage.name,
            minSessions: subStage.minSessions,
            minHours: subStage.minHours,
            sessionsCompleted: progress?.sessionsCompleted || 0,
            hoursCompleted: progress?.hoursCompleted.toNumber() || 0,
            isCompleted: progress?.isCompleted || false,
            completedAt: progress?.completedAt,
            progressPercentage: Math.min(100, Math.round(
              ((progress?.sessionsCompleted || 0) / subStage.minSessions) * 100
            ))
          };
        });

        // Calculate overall stage progress
        const totalSubStages = subStagesArray.length;
        const completedSubStages = subStageProgress.filter(s => s.isCompleted).length;
        const overallProgress = totalSubStages > 0 ? Math.round((completedSubStages / totalSubStages) * 100) : 0;

        return {
          stageId: stage.id,
          stageNumber: stage.stageNumber,
          name: stage.name,
          minSessions: stage.minSessions,
          minHours: stage.minHours.toNumber(),
          hasSubStages: true,
          subStages: subStageProgress,
          overallProgress,
          isCompleted: completedSubStages === totalSubStages,
          isUnlocked: stage.stageNumber === 1 || 
            (stage.stageNumber > 1 && 
             allStages.some(s => s.stageNumber === stage.stageNumber - 1 && 
               stageProgress.find(p => p.stageId === s.id && p.isCompleted)))
        };
      } else {
        // Regular stage without sub-stages
        const progress = stageProgress.find(p => p.stageId === stage.id);
        const sessionsProgress = progress ? Math.round((progress.sessionsCompleted / stage.minSessions) * 100) : 0;
        const hoursProgress = progress ? Math.round((progress.hoursCompleted.toNumber() / stage.minHours.toNumber()) * 100) : 0;
        const overallProgress = Math.min(100, Math.max(sessionsProgress, hoursProgress));

        return {
          stageId: stage.id,
          stageNumber: stage.stageNumber,
          name: stage.name,
          minSessions: stage.minSessions,
          minHours: stage.minHours.toNumber(),
          sessionsCompleted: progress?.sessionsCompleted || 0,
          hoursCompleted: progress?.hoursCompleted.toNumber() || 0,
          hasSubStages: false,
          overallProgress,
          isCompleted: progress?.isCompleted || false,
          completedAt: progress?.completedAt,
          isUnlocked: stage.stageNumber === 1 || 
            (stage.stageNumber > 1 && 
             allStages.some(s => s.stageNumber === stage.stageNumber - 1 && 
               stageProgress.find(p => p.stageId === s.id && p.isCompleted)))
        };
      }
    });

    // Calculate overall journey progress
    const completedStages = formattedProgress.filter(s => s.isCompleted).length;
    const journeyProgress = Math.round((completedStages / allStages.length) * 100);

    return NextResponse.json({
      success: true,
      progress: {
        stages: formattedProgress,
        overall: {
          journeyProgress,
          completedStages,
          totalStages: allStages.length,
          currentStage: formattedProgress.find(s => !s.isCompleted && s.isUnlocked)?.stageNumber || 1
        },
        statistics: {
          totalSessions: sessionStats._count.id || 0,
          totalHours: sessionStats._sum.duration ? Math.round((sessionStats._sum.duration / 60) * 100) / 100 : 0,
          averageQuality: sessionStats._avg.qualityRating ? Math.round(sessionStats._avg.qualityRating * 100) / 100 : null,
          streak: streak
        },
        activeSession: activeSession ? {
          id: activeSession.id,
          stageNumber: activeSession.stageNumber,
          subStage: activeSession.subStage,
          sessionType: activeSession.sessionType,
          duration: activeSession.duration,
          startedAt: activeSession.startedAt,
          stage: activeSession.stage,
          pahmSession: activeSession.pahmSession
        } : null,
        recentActivity: recentSessions.map(session => ({
          id: session.id,
          stageNumber: session.stageNumber,
          sessionType: session.sessionType,
          duration: session.duration,
          completedAt: session.completedAt,
          qualityRating: session.qualityRating
        }))
      }
    });

  } catch (error) {
    console.error('Session progress error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate streak
async function calculateStreak(userId: string): Promise<number> {
  try {
    // Get sessions grouped by date (completed sessions only)
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        status: 'completed'
      },
      select: {
        completedAt: true
      },
      orderBy: { completedAt: 'desc' }
    });

    if (sessions.length === 0) return 0;

    // Group sessions by date
    const sessionDates = sessions
      .map(session => {
        if (!session.completedAt) return null;
        return session.completedAt.toISOString().split('T')[0];
      })
      .filter(date => date !== null)
      .filter((date, index, array) => array.indexOf(date) === index); // Remove duplicates

    if (sessionDates.length === 0) return 0;

    // Calculate streak from most recent date
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Start counting from today or yesterday
    let currentDate = sessionDates.includes(today) ? today : 
                     sessionDates.includes(yesterday) ? yesterday : null;

    if (!currentDate) return 0;

    // Count consecutive days backwards
    for (let i = 0; i < sessionDates.length; i++) {
      if (sessionDates[i] === currentDate) {
        streak++;
        // Move to previous day
        const prevDate: Date = new Date(currentDate);
        prevDate.setDate(prevDate.getDate() - 1);
        currentDate = prevDate.toISOString().split('T')[0];
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Streak calculation error:', error);
    return 0;
  }
}