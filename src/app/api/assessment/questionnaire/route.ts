import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { questionnaireSchema, validateRequestBody } from '@/lib/validation'
import { getAuthenticatedUser } from '@/lib/auth/middleware'
import { handleApiError, createSuccessResponse, CommonErrors } from '@/lib/errors'

/**
 * POST /api/assessment/questionnaire
 * Submit the one-time questionnaire (27 fields)
 * Required after account creation - collected only once
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser(request)

    // Validate request body
    const body = await request.json()
    const validation = validateRequestBody(questionnaireSchema, body)
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      }, { status: 400 })
    }

    // Check if user already has a questionnaire
    const existingQuestionnaire = await prisma.questionnaire.findUnique({
      where: { userId: user.id }
    })

    if (existingQuestionnaire) {
      throw CommonErrors.assessmentCompleted('Questionnaire')
    }

    // Create questionnaire record
    const questionnaire = await prisma.questionnaire.create({
      data: {
        userId: user.id,
        ...validation.data,
        isCompleted: new Date()
      }
    })

    return createSuccessResponse({
      id: questionnaire.id,
      completedAt: questionnaire.isCompleted,
      userId: user.id
    }, 'Questionnaire submitted successfully', 201)

  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * GET /api/assessment/questionnaire
 * Retrieve user's questionnaire data and status
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser(request)

    // Get user's questionnaire
    const questionnaire = await prisma.questionnaire.findUnique({
      where: { userId: user.id }
    })

    if (!questionnaire) {
      return createSuccessResponse({
        completed: false,
        questionnaire: null,
        status: 'not_started'
      }, 'Questionnaire not yet completed')
    }

    // Return questionnaire data (excluding sensitive info if needed)
    const questionnaireData = {
      id: questionnaire.id,
      completed: !!questionnaire.isCompleted,
      completedAt: questionnaire.isCompleted,
      status: questionnaire.isCompleted ? 'completed' : 'in_progress',
      
      // Phase 1: Demographics & Background
      experienceLevel: questionnaire.experienceLevel,
      mainGoals: questionnaire.mainGoals,
      ageRange: questionnaire.ageRange,
      location: questionnaire.location,
      occupation: questionnaire.occupation,
      educationLevel: questionnaire.educationLevel,
      meditationBackground: questionnaire.meditationBackground,
      
      // Phase 2: Lifestyle Patterns
      sleepPattern: questionnaire.sleepPattern,
      physicalActivity: questionnaire.physicalActivity,
      stressTrigers: questionnaire.stressTrigers,
      dailyRoutine: questionnaire.dailyRoutine,
      dietPattern: questionnaire.dietPattern,
      screenTime: questionnaire.screenTime,
      socialConnections: questionnaire.socialConnections,
      workLifeBalance: questionnaire.workLifeBalance,
      
      // Phase 3: Thinking Patterns
      emotionalAwareness: questionnaire.emotionalAwareness,
      stressResponse: questionnaire.stressResponse,
      decisionMaking: questionnaire.decisionMaking,
      selfReflection: questionnaire.selfReflection,
      thoughtPatterns: questionnaire.thoughtPatterns,
      mindfulnessInDailyLife: questionnaire.mindfulnessInDailyLife,
      
      // Phase 4: Mindfulness Specific
      mindfulnessExperience: questionnaire.mindfulnessExperience,
      meditationBackgroundDetail: questionnaire.meditationBackgroundDetail,
      practiceGoals: questionnaire.practiceGoals,
      preferredDuration: questionnaire.preferredDuration,
      biggestChallenges: questionnaire.biggestChallenges,
      motivation: questionnaire.motivation
    }

    return createSuccessResponse(questionnaireData, 'Questionnaire retrieved successfully')

  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PUT /api/assessment/questionnaire
 * Update questionnaire (allowed only if not completed)
 */
export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser(request)

    // Check existing questionnaire
    const existingQuestionnaire = await prisma.questionnaire.findUnique({
      where: { userId: user.id }
    })

    if (!existingQuestionnaire) {
      throw CommonErrors.assessmentNotFound()
    }

    if (existingQuestionnaire.isCompleted) {
      return NextResponse.json({
        success: false,
        message: 'Questionnaire is already completed and cannot be modified'
      }, { status: 403 })
    }

    // Validate request body
    const body = await request.json()
    const validation = validateRequestBody(questionnaireSchema, body)
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      }, { status: 400 })
    }

    // Update questionnaire
    const updatedQuestionnaire = await prisma.questionnaire.update({
      where: { userId: user.id },
      data: {
        ...validation.data,
        isCompleted: new Date() // Mark as completed on update
      }
    })

    return createSuccessResponse({
      id: updatedQuestionnaire.id,
      completedAt: updatedQuestionnaire.isCompleted
    }, 'Questionnaire updated successfully')

  } catch (error) {
    return handleApiError(error)
  }
}