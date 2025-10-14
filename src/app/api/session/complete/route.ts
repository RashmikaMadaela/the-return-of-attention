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
    const existingSession = await prisma.session.findFirst({
      where: {
        id: validatedData.sessionId,
        userId: user.id,
        status: 'in_progress'
      },
      include: {
        stage: true,
        pahmSession: true
      }
    });

    if (!existingSession) {
      throw CommonErrors.sessionNotFound()
    }

    // Calculate actual session duration (if different from planned)
    const startedAt = existingSession.startedAt;
    const completedAt = new Date();
    const actualDurationMinutes = startedAt 
      ? Math.round((completedAt.getTime() - startedAt.getTime()) / (1000 * 60))
      : existingSession.duration;

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Update session as completed
      const completedSession = await tx.session.update({
        where: { id: validatedData.sessionId },
        data: {
          status: 'completed',
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
              minHours: true
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
      const progressUpdate = await tx.userStageProgress.upsert({
        where: {
          userId_stageId_subStage: {
            userId: user.id,
            stageId: existingSession.stageId,
            subStage: existingSession.subStage || ''
          }
        },
        update: {
          sessionsCompleted: { increment: 1 },
          hoursCompleted: { 
            increment: new Decimal(actualDurationMinutes).div(60) 
          },
          updatedAt: completedAt,
        },
        create: {
          userId: user.id,
          stageId: existingSession.stageId,
          stageNumber: existingSession.stageNumber,
          subStage: existingSession.subStage,
          sessionsCompleted: 1,
          hoursCompleted: new Decimal(actualDurationMinutes).div(60),
        }
      });

      // Check if stage/sub-stage is now completed
      const stageRequirements = existingSession.stage;
      const isStageCompleted = progressUpdate.sessionsCompleted >= stageRequirements.minSessions &&
                              progressUpdate.hoursCompleted.gte(stageRequirements.minHours);

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