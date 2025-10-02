import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Validation schema for session update
const sessionUpdateSchema = z.object({
  sessionId: z.string().cuid('Invalid session ID format'),
  qualityRating: z.number().int().min(1).max(10).optional(),
  insights: z.string().max(1000).optional(),
  posture: z.enum(['sitting', 'lying', 'walking', 'custom']).optional(),
  duration: z.number().int().min(1).max(120).optional(), // Update duration if needed
});

export async function PUT(request: NextRequest) {
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
    const validatedData = sessionUpdateSchema.parse(body);

    // Find existing session and verify ownership
    const existingSession = await prisma.session.findFirst({
      where: {
        id: validatedData.sessionId,
        userId: session.user.id,
        status: 'in_progress'
      },
      include: {
        stage: {
          select: {
            name: true,
            description: true
          }
        }
      }
    });

    if (!existingSession) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Session not found or not in progress' 
        },
        { status: 404 }
      );
    }

    // Update session with provided data
    const updatedSession = await prisma.session.update({
      where: { id: validatedData.sessionId },
      data: {
        qualityRating: validatedData.qualityRating,
        insights: validatedData.insights,
        posture: validatedData.posture,
        duration: validatedData.duration,
        updatedAt: new Date(),
      },
      include: {
        stage: {
          select: {
            name: true,
            description: true,
            sessionType: true
          }
        },
        pahmSession: {
          select: {
            id: true,
            totalClicks: true,
            exerciseType: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Session updated successfully',
      session: {
        id: updatedSession.id,
        stageNumber: updatedSession.stageNumber,
        subStage: updatedSession.subStage,
        sessionType: updatedSession.sessionType,
        duration: updatedSession.duration,
        posture: updatedSession.posture,
        status: updatedSession.status,
        qualityRating: updatedSession.qualityRating,
        insights: updatedSession.insights,
        startedAt: updatedSession.startedAt,
        updatedAt: updatedSession.updatedAt,
        stage: updatedSession.stage,
        pahmSession: updatedSession.pahmSession
      }
    });

  } catch (error) {
    console.error('Session update error:', error);
    
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