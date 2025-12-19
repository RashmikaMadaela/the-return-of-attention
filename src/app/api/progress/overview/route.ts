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

    // Get user profile for account age
    const userProfile = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        createdAt: true,
        name: true,
        email: true
      }
    });

    // Get all stages with progress
    const stagesWithProgress = await prisma.stage.findMany({
      include: {
        userProgress: {
          where: { userId: session.user.id }
        }
      },
      orderBy: { stageNumber: 'asc' }
    });

    // Get session statistics
    const sessionStats = await prisma.session.aggregate({
      where: { 
        userId: session.user.id,
        status: 'COMPLETED'
      },
      _count: { id: true },
      _sum: { duration: true },
      _avg: { qualityRating: true }
    });

    // Get recent sessions for streak calculation
    const recentSessions = await prisma.session.findMany({
      where: {
        userId: session.user.id,
        status: 'COMPLETED'
      },
      select: {
        completedAt: true
      },
      orderBy: { completedAt: 'desc' },
      take: 30 // Last 30 sessions for streak calculation
    });

    // Get PAHM session statistics
    const pahmStats = await prisma.pAHMSession.aggregate({
      where: { 
        userId: session.user.id
      },
      _count: { id: true },
      _sum: { totalClicks: true },
      _avg: { totalClicks: true }
    });

    // Get happiness score history
    const happinessScores = await prisma.happinessScore.findMany({
      where: { userId: session.user.id },
      orderBy: { calculatedAt: 'desc' },
      take: 10
    });

    // Get assessment completion status
    const assessmentStatus = await getAssessmentStatus(session.user.id);

    // Helper function to check if stage is completed (with comprehensive Stage 1 logic)
    const isStageCompleted = (stage: any) => {
      if (stage.hasSubStages && stage.subStages) {
        const subStagesArray = Array.isArray(stage.subStages) ? stage.subStages : [];
        const allSubStagesCompleted = subStagesArray.every((subStage: any) => 
          stage.userProgress.some((p: any) => p.subStage === subStage.id && p.isCompleted)
        );
        const pahmIntroProgress = stage.userProgress.find((p: any) => p.subStage === 'PAHM');
        const pahmIntroCompleted = pahmIntroProgress?.isCompleted || false;
        const totalHours = stage.userProgress.reduce((sum: number, p: any) => 
          sum + (p.hoursCompleted ? p.hoursCompleted.toNumber() : 0), 0
        );
        const hoursRequirementMet = totalHours >= stage.minHours.toNumber();
        const totalSessions = stage.userProgress.reduce((sum: number, p: any) => 
          sum + (p.sessionsCompleted || 0), 0
        );
        const sessionsRequirementMet = totalSessions >= stage.minSessions;
        return allSubStagesCompleted && pahmIntroCompleted && hoursRequirementMet && sessionsRequirementMet;
      }
      return stage.userProgress.some((p: any) => p.isCompleted);
    };

    // Calculate journey progress
    const totalStages = stagesWithProgress.length;
    const completedStages = stagesWithProgress.filter(stage => isStageCompleted(stage)).length;

    const currentStage = stagesWithProgress.find(stage => {
      // Check if stage is unlocked but not completed
      const isUnlocked = stage.stageNumber === 1 || 
        stagesWithProgress.some(prevStage => 
          prevStage.stageNumber === stage.stageNumber - 1 &&
          isStageCompleted(prevStage)
        );
      const completed = isStageCompleted(stage);
      return isUnlocked && !completed;
    });

    // Calculate streak
    const streak = calculateStreak(recentSessions);

    // Calculate total practice time
    const totalHours = sessionStats._sum.duration ? sessionStats._sum.duration / 60 : 0;

    // Calculate stage progress details
    const stageProgress = stagesWithProgress.map(stage => {
      const progress = stage.userProgress[0];
      let overallProgress = 0;
      let isCompleted = false;

      if (stage.hasSubStages && stage.subStages) {
        const subStagesArray = Array.isArray(stage.subStages) ? stage.subStages : [];
        // Check all T1-T5 sub-stages completed
        const allSubStagesCompleted = subStagesArray.every((subStage: any) => 
          stage.userProgress.some(p => p.subStage === subStage.id && p.isCompleted)
        );
        // Check PAHM intro completed
        const pahmIntroProgress = stage.userProgress.find(p => p.subStage === 'PAHM');
        const pahmIntroCompleted = pahmIntroProgress?.isCompleted || false;
        // Check total hours requirement met
        const totalHours = stage.userProgress.reduce((sum, p) => 
          sum + (p.hoursCompleted ? p.hoursCompleted.toNumber() : 0), 0
        );
        const hoursRequirementMet = totalHours >= stage.minHours.toNumber();
        // Check total sessions requirement met
        const totalSessions = stage.userProgress.reduce((sum, p) => 
          sum + (p.sessionsCompleted || 0), 0
        );
        const sessionsRequirementMet = totalSessions >= stage.minSessions;
        // Stage 1 is only complete when ALL requirements are met
        isCompleted = allSubStagesCompleted && pahmIntroCompleted && hoursRequirementMet && sessionsRequirementMet;
        const completedSubStages = subStagesArray.filter((subStage: any) =>
          stage.userProgress.some(p => p.subStage === subStage.id && p.isCompleted)
        ).length;
        overallProgress = subStagesArray.length > 0 ? 
          Math.round((completedSubStages / subStagesArray.length) * 100) : 0;
      } else {
        // For stages without sub-stages
        isCompleted = stage.userProgress.some(p => p.isCompleted);
        if (progress) {
          const sessionsProgress = Math.round((progress.sessionsCompleted / stage.minSessions) * 100);
          const hoursProgress = Math.round((progress.hoursCompleted.toNumber() / stage.minHours.toNumber()) * 100);
          overallProgress = Math.min(100, Math.max(sessionsProgress, hoursProgress));
        }
      }

      return {
        stageNumber: stage.stageNumber,
        name: stage.name,
        minSessions: stage.minSessions,
        minHours: stage.minHours?.toNumber ? stage.minHours.toNumber() : stage.minHours,
        progress: overallProgress,
        isCompleted,
        sessionsCompleted: stage.userProgress.reduce((sum, p) => sum + p.sessionsCompleted, 0),
        hoursCompleted: stage.userProgress.reduce((sum, p) => sum + p.hoursCompleted.toNumber(), 0)
      };
    });

    // Calculate milestones achieved
    const milestones = calculateMilestones(sessionStats._count.id || 0, totalHours, completedStages);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await prisma.session.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: sevenDaysAgo }
      },
      select: {
        id: true,
        stageNumber: true,
        sessionType: true,
        duration: true,
        status: true,
        completedAt: true,
        qualityRating: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Calculate weekly goals progress
    const weeklyGoals = calculateWeeklyGoals(recentActivity);

    // Get current happiness score
    const currentHappinessScore = happinessScores[0];

    return NextResponse.json({
      success: true,
      overview: {
        user: {
          name: userProfile?.name,
          email: userProfile?.email,
          memberSince: userProfile?.createdAt,
          accountAge: userProfile?.createdAt ? 
            Math.floor((new Date().getTime() - new Date(userProfile.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0
        },
        journey: {
          currentStage: currentStage ? {
            number: currentStage.stageNumber,
            name: currentStage.name,
            progress: stageProgress.find(s => s.stageNumber === currentStage.stageNumber)?.progress || 0
          } : null,
          totalStages,
          completedStages,
          journeyProgress: Math.round((completedStages / totalStages) * 100),
          nextMilestone: getNextMilestone(completedStages, totalStages)
        },
        practice: {
          totalSessions: sessionStats._count.id || 0,
          totalHours: Math.round(totalHours * 100) / 100,
          averageQuality: sessionStats._avg.qualityRating ? 
            Math.round(sessionStats._avg.qualityRating * 100) / 100 : null,
          currentStreak: streak,
          longestStreak: calculateLongestStreak(recentSessions),
          weeklyGoals
        },
        pahm: {
          totalSessions: pahmStats._count.id || 0,
          totalClicks: pahmStats._sum.totalClicks || 0,
          averageClicksPerSession: pahmStats._avg.totalClicks ? 
            Math.round(pahmStats._avg.totalClicks * 100) / 100 : 0
        },
        happiness: {
          currentScore: currentHappinessScore ? {
            score: currentHappinessScore.finalScore.toNumber(),
            level: currentHappinessScore.userLevel,
            calculatedAt: currentHappinessScore.calculatedAt
          } : null,
          scoreHistory: happinessScores.map(score => ({
            score: score.finalScore.toNumber(),
            level: score.userLevel,
            date: score.calculatedAt
          }))
        },
        assessments: assessmentStatus,
        milestones,
        recentActivity: recentActivity.map(activity => ({
          id: activity.id,
          stageNumber: activity.stageNumber,
          sessionType: activity.sessionType,
          duration: activity.duration,
          status: activity.status,
          completedAt: activity.completedAt,
          qualityRating: activity.qualityRating,
          daysAgo: activity.completedAt ? 
            Math.floor((new Date().getTime() - new Date(activity.completedAt).getTime()) / (1000 * 60 * 60 * 24)) : null
        })),
        stages: stageProgress
      }
    });

  } catch (error) {
    console.error('Progress overview error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
async function getAssessmentStatus(userId: string) {
  const questionnaire = await prisma.questionnaire.findUnique({
    where: { userId },
    select: { id: true, createdAt: true }
  });

  const initialAssessment = await prisma.selfAssessment.findFirst({
    where: { userId, type: 'initial' },
    select: { id: true, createdAt: true }
  });

  const midAssessment = await prisma.selfAssessment.findFirst({
    where: { userId, type: 'mid' },
    select: { id: true, createdAt: true }
  });

  const finalAssessment = await prisma.selfAssessment.findFirst({
    where: { userId, type: 'final' },
    select: { id: true, createdAt: true }
  });

  return {
    questionnaire: questionnaire ? {
      completed: true,
      completedAt: questionnaire.createdAt
    } : { completed: false },
    initial: initialAssessment ? {
      completed: true,
      completedAt: initialAssessment.createdAt
    } : { completed: false },
    mid: midAssessment ? {
      completed: true,
      completedAt: midAssessment.createdAt
    } : { completed: false },
    final: finalAssessment ? {
      completed: true,
      completedAt: finalAssessment.createdAt
    } : { completed: false }
  };
}

function calculateStreak(sessions: any[]): number {
  if (sessions.length === 0) return 0;

  const sessionDates = sessions
    .map(session => session.completedAt?.toISOString().split('T')[0])
    .filter(date => date)
    .filter((date, index, array) => array.indexOf(date) === index)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (sessionDates.length === 0) return 0;

  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  let currentDate = sessionDates.includes(today) ? today : 
                   sessionDates.includes(yesterday) ? yesterday : null;

  if (!currentDate) return 0;

  for (let i = 0; i < sessionDates.length; i++) {
    if (sessionDates[i] === currentDate) {
      streak++;
      const prevDate: Date = new Date(currentDate!);
      prevDate.setDate(prevDate.getDate() - 1);
      currentDate = prevDate.toISOString().split('T')[0];
    } else {
      break;
    }
  }

  return streak;
}

function calculateLongestStreak(sessions: any[]): number {
  // Implementation similar to calculateStreak but finds longest streak in history
  return calculateStreak(sessions); // Simplified for now
}

function calculateMilestones(totalSessions: number, totalHours: number, completedStages: number): any[] {
  const milestones = [];

  // Session milestones
  const sessionMilestones = [1, 5, 10, 25, 50, 100];
  sessionMilestones.forEach(milestone => {
    if (totalSessions >= milestone) {
      milestones.push({
        type: 'sessions',
        title: `${milestone} Sessions Completed`,
        achieved: true,
        achievedAt: null // Would need to track this separately
      });
    }
  });

  // Hour milestones
  const hourMilestones = [1, 5, 10, 25, 50, 100];
  hourMilestones.forEach(milestone => {
    if (totalHours >= milestone) {
      milestones.push({
        type: 'hours',
        title: `${milestone} Hours of Practice`,
        achieved: true,
        achievedAt: null
      });
    }
  });

  // Stage milestones
  if (completedStages >= 1) {
    milestones.push({
      type: 'stage',
      title: 'First Stage Completed',
      achieved: true,
      achievedAt: null
    });
  }

  return milestones;
}

function calculateWeeklyGoals(recentActivity: any[]) {
  const completedSessions = recentActivity.filter(a => a.status === 'COMPLETED').length;
  const totalMinutes = recentActivity
    .filter(a => a.status === 'COMPLETED')
    .reduce((sum, a) => sum + a.duration, 0);

  return {
    sessionsGoal: 5, // Weekly goal
    sessionsCompleted: completedSessions,
    hoursGoal: 2.5, // Weekly goal in hours
    hoursCompleted: Math.round((totalMinutes / 60) * 100) / 100,
    onTrack: completedSessions >= 5 && (totalMinutes / 60) >= 2.5
  };
}

function getNextMilestone(completedStages: number, totalStages: number): string {
  if (completedStages === 0) return "Complete your first stage";
  if (completedStages < totalStages / 2) return "Reach the halfway point";
  if (completedStages < totalStages) return "Complete your meditation journey";
  return "Journey completed!";
}