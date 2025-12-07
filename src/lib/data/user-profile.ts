/**
 * Server-side data fetching for user profile
 * Optimized for Next.js 15 Server Components
 */
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cache } from 'react'

export interface UserProfileData {
  name: string
  email: string
  role: string
  profile: {
    age: number
    gender: string
    nationality: string
    country: string
  } | null
  happiness: number
  sessions: number
  userLevel: string
  hours: number
  questionnaireCompleted: boolean
  selfAssessmentCompleted: boolean
}

/**
 * Fetch user profile data
 * Uses React cache() for deduplication within a single request
 */
export const getUserProfile = cache(async (): Promise<UserProfileData | null> => {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return null
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: true,
        questionnaire: {
          select: {
            isCompleted: true
          }
        },
        selfAssessments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        happinessScores: {
          select: {
            finalScore: true,
            userLevel: true
          },
          orderBy: { calculatedAt: 'desc' },
          take: 1
        },
        stageProgress: {
          select: {
            hoursCompleted: true,
            sessionsCompleted: true
          }
        },
        sessions: {
          where: { status: 'completed' },
          select: {
            id: true
          }
        }
      }
    })

    if (!user) {
      return null
    }

    // Calculate total completed sessions from both Session table and UserStageProgress
    const sessionTableCount = user.sessions.length
    const stageProgressSessions = user.stageProgress.reduce((sum, progress) => {
      return sum + (progress.sessionsCompleted || 0)
    }, 0)
    const totalSessions = Math.max(sessionTableCount, stageProgressSessions)

    // Calculate total hours from stage progress
    const totalHours = user.stageProgress.reduce((sum, progress) => {
      return sum + parseFloat(progress.hoursCompleted.toString())
    }, 0)

    // Get latest happiness score and user level
    const latestHappinessScore = user.happinessScores[0]
    const happiness = latestHappinessScore ? parseFloat(latestHappinessScore.finalScore.toString()) : 0
    const userLevel = latestHappinessScore?.userLevel || 'Seeker'

    // Check assessment completion status
    const questionnaireCompleted = !!user.questionnaire?.isCompleted
    const selfAssessmentCompleted = user.selfAssessments.length > 0

    // Try to get role from user object, fallback to query if not available
    let userRole = 'user'
    try {
      // @ts-ignore - role field may not be in generated Prisma types yet
      userRole = user.role || 'user'
    } catch {
      // Fallback to query if role is not in Prisma types
      const userRoleResult = await prisma.$queryRaw<Array<{role: string}>>`
        SELECT role FROM "User" WHERE id = ${user.id} LIMIT 1
      `
      userRole = userRoleResult[0]?.role || 'user'
    }

    return {
      name: user.name || user.email.split('@')[0],
      email: user.email,
      role: userRole,
      profile: user.profile,
      happiness: Math.round(happiness),
      sessions: totalSessions,
      userLevel: userLevel,
      hours: Math.round(totalHours),
      questionnaireCompleted,
      selfAssessmentCompleted
    }

  } catch (error) {
    console.error('Error fetching user profile data:', error)
    return null
  }
})
