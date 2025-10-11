import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateProfileSchema, validateRequestBody } from '@/lib/validation'
import { getAuthenticatedUser } from '@/lib/auth/middleware'
import { handleApiError, createSuccessResponse, CommonErrors } from '@/lib/errors'

/**
 * GET /api/user/profile
 * Retrieve current user's profile information
 */
export async function GET(_request: NextRequest) {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser(_request)

    // Get user profile data
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        emailVerified: true,
        isActive: true,
        role: true,
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
            totalScore: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 3
        },
        happinessScores: {
          select: {
            finalScore: true,
            userLevel: true,
            calculatedAt: true
          },
          orderBy: { calculatedAt: 'desc' },
          take: 1
        },
        stageProgress: {
          select: {
            sessionsCompleted: true,
            hoursCompleted: true
          }
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

    if (!userProfile) {
      throw CommonErrors.userNotFound()
    }

    // Calculate profile completion percentage
    const completionChecks = [
      !!userProfile.name,
      !!userProfile.profile?.age,
      !!userProfile.profile?.gender,
      !!userProfile.profile?.nationality,
      !!userProfile.profile?.country,
      !!userProfile.questionnaire?.isCompleted,
      userProfile.selfAssessments.length > 0
    ]
    const profileCompletion = Math.round(
      (completionChecks.filter(Boolean).length / completionChecks.length) * 100
    )

    const profileData = {
      user: {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        image: userProfile.image,
        emailVerified: userProfile.emailVerified,
        isActive: userProfile.isActive,
        createdAt: userProfile.createdAt,
        updatedAt: userProfile.updatedAt,
        profileCompletion
      },
      personalInfo: userProfile.profile,
      assessmentStatus: {
        questionnaireCompleted: !!userProfile.questionnaire?.isCompleted,
        questionnaireCompletedAt: userProfile.questionnaire?.createdAt,
        selfAssessments: userProfile.selfAssessments,
        totalSelfAssessments: userProfile.selfAssessments.length
      },
      statistics: {
        totalSessions: userProfile._count.sessions,
        totalNotes: userProfile._count.dailyNotes,
        totalHappinessScores: userProfile._count.happinessScores
      }
    }

    return createSuccessResponse(profileData, 'Profile retrieved successfully')

  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PUT /api/user/profile
 * Update current user's basic profile information (name, image)
 */
export async function PUT(_request: NextRequest) {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser(_request)

    // Validate request body
  const body = await _request.json()
    const validation = validateRequestBody(updateProfileSchema, body)
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      }, { status: 400 })
    }

    const { name, image } = validation.data

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
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
    return handleApiError(error)
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json({
    success: false,
    message: 'Method not allowed'
  }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({
    success: false,
    message: 'Method not allowed'
  }, { status: 405 })
}