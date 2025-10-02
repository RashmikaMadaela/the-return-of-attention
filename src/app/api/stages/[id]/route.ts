import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: stageId } = await params;

    // Validate CUID format
    if (!stageId || stageId.length < 20) {
      return NextResponse.json(
        { success: false, error: 'Invalid stage ID format' },
        { status: 400 }
      );
    }

    // Get stage with user progress and session history
    const stage = await prisma.stage.findUnique({
      where: { id: stageId },
      include: {
        userProgress: {
          where: { userId: session.user.id },
          select: {
            id: true,
            subStage: true,
            sessionsCompleted: true,
            hoursCompleted: true,
            isCompleted: true,
            completedAt: true,
            createdAt: true,
            updatedAt: true
          }
        },
        sessions: {
          where: { userId: session.user.id },
          include: {
            pahmSession: {
              select: {
                id: true,
                totalClicks: true,
                exerciseType: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 20 // Last 20 sessions for this stage
        }
      }
    });

    if (!stage) {
      return NextResponse.json(
        { success: false, error: 'Stage not found' },
        { status: 404 }
      );
    }

    // Check if stage is unlocked
    let isUnlocked = stage.stageNumber === 1;
    if (stage.stageNumber > 1) {
      const previousStageCompleted = await prisma.userStageProgress.findFirst({
        where: {
          userId: session.user.id,
          stageNumber: stage.stageNumber - 1,
          isCompleted: true
        }
      });
      isUnlocked = !!previousStageCompleted;
    }

    // Process sub-stages if they exist
    let subStagesProgress = null;
    if (stage.hasSubStages && stage.subStages) {
      const subStagesArray = Array.isArray(stage.subStages) ? stage.subStages : [];
      subStagesProgress = subStagesArray.map((subStage: any) => {
        const progress = stage.userProgress.find(p => p.subStage === subStage.id);
        const subStageSessions = stage.sessions.filter(s => s.subStage === subStage.id);
        
        return {
          id: subStage.id,
          name: subStage.name,
          description: subStage.description,
          minSessions: subStage.minSessions,
          minHours: subStage.minHours,
          isUnlocked: subStage.id === 'T1' || // T1 is always unlocked
            (subStage.id !== 'T1' && stage.userProgress.some(p => 
              p.subStage === getPreviousSubStage(subStage.id) && p.isCompleted
            )),
          progress: progress ? {
            sessionsCompleted: progress.sessionsCompleted,
            hoursCompleted: progress.hoursCompleted.toNumber(),
            isCompleted: progress.isCompleted,
            completedAt: progress.completedAt,
            progressPercentage: Math.min(100, Math.round(
              (progress.sessionsCompleted / subStage.minSessions) * 100
            ))
          } : {
            sessionsCompleted: 0,
            hoursCompleted: 0,
            isCompleted: false,
            completedAt: null,
            progressPercentage: 0
          },
          sessions: subStageSessions.map(s => ({
            id: s.id,
            sessionType: s.sessionType,
            duration: s.duration,
            status: s.status,
            qualityRating: s.qualityRating,
            startedAt: s.startedAt,
            completedAt: s.completedAt,
            pahmSession: s.pahmSession
          }))
        };
      });
    }

    // Calculate overall stage progress
    let overallProgress = 0;
    let totalSessions = 0;
    let totalHours = 0;
    let isCompleted = false;
    let nextAvailableSubStage = null;

    if (stage.hasSubStages && subStagesProgress) {
      const completedSubStages = subStagesProgress.filter(s => s.progress.isCompleted).length;
      overallProgress = subStagesProgress.length > 0 ? 
        Math.round((completedSubStages / subStagesProgress.length) * 100) : 0;
      isCompleted = completedSubStages === subStagesProgress.length;
      
      totalSessions = subStagesProgress.reduce((sum, s) => sum + s.progress.sessionsCompleted, 0);
      totalHours = subStagesProgress.reduce((sum, s) => sum + s.progress.hoursCompleted, 0);
      
      // Find next available sub-stage
      nextAvailableSubStage = subStagesProgress.find(s => s.isUnlocked && !s.progress.isCompleted);
    } else {
      const stageProgress = stage.userProgress[0];
      if (stageProgress) {
        const sessionsProgress = Math.round((stageProgress.sessionsCompleted / stage.minSessions) * 100);
        const hoursProgress = Math.round((stageProgress.hoursCompleted.toNumber() / stage.minHours.toNumber()) * 100);
        overallProgress = Math.min(100, Math.max(sessionsProgress, hoursProgress));
        totalSessions = stageProgress.sessionsCompleted;
        totalHours = stageProgress.hoursCompleted.toNumber();
        isCompleted = stageProgress.isCompleted;
      }
    }

    // Get recommendations for this stage
    const recommendations = generateStageRecommendations(stage, overallProgress, totalSessions);

    // Format session history
    const sessionHistory = stage.sessions.map(session => ({
      id: session.id,
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
      pahmSession: session.pahmSession
    }));

    return NextResponse.json({
      success: true,
      stage: {
        id: stage.id,
        stageNumber: stage.stageNumber,
        name: stage.name,
        description: stage.description,
        sessionType: stage.sessionType,
        minSessions: stage.minSessions,
        minHours: stage.minHours.toNumber(),
        hasSubStages: stage.hasSubStages,
        isActive: stage.isActive,
        isUnlocked,
        isCompleted,
        createdAt: stage.createdAt,
        updatedAt: stage.updatedAt
      },
      progress: {
        overallProgress,
        sessionsCompleted: totalSessions,
        hoursCompleted: Math.round(totalHours * 100) / 100,
        sessionsRemaining: Math.max(0, stage.minSessions - totalSessions),
        hoursRemaining: Math.max(0, Math.round((stage.minHours.toNumber() - totalHours) * 100) / 100),
        canStartNewSession: isUnlocked && !isCompleted
      },
      subStages: subStagesProgress,
      nextSubStage: nextAvailableSubStage,
      sessionHistory,
      recommendations,
      navigationInfo: {
        previousStage: stage.stageNumber > 1 ? stage.stageNumber - 1 : null,
        nextStage: stage.stageNumber < 6 ? stage.stageNumber + 1 : null,
        canNavigateNext: isCompleted,
        totalStages: 6
      }
    });

  } catch (error) {
    console.error('Individual stage error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get previous sub-stage
function getPreviousSubStage(currentSubStage: string): string {
  const subStageOrder = ['T1', 'T2', 'T3', 'T4', 'T5'];
  const currentIndex = subStageOrder.indexOf(currentSubStage);
  return currentIndex > 0 ? subStageOrder[currentIndex - 1] : '';
}

// Helper function to generate stage recommendations
function generateStageRecommendations(stage: any, progress: number, sessions: number): string[] {
  const recommendations = [];
  
  if (progress === 0) {
    recommendations.push(`Start your ${stage.name} journey with your first session`);
  } else if (progress < 25) {
    recommendations.push('You\'re just getting started - consistency is key');
  } else if (progress < 50) {
    recommendations.push('Great progress! Keep building your practice');
  } else if (progress < 75) {
    recommendations.push('You\'re more than halfway there - maintain momentum');
  } else if (progress < 100) {
    recommendations.push('Almost complete! Finish strong to unlock the next stage');
  } else {
    recommendations.push('Stage completed! Ready to move to the next level');
  }

  if (stage.sessionType === 'timer_only') {
    recommendations.push('Focus on physical stillness and breath awareness');
  } else if (stage.sessionType === 'pahm_matrix') {
    recommendations.push('Use the PAHM matrix to track your attention patterns');
  }

  if (sessions > 0 && sessions % 10 === 0) {
    recommendations.push('Consider reviewing your session insights for patterns');
  }

  return recommendations;
}