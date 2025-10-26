/**
 * AUTHENTICATION MIDDLEWARE
 * Provides authentication utilities and middleware for API routes
 */

import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAdminUser } from '@/lib/admin-auth'
import { CommonErrors } from '@/lib/errors'
import type { Session } from 'next-auth'

// ============================================================================
// SESSION UTILITIES
// ============================================================================

/**
 * Get authenticated user session from API route
 */
export async function getAuthenticatedUser(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user?.id) {
    throw CommonErrors.unauthorized()
  }

  if (!session.user.isActive) {
    throw CommonErrors.accountInactive()
  }

  return session.user
}

/**
 * Get authenticated user with full profile data
 */
export async function getAuthenticatedUserWithProfile(request: NextRequest) {
  const sessionUser = await getAuthenticatedUser(request)
  
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      profile: true,
      questionnaire: true,
      selfAssessments: {
        orderBy: { createdAt: 'desc' }
      },
      stageProgress: {
        include: { stage: true }
      }
    }
  })

  if (!user) {
    throw CommonErrors.userNotFound()
  }

  return user
}

/**
 * Verify user owns a resource
 */
export async function verifyResourceOwnership(
  request: NextRequest,
  resourceUserId: string
) {
  const user = await getAuthenticatedUser(request)
  
  if (user.id !== resourceUserId) {
    throw CommonErrors.unauthorized()
  }

  return user
}

/**
 * Check if user is admin
 */
export async function requireAdmin(request: NextRequest) {
  // Use centralized admin user checker which reads User.role
  const adminUser = await getAdminUser()
  if (!adminUser) {
    throw CommonErrors.unauthorized()
  }

  // Return the session user data and the derived adminUser object
  const sessionUser = await getAuthenticatedUser(request)
  return { user: sessionUser, adminUser }
}

// ============================================================================
// ASSESSMENT REQUIREMENTS
// ============================================================================

/**
 * Check if user has completed required assessments for stage access
 */
export async function checkAssessmentRequirements(
  userId: string,
  stageNumber: number
): Promise<{ 
  canAccess: boolean
  missingAssessments: string[]
  questionnaireDone: boolean
  initialAssessmentDone: boolean
  midAssessmentDone: boolean
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      questionnaire: true,
      selfAssessments: true
    }
  })

  if (!user) {
    throw CommonErrors.userNotFound()
  }

  const questionnaireDone = !!user.questionnaire?.isCompleted
  const initialAssessmentDone = user.selfAssessments.some(a => a.type === 'initial')
  const midAssessmentDone = user.selfAssessments.some(a => a.type === 'mid')

  const missingAssessments: string[] = []

  // Basic requirements for all stages
  if (!questionnaireDone) {
    missingAssessments.push('questionnaire')
  }
  
  if (!initialAssessmentDone) {
    missingAssessments.push('initial self-assessment')
  }

  // Stage 4+ requires mid assessment (after completing stage 3)
  if (stageNumber >= 4 && !midAssessmentDone) {
    // Check if user has completed stage 3
    const stage3Progress = await prisma.userStageProgress.findFirst({
      where: { userId, stageNumber: 3, isCompleted: true }
    })
    
    if (stage3Progress && !midAssessmentDone) {
      missingAssessments.push('mid self-assessment')
    }
  }

  return {
    canAccess: missingAssessments.length === 0,
    missingAssessments,
    questionnaireDone,
    initialAssessmentDone,
    midAssessmentDone
  }
}

/**
 * Check if user can access a specific stage
 */
export async function checkStageAccess(
  userId: string,
  stageNumber: number
): Promise<{
  canAccess: boolean
  reason?: string
  requirements?: {
    questionnaire: boolean
    initialAssessment: boolean
    previousStages: boolean
    midAssessment?: boolean
  }
}> {
  // Check assessment requirements
  const assessmentCheck = await checkAssessmentRequirements(userId, stageNumber)
  
  if (!assessmentCheck.canAccess) {
    return {
      canAccess: false,
      reason: `Complete required assessments: ${assessmentCheck.missingAssessments.join(', ')}`,
      requirements: {
        questionnaire: assessmentCheck.questionnaireDone,
        initialAssessment: assessmentCheck.initialAssessmentDone,
        previousStages: true,
        ...(stageNumber >= 4 && { midAssessment: assessmentCheck.midAssessmentDone })
      }
    }
  }

  // Stage 1 is always accessible after assessments
  if (stageNumber === 1) {
    return { canAccess: true }
  }

  // Check if previous stages are completed
  const previousStageProgress = await prisma.userStageProgress.findFirst({
    where: { 
      userId, 
      stageNumber: stageNumber - 1,
      isCompleted: true
    }
  })

  if (!previousStageProgress) {
    return {
      canAccess: false,
      reason: `Complete Stage ${stageNumber - 1} first`,
      requirements: {
        questionnaire: true,
        initialAssessment: true,
        previousStages: false,
        ...(stageNumber >= 4 && { midAssessment: assessmentCheck.midAssessmentDone })
      }
    }
  }

  return { canAccess: true }
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Check if user has an active session
 */
export async function checkActiveSession(userId: string) {
  const activeSession = await prisma.session.findFirst({
    where: {
      userId,
      status: 'in_progress'
    },
    include: {
      stage: true
    }
  })

  return activeSession
}

/**
 * Get user's current stage and progress
 */
export async function getUserCurrentStage(userId: string) {
  const stageProgress = await prisma.userStageProgress.findMany({
    where: { userId },
    include: { stage: true },
    orderBy: { stageNumber: 'asc' }
  })

  // Find current stage (first incomplete stage)
  const currentStageProgress = stageProgress.find(p => !p.isCompleted)
  const completedStages = stageProgress.filter(p => p.isCompleted)

  return {
    currentStage: currentStageProgress,
    completedStages,
    allProgress: stageProgress
  }
}

// ============================================================================
// HAPPINESS SCORE REQUIREMENTS
// ============================================================================

/**
 * Check if happiness score can be calculated
 */
export async function checkHappinessScoreRequirements(userId: string): Promise<{
  canCalculate: boolean
  hasQuestionnaire: boolean
  hasSelfAssessment: boolean
  missingComponents: string[]
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      questionnaire: true,
      selfAssessments: true
    }
  })

  if (!user) {
    throw CommonErrors.userNotFound()
  }

  const hasQuestionnaire = !!user.questionnaire?.isCompleted
  const hasSelfAssessment = user.selfAssessments.length > 0
  
  const missingComponents: string[] = []
  
  if (!hasQuestionnaire) {
    missingComponents.push('questionnaire')
  }
  
  if (!hasSelfAssessment) {
    missingComponents.push('self-assessment')
  }

  return {
    canCalculate: missingComponents.length === 0,
    hasQuestionnaire,
    hasSelfAssessment,
    missingComponents
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Extract user ID from request headers or session
 */
export async function extractUserId(request: NextRequest): Promise<string | null> {
  try {
    const user = await getAuthenticatedUser(request)
    return user.id
  } catch {
    return null
  }
}

/**
 * Check if request is from authenticated user
 */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  try {
    await getAuthenticatedUser(request)
    return true
  } catch {
    return false
  }
}

/**
 * Get request context with user information
 */
export async function getRequestContext(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'

    return {
      user,
      userAgent,
      ip,
      timestamp: new Date()
    }
  } catch (error) {
    return {
      user: null,
      userAgent: request.headers.get('user-agent') || 'unknown',
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          'unknown',
      timestamp: new Date()
    }
  }
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface AuthenticatedUser {
  id: string
  email: string
  name?: string | null
  image?: string | null
  isActive: boolean
}

export interface RequestContext {
  user: AuthenticatedUser | null
  userAgent: string
  ip: string
  timestamp: Date
}

export interface StageAccessCheck {
  canAccess: boolean
  reason?: string
  requirements?: {
    questionnaire: boolean
    initialAssessment: boolean
    previousStages: boolean
    midAssessment?: boolean
  }
}