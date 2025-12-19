/**
 * SERVER-SIDE USER PROFILE DATA FETCHER
 * Optimized for fast server component rendering
 */

import { cache } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
 * Fetch user profile data directly from database
 * Uses React cache() for deduplication during SSR
 */
export const getUserProfileData = cache(async (): Promise<UserProfileData | null> => {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return null
    }

    // Single database query with all relations (parallel loading)
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
          where: { status: 'COMPLETED' },
          select: {
            id: true
          }
        }
      }
    })

    if (!user) {
      return null
    }

    // Calculate total completed sessions
    const sessionTableCount = user.sessions.length
    const stageProgressSessions = user.stageProgress.reduce((sum, progress) => {
      return sum + (progress.sessionsCompleted || 0)
    }, 0)
    const totalSessions = Math.max(sessionTableCount, stageProgressSessions)

    // Calculate total hours
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

    // Get user role
    const userRoleResult = await prisma.$queryRaw<Array<{role: string}>>`
      SELECT role FROM users WHERE email = ${session.user.email}
    `
    const userRole = userRoleResult[0]?.role || 'user'

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
