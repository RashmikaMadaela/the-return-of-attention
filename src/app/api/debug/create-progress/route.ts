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
    const { stageId, stageNumber, subStage, sessionsCompleted, hoursCompleted, isCompleted } = body;

    // Create or update progress record
    const progressRecord = await prisma.userStageProgress.upsert({
      where: {
        userId_stageId_subStage: {
          userId: session.user.id,
          stageId: stageId,
          subStage: subStage || ''
        }
      },
      update: {
        sessionsCompleted: sessionsCompleted || 0,
        hoursCompleted: new Decimal(hoursCompleted || 0),
        isCompleted: isCompleted || false,
        completedAt: isCompleted ? new Date() : null,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        stageId: stageId,
        stageNumber: stageNumber,
        subStage: subStage,
        sessionsCompleted: sessionsCompleted || 0,
        hoursCompleted: new Decimal(hoursCompleted || 0),
        isCompleted: isCompleted || false,
        completedAt: isCompleted ? new Date() : null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Progress record created/updated successfully',
      progress: {
        id: progressRecord.id,
        stageId: progressRecord.stageId,
        stageNumber: progressRecord.stageNumber,
        subStage: progressRecord.subStage,
        sessionsCompleted: progressRecord.sessionsCompleted,
        hoursCompleted: progressRecord.hoursCompleted.toNumber(),
        isCompleted: progressRecord.isCompleted,
        completedAt: progressRecord.completedAt
      }
    });

  } catch (error) {
    console.error('Create progress error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}