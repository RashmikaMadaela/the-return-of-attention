import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin, createAdminAuditLog } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

// Validation schema for user management actions
const userActionSchema = z.object({
  action: z.enum(['disable', 'reactivate', 'delete', 'reset_progress']),
  userId: z.string().min(1, 'User ID is required'),
  reason: z.string().min(1, 'Reason is required'),
});

/**
 * POST /api/admin/users/manage
 * Admin user management actions
 * 
 * Supported Actions:
 * - disable: Deactivate user account
 * - reactivate: Reactivate user account
 * - delete: Permanently delete user account
 * - reset_progress: Reset user's progress and data
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication and permissions
    const authResult = await requireAdmin('users.write');
    if (authResult.error) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }
    const { adminUser } = authResult;

    // Parse and validate request body
    const body = await request.json();
    const validation = userActionSchema.safeParse(body);

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

    const { action, userId, reason } = validation.data;

    // Find the target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
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

    // Check if trying to manage another admin (prevent admins from deleting other admins accidentally)
    if (targetUser.id !== adminUser?.userId && !adminUser?.permissions?.includes('admin.manage')) {
      // Allow managing regular users, but require special permission for admin users
      const targetUserRole = await prisma.user.findUnique({
        where: { id: targetUser.id },
        select: { role: true }
      });
      
      if (targetUserRole?.role === 'admin') {
        return NextResponse.json(
          {
            success: false,
            error: 'Insufficient permissions to manage admin users',
          },
          { status: 403 }
        );
      }
    }

    let result;
    let message;

    switch (action) {
      case 'disable':
        if (!targetUser.isActive) {
          return NextResponse.json(
            {
              success: false,
              error: 'User is already disabled',
            },
            { status: 400 }
          );
        }

        result = await prisma.user.update({
          where: { id: userId },
          data: { isActive: false }
        });

        message = 'User disabled successfully';
        break;

      case 'reactivate':
        if (targetUser.isActive) {
          return NextResponse.json(
            {
              success: false,
              error: 'User is already active',
            },
            { status: 400 }
          );
        }

        result = await prisma.user.update({
          where: { id: userId },
          data: { isActive: true }
        });

        message = 'User reactivated successfully';
        break;

      case 'delete':
        // Require super_admin permission for deletion
        if (!adminUser?.permissions?.includes('users.delete')) {
          return NextResponse.json(
            {
              success: false,
              error: 'Insufficient permissions for user deletion',
            },
            { status: 403 }
          );
        }

        // Perform cascade deletion in transaction
        result = await prisma.$transaction(async (tx) => {
          // Delete related data first
          await tx.happinessScore.deleteMany({ where: { userId } });
          await tx.userStageProgress.deleteMany({ where: { userId } });
          await tx.session.deleteMany({ where: { userId } });
          await tx.pAHMSession.deleteMany({ where: { userId } });
          await tx.selfAssessment.deleteMany({ where: { userId } });
          await tx.questionnaire.deleteMany({ where: { userId } });
          await tx.dailyNote.deleteMany({ where: { userId } });
          await tx.account.deleteMany({ where: { userId } });
          
          // Finally delete the user
          return await tx.user.delete({ where: { id: userId } });
        });

        message = 'User deleted permanently';
        break;

      case 'reset_progress':
        // Reset all user progress and data (but keep the user account)
        result = await prisma.$transaction(async (tx) => {
          // Reset/delete progress data
          await tx.happinessScore.deleteMany({ where: { userId } });
          await tx.userStageProgress.deleteMany({ where: { userId } });
          await tx.session.deleteMany({ where: { userId } });
          await tx.pAHMSession.deleteMany({ where: { userId } });
          await tx.selfAssessment.deleteMany({ where: { userId } });
          await tx.questionnaire.deleteMany({ where: { userId } });
          await tx.dailyNote.deleteMany({ where: { userId } });
          
          // Keep user account but reset key fields
          return await tx.user.update({
            where: { id: userId },
            data: {
              // Reset onboarding status if needed
              // Keep basic profile info intact
            }
          });
        });

        message = 'User progress reset successfully';
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
        `user_${action}`,
        {
          targetUserId: userId,
          targetUserEmail: targetUser.email,
          reason,
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
        reason,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('User management error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        code: 'USER_MANAGEMENT_ERROR'
      },
      { status: 500 }
    );
  }
}