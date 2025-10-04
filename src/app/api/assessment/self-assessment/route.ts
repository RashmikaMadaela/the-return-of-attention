import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { selfAssessmentSchema, validateRequestBody } from '@/lib/validation'
import { getAuthenticatedUser } from '@/lib/auth/middleware'
import { handleApiError, createSuccessResponse, CommonErrors } from '@/lib/errors'
import { calculateSelfAssessmentScore } from '@/lib/business-logic'

/**
 * POST /api/assessment/self-assessment
 * Submit a self-assessment (6 sensory dimensions)
 * Can be taken multiple times for progress tracking
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser(request)

    // Validate request body
    const body = await request.json()
    const validation = validateRequestBody(selfAssessmentSchema, body)
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      }, { status: 400 })
    }

    // Calculate total score
    const totalScore = calculateSelfAssessmentScore(validation.data)

    // Create self assessment record
    const selfAssessment = await prisma.selfAssessment.create({
      data: {
        userId: user.id,
        ...validation.data,
        totalScore
      }
    })

    return createSuccessResponse({
      id: selfAssessment.id,
      totalScore: selfAssessment.totalScore,
      createdAt: selfAssessment.createdAt,
      userId: user.id
    }, 'Self assessment submitted successfully', 201)

  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * GET /api/assessment/self-assessment
 * Retrieve user's self-assessment history
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser(request)

    // Get user's self assessments
    const assessments = await prisma.selfAssessment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return createSuccessResponse({
      assessments,
      count: assessments.length
    }, 'Self assessments retrieved successfully')

  } catch (error) {
    return handleApiError(error)
  }
}