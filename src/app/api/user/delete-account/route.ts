import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions, verifyPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireAuth, createErrorResponse, createSuccessResponse, checkRateLimit } from '@/lib/session'
import { deleteAccountSchema } from '@/lib/validations/user'

/**
 * DELETE /api/user/delete-account
 * Delete current user's account and all associated data
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const authError = await requireAuth(request)
    if (authError) return authError

    // Strict rate limiting for account deletion
    const session = await getServerSession(authOptions)
    const rateLimitResult = checkRateLimit(`delete_account_${session!.user.id}`, 2, 3600000) // 2 attempts per hour
    if (!rateLimitResult.allowed) {
      return createErrorResponse('Rate limit exceeded. Please try again later.', 429, 'RATE_LIMIT_EXCEEDED')
    }

    // Parse and validate request body
    let body = {}
    try {
      const rawBody = await request.text()
      if (rawBody.trim()) {
        body = JSON.parse(rawBody)
      }
    } catch (error) {
      // If JSON parsing fails, treat as empty body
      body = {}
    }
    
    const validationResult = deleteAccountSchema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
      return createErrorResponse('Validation failed', 400, 'VALIDATION_ERROR', { errors })
    }

    const { password, confirmation, reason } = validationResult.data
    const userId = session!.user.id

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        createdAt: true,
        _count: {
          select: {
            sessions: true,
            dailyNotes: true,
            selfAssessments: true
          }
        }
      }
    })

    if (!user) {
      return createErrorResponse('User not found', 404, 'USER_NOT_FOUND')
    }

    // Verify password for non-OAuth users
    if (user.password) {
      const isPasswordValid = await verifyPassword(password, user.password)
      if (!isPasswordValid) {
        return createErrorResponse('Incorrect password', 400, 'INVALID_PASSWORD')
      }
    } else {
      // For OAuth-only users, skip password verification but log it
      console.log(`Account deletion for OAuth user ${user.email} - no password verification needed`)
    }

    // Verify confirmation text
    if (confirmation !== 'DELETE') {
      return createErrorResponse('Confirmation text must be "DELETE"', 400, 'INVALID_CONFIRMATION')
    }

    // Start transaction to delete all user data
    await prisma.$transaction(async (tx) => {
      // Delete related data in correct order (due to foreign key constraints)
      
      // 1. Delete PAHM sessions
      await tx.pAHMSession.deleteMany({
        where: { userId }
      })

      // 2. Delete sessions
      await tx.session.deleteMany({
        where: { userId }
      })

      // 3. Delete user stage progress
      await tx.userStageProgress.deleteMany({
        where: { userId }
      })

      // 4. Delete daily notes
      await tx.dailyNote.deleteMany({
        where: { userId }
      })

      // 5. Delete happiness scores
      await tx.happinessScore.deleteMany({
        where: { userId }
      })

      // 6. Delete self assessments
      await tx.selfAssessment.deleteMany({
        where: { userId }
      })

      // 7. Delete questionnaire
      await tx.questionnaire.deleteMany({
        where: { userId }
      })

      // 8. Delete user profile
      await tx.userProfile.deleteMany({
        where: { userId }
      })

      // 9. Delete NextAuth accounts
      await tx.account.deleteMany({
        where: { userId }
      })

      // 10. Delete verification tokens for this user's email
      await tx.verificationToken.deleteMany({
        where: { identifier: user.email }
      })

      // 11. Delete session challenges (cascade from sessions, but explicit for clarity)
      await tx.sessionChallenge.deleteMany({
        where: { 
          session: {
            userId: userId
          }
        }
      })

      // 12. Finally, delete the user (cascade will handle remaining relations)
      await tx.user.delete({
        where: { id: userId }
      })
    })

    // Log account deletion for audit purposes
    const deletionLog = {
      userId: user.id,
      email: user.email,
      name: user.name,
      accountAge: Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)), // days
      sessionsCount: user._count.sessions,
      notesCount: user._count.dailyNotes,
      assessmentsCount: user._count.selfAssessments,
      reason: reason || 'No reason provided',
      deletedAt: new Date().toISOString()
    }

    console.log('Account deleted:', JSON.stringify(deletionLog, null, 2))

    return createSuccessResponse(
      {
        message: 'Account deleted successfully',
        deletedAt: new Date().toISOString(),
        dataRemoved: {
          sessions: user._count.sessions,
          notes: user._count.dailyNotes,
          assessments: user._count.selfAssessments
        }
      },
      'Account and all associated data have been permanently deleted'
    )

  } catch (error) {
    console.error('DELETE /api/user/delete-account error:', error)
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint')) {
        return createErrorResponse('Cannot delete account due to data dependencies', 409, 'DELETE_CONSTRAINT')
      }
      if (error.message.includes('Record to delete does not exist')) {
        return createErrorResponse('User not found', 404, 'USER_NOT_FOUND')
      }
    }

    return createErrorResponse('Internal server error during account deletion', 500, 'INTERNAL_ERROR')
  }
}

/**
 * POST /api/user/delete-account
 * Alternative endpoint for account deletion confirmation (some clients prefer POST for destructive actions)
 */
export async function POST(request: NextRequest) {
  // Redirect to DELETE method
  return await DELETE(request)
}

// Handle unsupported methods
export async function GET() {
  return createErrorResponse('Method not allowed', 405, 'METHOD_NOT_ALLOWED')
}

export async function PUT() {
  return createErrorResponse('Method not allowed', 405, 'METHOD_NOT_ALLOWED')
}