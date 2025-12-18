/**
 * HOME PAGE DATA FETCHER (SERVER-SIDE)
 * Direct database queries optimized for performance
 * Replaces slow API routes with efficient parallel queries
 */

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { cache } from 'react'

// Cache the data fetching function to avoid duplicate queries during SSR
export const getHomePageData = cache(async () => {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }

  const userId = session.user.id

  try {
    // Execute all queries in parallel for maximum performance
    const [
      user,
      stagesWithProgress,
      sessionStats,
      happinessScore,
      assessments
    ] = await Promise.all([
      // User info
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        }
      }),

      // Stages with progress - optimized query
      prisma.stage.findMany({
        include: {
          userProgress: {
            where: { userId },
            select: {
              stageNumber: true,
              subStage: true,
              sessionsCompleted: true,
              hoursCompleted: true,
              isCompleted: true
            }
          }
        },
        orderBy: { stageNumber: 'asc' }
      }),

      // Session statistics - single aggregation
      prisma.session.aggregate({
        where: { 
          userId,
          status: 'completed'
        },
        _count: { id: true },
        _sum: { duration: true }
      }),

      // Latest happiness score only
      prisma.happinessScore.findFirst({
        where: { userId },
        orderBy: { calculatedAt: 'desc' },
        select: {
          finalScore: true,
          userLevel: true,
          calculatedAt: true
        }
      }),

      // Assessment status
      Promise.all([
        prisma.questionnaire.findFirst({
          where: { userId },
          select: { isCompleted: true }
        }),
        prisma.selfAssessment.findFirst({
          where: { 
            userId,
            type: 'initial'
          },
          select: { createdAt: true }
        })
      ])
    ])

    if (!user) {
      return null
    }

    // Process stages data efficiently
    const currentStage = determineCurrentStage(stagesWithProgress)
    const completedStagesCount = stagesWithProgress.filter(stage => 
      isStageCompleted(stage)
    ).length

    // Calculate happiness points
    const happinessPoints = happinessScore?.finalScore?.toNumber() || 0

    // Process assessment status
    const [questionnaire, selfAssessment] = assessments
    const questionnaireCompleted = !!questionnaire?.isCompleted
    const selfAssessmentCompleted = !!selfAssessment?.createdAt

    // Map stages for frontend consumption
    const stages = stagesWithProgress.map(stage => {
      const progress = stage.userProgress[0] || null
      const isCompleted = isStageCompleted(stage)
      const isUnlocked = stage.stageNumber === 1 || 
        stagesWithProgress.find(s => s.stageNumber === stage.stageNumber - 1)?.userProgress.some(p => p.isCompleted)

      return {
        stageNumber: stage.stageNumber,
        name: stage.name,
        description: stage.description,
        minSessions: stage.minSessions,
        minHours: stage.minHours.toNumber(),
        sessionsCompleted: progress?.sessionsCompleted || 0,
        hoursCompleted: progress?.hoursCompleted?.toNumber() || 0,
        isCompleted,
        isUnlocked,
        hasSubStages: stage.hasSubStages,
        subStages: stage.subStages
      }
    })

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        memberSince: user.createdAt.toISOString()
      },
      journey: {
        currentStage,
        totalStages: stagesWithProgress.length,
        completedStages: completedStagesCount
      },
      happiness: {
        currentScore: happinessScore ? {
          score: happinessScore.finalScore.toNumber(),
          level: happinessScore.userLevel,
          calculatedAt: happinessScore.calculatedAt.toISOString()
        } : null
      },
      assessments: {
        questionnaire: {
          completed: questionnaireCompleted
        },
        initial: {
          completed: selfAssessmentCompleted
        }
      },
      stages,
      stats: {
        totalSessions: sessionStats._count.id,
        totalHours: sessionStats._sum.duration 
          ? Math.floor(sessionStats._sum.duration / 60) 
          : 0
      }
    }
  } catch (error) {
    console.error('Error fetching home page data:', error)
    throw error
  }
})

// Helper: Determine current stage
function determineCurrentStage(stages: any[]) {
  // Find first incomplete stage
  for (const stage of stages) {
    if (!isStageCompleted(stage)) {
      return {
        number: stage.stageNumber,
        name: stage.name
      }
    }
  }
  
  // All stages completed
  return {
    number: stages.length,
    name: stages[stages.length - 1]?.name || 'Complete'
  }
}

// Helper: Check if stage is completed
function isStageCompleted(stage: any) {
  const progress = stage.userProgress[0]
  
  if (!progress) {
    return false
  }

  // For Stage 1 with substages
  if (stage.hasSubStages && stage.stageNumber === 1) {
    // Check if all requirements are met
    const sessionsRequirementMet = progress.sessionsCompleted >= stage.minSessions
    const hoursRequirementMet = progress.hoursCompleted 
      ? progress.hoursCompleted.toNumber() >= stage.minHours.toNumber()
      : false
    
    return progress.isCompleted && sessionsRequirementMet && hoursRequirementMet
  }

  // For other stages
  return progress.isCompleted
}

// Export type for type safety
export type HomePageData = Awaited<ReturnType<typeof getHomePageData>>
