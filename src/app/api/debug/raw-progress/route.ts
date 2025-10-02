import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Decimal } from '@prisma/client/runtime/library';

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

    // Get raw progress records
    const progressRecords = await prisma.userStageProgress.findMany({
      where: { userId: session.user.id },
      include: {
        stage: {
          select: {
            name: true,
            stageNumber: true,
            hasSubStages: true,
            minSessions: true,
            minHours: true
          }
        }
      },
      orderBy: [
        { stageNumber: 'asc' },
        { subStage: 'asc' }
      ]
    });

    // Get session counts
    const sessionCounts = await prisma.session.groupBy({
      by: ['stageId', 'stageNumber', 'subStage', 'status'],
      where: { userId: session.user.id },
      _count: {
        id: true
      },
      _sum: {
        duration: true
      }
    });

    return NextResponse.json({
      success: true,
      debug: {
        userId: session.user.id,
        progressRecords: progressRecords.map(p => ({
          id: p.id,
          stageId: p.stageId,
          stageNumber: p.stageNumber,
          stageName: p.stage.name,
          subStage: p.subStage,
          sessionsCompleted: p.sessionsCompleted,
          hoursCompleted: p.hoursCompleted.toNumber(),
          isCompleted: p.isCompleted,
          completedAt: p.completedAt,
          requirements: {
            minSessions: p.stage.minSessions,
            minHours: p.stage.minHours.toNumber()
          }
        })),
        sessionCounts: sessionCounts.map(s => ({
          stageId: s.stageId,
          stageNumber: s.stageNumber,
          subStage: s.subStage,
          status: s.status,
          count: s._count.id,
          totalDurationMinutes: s._sum.duration
        }))
      }
    });

  } catch (error) {
    console.error('Debug progress error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
        sessionsCompleted: sessionsCompleted,
        hoursCompleted: new Decimal(hoursCompleted),
        isCompleted: isCompleted,
        completedAt: isCompleted ? new Date() : null,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        stageId: stageId,
        stageNumber: stageNumber,
        subStage: subStage,
        sessionsCompleted: sessionsCompleted,
        hoursCompleted: new Decimal(hoursCompleted),
        isCompleted: isCompleted,
        completedAt: isCompleted ? new Date() : null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Progress record created/updated',
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
    console.error('Debug progress creation error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}