import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    // Check questionnaire completion
    const questionnaire = await prisma.questionnaire.findUnique({
      where: { userId: session.user.id },
      select: { 
        id: true, 
        isCompleted: true 
      }
    });

    // Check self assessments completion
    const selfAssessments = await prisma.selfAssessment.findMany({
      where: { userId: session.user.id },
      select: { 
        id: true, 
        type: true, 
        totalScore: true,
        createdAt: true 
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Determine assessment status
    const isQuestionnaireCompleted = !!questionnaire?.isCompleted;
    const completedAssessmentTypes = selfAssessments.map(sa => sa.type);
    
    const assessmentStatus = {
      questionnaire: {
        completed: isQuestionnaireCompleted,
        completedAt: questionnaire?.isCompleted || null,
      },
      selfAssessments: {
        initial: {
          completed: completedAssessmentTypes.includes('initial'),
          data: selfAssessments.find(sa => sa.type === 'initial') || null,
        },
        mid: {
          completed: completedAssessmentTypes.includes('mid'),
          data: selfAssessments.find(sa => sa.type === 'mid') || null,
        },
        final: {
          completed: completedAssessmentTypes.includes('final'),
          data: selfAssessments.find(sa => sa.type === 'final') || null,
        }
      },
      overallStatus: {
        hasCompletedOnboarding: isQuestionnaireCompleted && completedAssessmentTypes.includes('initial'),
        canAccessStages: isQuestionnaireCompleted && completedAssessmentTypes.includes('initial'),
        canAccessAdvancedStages: completedAssessmentTypes.includes('mid'),
        hasCompletedProgram: completedAssessmentTypes.includes('final'),
      }
    };

    return NextResponse.json({
      success: true,
      data: assessmentStatus
    });

  } catch (error) {
    console.error('Get assessment status error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}