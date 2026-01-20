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
          status: 'COMPLETED'
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
      const isCompleted = isStageCompleted(stage)
      // A stage is unlocked if it has user progress entry OR it's Stage 1 (always unlocked)
      const isUnlocked = stage.userProgress.length > 0 || stage.stageNumber === 1

      // For Stage 1 with substages, aggregate session counts
      let sessionsCompleted = 0
      let hoursCompleted = 0
      
      if (stage.hasSubStages && stage.stageNumber === 1) {
        // Sum up sessions from all substages (T1-T5, excluding PAHM)
        const subStages = ['T1', 'T2', 'T3', 'T4', 'T5']
        sessionsCompleted = stage.userProgress
          .filter((p: any) => subStages.includes(p.subStage))
          .reduce((sum: number, p: any) => sum + p.sessionsCompleted, 0)
        
        // Get max hours from any substage
        hoursCompleted = Math.max(...stage.userProgress
          .filter((p: any) => subStages.includes(p.subStage))
          .map((p: any) => p.hoursCompleted?.toNumber() || 0))
      } else {
        // For other stages, use first progress entry
        const progress = stage.userProgress[0]
        sessionsCompleted = progress?.sessionsCompleted || 0
        hoursCompleted = progress?.hoursCompleted?.toNumber() || 0
      }

      return {
        stageNumber: stage.stageNumber,
        name: stage.name,
        description: stage.description,
        minSessions: stage.minSessions,
        minHours: stage.minHours.toNumber(),
        sessionsCompleted,
        hoursCompleted,
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

// Helper: Determine current stage (maximum unlocked stage)
function determineCurrentStage(stages: any[]) {
  let maxUnlockedStage = 1
  
  // Find the highest unlocked stage (has user progress entry)
  for (const stage of stages) {
    // A stage is unlocked if it has userProgress
    if (stage.userProgress.length > 0) {
      maxUnlockedStage = stage.stageNumber
    }
  }
  
  const currentStage = stages.find(s => s.stageNumber === maxUnlockedStage)
  
  return {
    number: maxUnlockedStage,
    name: currentStage?.name || 'Seeker'
  }
}

// Helper: Check if stage is completed
function isStageCompleted(stage: any) {
  if (!stage.userProgress || stage.userProgress.length === 0) {
    return false
  }

  // For Stage 1 with substages
  if (stage.hasSubStages && stage.stageNumber === 1) {
    // Check if all substages (T1-T5) are completed
    const requiredSubStages = ['T1', 'T2', 'T3', 'T4', 'T5']
    const allSubStagesCompleted = requiredSubStages.every(subStage => {
      const progress = stage.userProgress.find((p: any) => p.subStage === subStage)
      return progress && progress.isCompleted
    })
    
    // Check if PAHM intro is completed
    const pahmProgress = stage.userProgress.find((p: any) => p.subStage === 'PAHM')
    const pahmCompleted = pahmProgress && pahmProgress.isCompleted
    
    return allSubStagesCompleted && pahmCompleted
  }

  // For other stages, check the single progress entry
  const progress = stage.userProgress[0]
  return progress && progress.isCompleted
}

// Export type for type safety
export type HomePageData = Awaited<ReturnType<typeof getHomePageData>>
