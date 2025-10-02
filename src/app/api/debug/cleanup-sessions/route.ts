import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

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
        { success: false, error: 'Force cleanup required' },
        { status: 400 }
      );
    }

    console.log('🧹 Starting force session cleanup...');

    // Find all active sessions for this user
    const activeSessions = await prisma.session.findMany({
      where: {
        userId: session.user.id,
        status: 'in_progress'
      },
      include: {
        pahmSession: true
      }
    });

    console.log(`Found ${activeSessions.length} active sessions to cleanup`);

    const cleanupResults = [];
    const completedAt = new Date();

    for (const activeSession of activeSessions) {
      try {
        // Calculate approximate duration if startedAt exists
        const actualDuration = activeSession.startedAt 
          ? Math.round((completedAt.getTime() - activeSession.startedAt.getTime()) / (1000 * 60))
          : activeSession.duration;

        // Update the session as completed
        const updatedSession = await prisma.session.update({
          where: { id: activeSession.id },
          data: {
            status: 'completed',
            completedAt: completedAt,
            duration: actualDuration,
            qualityRating: 7, // Default rating for cleanup
            insights: 'Auto-completed during session cleanup',
            updatedAt: completedAt,
          }
        });

        // Update PAHM session if exists
        if (activeSession.pahmSession) {
          await prisma.pAHMSession.update({
            where: { sessionId: activeSession.id },
            data: {
              patternNotes: 'Session auto-completed during cleanup',
              updatedAt: completedAt,
            }
          });
        }

        // Update user stage progress
        await prisma.userStageProgress.upsert({
          where: {
            userId_stageId_subStage: {
              userId: session.user.id,
              stageId: activeSession.stageId,
              subStage: activeSession.subStage || ''
            }
          },
          update: {
            sessionsCompleted: { increment: 1 },
            hoursCompleted: { 
              increment: actualDuration / 60 
            },
            updatedAt: completedAt,
          },
          create: {
            userId: session.user.id,
            stageId: activeSession.stageId,
            stageNumber: activeSession.stageNumber,
            subStage: activeSession.subStage,
            sessionsCompleted: 1,
            hoursCompleted: actualDuration / 60,
          }
        });

        cleanupResults.push({
          sessionId: activeSession.id,
          stageNumber: activeSession.stageNumber,
          subStage: activeSession.subStage,
          originalDuration: activeSession.duration,
          actualDuration: actualDuration,
          hadPahmSession: !!activeSession.pahmSession,
          status: 'completed'
        });

        console.log(`✅ Cleaned up session: ${activeSession.id}`);

      } catch (error) {
        console.error(`❌ Failed to cleanup session ${activeSession.id}:`, error);
        
        cleanupResults.push({
          sessionId: activeSession.id,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${cleanupResults.filter(r => r.status === 'completed').length} active sessions`,
      cleanupResults,
      summary: {
        totalFound: activeSessions.length,
        successfullyCompleted: cleanupResults.filter(r => r.status === 'completed').length,
        failed: cleanupResults.filter(r => r.status === 'failed').length
      }
    });

  } catch (error) {
    console.error('Force session cleanup error:', error);
    
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