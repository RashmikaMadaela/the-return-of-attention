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

    // Get all stages with comprehensive progress information
    const stagesWithProgress = await prisma.stage.findMany({
      include: {
        userProgress: {
          where: { userId: session.user.id }
        },
        sessions: {
          where: { 
            userId: session.user.id,
            status: 'completed'
          },
          select: {
            id: true,
            duration: true,
            qualityRating: true,
            completedAt: true,
            sessionType: true,
            subStage: true
          },
          orderBy: { completedAt: 'desc' }
        }
      },
      orderBy: { stageNumber: 'asc' }
    });

    // Process each stage to get detailed progress information
    const detailedStageProgress = stagesWithProgress.map(stage => {
      // Check if stage is unlocked
      let isUnlocked = stage.stageNumber === 1;
      if (stage.stageNumber > 1) {
        const previousStage = stagesWithProgress.find(s => s.stageNumber === stage.stageNumber - 1);
        if (previousStage) {
          if (previousStage.hasSubStages) {
            // For Stage 1, check if all sub-stages are completed
            const subStagesArray = Array.isArray(previousStage.subStages) ? previousStage.subStages : [];
            isUnlocked = subStagesArray.every((subStage: any) =>
              previousStage.userProgress.some(p => p.subStage === subStage.id && p.isCompleted)
            );
          } else {
            isUnlocked = previousStage.userProgress.some(p => p.isCompleted);
          }
        }
      }

      // Process sub-stages if they exist
      let subStagesProgress = null;
      let overallProgress = 0;
      let totalSessions = 0;
      let totalHours = 0;
      let isCompleted = false;
      let completedAt = null;

      if (stage.hasSubStages && stage.subStages) {
        const subStagesArray = Array.isArray(stage.subStages) ? stage.subStages : [];
        
        subStagesProgress = subStagesArray.map((subStage: any, index: number) => {
          const progress = stage.userProgress.find(p => p.subStage === subStage.id);
          const subStageSessions = stage.sessions.filter(s => s.subStage === subStage.id);
          
          // Check if this sub-stage is unlocked
          const isSubStageUnlocked = index === 0 || // First sub-stage is always unlocked
            subStagesArray.slice(0, index).every((prevSubStage: any) =>
              stage.userProgress.some(p => p.subStage === prevSubStage.id && p.isCompleted)
            );

          const sessionsCompleted = progress?.sessionsCompleted || 0;
          const hoursCompleted = progress?.hoursCompleted.toNumber() || 0;
          const sessionsProgress = Math.round((sessionsCompleted / subStage.minSessions) * 100);
          const hoursProgress = Math.round((hoursCompleted / subStage.minHours) * 100);
          const subStageProgress = Math.min(100, Math.max(sessionsProgress, hoursProgress));

          return {
            id: subStage.id,
            name: subStage.name,
            description: subStage.description,
            minSessions: subStage.minSessions,
            minHours: subStage.minHours,
            isUnlocked: isSubStageUnlocked,
            progress: {
              sessionsCompleted,
              hoursCompleted: Math.round(hoursCompleted * 100) / 100,
              sessionsProgress,
              hoursProgress,
              overallProgress: subStageProgress,
              isCompleted: progress?.isCompleted || false,
              completedAt: progress?.completedAt,
              sessionsRemaining: Math.max(0, subStage.minSessions - sessionsCompleted),
              hoursRemaining: Math.max(0, Math.round((subStage.minHours - hoursCompleted) * 100) / 100)
            },
            sessions: {
              total: subStageSessions.length,
              averageQuality: subStageSessions.length > 0 ? 
                Math.round((subStageSessions.reduce((sum, s) => sum + (s.qualityRating || 0), 0) / subStageSessions.length) * 100) / 100 : null,
              totalDuration: subStageSessions.reduce((sum, s) => sum + s.duration, 0),
              recent: subStageSessions.slice(0, 3)
            }
          };
        });

        // Calculate overall stage progress for sub-stage stage
        const completedSubStages = subStagesProgress.filter(s => s.progress.isCompleted).length;
        overallProgress = subStagesArray.length > 0 ? 
          Math.round((completedSubStages / subStagesArray.length) * 100) : 0;
        isCompleted = completedSubStages === subStagesArray.length;
        
        // Sum totals from all sub-stages
        totalSessions = subStagesProgress.reduce((sum, s) => sum + s.progress.sessionsCompleted, 0);
        totalHours = subStagesProgress.reduce((sum, s) => sum + s.progress.hoursCompleted, 0);
        
        // Get latest completion date
        const completedSubStages_withDates = subStagesProgress
          .filter(s => s.progress.isCompleted && s.progress.completedAt)
          .sort((a, b) => new Date(b.progress.completedAt!).getTime() - new Date(a.progress.completedAt!).getTime());
        completedAt = completedSubStages_withDates[0]?.progress.completedAt || null;
      } else {
        // Regular stage without sub-stages
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

      // Calculate session statistics for this stage
      const stageSessionStats = {
        total: stage.sessions.length,
        averageQuality: stage.sessions.length > 0 ? 
          Math.round((stage.sessions.reduce((sum, s) => sum + (s.qualityRating || 0), 0) / stage.sessions.length) * 100) / 100 : null,
        totalDuration: stage.sessions.reduce((sum, s) => sum + s.duration, 0),
        byType: stage.sessions.reduce((acc, session) => {
          acc[session.sessionType] = (acc[session.sessionType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };

      // Generate recommendations
      const recommendations = generateStageRecommendations(stage, overallProgress, isUnlocked, isCompleted);

      return {
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
        completedAt,
        progress: {
          overallProgress,
          sessionsCompleted: totalSessions,
          hoursCompleted: Math.round(totalHours * 100) / 100,
          sessionsRemaining: Math.max(0, stage.minSessions - totalSessions),
          hoursRemaining: Math.max(0, Math.round((stage.minHours.toNumber() - totalHours) * 100) / 100),
          canStart: isUnlocked && !isCompleted
        },
        subStages: subStagesProgress,
        sessions: stageSessionStats,
        recommendations,
        timeEstimate: {
          remainingHours: Math.max(0, stage.minHours.toNumber() - totalHours),
          estimatedWeeksToComplete: isCompleted ? 0 : 
            Math.ceil(Math.max(0, stage.minHours.toNumber() - totalHours) / 2.5) // Assuming 2.5 hours/week
        }
      };
    });

    // Calculate journey statistics
    const journeyStats = {
      totalStages: detailedStageProgress.length,
      completedStages: detailedStageProgress.filter(s => s.isCompleted).length,
      unlockedStages: detailedStageProgress.filter(s => s.isUnlocked).length,
      totalSessions: detailedStageProgress.reduce((sum, s) => sum + s.progress.sessionsCompleted, 0),
      totalHours: detailedStageProgress.reduce((sum, s) => sum + s.progress.hoursCompleted, 0),
      averageProgress: Math.round(
        detailedStageProgress.reduce((sum, s) => sum + s.progress.overallProgress, 0) / detailedStageProgress.length
      ),
      currentStage: detailedStageProgress.find(s => s.isUnlocked && !s.isCompleted),
      nextMilestone: getNextStageMilestone(detailedStageProgress)
    };

    return NextResponse.json({
      success: true,
      stages: detailedStageProgress,
      journey: journeyStats,
      recommendations: generateJourneyRecommendations(detailedStageProgress, journeyStats)
    });

  } catch (error) {
    console.error('Progress stages error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate stage-specific recommendations
function generateStageRecommendations(stage: any, progress: number, isUnlocked: boolean, isCompleted: boolean): string[] {
  const recommendations = [];

  if (!isUnlocked) {
    recommendations.push(`Complete the previous stage to unlock ${stage.name}`);
    return recommendations;
  }

  if (isCompleted) {
    recommendations.push(`${stage.name} completed! Well done on your progress`);
    return recommendations;
  }

  if (progress === 0) {
    recommendations.push(`Begin your ${stage.name} journey with your first session`);
  } else if (progress < 25) {
    recommendations.push('You\'re just getting started - establish a consistent practice');
  } else if (progress < 50) {
    recommendations.push('Great momentum! Keep up the regular practice');
  } else if (progress < 75) {
    recommendations.push('You\'re over halfway there - maintain your dedication');
  } else {
    recommendations.push('Almost there! Complete this stage to unlock the next one');
  }

  // Stage-specific guidance
  if (stage.stageNumber === 1) {
    recommendations.push('Focus on physical stillness and breath awareness');
    recommendations.push('Complete sub-stages T1 through T5 sequentially');
  } else if (stage.sessionType === 'pahm_matrix') {
    recommendations.push('Use the PAHM matrix to track your attention patterns');
    recommendations.push('Notice where your mind goes without judgment');
  }

  return recommendations;
}

// Helper function to generate journey recommendations
function generateJourneyRecommendations(stages: any[], journeyStats: any): string[] {
  const recommendations = [];

  if (journeyStats.completedStages === 0) {
    recommendations.push('Start with Stage 1 to build your foundation');
  } else if (journeyStats.completedStages < 3) {
    recommendations.push('You\'re building a strong foundation - keep going!');
  } else if (journeyStats.completedStages < 6) {
    recommendations.push('Great progress on your meditation journey');
  } else {
    recommendations.push('Congratulations on completing your PAHM journey!');
  }

  // Practice frequency recommendations
  if (journeyStats.totalSessions > 0) {
    const averageSessionDuration = journeyStats.totalHours * 60 / journeyStats.totalSessions;
    if (averageSessionDuration < 20) {
      recommendations.push('Consider gradually extending your session duration');
    }
  }

  return recommendations;
}

// Helper function to get next milestone
function getNextStageMilestone(stages: any[]): string {
  const completedStages = stages.filter(s => s.isCompleted).length;
  
  if (completedStages === 0) return "Complete Stage 1: Seeker";
  if (completedStages === 1) return "Complete Stage 2: PAHM Trainee";
  if (completedStages === 2) return "Complete Stage 3: PAHM Beginner";
  if (completedStages === 3) return "Complete Stage 4: PAHM Practitioner";
  if (completedStages === 4) return "Complete Stage 5: PAHM Master";
  if (completedStages === 5) return "Complete Stage 6: PAHM Illuminator";
  return "Journey Complete!";
}