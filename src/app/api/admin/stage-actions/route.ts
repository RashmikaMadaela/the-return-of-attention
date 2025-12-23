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
      
      case 'reset-all':
        return await handleResetAll(targetUserId)
      
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
 * Unlock a stage for a user (and complete all previous stages)
 */
async function handleUnlock(userId: string, stageId: string, stageNumber: number) {
  try {
    // First, complete all previous stages (1 to stageNumber-1)
    for (let i = 1; i < stageNumber; i++) {
      const prevStage = await prisma.stage.findUnique({
        where: { stageNumber: i }
      })
      
      if (prevStage) {
        // For Stage 1, complete all sub-stages
        if (i === 1) {
          const subStages = [
            { name: 'T1', sessions: 4 },
            { name: 'T2', sessions: 6 },
            { name: 'T3', sessions: 6 },
            { name: 'T4', sessions: 6 },
            { name: 'T5', sessions: 10 }
          ]
          
          for (const subStage of subStages) {
            await prisma.userStageProgress.upsert({
              where: {
                userId_stageId_subStage: {
                  userId,
                  stageId: prevStage.id,
                  subStage: subStage.name
                }
              },
              create: {
                userId,
                stageId: prevStage.id,
                stageNumber: i,
                subStage: subStage.name,
                sessionsCompleted: subStage.sessions,
                hoursCompleted: prevStage.minHours,
                isCompleted: true,
                completedAt: new Date()
              },
              update: {
                sessionsCompleted: subStage.sessions,
                hoursCompleted: prevStage.minHours,
                isCompleted: true,
                completedAt: new Date()
              }
            })
          }
          
          // Also mark PAHM intro as completed for Stage 1
          await prisma.userStageProgress.upsert({
            where: {
              userId_stageId_subStage: {
                userId,
                stageId: prevStage.id,
                subStage: 'PAHM'
              }
            },
            create: {
              userId,
              stageId: prevStage.id,
              stageNumber: i,
              subStage: 'PAHM',
              sessionsCompleted: 1,
              hoursCompleted: 0,
              isCompleted: true,
              completedAt: new Date()
            },
            update: {
              sessionsCompleted: 1,
              isCompleted: true,
              completedAt: new Date()
            }
          })
        } else {
          // For other stages, complete normally
          await prisma.userStageProgress.upsert({
            where: {
              userId_stageId_subStage: {
                userId,
                stageId: prevStage.id,
                subStage: ''
              }
            },
            create: {
              userId,
              stageId: prevStage.id,
              stageNumber: i,
              sessionsCompleted: Math.ceil(prevStage.minSessions),
              hoursCompleted: prevStage.minHours,
              isCompleted: true,
              completedAt: new Date()
            },
            update: {
              sessionsCompleted: Math.ceil(prevStage.minSessions),
              hoursCompleted: prevStage.minHours,
              isCompleted: true,
              completedAt: new Date()
            }
          })
        }
      }
    }

    // Now unlock the target stage
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
            // If already exists, keep current progress
            isCompleted: false
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
            subStage: ''
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
          // If already exists, keep current progress
          isCompleted: false
        }
      })
    }

    const completedStages = stageNumber > 1 ? ` (stages 1-${stageNumber-1} completed)` : ''
    return NextResponse.json({
      success: true,
      message: `Stage ${stageNumber} unlocked successfully${completedStages}`,
      stageNumber,
      previousStagesCompleted: stageNumber - 1
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
    // Delete progress for only this specific stage
    await prisma.userStageProgress.deleteMany({
      where: {
        userId,
        stageNumber: stageNumber
      }
    })

    // Delete sessions for only this stage
    await prisma.session.deleteMany({
      where: {
        userId,
        stageNumber: stageNumber
      }
    })

    return NextResponse.json({
      success: true,
      message: `Stage ${stageNumber} reset to initial progress`,
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
      const subStages = [
        { name: 'T1', sessions: 4 },
        { name: 'T2', sessions: 6 },
        { name: 'T3', sessions: 6 },
        { name: 'T4', sessions: 6 },
        { name: 'T5', sessions: 10 }
      ]
      
      for (const subStage of subStages) {
        await prisma.userStageProgress.upsert({
          where: {
            userId_stageId_subStage: {
              userId,
              stageId,
              subStage: subStage.name
            }
          },
          create: {
            userId,
            stageId,
            stageNumber,
            subStage: subStage.name,
            sessionsCompleted: subStage.sessions,
            hoursCompleted: stage.minHours,
            isCompleted: true,
            completedAt: new Date()
          },
          update: {
            sessionsCompleted: subStage.sessions,
            hoursCompleted: stage.minHours,
            isCompleted: true,
            completedAt: new Date()
          }
        })
      }

      // Also mark PAHM intro as completed
      await prisma.userStageProgress.upsert({
        where: {
          userId_stageId_subStage: {
            userId,
            stageId,
            subStage: 'PAHM'
          }
        },
        create: {
          userId,
          stageId,
          stageNumber,
          subStage: 'PAHM',
          sessionsCompleted: 1,
          hoursCompleted: 0,
          isCompleted: true,
          completedAt: new Date()
        },
        update: {
          sessionsCompleted: 1,
          isCompleted: true,
          completedAt: new Date()
        }
      })

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

/**
 * Reset all progress for a user (back to new user state)
 */
async function handleResetAll(userId: string) {
  try {
    // Delete all user stage progress
    await prisma.userStageProgress.deleteMany({
      where: { userId }
    })

    // Delete all sessions
    await prisma.session.deleteMany({
      where: { userId }
    })

    // Delete all happiness scores
    await prisma.happinessScore.deleteMany({
      where: { userId }
    })

    // Delete daily notes
    await prisma.dailyNote.deleteMany({
      where: { userId }
    })

    // Reset questionnaire
    await prisma.questionnaire.updateMany({
      where: { userId },
      data: { isCompleted: false }
    })

    // Delete self assessments
    await prisma.selfAssessment.deleteMany({
      where: { userId }
    })

    return NextResponse.json({
      success: true,
      message: 'All progress reset successfully. User returned to initial state (only Stage 1 unlocked).',
    })
  } catch (error) {
    console.error('Reset all error:', error)
    throw error
  }
}
