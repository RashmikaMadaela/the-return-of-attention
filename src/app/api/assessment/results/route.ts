import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateSelfAssessmentScore } from '@/lib/validations/assessment';

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

    // Get complete questionnaire data
    const questionnaire = await prisma.questionnaire.findUnique({
      where: { userId: session.user.id }
    });

    // Get all self assessments
    const selfAssessments = await prisma.selfAssessment.findMany({
      where: { userId: session.user.id },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Calculate progress tracking for self assessments
    const assessmentProgress = selfAssessments.map(assessment => {
      const scoreResult = calculateSelfAssessmentScore(assessment);
      return {
        id: assessment.id,
        type: assessment.type,
        totalScore: assessment.totalScore,
        interpretation: scoreResult.interpretation,
        individualScores: scoreResult.individualScores,
        categories: {
          foodTaste: assessment.foodTaste,
          scentsAromas: assessment.scentsAromas,
          soundsMusic: assessment.soundsMusic,
          visualBeauty: assessment.visualBeauty,
          touchTextures: assessment.touchTextures,
          thoughtsImages: assessment.thoughtsImages,
        },
        createdAt: assessment.createdAt,
      };
    });

    // Generate insights based on questionnaire data
    const generateInsights = (questionnaire: any) => {
      if (!questionnaire) return null;

      const insights = {
        experience: {
          level: questionnaire.experienceLevel || 0,
          background: questionnaire.meditationBackground,
          detail: questionnaire.meditationBackgroundDetail,
        },
        lifestyle: {
          sleepQuality: questionnaire.sleepPattern || 0,
          physicalActivity: questionnaire.physicalActivity,
          stressLevel: questionnaire.stressTrigers?.length || 0,
          workLifeBalance: questionnaire.workLifeBalance,
        },
        mindfulness: {
          awareness: questionnaire.emotionalAwareness || 0,
          experience: questionnaire.mindfulnessExperience || 0,
          dailyPractice: questionnaire.mindfulnessInDailyLife,
        },
        goals: {
          main: questionnaire.mainGoals || [],
          practice: questionnaire.practiceGoals,
          duration: questionnaire.preferredDuration,
          motivation: questionnaire.motivation,
        },
        challenges: questionnaire.biggestChallenges,
      };

      return insights;
    };

    // Calculate attachment progress if multiple assessments exist
    const attachmentProgress = assessmentProgress.length > 1 ? {
      initialScore: assessmentProgress.find(a => a.type === 'initial')?.totalScore || 0,
      midScore: assessmentProgress.find(a => a.type === 'mid')?.totalScore,
      finalScore: assessmentProgress.find(a => a.type === 'final')?.totalScore,
      overallImprovement: (() => {
        const initial = assessmentProgress.find(a => a.type === 'initial')?.totalScore || 0;
        const latest = assessmentProgress[assessmentProgress.length - 1]?.totalScore || 0;
        return latest - initial;
      })(),
    } : null;

    const results = {
      questionnaire: questionnaire ? {
        id: questionnaire.id,
        completedAt: questionnaire.isCompleted,
        insights: generateInsights(questionnaire),
        demographics: {
          ageRange: questionnaire.ageRange,
          location: questionnaire.location,
          occupation: questionnaire.occupation,
          educationLevel: questionnaire.educationLevel,
        },
      } : null,
      selfAssessments: assessmentProgress,
      progress: {
        attachmentTracking: attachmentProgress,
        completionStatus: {
          questionnaire: !!questionnaire?.isCompleted,
          initialAssessment: assessmentProgress.some(a => a.type === 'initial'),
          midAssessment: assessmentProgress.some(a => a.type === 'mid'),
          finalAssessment: assessmentProgress.some(a => a.type === 'final'),
        },
        spiritualGrowth: assessmentProgress.length > 1 ? {
          journey: assessmentProgress.map(a => ({
            milestone: a.type,
            score: a.totalScore,
            interpretation: a.interpretation,
            date: a.createdAt,
          })),
          trend: attachmentProgress?.overallImprovement ? 
            (attachmentProgress.overallImprovement > 0 ? 'improving' : 
             attachmentProgress.overallImprovement < 0 ? 'declining' : 'stable') : 'initial',
        } : null,
      }
    };

    return NextResponse.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Get assessment results error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}