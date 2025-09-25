import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth'
import { prisma } from './prisma'

// Auth middleware for protected routes
export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Unauthorized. Please sign in to access this resource.',
        code: 'UNAUTHORIZED'
      }, 
      { status: 401 }
    )
  }

  // Check if user is active
  if (!session.user.isActive) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Account is inactive. Please verify your email.',
        code: 'ACCOUNT_INACTIVE'
      }, 
      { status: 403 }
    )
  }

  return null // No error, auth passed
}

// Admin auth middleware
export async function requireAdmin(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Unauthorized. Admin access required.',
        code: 'UNAUTHORIZED'
      }, 
      { status: 401 }
    )
  }

  // Check if user is admin
  const adminUser = await prisma.adminUser.findUnique({
    where: { 
      userId: session.user.id,
      isActive: true 
    }
  })

  if (!adminUser) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Forbidden. Admin privileges required.',
        code: 'FORBIDDEN'
      }, 
      { status: 403 }
    )
  }

  return null // No error, admin auth passed
}

// Get current user from session
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    return null
  }

  // Get full user data from database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      questionnaire: true,
      selfAssessments: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  })

  return user
}

// Check if user has completed required assessments
export async function checkAssessmentCompletion(userId: string) {
  const questionnaire = await prisma.questionnaire.findUnique({
    where: { userId }
  })

  const initialSelfAssessment = await prisma.selfAssessment.findFirst({
    where: { 
      userId,
      type: 'initial'
    }
  })

  return {
    questionnaireComplete: !!questionnaire?.isCompleted,
    initialSelfAssessmentComplete: !!initialSelfAssessment,
    canAccessStages: !!questionnaire?.isCompleted && !!initialSelfAssessment
  }
}

// Get user's current stage progress
export async function getUserStageProgress(userId: string) {
  const stageProgress = await prisma.userStageProgress.findMany({
    where: { userId },
    include: { stage: true },
    orderBy: { stageNumber: 'asc' }
  })

  const currentStage = stageProgress.find(progress => !progress.isCompleted) || 
                     stageProgress[stageProgress.length - 1] // If all complete, return last stage

  return {
    allProgress: stageProgress,
    currentStage: currentStage,
    completedStages: stageProgress.filter(progress => progress.isCompleted).length,
    totalStages: 6
  }
}

// Utility to handle API errors consistently
export function createErrorResponse(error: string, status = 400, code?: string) {
  return NextResponse.json(
    { 
      success: false, 
      error,
      code 
    }, 
    { status }
  )
}

// Utility to handle API success responses consistently
export function createSuccessResponse(data?: any, message?: string, status = 200) {
  return NextResponse.json(
    { 
      success: true,
      message,
      data
    }, 
    { status }
  )
}

// Rate limiting helper (basic implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(identifier: string, maxRequests = 10, windowMs = 60000) {
  const now = Date.now()
  const record = requestCounts.get(identifier)

  if (!record || now > record.resetTime) {
    // Reset or create new record
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1 }
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: maxRequests - record.count }
}

// Session utilities
export const sessionUtils = {
  // Check if session is valid and active
  async isValidSession(): Promise<boolean> {
    const session = await getServerSession(authOptions)
    return !!(session && session.user && session.user.isActive)
  },

  // Get session with user data
  async getSessionWithUser() {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) return null

    const user = await getCurrentUser()
    return { ...session, userData: user }
  },

  // Refresh session data
  async refreshSession() {
    // This would typically involve updating the JWT token
    // For now, we'll just return the current session
    return await getServerSession(authOptions)
  }
}