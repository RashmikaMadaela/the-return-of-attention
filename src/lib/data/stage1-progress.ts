/**
 * Server-side data fetching for Stage 1 progress
 * Optimized for Next.js 15 Server Components
 */
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cache } from 'react'

export interface SubStageProgress {
  id: string
  name: string
  duration: number
  minSessions: number
  sessionsCompleted: number
  hoursCompleted: number
  isCompleted: boolean
  meetsSessionRequirement: boolean
  isUnlocked: boolean
  progressPercent: number
}

export interface Stage1ProgressData {
  subStages: SubStageProgress[]
  pahmIntro: {
    isCompleted: boolean
    isUnlocked: boolean
    sessionsCompleted: number
  }
  summary: {
    completedLevels: number
    totalSessions: number
    totalHours: number
    completionPercent: number
  }
}

/**
 * Fetch Stage 1 progress data
 * Uses React cache() for deduplication within a single request
 */
export const getStage1Progress = cache(async (): Promise<Stage1ProgressData | null> => {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return null
    }

    const userId = session.user.id

    // Parallel query optimization - fetch all data at once
    const [stage1Data, userProgressData] = await Promise.all([
      // Get Stage 1 details
      prisma.stage.findFirst({
        where: { stageNumber: 1 },
        select: {
          id: true,
          stageNumber: true,
          name: true,
          hasSubStages: true,
          subStages: true,
        }
      }),
      
      // Get all user progress for Stage 1
      prisma.userStageProgress.findMany({
        where: {
          userId,
          stageNumber: 1
        },
        select: {
          subStage: true,
          sessionsCompleted: true,
          hoursCompleted: true,
          isCompleted: true,
        }
      })
    ])

    if (!stage1Data) {
      return null
    }

    // Parse sub-stages from JSON
    const subStagesConfig = Array.isArray(stage1Data.subStages) 
      ? stage1Data.subStages 
      : []

    // Map sub-stages with progress data
    const subStages: SubStageProgress[] = subStagesConfig.map((subStage: any, index: number) => {
      const subStageId = subStage.id || subStage.name
      const progress = userProgressData.find(p => p.subStage === subStageId)

      const sessionsCompleted = progress?.sessionsCompleted || 0
      const hoursCompleted = progress?.hoursCompleted ? Number(progress.hoursCompleted) : 0
      const minSessions = subStage.minSessions || 3

      // Determine whether the user meets the session requirement
      const meetsSessionRequirement = sessionsCompleted >= minSessions

      // Cap progress percent at 100%
      const progressPercent = Math.min(100, Math.round((sessionsCompleted / Math.max(1, minSessions)) * 100))

      // Check if sub-stage is unlocked
      const isUnlocked = index === 0 ||
        subStagesConfig.slice(0, index).every((prevSubStage: any) => {
          const prevId = prevSubStage.id || prevSubStage.name
          const prevProgress = userProgressData.find(p => p.subStage === prevId)
          const prevMin = prevSubStage.minSessions || 3
          const prevSessions = prevProgress?.sessionsCompleted || 0
          return prevSessions >= prevMin
        })

      return {
        id: subStageId,
        name: subStage.name,
        duration: subStage.minDuration || subStage.duration || 10,
        minSessions,
        sessionsCompleted,
        hoursCompleted: Math.round(hoursCompleted * 100) / 100,
        isCompleted: meetsSessionRequirement,
        meetsSessionRequirement,
        isUnlocked,
        progressPercent
      }
    })

    // Check PAHM intro status
    const allSubStagesCompleted = subStages
      .filter(s => s.id !== 'PAHM')
      .every(s => s.isCompleted)
    
    const pahmIntroProgress = userProgressData.find(p => p.subStage === 'PAHM')
    
    const pahmIntro = {
      isCompleted: pahmIntroProgress?.isCompleted || false,
      isUnlocked: allSubStagesCompleted,
      sessionsCompleted: pahmIntroProgress?.sessionsCompleted || 0
    }

    // Calculate summary statistics
    const completedLevels = subStages.filter(s => s.isCompleted).length
    const totalSessions = subStages.reduce((sum, s) => sum + s.sessionsCompleted, 0)
    const totalHours = subStages.reduce((sum, s) => sum + s.hoursCompleted, 0)
    const completionPercent = subStages.length > 0 
      ? Math.round((completedLevels / subStages.length) * 100)
      : 0

    return {
      subStages,
      pahmIntro,
      summary: {
        completedLevels,
        totalSessions,
        totalHours: Math.round(totalHours * 100) / 100,
        completionPercent
      }
    }

  } catch (error) {
    console.error('Stage 1 progress error:', error)
    return null
  }
})
