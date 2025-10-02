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

    // Get target stage
    const targetStage = await prisma.stage.findUnique({
      where: { id: stageId },
      select: {
        id: true,
        stageNumber: true,
        name: true,
        minSessions: true,
        minHours: true,
        hasSubStages: true,
        subStages: true
      }
    });

    if (!targetStage) {
      return NextResponse.json(
        { success: false, error: 'Stage not found' },
        { status: 404 }
      );
    }

    // Stage 1 is always unlocked
    if (targetStage.stageNumber === 1) {
      return NextResponse.json({
        success: true,
        isUnlocked: true,
        stage: {
          id: targetStage.id,
          stageNumber: targetStage.stageNumber,
          name: targetStage.name
        },
        unlockReason: 'First stage is always available',
        requirements: null,
        canStart: true
      });
    }

    // Check requirements for stages 2-6
    const previousStageNumber = targetStage.stageNumber - 1;
    
    // Get previous stage and its progress
    const previousStage = await prisma.stage.findUnique({
      where: { stageNumber: previousStageNumber },
      include: {
        userProgress: {
          where: { userId: session.user.id }
        }
      }
    });

    if (!previousStage) {
      return NextResponse.json(
        { success: false, error: 'Previous stage not found' },
        { status: 404 }
      );
    }

    // Check if previous stage is completed
    let isUnlocked = false;
    let unlockReason = '';
    let requirements: any = null;
    let progress: any = null;

    if (previousStage.hasSubStages && previousStage.subStages) {
      // For Stage 1 with sub-stages, check if all sub-stages are completed
      const subStagesArray = Array.isArray(previousStage.subStages) ? previousStage.subStages : [];
      const completedSubStages = subStagesArray.filter((subStage: any) =>
        previousStage.userProgress.some(p => p.subStage === subStage.id && p.isCompleted)
      );

      isUnlocked = completedSubStages.length === subStagesArray.length;
      
      if (isUnlocked) {
        unlockReason = `All sub-stages of ${previousStage.name} completed`;
      } else {
        unlockReason = `Complete all sub-stages of ${previousStage.name} to unlock`;
        requirements = {
          type: 'sub_stages',
          total: subStagesArray.length,
          completed: completedSubStages.length,
          remaining: subStagesArray.length - completedSubStages.length,
          subStages: subStagesArray.map((subStage: any) => ({
            id: subStage.id,
            name: subStage.name,
            isCompleted: previousStage.userProgress.some(p => 
              p.subStage === subStage.id && p.isCompleted
            )
          }))
        };
      }

      // Calculate progress
      const totalSessions = previousStage.userProgress.reduce((sum, p) => sum + p.sessionsCompleted, 0);
      const totalHours = previousStage.userProgress.reduce((sum, p) => sum + p.hoursCompleted.toNumber(), 0);
      const totalMinSessions = subStagesArray.reduce((sum: number, subStage: any) => sum + subStage.minSessions, 0);
      const totalMinHours = subStagesArray.reduce((sum: number, subStage: any) => sum + subStage.minHours, 0);

      progress = {
        sessionsCompleted: totalSessions,
        hoursCompleted: Math.round(totalHours * 100) / 100,
        minSessions: totalMinSessions,
        minHours: totalMinHours,
        sessionsProgress: Math.round((totalSessions / totalMinSessions) * 100),
        hoursProgress: Math.round((totalHours / totalMinHours) * 100)
      };
    } else {
      // Regular stage completion check
      const stageProgress = previousStage.userProgress[0];
      isUnlocked = stageProgress?.isCompleted || false;

      if (isUnlocked) {
        unlockReason = `${previousStage.name} completed`;
      } else {
        unlockReason = `Complete ${previousStage.name} to unlock`;
        
        const sessionsCompleted = stageProgress?.sessionsCompleted || 0;
        const hoursCompleted = stageProgress?.hoursCompleted.toNumber() || 0;
        
        requirements = {
          type: 'stage_completion',
          minSessions: previousStage.minSessions,
          minHours: previousStage.minHours.toNumber(),
          sessionsCompleted,
          hoursCompleted: Math.round(hoursCompleted * 100) / 100,
          sessionsRemaining: Math.max(0, previousStage.minSessions - sessionsCompleted),
          hoursRemaining: Math.max(0, Math.round((previousStage.minHours.toNumber() - hoursCompleted) * 100) / 100),
          bothRequirementsMet: sessionsCompleted >= previousStage.minSessions && 
                              hoursCompleted >= previousStage.minHours.toNumber()
        };

        progress = {
          sessionsCompleted,
          hoursCompleted: Math.round(hoursCompleted * 100) / 100,
          minSessions: previousStage.minSessions,
          minHours: previousStage.minHours.toNumber(),
          sessionsProgress: Math.round((sessionsCompleted / previousStage.minSessions) * 100),
          hoursProgress: Math.round((hoursCompleted / previousStage.minHours.toNumber()) * 100)
        };
      }
    }

    // Additional checks for specific stages
    let additionalRequirements = null;
    if (targetStage.stageNumber >= 3) {
      // Check if user has completed initial self-assessment
      const initialAssessment = await prisma.selfAssessment.findFirst({
        where: {
          userId: session.user.id,
          type: 'initial'
        }
      });

      if (!initialAssessment) {
        additionalRequirements = {
          type: 'assessment',
          description: 'Complete initial self-assessment',
          completed: false
        };
      }
    }

    if (targetStage.stageNumber >= 4) {
      // Check mid-assessment requirement
      const midAssessment = await prisma.selfAssessment.findFirst({
        where: {
          userId: session.user.id,
          type: 'mid'
        }
      });

      if (!midAssessment) {
        additionalRequirements = {
          type: 'mid_assessment',
          description: 'Complete mid-journey self-assessment after Stage 3',
          completed: false
        };
      }
    }

    // Check if user can start a session for this stage
    const canStart = isUnlocked && (!additionalRequirements || additionalRequirements.completed);

    return NextResponse.json({
      success: true,
      isUnlocked,
      canStart,
      stage: {
        id: targetStage.id,
        stageNumber: targetStage.stageNumber,
        name: targetStage.name
      },
      unlockReason,
      previousStage: {
        stageNumber: previousStageNumber,
        name: previousStage.name,
        hasSubStages: previousStage.hasSubStages
      },
      requirements,
      progress,
      additionalRequirements,
      unlockPath: generateUnlockPath(targetStage.stageNumber, isUnlocked)
    });

  } catch (error) {
    console.error('Stage unlock check error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate unlock path instructions
function generateUnlockPath(targetStageNumber: number, isUnlocked: boolean): string[] {
  if (isUnlocked) {
    return [`Stage ${targetStageNumber} is ready to start!`];
  }

  const path = [];
  const previousStage = targetStageNumber - 1;

  if (previousStage === 1) {
    path.push('Complete all 5 sub-stages of Stage 1 (Seeker)');
    path.push('Each sub-stage has specific session and hour requirements');
    path.push('Progress through T1 → T2 → T3 → T4 → T5 sequentially');
  } else {
    path.push(`Complete Stage ${previousStage} requirements`);
    path.push('Meet both minimum session count and hour requirements');
  }

  if (targetStageNumber >= 3) {
    path.push('Ensure initial self-assessment is completed');
  }

  if (targetStageNumber >= 4) {
    path.push('Complete mid-journey self-assessment after Stage 3');
  }

  return path;
}