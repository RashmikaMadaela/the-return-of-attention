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
    const { force } = body;

    if (!force) {
      return NextResponse.json(
        { success: false, error: 'Force bypass required' },
        { status: 400 }
      );
    }

    console.log('🛠️ Starting Stage 1 force bypass...');

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

    console.log('Found Stage 1:', stage1.id);

    // Delete any existing progress records for Stage 1 to start fresh
    await prisma.userStageProgress.deleteMany({
      where: {
        userId: session.user.id,
        stageId: stage1.id
      }
    });

    console.log('Cleared existing Stage 1 progress records');

    // Create all Stage 1 sub-stage progress records as completed
    const subStageRequirements = [
      { subStage: 'T1', sessions: 3, hours: 0.5 },
      { subStage: 'T2', sessions: 4, hours: 1.0 },
      { subStage: 'T3', sessions: 6, hours: 2.0 },
      { subStage: 'T4', sessions: 6, hours: 2.5 },
      { subStage: 'T5', sessions: 10, hours: 5.0 }
    ];

    const createdRecords = [];
    const completedAt = new Date();

    for (const req of subStageRequirements) {
      console.log(`Creating progress record for ${req.subStage}...`);
      
      const progressRecord = await prisma.userStageProgress.create({
        data: {
          userId: session.user.id,
          stageId: stage1.id,
          stageNumber: 1,
          subStage: req.subStage,
          sessionsCompleted: req.sessions,
          hoursCompleted: new Decimal(req.hours),
          isCompleted: true,
          completedAt: completedAt,
          createdAt: completedAt,
          updatedAt: completedAt
        }
      });

      console.log(`Created progress record for ${req.subStage}:`, progressRecord.id);

      createdRecords.push({
        id: progressRecord.id,
        subStage: req.subStage,
        sessionsCompleted: progressRecord.sessionsCompleted,
        hoursCompleted: progressRecord.hoursCompleted.toNumber(),
        isCompleted: progressRecord.isCompleted,
        completedAt: progressRecord.completedAt
      });
    }

    // Verify the records were created
    const verificationRecords = await prisma.userStageProgress.findMany({
      where: {
        userId: session.user.id,
        stageId: stage1.id
      }
    });

    console.log(`Verification: Found ${verificationRecords.length} progress records for Stage 1`);

    // Also check if Stage 2 exists and should be unlocked
    const stage2 = await prisma.stage.findFirst({
      where: { stageNumber: 2 }
    });

    return NextResponse.json({
      success: true,
      message: 'Stage 1 bypassed successfully - PAHM Matrix unlocked',
      bypassedRecords: createdRecords,
      verification: {
        recordsCreated: verificationRecords.length,
        stage1Id: stage1.id,
        stage2Available: !!stage2,
        stage2Id: stage2?.id || null
      },
      totals: {
        totalSessions: createdRecords.reduce((sum, r) => sum + r.sessionsCompleted, 0),
        totalHours: createdRecords.reduce((sum, r) => sum + r.hoursCompleted, 0)
      }
    });

  } catch (error) {
    console.error('Force Stage 1 bypass error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}