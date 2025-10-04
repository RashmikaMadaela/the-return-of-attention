import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin, createAdminAuditLog } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

// Validation schema for stage management actions
const stageActionSchema = z.object({
  action: z.enum(['unlock', 'reset', 'time_skip']),
  userId: z.string().min(1, 'User ID is required'),
  stageNumber: z.number().int().min(1).max(6, 'Stage number must be between 1 and 6'),
  reason: z.string().min(1, 'Reason is required'),
  skipDays: z.number().int().min(1).max(365).optional(), // For time_skip action
});

/**
 * POST /api/admin/stages/manage
 * Admin stage management operations
 * 
 * Supported Actions:
 * - unlock: Manually create progress for a specific stage
 * - reset: Reset a stage progress to initial state
 * - time_skip: Fast forward through time-dependent elements
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication and permissions
    const authResult = await requireAdmin('stages.manage');
    if (authResult.error) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }
    const { adminUser } = authResult;

    // Parse and validate request body
    const body = await request.json();
    const validation = stageActionSchema.safeParse(body);

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

    const { action, userId, stageNumber, reason, skipDays } = validation.data;

    // Find the target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
      }
    });

    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    if (!targetUser.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot manage stages for inactive user',
        },
        { status: 400 }
      );
    }

    // Find the stage by number
    const stage = await prisma.stage.findUnique({
      where: { stageNumber }
    });

    if (!stage) {
      return NextResponse.json(
        {
          success: false,
          error: 'Stage not found',
        },
        { status: 404 }
      );
    }

    let result;
    let message;

    switch (action) {
      case 'unlock':
        // Create stage progress entry for the user
        result = await prisma.userStageProgress.create({
          data: {
            userId,
            stageId: stage.id,
            stageNumber: stage.stageNumber,
            sessionsCompleted: 0,
            hoursCompleted: 0,
            isCompleted: false,
          }
        });

        message = `Stage ${stageNumber} unlocked successfully`;
        break;

      case 'reset':
        // Reset the specified stage and all subsequent stages
        result = await prisma.$transaction(async (tx) => {
          // Delete stage progress for this stage and beyond
          await tx.userStageProgress.deleteMany({
            where: { 
              userId,
              stageNumber: { gte: stageNumber }
            }
          });

          // Delete related sessions for this stage and beyond
          await tx.session.deleteMany({
            where: {
              userId,
              stageNumber: { gte: stageNumber }
            }
          });

          // Delete PAHM sessions for this stage and beyond
          await tx.pAHMSession.deleteMany({
            where: {
              userId,
              stageNumber: { gte: stageNumber }
            }
          });

          return { deletedStages: stageNumber };
        });

        message = `Stage ${stageNumber} and subsequent stages reset successfully`;
        break;

      case 'time_skip':
        if (!skipDays) {
          return NextResponse.json(
            {
              success: false,
              error: 'skipDays parameter is required for time_skip action',
            },
            { status: 400 }
          );
        }

        // Fast forward through time-dependent elements
        const pastDate = new Date(Date.now() - (skipDays * 24 * 60 * 60 * 1000));

        result = await prisma.$transaction(async (tx) => {
          // Update session timestamps to appear as if they happened in the past
          const updatedSessions = await tx.session.updateMany({
            where: {
              userId,
              stageNumber: { lte: stageNumber }
            },
            data: {
              startedAt: pastDate,
              completedAt: new Date(pastDate.getTime() + (30 * 60 * 1000)) // Add 30 minutes
            }
          });

          return updatedSessions;
        });

        message = `Time skipped ${skipDays} days for stage ${stageNumber}`;
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
          },
          { status: 400 }
        );
    }

    // Create audit log
    if (adminUser) {
      await createAdminAuditLog(
        adminUser.id,
        `stage_${action}`,
        {
          targetUserId: userId,
          targetUserEmail: targetUser.email,
          stageNumber,
          reason,
          skipDays: skipDays || undefined,
          timestamp: new Date().toISOString()
        }
      );
    }

    return NextResponse.json({
      success: true,
      message,
      data: {
        action,
        userId,
        userEmail: targetUser.email,
        stageNumber,
        reason,
        skipDays: skipDays || undefined,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Stage management error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        code: 'STAGE_MANAGEMENT_ERROR'
      },
      { status: 500 }
    );
  }
}