import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/progress/stage-1
 * Fetch Stage 1 (Seeker) progress with all sub-stages (T1-T5) and PAHM intro
 * Optimized with parallel queries
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
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
      return NextResponse.json(
        { success: false, error: 'Stage 1 not found' },
        { status: 404 }
      )
    }

    // Parse sub-stages from JSON
    const subStagesConfig = Array.isArray(stage1Data.subStages) 
      ? stage1Data.subStages 
      : []

    // Map sub-stages with progress data
    const subStages = subStagesConfig.map((subStage: any, index: number) => {
      const subStageId = subStage.id || subStage.name
      const progress = userProgressData.find(p => p.subStage === subStageId)
      
      // Check if sub-stage is unlocked
      // T1 is always unlocked, others unlock when previous is completed
      const isUnlocked = index === 0 || 
        subStagesConfig.slice(0, index).every((prevSubStage: any) =>
          userProgressData.some(p => 
            p.subStage === (prevSubStage.id || prevSubStage.name) && 
            p.isCompleted
          )
        )

      const sessionsCompleted = progress?.sessionsCompleted || 0
      const hoursCompleted = progress?.hoursCompleted.toNumber() || 0
      const minSessions = subStage.minSessions || 3
      const progressPercent = Math.min(100, Math.round((sessionsCompleted / minSessions) * 100))

      return {
        id: subStageId,
        name: subStage.name,
        duration: subStage.minDuration || subStage.duration || 10,
        minSessions,
        sessionsCompleted,
        hoursCompleted: Math.round(hoursCompleted * 100) / 100,
        isCompleted: progress?.isCompleted || false,
        isUnlocked,
        progressPercent
      }
    })

    // Check PAHM intro status
    // PAHM intro unlocks when all T1-T5 are completed
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

    const responseData = {
      subStages,
      pahmIntro,
      summary: {
        completedLevels,
        totalSessions,
        totalHours: Math.round(totalHours * 100) / 100,
        completionPercent
      }
    }

    return NextResponse.json({
      success: true,
      data: responseData
    })

  } catch (error) {
    console.error('Stage 1 progress error:', error)
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
