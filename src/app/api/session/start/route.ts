import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Validation schema for session start
const sessionStartSchema = z.object({
  stageId: z.string().cuid('Invalid stage ID format'),
  stageNumber: z.number().int().min(1).max(6),
  subStage: z.string().optional(), // 'T1', 'T2', etc. for Stage 1
  sessionType: z.enum(['timer_only', 'pahm_matrix', 'mind_recovery']),
  duration: z.number().int().min(1).max(120), // Duration in minutes
  posture: z.enum(['sitting', 'lying', 'walking', 'custom']).default('sitting'),
  exerciseType: z.string().optional(), // For mind recovery exercises
});

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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = sessionStartSchema.parse(body);

    // Verify stage exists and is accessible
    const stage = await prisma.stage.findUnique({
      where: { id: validatedData.stageId },
      include: {
        userProgress: {
          where: { userId: session.user.id }
        }
      }
    });

    if (!stage) {
      return NextResponse.json(
        { success: false, error: 'Stage not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this stage
    if (validatedData.stageNumber > 1) {
      const previousStageCompleted = await prisma.userStageProgress.findFirst({
        where: {
          userId: session.user.id,
          stageNumber: validatedData.stageNumber - 1,
          isCompleted: true
        }
      });

      if (!previousStageCompleted) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Previous stage must be completed first',
            requiredStage: validatedData.stageNumber - 1
          },
          { status: 403 }
        );
      }
    }

    // Check for existing in-progress session
    const existingSession = await prisma.session.findFirst({
      where: {
        userId: session.user.id,
        status: 'in_progress'
      }
    });

    if (existingSession) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Another session is already in progress',
          existingSessionId: existingSession.id
        },
        { status: 409 }
      );
    }

    // Create new session
    const newSession = await prisma.session.create({
      data: {
        userId: session.user.id,
        stageId: validatedData.stageId,
        stageNumber: validatedData.stageNumber,
        subStage: validatedData.subStage,
        sessionType: validatedData.sessionType,
        duration: validatedData.duration,
        posture: validatedData.posture,
        status: 'in_progress',
        startedAt: new Date(),
      },
      include: {
        stage: {
          select: {
            name: true,
            description: true,
            sessionType: true
          }
        }
      }
    });

    // Create PAHM session if required
    let pahmSession = null;
    if (validatedData.sessionType === 'pahm_matrix' || validatedData.sessionType === 'mind_recovery') {
      pahmSession = await prisma.pAHMSession.create({
        data: {
          sessionId: newSession.id,
          userId: session.user.id,
          stageNumber: validatedData.stageNumber,
          exerciseType: validatedData.exerciseType,
          clickTimestamps: [], // Initialize empty array for click tracking
        }
      });
    }

    // Update or create user stage progress
    await prisma.userStageProgress.upsert({
      where: {
        userId_stageId_subStage: {
          userId: session.user.id,
          stageId: validatedData.stageId,
          subStage: validatedData.subStage || ''
        }
      },
      update: {
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        stageId: validatedData.stageId,
        stageNumber: validatedData.stageNumber,
        subStage: validatedData.subStage,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Session started successfully',
      session: {
        id: newSession.id,
        stageNumber: newSession.stageNumber,
        subStage: newSession.subStage,
        sessionType: newSession.sessionType,
        duration: newSession.duration,
        posture: newSession.posture,
        status: newSession.status,
        startedAt: newSession.startedAt,
        stage: newSession.stage,
        pahmSessionId: pahmSession?.id || null
      }
    });

  } catch (error) {
    console.error('Session start error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: error.issues
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}