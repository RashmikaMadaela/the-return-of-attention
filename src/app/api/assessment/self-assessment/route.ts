import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SelfAssessmentSchema, calculateSelfAssessmentScore } from '@/lib/validations/assessment';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Validate self assessment data
    const validatedData = SelfAssessmentSchema.parse(body);

    // Check if user already has this type of assessment
    const existingAssessment = await prisma.selfAssessment.findUnique({
      where: { 
        userId_type: {
          userId: session.user.id,
          type: validatedData.type
        }
      }
    });

    if (existingAssessment) {
      return NextResponse.json(
        { success: false, error: `${validatedData.type} assessment already completed` },
        { status: 409 }
      );
    }

    // Calculate score based on assessment choices
    const scoreResult = calculateSelfAssessmentScore(validatedData);

    // Create self assessment record
    const selfAssessment = await prisma.selfAssessment.create({
      data: {
        userId: session.user.id,
        type: validatedData.type,
        foodTaste: validatedData.foodTaste,
        scentsAromas: validatedData.scentsAromas,
        soundsMusic: validatedData.soundsMusic,
        visualBeauty: validatedData.visualBeauty,
        touchTextures: validatedData.touchTextures,
        thoughtsImages: validatedData.thoughtsImages,
        totalScore: scoreResult.totalScore,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Self assessment submitted successfully',
      data: {
        id: selfAssessment.id,
        type: selfAssessment.type,
        totalScore: selfAssessment.totalScore,
        interpretation: scoreResult.interpretation,
        individualScores: scoreResult.individualScores,
        createdAt: selfAssessment.createdAt,
      }
    });

  } catch (error) {
    console.error('Self assessment submission error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid self assessment data',
          details: error.issues 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameter for assessment type (optional)
    const url = new URL(request.url);
    const type = url.searchParams.get('type');

    let whereClause: any = { userId: session.user.id };
    if (type) {
      whereClause.type = type;
    }

    // Get user's self assessments
    const assessments = await prisma.selfAssessment.findMany({
      where: whereClause,
      select: {
        id: true,
        type: true,
        foodTaste: true,
        scentsAromas: true,
        soundsMusic: true,
        visualBeauty: true,
        touchTextures: true,
        thoughtsImages: true,
        totalScore: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate interpretation for each assessment
    const assessmentsWithInterpretation = assessments.map(assessment => {
      const scoreResult = calculateSelfAssessmentScore(assessment);
      return {
        ...assessment,
        interpretation: scoreResult.interpretation,
        individualScores: scoreResult.individualScores,
      };
    });

    return NextResponse.json({
      success: true,
      data: assessmentsWithInterpretation
    });

  } catch (error) {
    console.error('Get self assessments error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}