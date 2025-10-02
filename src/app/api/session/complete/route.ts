import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Decimal } from '@prisma/client/runtime/library';

// Validation schema for session completion
const sessionCompleteSchema = z.object({
  sessionId: z.string().cuid('Invalid session ID format'),
  qualityRating: z.number().int().min(1).max(10).optional(),
  insights: z.string().max(1000).optional(),
  pahmData: z.object({
    patternNotes: z.string().max(500).optional(),
    totalClicks: z.number().int().min(0).optional(),
    clickData: z.array(z.object({
      position: z.string(), // 'regret', 'past', 'nostalgia', etc.
      timestamp: z.string(),
      timeFromStart: z.number() // seconds from session start
    })).optional()
  }).optional()
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
    const validatedData = sessionCompleteSchema.parse(body);

    // Find existing session and verify ownership
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

    // Calculate actual session duration (if different from planned)
    const startedAt = existingSession.startedAt;
    const completedAt = new Date();
    const actualDurationMinutes = startedAt 
      ? Math.round((completedAt.getTime() - startedAt.getTime()) / (1000 * 60))
      : existingSession.duration;

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Update session as completed
      const completedSession = await tx.session.update({
        where: { id: validatedData.sessionId },
        data: {
          status: 'completed',
          completedAt: completedAt,
          qualityRating: validatedData.qualityRating,
          insights: validatedData.insights,
          duration: actualDurationMinutes, // Update with actual duration
          updatedAt: completedAt,
        },
        include: {
          stage: {
            select: {
              name: true,
              description: true,
              sessionType: true,
              minSessions: true,
              minHours: true
            }
          }
        }
      });

      // Update PAHM session if exists
      let updatedPahmSession = null;
      if (existingSession.pahmSession && validatedData.pahmData) {
        // Process click data to update individual position counts
        const clickCounts = {
          regretClicks: 0,
          pastClicks: 0,
          nostalgiaClicks: 0,
          dislikesClicks: 0,
          presentClicks: 0,
          likesClicks: 0,
          worryClicks: 0,
          futureClicks: 0,
          anticipationClicks: 0,
        };

        // Count clicks by position
        if (validatedData.pahmData.clickData) {
          validatedData.pahmData.clickData.forEach(click => {
            const position = click.position;
            if (position in clickCounts) {
              clickCounts[position as keyof typeof clickCounts]++;
            }
          });
        }

        updatedPahmSession = await tx.pAHMSession.update({
          where: { sessionId: validatedData.sessionId },
          data: {
            ...clickCounts,
            totalClicks: validatedData.pahmData.totalClicks || 
                        Object.values(clickCounts).reduce((sum, count) => sum + count, 0),
            clickTimestamps: validatedData.pahmData.clickData || [],
            patternNotes: validatedData.pahmData.patternNotes,
            updatedAt: completedAt,
          }
        });
      }

      // Update user stage progress
      const progressUpdate = await tx.userStageProgress.upsert({
        where: {
          userId_stageId_subStage: {
            userId: session.user.id,
            stageId: existingSession.stageId,
            subStage: existingSession.subStage || ''
          }
        },
        update: {
          sessionsCompleted: { increment: 1 },
          hoursCompleted: { 
            increment: new Decimal(actualDurationMinutes).div(60) 
          },
          updatedAt: completedAt,
        },
        create: {
          userId: session.user.id,
          stageId: existingSession.stageId,
          stageNumber: existingSession.stageNumber,
          subStage: existingSession.subStage,
          sessionsCompleted: 1,
          hoursCompleted: new Decimal(actualDurationMinutes).div(60),
        }
      });

      // Check if stage/sub-stage is now completed
      const stageRequirements = existingSession.stage;
      const isStageCompleted = progressUpdate.sessionsCompleted >= stageRequirements.minSessions &&
                              progressUpdate.hoursCompleted.gte(stageRequirements.minHours);

      if (isStageCompleted && !progressUpdate.isCompleted) {
        await tx.userStageProgress.update({
          where: { id: progressUpdate.id },
          data: {
            isCompleted: true,
            completedAt: completedAt
          }
        });
      }

      return {
        session: completedSession,
        pahmSession: updatedPahmSession,
        progress: {
          ...progressUpdate,
          isCompleted: isStageCompleted,
          completedAt: isStageCompleted ? completedAt : progressUpdate.completedAt
        },
        stageCompleted: isStageCompleted
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Session completed successfully',
      session: {
        id: result.session.id,
        stageNumber: result.session.stageNumber,
        subStage: result.session.subStage,
        sessionType: result.session.sessionType,
        duration: result.session.duration,
        actualDuration: actualDurationMinutes,
        status: result.session.status,
        qualityRating: result.session.qualityRating,
        insights: result.session.insights,
        startedAt: result.session.startedAt,
        completedAt: result.session.completedAt,
        stage: result.session.stage
      },
      progress: {
        sessionsCompleted: result.progress.sessionsCompleted,
        hoursCompleted: result.progress.hoursCompleted.toNumber(),
        isStageCompleted: result.stageCompleted,
        completedAt: result.progress.completedAt
      },
      pahmSession: result.pahmSession ? {
        id: result.pahmSession.id,
        totalClicks: result.pahmSession.totalClicks,
        patternNotes: result.pahmSession.patternNotes,
        clickCounts: {
          regret: result.pahmSession.regretClicks,
          past: result.pahmSession.pastClicks,
          nostalgia: result.pahmSession.nostalgiaClicks,
          dislikes: result.pahmSession.dislikesClicks,
          present: result.pahmSession.presentClicks,
          likes: result.pahmSession.likesClicks,
          worry: result.pahmSession.worryClicks,
          future: result.pahmSession.futureClicks,
          anticipation: result.pahmSession.anticipationClicks,
        }
      } : null
    });

  } catch (error) {
    console.error('Session completion error:', error);
    
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