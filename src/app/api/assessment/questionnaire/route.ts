import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { QuestionnaireSchema } from '@/lib/validations/assessment';
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
    
    // Validate questionnaire data
    const validatedData = QuestionnaireSchema.parse(body);

    // Check if user already has a questionnaire
    const existingQuestionnaire = await prisma.questionnaire.findUnique({
      where: { userId: session.user.id }
    });

    if (existingQuestionnaire) {
      return NextResponse.json(
        { success: false, error: 'Questionnaire already completed' },
        { status: 409 }
      );
    }

    // Create questionnaire record
    const questionnaire = await prisma.questionnaire.create({
      data: {
        userId: session.user.id,
        ...validatedData,
        isCompleted: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Questionnaire submitted successfully',
      data: {
        id: questionnaire.id,
        completedAt: questionnaire.isCompleted,
      }
    });

  } catch (error) {
    console.error('Questionnaire submission error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid questionnaire data',
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

    // Get user's questionnaire
    const questionnaire = await prisma.questionnaire.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        isCompleted: true,
        // Phase 1: Demographics & Background
        experienceLevel: true,
        mainGoals: true,
        ageRange: true,
        location: true,
        occupation: true,
        educationLevel: true,
        meditationBackground: true,
        // Phase 2: Lifestyle Patterns
        sleepPattern: true,
        physicalActivity: true,
        stressTrigers: true,
        dailyRoutine: true,
        dietPattern: true,
        screenTime: true,
        socialConnections: true,
        workLifeBalance: true,
        // Phase 3: Thinking Patterns
        emotionalAwareness: true,
        stressResponse: true,
        decisionMaking: true,
        selfReflection: true,
        thoughtPatterns: true,
        mindfulnessInDailyLife: true,
        // Phase 4: Mindfulness Specific
        mindfulnessExperience: true,
        meditationBackgroundDetail: true,
        practiceGoals: true,
        preferredDuration: true,
        biggestChallenges: true,
        motivation: true,
      }
    });

    if (!questionnaire) {
      return NextResponse.json(
        { success: false, error: 'Questionnaire not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: questionnaire
    });

  } catch (error) {
    console.error('Get questionnaire error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}