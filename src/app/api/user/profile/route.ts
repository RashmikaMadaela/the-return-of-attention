import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireAuth, createErrorResponse, createSuccessResponse, checkRateLimit } from '@/lib/session'
import { updateProfileSchema } from '@/lib/validations/user'

/**
 * GET /api/user/profile
 * Retrieve current user's profile information
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authError = await requireAuth(request)
    if (authError) return authError

    // Rate limiting
    const session = await getServerSession(authOptions)
    const rateLimitResult = checkRateLimit(`profile_get_${session!.user.id}`, 30, 60000) // 30 requests per minute
    if (!rateLimitResult.allowed) {
      return createErrorResponse('Rate limit exceeded. Please try again later.', 429, 'RATE_LIMIT_EXCEEDED')
    }

    // Get user profile data
    const user = await prisma.user.findUnique({
      where: { id: session!.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            age: true,
            gender: true,
            nationality: true,
            country: true,
            createdAt: true,
            updatedAt: true
          }
        },
        questionnaire: {
          select: {
            isCompleted: true,
            createdAt: true
          }
        },
        selfAssessments: {
          select: {
            id: true,
            type: true,
            totalScore: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 3 // Last 3 assessments
        },
        _count: {
          select: {
            sessions: true,
            dailyNotes: true,
            happinessScores: true
          }
        }
      }
    })

    if (!user) {
      return createErrorResponse('User not found', 404, 'USER_NOT_FOUND')
    }

    // Calculate profile completion percentage
    const completionChecks = [
      !!user.name,
      !!user.profile?.age,
      !!user.profile?.gender,
      !!user.profile?.nationality,
      !!user.profile?.country,
      !!user.questionnaire?.isCompleted,
      user.selfAssessments.length > 0
    ]
    const profileCompletion = Math.round(
      (completionChecks.filter(Boolean).length / completionChecks.length) * 100
    )

    const profileData = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profileCompletion
      },
      personalInfo: user.profile ? {
        age: user.profile.age,
        gender: user.profile.gender,
        nationality: user.profile.nationality,
        country: user.profile.country,
        createdAt: user.profile.createdAt,
        updatedAt: user.profile.updatedAt
      } : null,
      assessmentStatus: {
        questionnaireCompleted: !!user.questionnaire?.isCompleted,
        questionnaireCompletedAt: user.questionnaire?.createdAt,
        selfAssessments: user.selfAssessments,
        totalSelfAssessments: user.selfAssessments.length
      },
      statistics: {
        totalSessions: user._count.sessions,
        totalNotes: user._count.dailyNotes,
        totalHappinessScores: user._count.happinessScores
      }
    }

    return createSuccessResponse(profileData, 'Profile retrieved successfully')

  } catch (error) {
    console.error('GET /api/user/profile error:', error)
    return createErrorResponse('Internal server error', 500, 'INTERNAL_ERROR')
  }
}

/**
 * PUT /api/user/profile
 * Update current user's basic profile information (name, image)
 */
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const authError = await requireAuth(request)
    if (authError) return authError

    // Rate limiting
    const session = await getServerSession(authOptions)
    const rateLimitResult = checkRateLimit(`profile_update_${session!.user.id}`, 10, 60000) // 10 requests per minute
    if (!rateLimitResult.allowed) {
      return createErrorResponse('Rate limit exceeded. Please try again later.', 429, 'RATE_LIMIT_EXCEEDED')
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = updateProfileSchema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
      return createErrorResponse('Validation failed', 400, 'VALIDATION_ERROR', { errors })
    }

    const { name, image } = validationResult.data
    const userId = session!.user.id

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true }
    })

    if (!existingUser) {
      return createErrorResponse('User not found', 404, 'USER_NOT_FOUND')
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(image !== undefined && { image }),
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        emailVerified: true,
        isActive: true,
        updatedAt: true
      }
    })

    return createSuccessResponse(
      { user: updatedUser },
      'Profile updated successfully'
    )

  } catch (error) {
    console.error('PUT /api/user/profile error:', error)
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return createErrorResponse('Email already exists', 409, 'EMAIL_EXISTS')
      }
    }

    return createErrorResponse('Internal server error', 500, 'INTERNAL_ERROR')
  }
}

// Handle unsupported methods
export async function POST() {
  return createErrorResponse('Method not allowed', 405, 'METHOD_NOT_ALLOWED')
}

export async function DELETE() {
  return createErrorResponse('Method not allowed', 405, 'METHOD_NOT_ALLOWED')
}