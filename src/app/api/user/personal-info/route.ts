import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireAuth, createErrorResponse, createSuccessResponse, checkRateLimit } from '@/lib/session'
import { updatePersonalInfoSchema } from '@/lib/validations/user'

/**
 * GET /api/user/personal-info
 * Retrieve current user's personal information
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authError = await requireAuth(request)
    if (authError) return authError

    // Rate limiting
    const session = await getServerSession(authOptions)
    const rateLimitResult = checkRateLimit(`personal_info_get_${session!.user.id}`, 30, 60000) // 30 requests per minute
    if (!rateLimitResult.allowed) {
      return createErrorResponse('Rate limit exceeded. Please try again later.', 429, 'RATE_LIMIT_EXCEEDED')
    }

    // Get user personal information
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: session!.user.id },
      select: {
        age: true,
        gender: true,
        nationality: true,
        country: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
            email: true,
            createdAt: true
          }
        }
      }
    })

    if (!userProfile) {
      return createErrorResponse('Personal information not found', 404, 'PROFILE_NOT_FOUND')
    }

    return createSuccessResponse(
      { personalInfo: userProfile },
      'Personal information retrieved successfully'
    )

  } catch (error) {
    console.error('GET /api/user/personal-info error:', error)
    return createErrorResponse('Internal server error', 500, 'INTERNAL_ERROR')
  }
}

/**
 * PUT /api/user/personal-info
 * Update current user's personal information
 */
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const authError = await requireAuth(request)
    if (authError) return authError

    // Rate limiting
    const session = await getServerSession(authOptions)
    const rateLimitResult = checkRateLimit(`personal_info_update_${session!.user.id}`, 10, 60000) // 10 requests per minute
    if (!rateLimitResult.allowed) {
      return createErrorResponse('Rate limit exceeded. Please try again later.', 429, 'RATE_LIMIT_EXCEEDED')
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = updatePersonalInfoSchema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
      return createErrorResponse('Validation failed', 400, 'VALIDATION_ERROR', { errors })
    }

    const { age, gender, nationality, country } = validationResult.data
    const userId = session!.user.id

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    })

    if (!existingUser) {
      return createErrorResponse('User not found', 404, 'USER_NOT_FOUND')
    }

    // Update or create user profile
    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        ...(age !== undefined && { age }),
        ...(gender !== undefined && { gender }),
        ...(nationality !== undefined && { nationality }),
        ...(country !== undefined && { country }),
        updatedAt: new Date()
      },
      create: {
        userId,
        age: age || 18, // Default age if not provided
        gender: gender || 'prefer_not_to_say',
        nationality: nationality || '',
        country: country || ''
      },
      select: {
        age: true,
        gender: true,
        nationality: true,
        country: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return createSuccessResponse(
      { personalInfo: updatedProfile },
      'Personal information updated successfully'
    )

  } catch (error) {
    console.error('PUT /api/user/personal-info error:', error)
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint')) {
        return createErrorResponse('User not found', 404, 'USER_NOT_FOUND')
      }
    }

    return createErrorResponse('Internal server error', 500, 'INTERNAL_ERROR')
  }
}

/**
 * POST /api/user/personal-info
 * Create initial personal information for user (alternative to PUT)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authError = await requireAuth(request)
    if (authError) return authError

    // Rate limiting
    const session = await getServerSession(authOptions)
    const rateLimitResult = checkRateLimit(`personal_info_create_${session!.user.id}`, 5, 300000) // 5 requests per 5 minutes
    if (!rateLimitResult.allowed) {
      return createErrorResponse('Rate limit exceeded. Please try again later.', 429, 'RATE_LIMIT_EXCEEDED')
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = updatePersonalInfoSchema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
      return createErrorResponse('Validation failed', 400, 'VALIDATION_ERROR', { errors })
    }

    const { age, gender, nationality, country } = validationResult.data
    const userId = session!.user.id

    // Check if profile already exists
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { id: true }
    })

    if (existingProfile) {
      return createErrorResponse('Personal information already exists. Use PUT to update.', 409, 'PROFILE_EXISTS')
    }

    // Create new user profile
    const newProfile = await prisma.userProfile.create({
      data: {
        userId,
        age: age || 18,
        gender: gender || 'prefer_not_to_say',
        nationality: nationality || '',
        country: country || ''
      },
      select: {
        age: true,
        gender: true,
        nationality: true,
        country: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return createSuccessResponse(
      { personalInfo: newProfile },
      'Personal information created successfully',
      201
    )

  } catch (error) {
    console.error('POST /api/user/personal-info error:', error)
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return createErrorResponse('Personal information already exists', 409, 'PROFILE_EXISTS')
      }
      if (error.message.includes('Foreign key constraint')) {
        return createErrorResponse('User not found', 404, 'USER_NOT_FOUND')
      }
    }

    return createErrorResponse('Internal server error', 500, 'INTERNAL_ERROR')
  }
}

// Handle unsupported methods
export async function DELETE() {
  return createErrorResponse('Method not allowed', 405, 'METHOD_NOT_ALLOWED')
}