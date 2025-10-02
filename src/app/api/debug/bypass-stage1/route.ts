import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Decimal } from '@prisma/client/runtime/library';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { stageId, force } = body;

    if (!force) {
      return NextResponse.json(
        { success: false, error: 'Force bypass required' },
        { status: 400 }
      );
    }

    // Get Stage 1 details
    const stage1 = await prisma.stage.findFirst({
      where: { stageNumber: 1 }
    });

    if (!stage1) {
      return NextResponse.json(
        { success: false, error: 'Stage 1 not found' },
        { status: 404 }
      );
    }

    // Get the actual sub-stage structure from the stage
    const subStagesArray = Array.isArray(stage1.subStages) ? stage1.subStages : [];
    
    // Create all Stage 1 sub-stage progress records as completed
    const subStageRequirements = [
      { subStage: 'T1', sessions: 3, hours: 0.5 },
      { subStage: 'T2', sessions: 4, hours: 1.0 },
      { subStage: 'T3', sessions: 6, hours: 2.0 },
      { subStage: 'T4', sessions: 6, hours: 2.5 },
      { subStage: 'T5', sessions: 10, hours: 5.0 }
    ];

    const createdRecords = [];

    for (const req of subStageRequirements) {
      const progressRecord = await prisma.userStageProgress.upsert({
        where: {
          userId_stageId_subStage: {
            userId: session.user.id,
            stageId: stage1.id,
            subStage: req.subStage
          }
        },
        update: {
          sessionsCompleted: req.sessions,
          hoursCompleted: new Decimal(req.hours),
          isCompleted: true,
          completedAt: new Date(),
          updatedAt: new Date()
        },
        create: {
          userId: session.user.id,
          stageId: stage1.id,
          stageNumber: 1,
          subStage: req.subStage,
          sessionsCompleted: req.sessions,
          hoursCompleted: new Decimal(req.hours),
          isCompleted: true,
          completedAt: new Date()
        }
      });

      createdRecords.push({
        subStage: req.subStage,
        sessionsCompleted: progressRecord.sessionsCompleted,
        hoursCompleted: progressRecord.hoursCompleted.toNumber(),
        isCompleted: progressRecord.isCompleted
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Stage 1 bypassed successfully - PAHM Matrix unlocked',
      bypassedRecords: createdRecords,
      totalSessions: createdRecords.reduce((sum, r) => sum + r.sessionsCompleted, 0),
      totalHours: createdRecords.reduce((sum, r) => sum + r.hoursCompleted, 0)
    });

  } catch (error) {
    console.error('Stage 1 bypass error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}