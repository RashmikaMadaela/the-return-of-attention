import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin, createAdminAuditLog } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

// Validation schema for data clearing actions
const clearDataSchema = z.object({
  action: z.enum(['clear_all_data', 'clear_user_data', 'clear_system_data']),
  targetType: z.enum(['practice_sessions', 'mind_recovery_sessions', 'emotional_notes', 'user_progress', 'questionnaires', 'self_assessments', 'onboarding_progress', 'all']),
  userId: z.string().optional(), // Required for clear_user_data
  reason: z.string().min(1, 'Reason is required'),
  confirmationCode: z.string().min(1, 'Confirmation code required for destructive operations'),
});

/**
 * POST /api/admin/data/clear
 * Admin data clearing operations
 * 
 * Supported Actions:
 * - clear_all_data: Clear all data of specified type for all users
 * - clear_user_data: Clear specific user's data of specified type
 * - clear_system_data: Clear system-wide aggregated data
 * 
 * Target Types:
 * - practice_sessions: All user meditation/practice sessions
 * - mind_recovery_sessions: Mind recovery exercise sessions
 * - emotional_notes: Daily emotional tracking notes
 * - user_progress: User stage progression data
 * - questionnaires: Initial questionnaire responses
 * - self_assessments: Self-assessment results
 * - onboarding_progress: Onboarding completion data
 * - all: Everything (DANGEROUS)
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication and permissions (requires super_admin for destructive operations)
    const authResult = await requireAdmin('system.configure');
    if (authResult.error) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }
    const { adminUser } = authResult;

    // Parse and validate request body
    const body = await request.json();
    const validation = clearDataSchema.safeParse(body);

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

    const { action, targetType, userId, reason, confirmationCode } = validation.data;

    // Verify confirmation code (in production, this should be more secure)
    const validConfirmationCode = process.env.ADMIN_CLEAR_DATA_CODE || 'CLEAR-DATA-2024';
    if (confirmationCode !== validConfirmationCode) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid confirmation code',
        },
        { status: 403 }
      );
    }

    // Check if userId is required for user-specific actions
    if (action === 'clear_user_data' && !userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'userId is required for clear_user_data action',
        },
        { status: 400 }
      );
    }

    let result;
    let message;
    let recordsDeleted = 0;

    const whereClause = action === 'clear_user_data' ? { userId } : {};

    switch (targetType) {
      case 'practice_sessions':
        result = await prisma.session.deleteMany({
          where: {
            ...whereClause,
            sessionType: { in: ['timer_only', 'pahm_matrix'] }
          }
        });
        recordsDeleted = result.count;
        message = `Deleted ${recordsDeleted} practice sessions`;
        break;

      case 'mind_recovery_sessions':
        result = await prisma.session.deleteMany({
          where: {
            ...whereClause,
            sessionType: 'mind_recovery'
          }
        });
        recordsDeleted = result.count;
        message = `Deleted ${recordsDeleted} mind recovery sessions`;
        break;

      case 'emotional_notes':
        result = await prisma.dailyNote.deleteMany({
          where: whereClause
        });
        recordsDeleted = result.count;
        message = `Deleted ${recordsDeleted} emotional notes`;
        break;

      case 'user_progress':
        result = await prisma.userStageProgress.deleteMany({
          where: whereClause
        });
        recordsDeleted = result.count;
        message = `Deleted ${recordsDeleted} user progress records`;
        break;

      case 'questionnaires':
        result = await prisma.questionnaire.deleteMany({
          where: whereClause
        });
        recordsDeleted = result.count;
        message = `Deleted ${recordsDeleted} questionnaires`;
        break;

      case 'self_assessments':
        result = await prisma.selfAssessment.deleteMany({
          where: whereClause
        });
        recordsDeleted = result.count;
        message = `Deleted ${recordsDeleted} self assessments`;
        break;

      case 'onboarding_progress':
        // This would be based on user profiles or specific onboarding tracking
        result = await prisma.userProfile.deleteMany({
          where: whereClause
        });
        recordsDeleted = result.count;
        message = `Deleted ${recordsDeleted} onboarding progress records`;
        break;

      case 'all':
        // DANGEROUS: Delete all user data
        result = await prisma.$transaction(async (tx) => {
          const counts = {
            sessions: 0,
            pahmSessions: 0,
            dailyNotes: 0,
            userProgress: 0,
            questionnaires: 0,
            selfAssessments: 0,
            userProfiles: 0,
            happinessScores: 0,
          };

          if (action === 'clear_user_data' && userId) {
            // Clear specific user's data
            counts.sessions = (await tx.session.deleteMany({ where: { userId } })).count;
            counts.pahmSessions = (await tx.pAHMSession.deleteMany({ where: { userId } })).count;
            counts.dailyNotes = (await tx.dailyNote.deleteMany({ where: { userId } })).count;
            counts.userProgress = (await tx.userStageProgress.deleteMany({ where: { userId } })).count;
            counts.questionnaires = (await tx.questionnaire.deleteMany({ where: { userId } })).count;
            counts.selfAssessments = (await tx.selfAssessment.deleteMany({ where: { userId } })).count;
            counts.userProfiles = (await tx.userProfile.deleteMany({ where: { userId } })).count;
            counts.happinessScores = (await tx.happinessScore.deleteMany({ where: { userId } })).count;
          } else if (action === 'clear_all_data') {
            // Clear all users' data (EXTREMELY DANGEROUS)
            counts.sessions = (await tx.session.deleteMany({})).count;
            counts.pahmSessions = (await tx.pAHMSession.deleteMany({})).count;
            counts.dailyNotes = (await tx.dailyNote.deleteMany({})).count;
            counts.userProgress = (await tx.userStageProgress.deleteMany({})).count;
            counts.questionnaires = (await tx.questionnaire.deleteMany({})).count;
            counts.selfAssessments = (await tx.selfAssessment.deleteMany({})).count;
            counts.userProfiles = (await tx.userProfile.deleteMany({})).count;
            counts.happinessScores = (await tx.happinessScore.deleteMany({})).count;
          }

          return counts;
        });

        recordsDeleted = Object.values(result).reduce((sum, count) => sum + count, 0);
        message = `Deleted ${recordsDeleted} total records across all data types`;
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid target type',
          },
          { status: 400 }
        );
    }

    // Create audit log
    if (adminUser) {
      await createAdminAuditLog(
        adminUser.id,
        `data_clear_${action}`,
        {
          targetType,
          userId: userId || 'all_users',
          recordsDeleted,
          reason,
          confirmationCode: 'PROVIDED', // Don't log the actual code
          timestamp: new Date().toISOString()
        }
      );
    }

    return NextResponse.json({
      success: true,
      message,
      data: {
        action,
        targetType,
        userId: userId || 'all_users',
        recordsDeleted,
        reason,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Data clearing error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        code: 'DATA_CLEAR_ERROR'
      },
      { status: 500 }
    );
  }
}