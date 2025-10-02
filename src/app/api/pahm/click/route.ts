import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Validation schema for PAHM click tracking
const pahmClickSchema = z.object({
  pahmSessionId: z.string().cuid('Invalid PAHM session ID format'),
  position: z.enum([
    'regret', 'past', 'nostalgia',
    'dislikes', 'present', 'likes', 
    'worry', 'future', 'anticipation'
  ]),
  timestamp: z.string().datetime(),
  timeFromStart: z.number().min(0), // seconds from session start
  coordinates: z.object({
    x: z.number(),
    y: z.number()
  }).optional() // Optional mouse/touch coordinates
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
    const validatedData = pahmClickSchema.parse(body);

    // Find the PAHM session and verify ownership
    const pahmSession = await prisma.pAHMSession.findFirst({
      where: {
        id: validatedData.pahmSessionId,
        userId: session.user.id
      },
      include: {
        session: {
          select: {
            id: true,
            status: true,
            startedAt: true
          }
        }
      }
    });

    if (!pahmSession) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'PAHM session not found' 
        },
        { status: 404 }
      );
    }

    // Check if the main session is still in progress
    if (pahmSession.session.status !== 'in_progress') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Session is not in progress' 
        },
        { status: 400 }
      );
    }

    // Create click data object
    const clickData = {
      position: validatedData.position,
      timestamp: validatedData.timestamp,
      timeFromStart: validatedData.timeFromStart,
      coordinates: validatedData.coordinates
    };

    // Get current click timestamps array
    const currentTimestamps = Array.isArray(pahmSession.clickTimestamps) 
      ? pahmSession.clickTimestamps as any[]
      : [];

    // Add new click data
    const updatedTimestamps = [...currentTimestamps, clickData];

    // Prepare update data with incremented click count for the specific position
    const updateData: any = {
      totalClicks: { increment: 1 },
      clickTimestamps: updatedTimestamps,
      updatedAt: new Date()
    };

    // Increment the specific position counter
    switch (validatedData.position) {
      case 'regret':
        updateData.regretClicks = { increment: 1 };
        break;
      case 'past':
        updateData.pastClicks = { increment: 1 };
        break;
      case 'nostalgia':
        updateData.nostalgiaClicks = { increment: 1 };
        break;
      case 'dislikes':
        updateData.dislikesClicks = { increment: 1 };
        break;
      case 'present':
        updateData.presentClicks = { increment: 1 };
        break;
      case 'likes':
        updateData.likesClicks = { increment: 1 };
        break;
      case 'worry':
        updateData.worryClicks = { increment: 1 };
        break;
      case 'future':
        updateData.futureClicks = { increment: 1 };
        break;
      case 'anticipation':
        updateData.anticipationClicks = { increment: 1 };
        break;
    }

    // Update PAHM session with new click data
    const updatedPahmSession = await prisma.pAHMSession.update({
      where: { id: validatedData.pahmSessionId },
      data: updateData
    });

    // Calculate click distribution percentages
    const totalClicks = updatedPahmSession.totalClicks;
    const clickPercentages = totalClicks > 0 ? {
      regret: Math.round((updatedPahmSession.regretClicks / totalClicks) * 100),
      past: Math.round((updatedPahmSession.pastClicks / totalClicks) * 100),
      nostalgia: Math.round((updatedPahmSession.nostalgiaClicks / totalClicks) * 100),
      dislikes: Math.round((updatedPahmSession.dislikesClicks / totalClicks) * 100),
      present: Math.round((updatedPahmSession.presentClicks / totalClicks) * 100),
      likes: Math.round((updatedPahmSession.likesClicks / totalClicks) * 100),
      worry: Math.round((updatedPahmSession.worryClicks / totalClicks) * 100),
      future: Math.round((updatedPahmSession.futureClicks / totalClicks) * 100),
      anticipation: Math.round((updatedPahmSession.anticipationClicks / totalClicks) * 100),
    } : {};

    return NextResponse.json({
      success: true,
      message: `Click recorded for ${validatedData.position}`,
      clickData: {
        position: validatedData.position,
        timestamp: validatedData.timestamp,
        timeFromStart: validatedData.timeFromStart,
        newTotal: updatedPahmSession.totalClicks
      },
      pahmSession: {
        id: updatedPahmSession.id,
        totalClicks: updatedPahmSession.totalClicks,
        clickCounts: {
          regret: updatedPahmSession.regretClicks,
          past: updatedPahmSession.pastClicks,
          nostalgia: updatedPahmSession.nostalgiaClicks,
          dislikes: updatedPahmSession.dislikesClicks,
          present: updatedPahmSession.presentClicks,
          likes: updatedPahmSession.likesClicks,
          worry: updatedPahmSession.worryClicks,
          future: updatedPahmSession.futureClicks,
          anticipation: updatedPahmSession.anticipationClicks,
        },
        clickPercentages,
        lastClickAt: updatedPahmSession.updatedAt
      }
    });

  } catch (error) {
    console.error('PAHM click tracking error:', error);
    
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