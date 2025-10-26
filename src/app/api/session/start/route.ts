import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sessionStartSchema, validateRequestBody } from '@/lib/validation'
import { getAuthenticatedUser, checkStageAccess } from '@/lib/auth/middleware'
import { handleApiError, createSuccessResponse, CommonErrors } from '@/lib/errors'

/**
 * POST /api/session/start
 * Start a new meditation session
 * Validates stage access and creates session record
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser(request)

    // Validate request body
    const body = await request.json()
    const validation = validateRequestBody(sessionStartSchema, body)
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      }, { status: 400 })
    }

  const { stageNumber, subStage, sessionType, duration, posture, exerciseType, meditationBells, voiceCommands, useRemote } = validation.data

    // Check stage access
    await checkStageAccess(user.id, stageNumber)

    // Check for existing in-progress session
    const existingSession = await prisma.session.findFirst({
      where: {
        userId: user.id,
        status: 'in_progress'
      }
    })

    if (existingSession) {
      throw CommonErrors.sessionInProgress()
    }

    // Get stage info for the session
    const stage = await prisma.stage.findFirst({
      where: { stageNumber }
    })

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
        status: 'in_progress',
        startedAt: new Date()
      },
      include: {
        stage: {
          select: {
            name: true,
            description: true,
            sessionType: true
          }
        }
      }
    })

    // Create PAHM session if required
    let pahmSession = null
    if (sessionType === 'pahm_matrix' || sessionType === 'mind_recovery') {
      pahmSession = await prisma.pAHMSession.create({
        data: {
          sessionId: newSession.id,
          userId: user.id,
          stageNumber,
          exerciseType,
          clickTimestamps: []
        }
      })
    }

    // Update user stage progress
    await prisma.userStageProgress.upsert({
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

    return createSuccessResponse({
      id: newSession.id,
      stageNumber: newSession.stageNumber,
      subStage: newSession.subStage,
      sessionType: newSession.sessionType,
      duration: newSession.duration,
      posture: newSession.posture,
      status: newSession.status,
      startedAt: newSession.startedAt,
      // Return the canonical stage info fetched above (avoid relying on generated types)
      stage: {
        name: stage.name,
        description: stage.description,
        sessionType: stage.sessionType
      },
      pahmSessionId: pahmSession?.id || null
    }, 'Session started successfully', 201)

  } catch (error) {
    return handleApiError(error)
  }
}