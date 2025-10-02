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

    // Get all stages with user progress
    const stagesWithProgress = await prisma.stage.findMany({
      include: {
        userProgress: {
          where: { userId: session.user.id },
          select: {
            id: true,
            subStage: true,
            sessionsCompleted: true,
            hoursCompleted: true,
            isCompleted: true,
            completedAt: true
          }
        },
        sessions: {
          where: { userId: session.user.id },
          select: {
            id: true,
            status: true,
            completedAt: true
          }
        }
      },
      orderBy: { stageNumber: 'asc' }
    });

    // Check which stages are unlocked
    const formattedStages = stagesWithProgress.map((stage, index) => {
      // Stage 1 is always unlocked
      let isUnlocked = stage.stageNumber === 1;
      
      // For other stages, check if previous stage is completed
      if (stage.stageNumber > 1) {
        const previousStage = stagesWithProgress.find(s => s.stageNumber === stage.stageNumber - 1);
        if (previousStage) {
          const previousStageProgress = previousStage.userProgress.find(p => 
            !p.subStage || p.subStage === '' // Main stage completion (or last sub-stage for Stage 1)
          );
          isUnlocked = previousStageProgress?.isCompleted || false;
          
          // For Stage 1 with sub-stages, check if all sub-stages are completed
          if (previousStage.hasSubStages && previousStage.subStages) {
            const subStagesArray = Array.isArray(previousStage.subStages) ? previousStage.subStages : [];
            const allSubStagesCompleted = subStagesArray.every((subStage: any) => 
              previousStage.userProgress.some(p => p.subStage === subStage.id && p.isCompleted)
            );
            isUnlocked = allSubStagesCompleted;
          }
        }
      }

      // Calculate overall progress for this stage
      let overallProgress = 0;
      let totalSessions = 0;
      let totalHours = 0;
      let isCompleted = false;
      let completedAt = null;

      if (stage.hasSubStages && stage.subStages) {
        // Handle sub-stages
        const subStagesArray = Array.isArray(stage.subStages) ? stage.subStages : [];
        const completedSubStages = subStagesArray.filter((subStage: any) =>
          stage.userProgress.some(p => p.subStage === subStage.id && p.isCompleted)
        ).length;
        
        overallProgress = subStagesArray.length > 0 ? Math.round((completedSubStages / subStagesArray.length) * 100) : 0;
        isCompleted = completedSubStages === subStagesArray.length;
        
        // Sum up sessions and hours from all sub-stages
        totalSessions = stage.userProgress.reduce((sum, p) => sum + p.sessionsCompleted, 0);
        totalHours = stage.userProgress.reduce((sum, p) => sum + p.hoursCompleted.toNumber(), 0);
        
        // Get completion date of last sub-stage
        const lastCompletedSubStage = stage.userProgress
          .filter(p => p.isCompleted && p.completedAt)
          .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0];
        completedAt = lastCompletedSubStage?.completedAt || null;
      } else {
        // Handle regular stages
        const stageProgress = stage.userProgress[0];
        if (stageProgress) {
          const sessionsProgress = Math.round((stageProgress.sessionsCompleted / stage.minSessions) * 100);
          const hoursProgress = Math.round((stageProgress.hoursCompleted.toNumber() / stage.minHours.toNumber()) * 100);
          overallProgress = Math.min(100, Math.max(sessionsProgress, hoursProgress));
          totalSessions = stageProgress.sessionsCompleted;
          totalHours = stageProgress.hoursCompleted.toNumber();
          isCompleted = stageProgress.isCompleted;
          completedAt = stageProgress.completedAt;
        }
      }

      // Get recent session activity
      const recentSessions = stage.sessions
        .filter(s => s.status === 'completed' && s.completedAt)
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
        .slice(0, 3);

      return {
        id: stage.id,
        stageNumber: stage.stageNumber,
        name: stage.name,
        description: stage.description,
        sessionType: stage.sessionType,
        minSessions: stage.minSessions,
        minHours: stage.minHours.toNumber(),
        hasSubStages: stage.hasSubStages,
        subStages: stage.hasSubStages && stage.subStages ? 
          (Array.isArray(stage.subStages) ? stage.subStages : []) : null,
        isActive: stage.isActive,
        isUnlocked,
        isCompleted,
        completedAt,
        progress: {
          overallProgress,
          sessionsCompleted: totalSessions,
          hoursCompleted: Math.round(totalHours * 100) / 100,
          sessionsRemaining: Math.max(0, stage.minSessions - totalSessions),
          hoursRemaining: Math.max(0, Math.round((stage.minHours.toNumber() - totalHours) * 100) / 100)
        },
        recentActivity: recentSessions.map(s => ({
          id: s.id,
          status: s.status,
          completedAt: s.completedAt
        })),
        createdAt: stage.createdAt,
        updatedAt: stage.updatedAt
      };
    });

    // Calculate journey statistics
    const totalStages = formattedStages.length;
    const completedStages = formattedStages.filter(s => s.isCompleted).length;
    const unlockedStages = formattedStages.filter(s => s.isUnlocked).length;
    const currentStage = formattedStages.find(s => s.isUnlocked && !s.isCompleted);

    return NextResponse.json({
      success: true,
      stages: formattedStages,
      journey: {
        totalStages,
        completedStages,
        unlockedStages,
        currentStageNumber: currentStage?.stageNumber || 1,
        journeyProgress: Math.round((completedStages / totalStages) * 100),
        estimatedTimeRemaining: formattedStages
          .filter(s => !s.isCompleted)
          .reduce((sum, stage) => sum + stage.progress.hoursRemaining, 0)
      }
    });

  } catch (error) {
    console.error('Stages list error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}