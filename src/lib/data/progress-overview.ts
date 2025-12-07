/**
 * Server-side data fetching for progress overview
 * Optimized for Next.js 15 Server Components
 */
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cache } from 'react'

// Type definitions
interface SubStageConfig {
  id?: string
  name: string
}

interface UserProgress {
  subStage: string | null
  sessionsCompleted: number
  hoursCompleted: any
  isCompleted: boolean
}

interface StageData {
  stageNumber: number
  name: string
  hasSubStages: boolean
  subStages: any
  minHours: any
  minSessions: number
  userProgress: UserProgress[]
}

export interface ProgressOverviewData {
  user: {
    name: string | null
    email: string
    memberSince: Date
    accountAge: number
  }
  journey: {
    currentStage: {
      number: number
      name: string
      progress: number
    } | null
    totalStages: number
    completedStages: number
    journeyProgress: number
    nextMilestone: string
  }
  practice: {
    totalSessions: number
    totalHours: number
    averageQuality: number | null
    currentStreak: number
    longestStreak: number
    weeklyGoals: {
      sessionsGoal: number
      sessionsCompleted: number
      hoursGoal: number
      hoursCompleted: number
      onTrack: boolean
    }
  }
  pahm: {
    totalSessions: number
    totalClicks: number
    averageClicksPerSession: number
  }
  happiness: {
    currentScore: {
      score: number
      level: string
      calculatedAt: Date
    } | null
    scoreHistory: Array<{
      score: number
      level: string
      date: Date
    }>
  }
  assessments: {
    questionnaire: {
      completed: boolean
      completedAt?: Date
    }
    initial: {
      completed: boolean
      completedAt?: Date
    }
    mid: {
      completed: boolean
      completedAt?: Date
    }
    final: {
      completed: boolean
      completedAt?: Date
    }
  }
  milestones: any[]
  recentActivity: any[]
  stages: Array<{
    stageNumber: number
    name: string
    minSessions: number
    minHours: number
    progress: number
    isCompleted: boolean
    sessionsCompleted: number
    hoursCompleted: number
  }>
}

/**
 * Fetch progress overview data
 * Uses React cache() for deduplication within a single request
 */
export const getProgressOverview = cache(async (): Promise<ProgressOverviewData | null> => {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return null
    }

    // Get user profile for account age
    const userProfile = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        createdAt: true,
        name: true,
        email: true
      }
    })

    // Get all stages with progress
    const stagesWithProgress = await prisma.stage.findMany({
      include: {
        userProgress: {
          where: { userId: session.user.id }
        }
      },
      orderBy: { stageNumber: 'asc' }
    })

    // Get session statistics
    const sessionStats = await prisma.session.aggregate({
      where: { 
        userId: session.user.id,
        status: 'completed'
      },
      _count: { id: true },
      _sum: { duration: true },
      _avg: { qualityRating: true }
    })

    // Get recent sessions for streak calculation
    const recentSessions = await prisma.session.findMany({
      where: {
        userId: session.user.id,
        status: 'completed'
      },
      select: {
        completedAt: true
      },
      orderBy: { completedAt: 'desc' },
      take: 30
    })

    // Get PAHM session statistics
    const pahmStats = await prisma.pAHMSession.aggregate({
      where: { 
        userId: session.user.id
      },
      _count: { id: true },
      _sum: { totalClicks: true },
      _avg: { totalClicks: true }
    })

    // Get happiness score history
    const happinessScores = await prisma.happinessScore.findMany({
      where: { userId: session.user.id },
      orderBy: { calculatedAt: 'desc' },
      take: 10
    })

    // Get assessment completion status
    const assessmentStatus = await getAssessmentStatus(session.user.id)

    // Helper function to check if stage is completed
    const isStageCompleted = (stage: StageData): boolean => {
      if (stage.hasSubStages && stage.subStages) {
        const subStagesArray = Array.isArray(stage.subStages) ? (stage.subStages as SubStageConfig[]) : []
        const allSubStagesCompleted = subStagesArray.every((subStage: SubStageConfig) => 
          stage.userProgress.some((p: UserProgress) => p.subStage === subStage.id && p.isCompleted)
        )
        const pahmIntroProgress = stage.userProgress.find((p: UserProgress) => p.subStage === 'PAHM')
        const pahmIntroCompleted = pahmIntroProgress?.isCompleted || false
        const totalHours = stage.userProgress.reduce((sum: number, p: UserProgress) => 
          sum + (p.hoursCompleted ? p.hoursCompleted.toNumber() : 0), 0
        )
        const hoursRequirementMet = totalHours >= stage.minHours.toNumber()
        const totalSessions = stage.userProgress.reduce((sum: number, p: UserProgress) => 
          sum + (p.sessionsCompleted || 0), 0
        )
        const sessionsRequirementMet = totalSessions >= stage.minSessions
        return allSubStagesCompleted && pahmIntroCompleted && hoursRequirementMet && sessionsRequirementMet
      }
      return stage.userProgress.some((p: UserProgress) => p.isCompleted)
    }

    // Calculate journey progress
    const totalStages = stagesWithProgress.length
    const completedStages = stagesWithProgress.filter(stage => isStageCompleted(stage)).length

    const currentStage = stagesWithProgress.find(stage => {
      const isUnlocked = stage.stageNumber === 1 || 
        stagesWithProgress.some(prevStage => 
          prevStage.stageNumber === stage.stageNumber - 1 &&
          isStageCompleted(prevStage)
        )
      const completed = isStageCompleted(stage)
      return isUnlocked && !completed
    })

    // Calculate streak
    const streak = calculateStreak(recentSessions)

    // Calculate total practice time
    const totalHours = sessionStats._sum.duration ? sessionStats._sum.duration / 60 : 0

    // Calculate stage progress details
    const stageProgress = stagesWithProgress.map(stage => {
      const progress = stage.userProgress[0]
      let overallProgress = 0
      let isCompleted = false

      if (stage.hasSubStages && stage.subStages) {
        const subStagesArray = Array.isArray(stage.subStages) ? (stage.subStages as SubStageConfig[]) : []
        const allSubStagesCompleted = subStagesArray.every((subStage: SubStageConfig) => 
          stage.userProgress.some((p: UserProgress) => p.subStage === subStage.id && p.isCompleted)
        )
        const pahmIntroProgress = stage.userProgress.find((p: UserProgress) => p.subStage === 'PAHM')
        const pahmIntroCompleted = pahmIntroProgress?.isCompleted || false
        const totalHours = stage.userProgress.reduce((sum: number, p: UserProgress) => 
          sum + (p.hoursCompleted ? p.hoursCompleted.toNumber() : 0), 0
        )
        const hoursRequirementMet = totalHours >= stage.minHours.toNumber()
        const totalSessions = stage.userProgress.reduce((sum: number, p: UserProgress) => 
          sum + (p.sessionsCompleted || 0), 0
        )
        const sessionsRequirementMet = totalSessions >= stage.minSessions
        isCompleted = allSubStagesCompleted && pahmIntroCompleted && hoursRequirementMet && sessionsRequirementMet
        const completedSubStages = subStagesArray.filter((subStage: SubStageConfig) =>
          stage.userProgress.some((p: UserProgress) => p.subStage === subStage.id && p.isCompleted)
        ).length
        overallProgress = subStagesArray.length > 0 ? 
          Math.round((completedSubStages / subStagesArray.length) * 100) : 0
      } else {
        isCompleted = stage.userProgress.some((p: UserProgress) => p.isCompleted)
        if (progress) {
          const sessionsProgress = Math.round((progress.sessionsCompleted / stage.minSessions) * 100)
          const hoursProgress = Math.round((progress.hoursCompleted.toNumber() / stage.minHours.toNumber()) * 100)
          overallProgress = Math.min(100, Math.max(sessionsProgress, hoursProgress))
        }
      }

      return {
        stageNumber: stage.stageNumber,
        name: stage.name,
        minSessions: stage.minSessions,
        minHours: stage.minHours?.toNumber ? stage.minHours.toNumber() : stage.minHours,
        progress: overallProgress,
        isCompleted,
        sessionsCompleted: stage.userProgress.reduce((sum: number, p: UserProgress) => sum + p.sessionsCompleted, 0),
        hoursCompleted: stage.userProgress.reduce((sum: number, p: UserProgress) => sum + p.hoursCompleted.toNumber(), 0)
      }
    })

    // Calculate milestones achieved
    const milestones = calculateMilestones(sessionStats._count.id || 0, totalHours, completedStages)

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentActivity = await prisma.session.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: sevenDaysAgo }
      },
      select: {
        id: true,
        stageNumber: true,
        sessionType: true,
        duration: true,
        status: true,
        completedAt: true,
        qualityRating: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Calculate weekly goals progress
    const weeklyGoals = calculateWeeklyGoals(recentActivity)

    // Get current happiness score
    const currentHappinessScore = happinessScores[0]

    return {
      user: {
        name: userProfile?.name || null,
        email: userProfile?.email || '',
        memberSince: userProfile?.createdAt || new Date(),
        accountAge: userProfile?.createdAt ? 
          Math.floor((new Date().getTime() - new Date(userProfile.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0
      },
      journey: {
        currentStage: currentStage ? {
          number: currentStage.stageNumber,
          name: currentStage.name,
          progress: stageProgress.find(s => s.stageNumber === currentStage.stageNumber)?.progress || 0
        } : null,
        totalStages,
        completedStages,
        journeyProgress: Math.round((completedStages / totalStages) * 100),
        nextMilestone: getNextMilestone(completedStages, totalStages)
      },
      practice: {
        totalSessions: sessionStats._count.id || 0,
        totalHours: Math.round(totalHours * 100) / 100,
        averageQuality: sessionStats._avg.qualityRating ? 
          Math.round(sessionStats._avg.qualityRating * 100) / 100 : null,
        currentStreak: streak,
        longestStreak: calculateLongestStreak(recentSessions),
        weeklyGoals
      },
      pahm: {
        totalSessions: pahmStats._count.id || 0,
        totalClicks: pahmStats._sum.totalClicks || 0,
        averageClicksPerSession: pahmStats._avg.totalClicks ? 
          Math.round(pahmStats._avg.totalClicks * 100) / 100 : 0
      },
      happiness: {
        currentScore: currentHappinessScore ? {
          score: currentHappinessScore.finalScore.toNumber(),
          level: currentHappinessScore.userLevel,
          calculatedAt: currentHappinessScore.calculatedAt
        } : null,
        scoreHistory: happinessScores.map(score => ({
          score: score.finalScore.toNumber(),
          level: score.userLevel,
          date: score.calculatedAt
        }))
      },
      assessments: assessmentStatus,
      milestones,
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        stageNumber: activity.stageNumber,
        sessionType: activity.sessionType,
        duration: activity.duration,
        status: activity.status,
        completedAt: activity.completedAt,
        qualityRating: activity.qualityRating,
        daysAgo: activity.completedAt ? 
          Math.floor((new Date().getTime() - new Date(activity.completedAt).getTime()) / (1000 * 60 * 60 * 24)) : null
      })),
      stages: stageProgress
    }

  } catch (error) {
    console.error('Progress overview error:', error)
    return null
  }
})

// Helper functions
async function getAssessmentStatus(userId: string) {
  const questionnaire = await prisma.questionnaire.findUnique({
    where: { userId },
    select: { id: true, createdAt: true }
  })

  const initialAssessment = await prisma.selfAssessment.findFirst({
    where: { userId, type: 'initial' },
    select: { id: true, createdAt: true }
  })

  const midAssessment = await prisma.selfAssessment.findFirst({
    where: { userId, type: 'mid' },
    select: { id: true, createdAt: true }
  })

  const finalAssessment = await prisma.selfAssessment.findFirst({
    where: { userId, type: 'final' },
    select: { id: true, createdAt: true }
  })

  return {
    questionnaire: questionnaire ? {
      completed: true,
      completedAt: questionnaire.createdAt
    } : { completed: false },
    initial: initialAssessment ? {
      completed: true,
      completedAt: initialAssessment.createdAt
    } : { completed: false },
    mid: midAssessment ? {
      completed: true,
      completedAt: midAssessment.createdAt
    } : { completed: false },
    final: finalAssessment ? {
      completed: true,
      completedAt: finalAssessment.createdAt
    } : { completed: false }
  }
}

function calculateStreak(sessions: any[]): number {
  if (sessions.length === 0) return 0

  const sessionDates = sessions
    .map(session => session.completedAt?.toISOString().split('T')[0])
    .filter(date => date)
    .filter((date, index, array) => array.indexOf(date) === index)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  if (sessionDates.length === 0) return 0

  let streak = 0
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  let currentDate = sessionDates.includes(today) ? today : 
                   sessionDates.includes(yesterday) ? yesterday : null

  if (!currentDate) return 0

  for (let i = 0; i < sessionDates.length; i++) {
    if (currentDate && sessionDates[i] === currentDate) {
      streak++
      const prevDate: Date = new Date(currentDate)
      prevDate.setDate(prevDate.getDate() - 1)
      currentDate = prevDate.toISOString().split('T')[0]
    } else {
      break
    }
  }

  return streak
}

function calculateLongestStreak(sessions: any[]): number {
  return calculateStreak(sessions)
}

function calculateMilestones(totalSessions: number, totalHours: number, completedStages: number): any[] {
  const milestones = []

  // Session milestones
  const sessionMilestones = [1, 5, 10, 25, 50, 100]
  sessionMilestones.forEach(milestone => {
    if (totalSessions >= milestone) {
      milestones.push({
        type: 'sessions',
        title: `${milestone} Sessions Completed`,
        achieved: true,
        achievedAt: null
      })
    }
  })

  // Hour milestones
  const hourMilestones = [1, 5, 10, 25, 50, 100]
  hourMilestones.forEach(milestone => {
    if (totalHours >= milestone) {
      milestones.push({
        type: 'hours',
        title: `${milestone} Hours of Practice`,
        achieved: true,
        achievedAt: null
      })
    }
  })

  // Stage milestones
  if (completedStages >= 1) {
    milestones.push({
      type: 'stage',
      title: 'First Stage Completed',
      achieved: true,
      achievedAt: null
    })
  }

  return milestones
}

function calculateWeeklyGoals(recentActivity: any[]) {
  const completedSessions = recentActivity.filter(a => a.status === 'completed').length
  const totalMinutes = recentActivity
    .filter(a => a.status === 'completed')
    .reduce((sum, a) => sum + a.duration, 0)

  return {
    sessionsGoal: 5,
    sessionsCompleted: completedSessions,
    hoursGoal: 2.5,
    hoursCompleted: Math.round((totalMinutes / 60) * 100) / 100,
    onTrack: completedSessions >= 5 && (totalMinutes / 60) >= 2.5
  }
}

function getNextMilestone(completedStages: number, totalStages: number): string {
  if (completedStages === 0) return "Complete your first stage"
  if (completedStages < totalStages / 2) return "Reach the halfway point"
  if (completedStages < totalStages) return "Complete your meditation journey"
  return "Journey completed!"
}
