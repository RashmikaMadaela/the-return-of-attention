import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin, ADMIN_PERMISSIONS, createAdminAuditLog } from '@/lib/admin-auth';

// Validation schema for query parameters
const adminUsersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'verified', 'unverified']).optional(),
  stageNumber: z.coerce.number().min(1).max(6).optional(),
  joinedAfter: z.string().optional(), // ISO date string
  hasQuestionnaire: z.coerce.boolean().optional(),
  sort: z.enum(['joinedDate', 'lastActivity', 'name', 'stage']).default('joinedDate'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * GET /api/admin/users
 * Retrieve paginated list of all users with filtering and search
 * 
 * Features:
 * - Pagination with configurable limits
 * - Multi-field search (name, email)
 * - Status filtering (active, verified, etc.)
 * - Stage progression filtering
 * - Date range filtering
 * - Assessment completion filtering
 * - Sorting by multiple fields
 * - Comprehensive user summaries
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication and permissions
    const authResult = await requireAdmin(ADMIN_PERMISSIONS.USER_MANAGEMENT);
    if (authResult.error) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { adminUser } = authResult;

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const validation = adminUsersQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      page,
      limit,
      search,
      status,
      stageNumber,
      joinedAfter,
      hasQuestionnaire,
      sort,
      order
    } = validation.data;

    // Build filter conditions
    const whereConditions: any = {};
    
    // Search by name or email
    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Status filtering
    if (status === 'active') {
      whereConditions.isActive = true;
    } else if (status === 'inactive') {
      whereConditions.isActive = false;
    } else if (status === 'verified') {
      whereConditions.emailVerified = { not: null };
    } else if (status === 'unverified') {
      whereConditions.emailVerified = null;
    }

    // Date filtering
    if (joinedAfter) {
      whereConditions.createdAt = {
        gte: new Date(joinedAfter)
      };
    }

    // Assessment completion filtering
    if (hasQuestionnaire !== undefined) {
      if (hasQuestionnaire) {
        whereConditions.questionnaire = { isNot: null };
      } else {
        whereConditions.questionnaire = null;
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort conditions
    let orderBy: any = {};
    switch (sort) {
      case 'joinedDate':
        orderBy = { createdAt: order };
        break;
      case 'lastActivity':
        orderBy = { updatedAt: order };
        break;
      case 'name':
        orderBy = { name: order };
        break;
      case 'stage':
        // Note: This would require a complex join. For now, we'll sort by created date
        orderBy = { createdAt: order };
        break;
      default:
        orderBy = { createdAt: order };
    }

    // Execute queries
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              age: true,
              gender: true,
              nationality: true,
            }
          },
          questionnaire: {
            select: {
              isCompleted: true,
              createdAt: true,
            }
          },
          selfAssessments: {
            select: {
              type: true,
              totalScore: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          sessions: {
            select: {
              id: true,
              duration: true,
              stageNumber: true,
            }
          }
        }
      }),
      prisma.user.count({ where: whereConditions })
    ]);

    // Process user data to calculate summaries
    const processedUsers = users.map(user => {
      // Calculate session statistics
      const totalSessions = user.sessions.length;
      const totalHours = user.sessions.reduce((sum, session) => sum + (session.duration || 0), 0) / 3600;
      
      // Determine current stage (highest stage from sessions)
      const currentStage = user.sessions.length > 0 
        ? Math.max(...user.sessions.map(s => s.stageNumber || 1))
        : 1;

      // Calculate completion status
      const hasQuestionnaire = !!user.questionnaire?.isCompleted;
      const initialAssessment = user.selfAssessments.find(a => a.type === 'initial');
      const midAssessment = user.selfAssessments.find(a => a.type === 'mid');
      const finalAssessment = user.selfAssessments.find(a => a.type === 'final');

      // Calculate happiness score (using most recent assessment)
      const latestAssessment = user.selfAssessments[0];
      const happinessScore = latestAssessment?.totalScore || 0;
      
      // Determine user level based on happiness score
      let userLevel = 'Seeker';
      if (happinessScore >= 90) userLevel = 'Liberation Master';
      else if (happinessScore >= 80) userLevel = 'Advanced Practitioner';
      else if (happinessScore >= 70) userLevel = 'PAHM Expert';
      else if (happinessScore >= 60) userLevel = 'PAHM Intermediate';
      else if (happinessScore >= 50) userLevel = 'PAHM Beginner';
      else if (happinessScore >= 40) userLevel = 'PAHM Trainee';
      else if (happinessScore >= 30) userLevel = 'Aware Seeker';

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        lastActivity: user.updatedAt,
        profile: user.profile ? {
          age: user.profile.age,
          gender: user.profile.gender,
          nationality: user.profile.nationality,
        } : null,
        progressSummary: {
          currentStage,
          totalSessions,
          totalHours: Math.round(totalHours * 100) / 100,
          happinessScore,
          userLevel,
        },
        completionStatus: {
          questionnaire: hasQuestionnaire,
          initialAssessment: !!initialAssessment,
          midAssessment: !!midAssessment,
          finalAssessment: !!finalAssessment,
        }
      };
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    // Create audit log
    if (adminUser) {
      await createAdminAuditLog(
        adminUser.id,
        'admin_users_list_accessed',
        {
          page,
          limit,
          search,
          status,
          resultCount: processedUsers.length,
          totalCount
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        users: processedUsers,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers: totalCount,
          usersPerPage: limit,
          hasNext,
          hasPrevious,
          nextPage: hasNext ? page + 1 : null,
          previousPage: hasPrevious ? page - 1 : null,
        },
        filters: {
          activeFilters: Object.entries({
            search,
            status,
            stageNumber,
            joinedAfter,
            hasQuestionnaire
          }).filter(([_, value]) => value !== undefined).map(([key, value]) => `${key}=${value}`),
          resultCount: processedUsers.length,
          searchTerm: search || null,
        }
      }
    });

  } catch (error) {
    console.error('Admin users list error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        code: 'ADMIN_USERS_ERROR'
      },
      { status: 500 }
    );
  }
}
