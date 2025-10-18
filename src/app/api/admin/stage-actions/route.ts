import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Admin Stage Actions API
 * 
 * POST /api/admin/stage-actions
 * Actions: unlock, reset, complete
 */

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check admin role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { action, stageNumber, userId } = body

    if (!action || !stageNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: action, stageNumber' },
        { status: 400 }
      )
    }

    // Get the target user (if userId provided) or use current user for testing
    const targetUserId = userId || user.id

    // Get or create stage record
    const stage = await prisma.stage.findUnique({
      where: { stageNumber }
    })

    if (!stage) {
      return NextResponse.json(
        { error: `Stage ${stageNumber} not found` },
        { status: 404 }
      )
    }

    // Handle different actions
    switch (action) {
      case 'unlock':
        return await handleUnlock(targetUserId, stage.id, stageNumber)
      
      case 'reset':
        return await handleReset(targetUserId, stage.id, stageNumber)
      
      case 'complete':
        return await handleComplete(targetUserId, stage.id, stageNumber)
      
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Admin stage action error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Unlock a stage for a user
 */
async function handleUnlock(userId: string, stageId: string, stageNumber: number) {
  try {
    // For Stage 1, create sub-stage progress entries
    if (stageNumber === 1) {
      const subStages = ['T1', 'T2', 'T3', 'T4', 'T5']
      
      for (const subStage of subStages) {
        await prisma.userStageProgress.upsert({
          where: {
            userId_stageId_subStage: {
              userId,
              stageId,
              subStage
            }
          },
          create: {
            userId,
            stageId,
            stageNumber,
            subStage,
            sessionsCompleted: 0,
            hoursCompleted: 0,
            isCompleted: false
          },
          update: {
            // If already exists, don't change completion status
          }
        })
      }
    } else {
      // For other stages, create single progress entry
      await prisma.userStageProgress.upsert({
        where: {
          userId_stageId_subStage: {
            userId,
            stageId,
            subStage: '' // Empty string for PAHM stages without sub-stages
          }
        },
        create: {
          userId,
          stageId,
          stageNumber,
          sessionsCompleted: 0,
          hoursCompleted: 0,
          isCompleted: false
        },
        update: {
          // If already exists, don't change completion status
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: `Stage ${stageNumber} unlocked successfully`,
      stageNumber
    })
  } catch (error) {
    console.error('Unlock error:', error)
    throw error
  }
}

/**
 * Reset a stage's progress for a user
 */
async function handleReset(userId: string, stageId: string, stageNumber: number) {
  try {
    // Delete all progress for this stage
    await prisma.userStageProgress.deleteMany({
      where: {
        userId,
        stageId
      }
    })

    // Delete all sessions for this stage
    await prisma.session.deleteMany({
      where: {
        userId,
        stageNumber
      }
    })

    return NextResponse.json({
      success: true,
      message: `Stage ${stageNumber} reset successfully`,
      stageNumber
    })
  } catch (error) {
    console.error('Reset error:', error)
    throw error
  }
}

/**
 * Mark a stage as completed for a user
 */
async function handleComplete(userId: string, stageId: string, stageNumber: number) {
  try {
    const stage = await prisma.stage.findUnique({
      where: { id: stageId }
    })

    if (!stage) {
      return NextResponse.json(
        { error: 'Stage not found' },
        { status: 404 }
      )
    }

    // For Stage 1, mark all sub-stages as completed
    if (stageNumber === 1) {
      const subStages = ['T1', 'T2', 'T3', 'T4', 'T5']
      
      for (const subStage of subStages) {
        await prisma.userStageProgress.upsert({
          where: {
            userId_stageId_subStage: {
              userId,
              stageId,
              subStage
            }
          },
          create: {
            userId,
            stageId,
            stageNumber,
            subStage,
            sessionsCompleted: 15, // Meet minimum requirement
            hoursCompleted: stage.minHours,
            isCompleted: true,
            completedAt: new Date()
          },
          update: {
            sessionsCompleted: 15,
            hoursCompleted: stage.minHours,
            isCompleted: true,
            completedAt: new Date()
          }
        })
      }

      // Unlock Stage 2
      const stage2 = await prisma.stage.findUnique({
        where: { stageNumber: 2 }
      })
      
      if (stage2) {
        await prisma.userStageProgress.upsert({
          where: {
            userId_stageId_subStage: {
              userId,
              stageId: stage2.id,
              subStage: ''
            }
          },
          create: {
            userId,
            stageId: stage2.id,
            stageNumber: 2,
            sessionsCompleted: 0,
            hoursCompleted: 0,
            isCompleted: false
          },
          update: {}
        })
      }
    } else {
      // For other stages, mark as completed
      await prisma.userStageProgress.upsert({
        where: {
          userId_stageId_subStage: {
            userId,
            stageId,
            subStage: ''
          }
        },
        create: {
          userId,
          stageId,
          stageNumber,
          sessionsCompleted: Math.ceil(stage.minSessions),
          hoursCompleted: stage.minHours,
          isCompleted: true,
          completedAt: new Date()
        },
        update: {
          sessionsCompleted: Math.ceil(stage.minSessions),
          hoursCompleted: stage.minHours,
          isCompleted: true,
          completedAt: new Date()
        }
      })

      // Unlock next stage if exists
      const nextStageNumber = stageNumber + 1
      if (nextStageNumber <= 6) {
        const nextStage = await prisma.stage.findUnique({
          where: { stageNumber: nextStageNumber }
        })
        
        if (nextStage) {
          await prisma.userStageProgress.upsert({
            where: {
              userId_stageId_subStage: {
                userId,
                stageId: nextStage.id,
                subStage: ''
              }
            },
            create: {
              userId,
              stageId: nextStage.id,
              stageNumber: nextStageNumber,
              sessionsCompleted: 0,
              hoursCompleted: 0,
              isCompleted: false
            },
            update: {}
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Stage ${stageNumber} marked as completed`,
      stageNumber,
      nextStageUnlocked: stageNumber < 6
    })
  } catch (error) {
    console.error('Complete error:', error)
    throw error
  }
}
