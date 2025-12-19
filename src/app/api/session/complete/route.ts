import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sessionCompleteSchema, validateRequestBody } from '@/lib/validation'
import { getAuthenticatedUser } from '@/lib/auth/middleware'
import { handleApiError, createSuccessResponse, CommonErrors } from '@/lib/errors'
import { Decimal } from '@prisma/client/runtime/library'
import { autoTriggerHappinessCalculation } from '@/lib/business-logic/auto-trigger'

/**
 * POST /api/session/complete
 * Complete a meditation session and update progress
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser(request)

    // Validate request body
    const body = await request.json()
    const validation = validateRequestBody(sessionCompleteSchema, body)
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      }, { status: 400 })
    }

    const validatedData = validation.data

    // Find existing session and verify ownership
    // Accept sessions in STARTED or AWAITING_REFLECTION status
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
    });

    if (!existingSession) {
      throw CommonErrors.sessionNotFound()
    }

    // Determine actual duration to persist. Precedence:
    // 1. Client-provided validatedData.actualDuration (explicit practiced minutes)
    // 2. Client-provided validatedData.duration (explicit planned minutes)
    // 3. Calculated elapsed minutes based on existingSession.startedAt
    // 4. existingSession.duration as a final fallback
    const completedAt = new Date()

    let actualDurationMinutes: number | null = null

    if (typeof validatedData.actualDuration === 'number') {
      actualDurationMinutes = Math.max(0, Math.floor(validatedData.actualDuration))
    } else if (typeof validatedData.duration === 'number') {
      actualDurationMinutes = Math.max(0, Math.floor(validatedData.duration))
    } else {
      const startedAt = existingSession.startedAt
      const elapsedMinutes = startedAt
        ? Math.round((completedAt.getTime() - startedAt.getTime()) / (1000 * 60))
        : 0

      // If session was just started (< 1 minute) but has a different duration set,
      // it's likely a time skip - use the explicitly set session duration
      if (elapsedMinutes < 1 && existingSession.duration > 1) {
        actualDurationMinutes = existingSession.duration
      } else if (elapsedMinutes > 0) {
        actualDurationMinutes = elapsedMinutes
      } else {
        actualDurationMinutes = existingSession.duration
      }
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Update session status to COMPLETED with reflection data
      const completedSession = await tx.session.update({
        where: { id: validatedData.sessionId },
        data: {
          status: 'COMPLETED',
          completedAt: completedAt,
          qualityRating: validatedData.qualityRating,
          insights: validatedData.insights,
          duration: actualDurationMinutes, // Update with actual duration
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
      });

      // Save session challenges if provided
      if (validatedData.challenges) {
        await tx.sessionChallenge.upsert({
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
        });
      }

      // Update PAHM session if exists
      let updatedPahmSession = null;
      if (existingSession.pahmSession && validatedData.pahmData) {
        // Process click data to update individual position counts
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
        };

        // Count clicks by position (map position names to database field names)
        if (validatedData.pahmData.clickData) {
          validatedData.pahmData.clickData.forEach((click: any) => {
            const position = click.position;
            // Map position to database field name (add "Clicks" suffix)
            const fieldName = `${position}Clicks` as keyof typeof clickCounts;
            if (fieldName in clickCounts) {
              clickCounts[fieldName]++;
            }
          });
        }

        updatedPahmSession = await tx.pAHMSession.update({
          where: { sessionId: validatedData.sessionId },
          data: {
            ...clickCounts,
            totalClicks: validatedData.pahmData.totalClicks || 
                        Object.values(clickCounts).reduce((sum, count) => sum + count, 0),
            clickTimestamps: validatedData.pahmData.clickData || [],
            patternNotes: validatedData.pahmData.patternNotes,
            updatedAt: completedAt,
          }
        });
      }

      // Update user stage progress
      // Only count the session towards progress if the user actually practiced
      // the full planned duration. This prevents short/completed-but-skipped
      // sessions from being counted towards required session counts.
      const shouldCountAsCompleted = typeof actualDurationMinutes === 'number' &&
        existingSession.duration !== undefined &&
        actualDurationMinutes === existingSession.duration

      const updateData: any = {
        updatedAt: completedAt
      }

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
      });

      // Check if stage/sub-stage is now completed
      // For substages, use substage-specific requirements
      // For main stages, use stage requirements
      const stageRequirements = completedSession.stage;
      let minSessionsRequired = stageRequirements.minSessions;
      let minHoursRequired = stageRequirements.minHours;

      // If this is a substage, find its specific requirements
      if (existingSession.subStage && stageRequirements.hasSubStages && stageRequirements.subStages) {
        const subStagesArray = Array.isArray(stageRequirements.subStages) 
          ? stageRequirements.subStages 
          : [];
        
        const currentSubStage = subStagesArray.find((ss: any) => 
          (ss.id || ss.name) === existingSession.subStage
        ) as any;

        if (currentSubStage) {
          minSessionsRequired = currentSubStage.minSessions || minSessionsRequired;
          minHoursRequired = currentSubStage.minHours || minHoursRequired;
        }
      }

      const isStageCompleted = progressUpdate.sessionsCompleted >= minSessionsRequired &&
                              progressUpdate.hoursCompleted.gte(minHoursRequired);

      if (isStageCompleted && !progressUpdate.isCompleted) {
        await tx.userStageProgress.update({
          where: { id: progressUpdate.id },
          data: {
            isCompleted: true,
            completedAt: completedAt
          }
        });
      }

      return {
        session: completedSession,
        pahmSession: updatedPahmSession,
        progress: {
          ...progressUpdate,
          isCompleted: isStageCompleted,
          completedAt: isStageCompleted ? completedAt : progressUpdate.completedAt
        },
        stageCompleted: isStageCompleted
      };
    });

    // Auto-trigger happiness score calculation after session completion
    // This runs asynchronously without blocking the response
    autoTriggerHappinessCalculation(user.id, 'session').catch(error => {
      console.error('Failed to auto-trigger happiness calculation after session:', error)
    })

    return createSuccessResponse({
      session: {
        id: result.session.id,
        stageNumber: result.session.stageNumber,
        subStage: result.session.subStage,
        sessionType: result.session.sessionType,
        duration: result.session.duration,
        actualDuration: actualDurationMinutes,
        status: result.session.status,
        qualityRating: result.session.qualityRating,
        insights: result.session.insights,
        startedAt: result.session.startedAt,
        completedAt: result.session.completedAt,
        stage: result.session.stage
      },
      progress: {
        sessionsCompleted: result.progress.sessionsCompleted,
        hoursCompleted: result.progress.hoursCompleted.toNumber(),
        isStageCompleted: result.stageCompleted,
        completedAt: result.progress.completedAt
      },
      pahmSession: result.pahmSession ? {
        id: result.pahmSession.id,
        totalClicks: result.pahmSession.totalClicks,
        patternNotes: result.pahmSession.patternNotes,
        clickCounts: {
          regret: result.pahmSession.regretClicks,
          past: result.pahmSession.pastClicks,
          nostalgia: result.pahmSession.nostalgiaClicks,
          dislikes: result.pahmSession.dislikesClicks,
          present: result.pahmSession.presentClicks,
          likes: result.pahmSession.likesClicks,
          worry: result.pahmSession.worryClicks,
          future: result.pahmSession.futureClicks,
          anticipation: result.pahmSession.anticipationClicks,
        }
      } : null
    }, 'Session completed successfully');

  } catch (error) {
    return handleApiError(error)
  }
}