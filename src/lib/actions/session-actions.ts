'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sessionStartSchema, sessionCompleteSchema } from '@/lib/validation'
import { CommonErrors } from '@/lib/errors'
import { Decimal } from '@prisma/client/runtime/library'
import { autoTriggerHappinessCalculation } from '@/lib/business-logic/auto-trigger'
import type { 
  StartSessionRequest, 
  StartSessionResponse, 
  CompleteSessionRequest, 
  CompleteSessionResponse,
  ApiResponse 
} from '@/lib/api/sessions'

/**
 * Get authenticated user from NextAuth session
 */
async function getAuthenticatedUser() {
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
 * Check if user has access to stage
 */
async function checkStageAccess(userId: string, stageNumber: number) {
  if (stageNumber === 1) return true

  const progress = await prisma.userStageProgress.findFirst({
    where: {
      userId,
      stageNumber: stageNumber - 1,
      isCompleted: true
    }
  })

  if (!progress) {
    throw CommonErrors.stageLocked(stageNumber)
  }

  return true
}

/**
 * Server Action: Start a new meditation session
 * This replaces the /api/session/start REST endpoint for better performance
 */
export async function startSessionAction(
  request: StartSessionRequest
): Promise<ApiResponse<StartSessionResponse>> {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser()

    // Validate request
    const validation = sessionStartSchema.safeParse(request)
    
    if (!validation.success) {
      return {
        success: false,
        message: 'Validation failed',
        errors: validation.error.flatten().fieldErrors as Record<string, string[]>
      }
    }

    const { stageNumber, subStage, sessionType, duration, posture, exerciseType, meditationBells, voiceCommands, useRemote } = validation.data

    // Run independent lookups in parallel for speed
    const [ , incompleteSession, stage ] = await Promise.all([
      checkStageAccess(user.id, stageNumber),
      prisma.session.findFirst({
        where: {
          userId: user.id,
          status: {
            in: ['STARTED', 'AWAITING_REFLECTION']
          }
        },
        select: { id: true },
        orderBy: {
          startedAt: 'desc'
        }
      }),
      prisma.stage.findFirst({
        where: { stageNumber }
      })
    ])

    // ZOMBIE LOCK FIX: Auto-abandon incomplete sessions
    if (incompleteSession) {
      await prisma.session.update({
        where: { id: incompleteSession.id },
        data: {
          status: 'ABANDONED',
          completedAt: new Date()
        }
      })
      console.log(`Auto-abandoned session ${incompleteSession.id} for user ${user.id}`)
    }

    if (!stage) {
      throw CommonErrors.stageNotFound()
    }

    // Create new session
    const newSession = await prisma.session.create({
      data: {
        userId: user.id,
        stageId: stage.id,
        stageNumber,
        subStage,
        sessionType,
        duration,
        posture,
        useRemote: sessionType === 'timer_only' ? false : (useRemote ?? false),
        meditationBells: meditationBells ?? true,
        voiceCommands: voiceCommands ?? true,
        status: 'STARTED',
        startedAt: new Date()
      }
    })

    // Create PAHM session (if needed) and update stage progress in parallel
    const [pahmSession] = await Promise.all([
      (sessionType === 'pahm_matrix' || sessionType === 'mind_recovery')
        ? prisma.pAHMSession.create({
            data: {
              sessionId: newSession.id,
              userId: user.id,
              stageNumber,
              exerciseType,
              clickTimestamps: []
            }
          })
        : Promise.resolve(null),
      prisma.userStageProgress.upsert({
        where: {
          userId_stageId_subStage: {
            userId: user.id,
            stageId: stage.id,
            subStage: subStage || ''
          }
        },
        update: {
          updatedAt: new Date()
        },
        create: {
          userId: user.id,
          stageId: stage.id,
          stageNumber,
          subStage
        }
      })
    ])

    return {
      success: true,
      message: 'Session started successfully',
      data: {
        id: newSession.id,
        stageNumber: newSession.stageNumber,
        subStage: newSession.subStage || undefined,
        sessionType: newSession.sessionType as any,
        duration: newSession.duration,
        posture: newSession.posture || 'sitting',
        status: newSession.status,
        startedAt: newSession.startedAt?.toISOString() || new Date().toISOString(),
        stage: {
          name: stage.name,
          description: stage.description,
          sessionType: stage.sessionType
        },
        pahmSessionId: pahmSession?.id
      }
    }
  } catch (error: any) {
    console.error('Start session error:', error)
    return {
      success: false,
      message: error.message || 'Failed to start session',
      error: error.message
    }
  }
}

/**
 * Server Action: Complete a meditation session
 * This replaces the /api/session/complete REST endpoint for better performance
 */
export async function completeSessionAction(
  request: CompleteSessionRequest
): Promise<ApiResponse<CompleteSessionResponse>> {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser()

    // Validate request
    const validation = sessionCompleteSchema.safeParse(request)
    
    if (!validation.success) {
      return {
        success: false,
        message: 'Validation failed',
        errors: validation.error.flatten().fieldErrors as Record<string, string[]>
      }
    }

    const validatedData = validation.data

    // Find existing session
    const existingSession = await prisma.session.findFirst({
      where: {
        id: validatedData.sessionId,
        userId: user.id,
        status: {
          in: ['STARTED', 'AWAITING_REFLECTION']
        }
      },
      include: {
        stage: true,
        pahmSession: true
      }
    })

    if (!existingSession) {
      throw CommonErrors.sessionNotFound()
    }

    // Calculate actual duration
    const completedAt = new Date()
    let actualDurationMinutes: number

    if (typeof validatedData.actualDuration === 'number') {
      actualDurationMinutes = Math.max(0, Math.floor(validatedData.actualDuration))
    } else if (typeof validatedData.duration === 'number') {
      actualDurationMinutes = Math.max(0, Math.floor(validatedData.duration))
    } else {
      const startedAt = existingSession.startedAt
      const elapsedMinutes = startedAt
        ? Math.round((completedAt.getTime() - startedAt.getTime()) / (1000 * 60))
        : 0

      if (elapsedMinutes < 1 && existingSession.duration > 1) {
        actualDurationMinutes = existingSession.duration
      } else if (elapsedMinutes > 0) {
        actualDurationMinutes = elapsedMinutes
      } else {
        actualDurationMinutes = existingSession.duration
      }
    }

    // Use transaction for data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Determine session status based on duration requirement
      const shouldCountAsCompleted = validatedData.shouldCountAsSession ?? 
                                    (actualDurationMinutes === existingSession.duration)
      const sessionStatus = shouldCountAsCompleted ? 'COMPLETED' : 'NOT_COMPLETED'
      
      // Update session
      const completedSession = await tx.session.update({
        where: { id: validatedData.sessionId },
        data: {
          status: sessionStatus as any,
          completedAt: completedAt,
          qualityRating: validatedData.qualityRating,
          insights: validatedData.insights,
          duration: actualDurationMinutes,
          updatedAt: completedAt,
        },
        include: {
          stage: {
            select: {
              name: true,
              description: true,
              sessionType: true,
              minSessions: true,
              minHours: true,
              hasSubStages: true,
              subStages: true
            }
          }
        }
      })

      // Save challenges and PAHM data in parallel when present
      const challengePromise = validatedData.challenges
        ? tx.sessionChallenge.upsert({
            where: { sessionId: validatedData.sessionId },
            update: {
              mindWandering: validatedData.challenges.mindWandering ?? false,
              physicalDiscomfort: validatedData.challenges.physicalDiscomfort ?? false,
              sleepiness: validatedData.challenges.sleepiness ?? false,
              restlessness: validatedData.challenges.restlessness ?? false,
              strongEmotions: validatedData.challenges.strongEmotions ?? false,
              externalDistractions: validatedData.challenges.externalDistractions ?? false,
              notes: validatedData.challenges.notes,
              updatedAt: completedAt
            },
            create: {
              sessionId: validatedData.sessionId,
              mindWandering: validatedData.challenges.mindWandering ?? false,
              physicalDiscomfort: validatedData.challenges.physicalDiscomfort ?? false,
              sleepiness: validatedData.challenges.sleepiness ?? false,
              restlessness: validatedData.challenges.restlessness ?? false,
              strongEmotions: validatedData.challenges.strongEmotions ?? false,
              externalDistractions: validatedData.challenges.externalDistractions ?? false,
              notes: validatedData.challenges.notes
            }
          })
        : Promise.resolve(null)

      let pahmPromise: Promise<any> = Promise.resolve(null)
      if (existingSession.pahmSession && validatedData.pahmData) {
        const clickCounts = {
          regretClicks: 0,
          pastClicks: 0,
          nostalgiaClicks: 0,
          dislikesClicks: 0,
          presentClicks: 0,
          likesClicks: 0,
          worryClicks: 0,
          futureClicks: 0,
          anticipationClicks: 0,
        }

        if (validatedData.pahmData.clickData) {
          validatedData.pahmData.clickData.forEach((click: any) => {
            const position = click.position
            const fieldName = `${position}Clicks` as keyof typeof clickCounts
            if (fieldName in clickCounts) {
              clickCounts[fieldName]++
            }
          })
        }

        pahmPromise = tx.pAHMSession.update({
          where: { sessionId: validatedData.sessionId },
          data: {
            ...clickCounts,
            totalClicks: validatedData.pahmData.totalClicks || 
                        Object.values(clickCounts).reduce((sum, count) => sum + count, 0),
            clickTimestamps: validatedData.pahmData.clickData || [],
            patternNotes: validatedData.pahmData.patternNotes,
            updatedAt: completedAt,
          }
        })
      }

      // Update progress (shouldCountAsCompleted already calculated above)
      const updateData: any = { updatedAt: completedAt }
      const createData: any = {
        userId: user.id,
        stageId: existingSession.stageId,
        stageNumber: existingSession.stageNumber,
        subStage: existingSession.subStage,
        sessionsCompleted: 0,
        hoursCompleted: new Decimal(0),
      }

      if (shouldCountAsCompleted) {
        updateData.sessionsCompleted = { increment: 1 }
        updateData.hoursCompleted = { increment: new Decimal(actualDurationMinutes).div(60) }
        createData.sessionsCompleted = 1
        createData.hoursCompleted = new Decimal(actualDurationMinutes).div(60)
      }

      const progressUpdate = await tx.userStageProgress.upsert({
        where: {
          userId_stageId_subStage: {
            userId: user.id,
            stageId: existingSession.stageId,
            subStage: existingSession.subStage || ''
          }
        },
        update: updateData,
        create: createData
      })

      // Check stage completion
      const stageRequirements = completedSession.stage
      let minSessionsRequired = stageRequirements.minSessions
      let minHoursRequired = stageRequirements.minHours

      if (existingSession.subStage && stageRequirements.hasSubStages && stageRequirements.subStages) {
        const subStagesArray = Array.isArray(stageRequirements.subStages) 
          ? stageRequirements.subStages 
          : []
        
        const currentSubStage = subStagesArray.find((ss: any) => 
          (ss.id || ss.name) === existingSession.subStage
        ) as any

        if (currentSubStage) {
          minSessionsRequired = currentSubStage.minSessions || minSessionsRequired
          minHoursRequired = currentSubStage.minHours || minHoursRequired
        }
      }

      const isStageCompleted = progressUpdate.sessionsCompleted >= minSessionsRequired &&
                              progressUpdate.hoursCompleted.gte(minHoursRequired)

      if (isStageCompleted && !progressUpdate.isCompleted) {
        await tx.userStageProgress.update({
          where: { id: progressUpdate.id },
          data: {
            isCompleted: true,
            completedAt: completedAt
          }
        })
      }

      // Ensure side-effect updates complete before returning transaction result
      const [ , updatedPahmSession ] = await Promise.all([challengePromise, pahmPromise])

      return {
        completedSession,
        progressUpdate,
        updatedPahmSession,
        isStageCompleted
      }
    })

    // Trigger happiness calculation and revalidations in parallel
    await Promise.all([
      autoTriggerHappinessCalculation(user.id, 'session').catch(err => 
        console.error('Auto-trigger happiness calculation failed:', err)
      ),
      revalidatePath('/home'),
      revalidatePath('/stage-1'),
      revalidatePath(`/stage-${result.completedSession.stageNumber}`)
    ])

    return {
      success: true,
      message: 'Session completed successfully',
      data: {
        session: {
          id: result.completedSession.id,
          stageNumber: result.completedSession.stageNumber,
          sessionType: result.completedSession.sessionType,
          duration: result.completedSession.duration,
          actualDuration: actualDurationMinutes,
          status: result.completedSession.status,
          qualityRating: result.completedSession.qualityRating || undefined,
          completedAt: result.completedSession.completedAt?.toISOString() || ''
        },
        progress: {
          sessionsCompleted: result.progressUpdate.sessionsCompleted,
          hoursCompleted: Number(result.progressUpdate.hoursCompleted),
          isStageCompleted: result.isStageCompleted,
          completedAt: result.progressUpdate.completedAt?.toISOString()
        },
        pahmSession: result.updatedPahmSession ? {
          id: result.updatedPahmSession.id,
          totalClicks: result.updatedPahmSession.totalClicks,
          clickCounts: {
            regret: result.updatedPahmSession.regretClicks,
            past: result.updatedPahmSession.pastClicks,
            nostalgia: result.updatedPahmSession.nostalgiaClicks,
            dislikes: result.updatedPahmSession.dislikesClicks,
            present: result.updatedPahmSession.presentClicks,
            likes: result.updatedPahmSession.likesClicks,
            worry: result.updatedPahmSession.worryClicks,
            future: result.updatedPahmSession.futureClicks,
            anticipation: result.updatedPahmSession.anticipationClicks
          }
        } : undefined
      }
    }
  } catch (error: any) {
    console.error('Complete session error:', error)
    return {
      success: false,
      message: error.message || 'Failed to complete session',
      error: error.message
    }
  }
}
