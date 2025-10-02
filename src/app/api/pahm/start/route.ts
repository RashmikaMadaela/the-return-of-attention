import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Validation schema for PAHM session start
const pahmStartSchema = z.object({
  sessionId: z.string().cuid('Invalid session ID format'),
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
    const validatedData = pahmStartSchema.parse(body);

    // Find the session and verify it belongs to the user
    const existingSession = await prisma.session.findFirst({
      where: {
        id: validatedData.sessionId,
        userId: session.user.id,
        status: 'in_progress'
      },
      include: {
        stage: true,
        pahmSession: true
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

    // Check if session type supports PAHM matrix
    if (!['pahm_matrix', 'mind_recovery'].includes(existingSession.sessionType)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Session type does not support PAHM matrix tracking' 
        },
        { status: 400 }
      );
    }

    // Check if PAHM session already exists
    if (existingSession.pahmSession) {
      return NextResponse.json({
        success: true,
        message: 'PAHM session already active',
        pahmSession: {
          id: existingSession.pahmSession.id,
          sessionId: existingSession.pahmSession.sessionId,
          stageNumber: existingSession.pahmSession.stageNumber,
          exerciseType: existingSession.pahmSession.exerciseType,
          totalClicks: existingSession.pahmSession.totalClicks,
          clickCounts: {
            regret: existingSession.pahmSession.regretClicks,
            past: existingSession.pahmSession.pastClicks,
            nostalgia: existingSession.pahmSession.nostalgiaClicks,
            dislikes: existingSession.pahmSession.dislikesClicks,
            present: existingSession.pahmSession.presentClicks,
            likes: existingSession.pahmSession.likesClicks,
            worry: existingSession.pahmSession.worryClicks,
            future: existingSession.pahmSession.futureClicks,
            anticipation: existingSession.pahmSession.anticipationClicks,
          },
          createdAt: existingSession.pahmSession.createdAt
        }
      });
    }

    // Create new PAHM session
    const pahmSession = await prisma.pAHMSession.create({
      data: {
        sessionId: validatedData.sessionId,
        userId: session.user.id,
        stageNumber: existingSession.stageNumber,
        exerciseType: validatedData.exerciseType,
        clickTimestamps: [], // Initialize empty array for click tracking
      }
    });

    return NextResponse.json({
      success: true,
      message: 'PAHM session started successfully',
      pahmSession: {
        id: pahmSession.id,
        sessionId: pahmSession.sessionId,
        stageNumber: pahmSession.stageNumber,
        exerciseType: pahmSession.exerciseType,
        totalClicks: pahmSession.totalClicks,
        clickCounts: {
          regret: pahmSession.regretClicks,
          past: pahmSession.pastClicks,
          nostalgia: pahmSession.nostalgiaClicks,
          dislikes: pahmSession.dislikesClicks,
          present: pahmSession.presentClicks,
          likes: pahmSession.likesClicks,
          worry: pahmSession.worryClicks,
          future: pahmSession.futureClicks,
          anticipation: pahmSession.anticipationClicks,
        },
        matrix: {
          positions: [
            { id: 'regret', name: 'Regret', time: 'Past', emotion: 'Dislikes', clicks: 0 },
            { id: 'past', name: 'Past', time: 'Past', emotion: 'Neutral', clicks: 0 },
            { id: 'nostalgia', name: 'Nostalgia', time: 'Past', emotion: 'Likes', clicks: 0 },
            { id: 'dislikes', name: 'Dislikes', time: 'Present', emotion: 'Dislikes', clicks: 0 },
            { id: 'present', name: 'Present', time: 'Present', emotion: 'Neutral', clicks: 0 },
            { id: 'likes', name: 'Likes', time: 'Present', emotion: 'Likes', clicks: 0 },
            { id: 'worry', name: 'Worry', time: 'Future', emotion: 'Dislikes', clicks: 0 },
            { id: 'future', name: 'Future', time: 'Future', emotion: 'Neutral', clicks: 0 },
            { id: 'anticipation', name: 'Anticipation', time: 'Future', emotion: 'Likes', clicks: 0 }
          ]
        },
        createdAt: pahmSession.createdAt
      }
    });

  } catch (error) {
    console.error('PAHM session start error:', error);
    
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