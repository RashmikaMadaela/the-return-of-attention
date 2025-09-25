import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions, hashPassword, verifyPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireAuth, createErrorResponse, createSuccessResponse, checkRateLimit } from '@/lib/session'
import { changePasswordSchema } from '@/lib/validations/user'

/**
 * PUT /api/user/change-password
 * Change current user's password
 */
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const authError = await requireAuth(request)
    if (authError) return authError

    // Rate limiting (stricter for password changes)
    const session = await getServerSession(authOptions)
    const rateLimitResult = checkRateLimit(`change_password_${session!.user.id}`, 3, 300000) // 3 requests per 5 minutes
    if (!rateLimitResult.allowed) {
      return createErrorResponse('Rate limit exceeded. Please try again later.', 429, 'RATE_LIMIT_EXCEEDED')
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = changePasswordSchema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
      return createErrorResponse('Validation failed', 400, 'VALIDATION_ERROR', { errors })
    }

    const { currentPassword, newPassword } = validationResult.data
    const userId = session!.user.id

    // Get user with current password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        password: true,
        emailVerified: true
      }
    })

    if (!user) {
      return createErrorResponse('User not found', 404, 'USER_NOT_FOUND')
    }

    // Check if user has a password (could be OAuth-only user)
    if (!user.password) {
      return createErrorResponse('Cannot change password for OAuth-only accounts', 400, 'OAUTH_ACCOUNT')
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return createErrorResponse('Current password is incorrect', 400, 'INVALID_CURRENT_PASSWORD')
    }

    // Check if new password is different from current
    const isSamePassword = await verifyPassword(newPassword, user.password)
    if (isSamePassword) {
      return createErrorResponse('New password must be different from current password', 400, 'SAME_PASSWORD')
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword)

    // Update password in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date()
      }
    })

    // Log the password change for security (optional - you can remove this if not needed)
    console.log(`Password changed for user ${user.email} at ${new Date().toISOString()}`)

    return createSuccessResponse(
      {
        message: 'Password changed successfully',
        updatedAt: new Date().toISOString()
      },
      'Password changed successfully'
    )

  } catch (error) {
    console.error('PUT /api/user/change-password error:', error)
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint')) {
        return createErrorResponse('User not found', 404, 'USER_NOT_FOUND')
      }
    }

    return createErrorResponse('Internal server error', 500, 'INTERNAL_ERROR')
  }
}

// Handle unsupported methods
export async function GET() {
  return createErrorResponse('Method not allowed', 405, 'METHOD_NOT_ALLOWED')
}

export async function POST() {
  return createErrorResponse('Method not allowed', 405, 'METHOD_NOT_ALLOWED')
}

export async function DELETE() {
  return createErrorResponse('Method not allowed', 405, 'METHOD_NOT_ALLOWED')
}