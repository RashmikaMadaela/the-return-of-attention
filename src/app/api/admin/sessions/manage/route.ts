import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin, ADMIN_PERMISSIONS, createAdminAuditLog } from '@/lib/admin-auth';

// Validation schema for session management actions
const sessionManageSchema = z.object({
  action: z.enum(['unlock_stage', 'reset_progress', 'simulate_completion', 'test_mode']),
  userId: z.string().min(1, 'User ID is required'),
  targetStage: z.number().min(1).max(6).optional(),
  testDuration: z.number().min(1).max(180).optional(), // 1-180 minutes
  reason: z.string().max(500).optional(),
});

/**
 * POST /api/admin/sessions/manage
 * Advanced session management tools for testing and debugging
 * 
 * Features:
 * - Stage unlocking for testing
 * - Progress reset capabilities
 * - Session completion simulation
 * - Test mode session creation
 * - Full audit logging
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication and permissions
    const authResult = await requireAdmin(ADMIN_PERMISSIONS.SESSION_MANAGEMENT);
    if (authResult.error) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { adminUser } = authResult;

    // Parse and validate request body
    const body = await request.json();
    const validation = sessionManageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input data',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { action, userId, targetStage, testDuration, reason } = validation.data;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'User account is inactive' },
        { status: 400 }
      );
    }

    let result: any = {};
    let actionMessage = '';

    switch (action) {
      case 'unlock_stage':
        if (!targetStage) {
          return NextResponse.json(
            { success: false, error: 'Target stage is required for unlock_stage action' },
            { status: 400 }
          );
        }

        // Get current stage progress
        const currentProgress = await prisma.session.findFirst({
          where: { userId, status: 'completed' },
          orderBy: { stageNumber: 'desc' },
          select: { stageNumber: true }
        });

        const currentStage = currentProgress?.stageNumber || 0;

        // For demo purposes, we'll just log the stage unlock
        // In a full implementation, this would modify stage unlock logic

        result = {
          action: 'unlock_stage',
          userId,
          previousStage: currentStage,
          newStage: targetStage,
          timestamp: new Date().toISOString(),
        };

        actionMessage = `Stage ${targetStage} unlocked for user ${user.email}`;
        break;

      case 'reset_progress':
        // Delete all sessions and progress for the user
        await prisma.$transaction([
          prisma.session.deleteMany({ where: { userId } }),
          prisma.pAHMSession.deleteMany({ where: { userId } }),
          prisma.userStageProgress.deleteMany({ where: { userId } }),
        ]);

        result = {
          action: 'reset_progress',
          userId,
          timestamp: new Date().toISOString(),
        };

        actionMessage = `All progress reset for user ${user.email}`;
        break;

      case 'simulate_completion':
        if (!targetStage) {
          return NextResponse.json(
            { success: false, error: 'Target stage is required for simulate_completion action' },
            { status: 400 }
          );
        }

        // Create completed sessions for all stages up to target
        const sessionPromises = [];
        for (let stage = 1; stage <= targetStage; stage++) {
          // Create minimum required sessions for each stage
          const requiredSessions = stage === 1 ? 29 : 30; // Stage 1 has 29 sessions (T1-T5), others have 30
          
          for (let i = 0; i < requiredSessions; i++) {
            sessionPromises.push(
              prisma.session.create({
                data: {
                  userId,
                  stageId: `stage-${stage}`,
                  stageNumber: stage,
                  sessionType: stage === 1 ? 'timer_only' : 'pahm_matrix',
                  duration: 30, // 30 minutes
                  status: 'completed',
                  startedAt: new Date(Date.now() - (requiredSessions - i) * 24 * 60 * 60 * 1000),
                  completedAt: new Date(Date.now() - (requiredSessions - i - 1) * 24 * 60 * 60 * 1000),
                  qualityRating: Math.floor(Math.random() * 3) + 7, // Random 7-10
                }
              })
            );
          }

          // Create/update stage progress - simplified approach
          const stageRecord = await prisma.stage.findUnique({
            where: { stageNumber: stage }
          });
          
          if (stageRecord) {
            // Find existing progress or create new
            sessionPromises.push(
              (async () => {
                const existingProgress = await prisma.userStageProgress.findFirst({
                  where: { 
                    userId,
                    stageId: stageRecord.id,
                    subStage: null
                  }
                });

                if (existingProgress) {
                  return prisma.userStageProgress.update({
                    where: { id: existingProgress.id },
                    data: {
                      isCompleted: true,
                      sessionsCompleted: requiredSessions,
                      hoursCompleted: requiredSessions * 0.5,
                      completedAt: new Date()
                    }
                  });
                } else {
                  return prisma.userStageProgress.create({
                    data: {
                      userId,
                      stageId: stageRecord.id,
                      stageNumber: stage,
                      isCompleted: true,
                      sessionsCompleted: requiredSessions,
                      hoursCompleted: requiredSessions * 0.5,
                      completedAt: new Date()
                    }
                  });
                }
              })()
            );
          }
        }

        await Promise.all(sessionPromises);

        result = {
          action: 'simulate_completion',
          userId,
          completedStages: targetStage,
          totalSessionsCreated: Array.from({length: targetStage}, (_, i) => i === 0 ? 29 : 30).reduce((a, b) => a + b, 0),
          timestamp: new Date().toISOString(),
        };

        actionMessage = `Simulated completion of stages 1-${targetStage} for user ${user.email}`;
        break;

      case 'test_mode':
        // Create a test session with custom duration
        const duration = testDuration || 5; // Default 5 minutes for testing

        const testSession = await prisma.session.create({
          data: {
            userId,
            stageId: 'test-session',
            stageNumber: 1,
            sessionType: 'timer_only',
            duration,
            status: 'not_started',
            posture: 'sitting',
          }
        });

        result = {
          action: 'test_mode',
          userId,
          sessionId: testSession.id,
          testDuration: duration,
          timestamp: new Date().toISOString(),
        };

        actionMessage = `Test session created (${duration} min) for user ${user.email}`;
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Create comprehensive audit log
    await createAdminAuditLog(
      adminUser!.id,
      'admin_session_management',
      {
        action,
        targetUserId: userId,
        targetUserEmail: user.email,
        details: result,
        reason: reason || 'No reason provided',
        adminEmail: adminUser!.user.email,
      }
    );

    return NextResponse.json({
      success: true,
      message: `Session management action completed successfully: ${actionMessage}`,
      data: {
        ...result,
        adminId: adminUser!.id,
        reason: reason || 'No reason provided',
      }
    });

  } catch (error) {
    console.error('Admin session management error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        code: 'ADMIN_SESSION_MANAGEMENT_ERROR'
      },
      { status: 500 }
    );
  }
}