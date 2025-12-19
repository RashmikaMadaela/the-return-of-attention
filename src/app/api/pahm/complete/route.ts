import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Validation schema for PAHM session completion
const pahmCompleteSchema = z.object({
  pahmSessionId: z.string().cuid('Invalid PAHM session ID format'),
  patternNotes: z.string().max(500).optional(),
  insights: z.string().max(1000).optional(),
  finalReflection: z.object({
    dominantTime: z.enum(['past', 'present', 'future']).optional(),
    dominantEmotion: z.enum(['dislikes', 'neutral', 'likes']).optional(),
    awarenessLevel: z.number().int().min(1).max(10).optional(),
    selfRating: z.number().int().min(1).max(10).optional()
  }).optional()
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = pahmCompleteSchema.parse(body);

    // Find the PAHM session and verify ownership
    const pahmSession = await prisma.pAHMSession.findFirst({
      where: {
        id: validatedData.pahmSessionId,
        userId: session.user.id
      },
      include: {
        session: {
          select: {
            id: true,
            status: true,
            stageNumber: true,
            startedAt: true,
            stage: {
              select: {
                name: true,
                sessionType: true
              }
            }
          }
        }
      }
    });

    if (!pahmSession) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'PAHM session not found' 
        },
        { status: 404 }
      );
    }

    // Check if the main session is still in progress
    if (pahmSession.session.status !== 'STARTED') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Session is not in progress' 
        },
        { status: 400 }
      );
    }

    // Calculate session analysis
    const analysis = calculatePahmAnalysis(pahmSession);

    // Update PAHM session with completion data
    const completedPahmSession = await prisma.pAHMSession.update({
      where: { id: validatedData.pahmSessionId },
      data: {
        patternNotes: validatedData.patternNotes,
        updatedAt: new Date()
      }
    });

    // Prepare response with comprehensive analysis
    return NextResponse.json({
      success: true,
      message: 'PAHM session completed successfully',
      pahmSession: {
        id: completedPahmSession.id,
        sessionId: completedPahmSession.sessionId,
        stageNumber: completedPahmSession.stageNumber,
        exerciseType: completedPahmSession.exerciseType,
        totalClicks: completedPahmSession.totalClicks,
        patternNotes: completedPahmSession.patternNotes,
        clickCounts: {
          regret: completedPahmSession.regretClicks,
          past: completedPahmSession.pastClicks,
          nostalgia: completedPahmSession.nostalgiaClicks,
          dislikes: completedPahmSession.dislikesClicks,
          present: completedPahmSession.presentClicks,
          likes: completedPahmSession.likesClicks,
          worry: completedPahmSession.worryClicks,
          future: completedPahmSession.futureClicks,
          anticipation: completedPahmSession.anticipationClicks,
        },
        analysis: analysis,
        completedAt: completedPahmSession.updatedAt
      },
      reflection: validatedData.finalReflection,
      nextSteps: {
        continueSession: true, // Allow continuing main session
        saveForReview: true,
        shareProgress: pahmSession.session.stageNumber >= 2 // Allow sharing after Stage 2
      }
    });

  } catch (error) {
    console.error('PAHM completion error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
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

// Helper function to calculate PAHM analysis
function calculatePahmAnalysis(pahmSession: any) {
  const totalClicks = pahmSession.totalClicks;
  
  if (totalClicks === 0) {
    return {
      dominantTime: 'present',
      dominantEmotion: 'neutral',
      timeDistribution: { past: 0, present: 0, future: 0 },
      emotionDistribution: { dislikes: 0, neutral: 0, likes: 0 },
      insights: ['No clicks recorded - try to track your attention during the session'],
      recommendations: ['Focus on being present and aware of your thoughts']
    };
  }

  // Calculate time distribution (Past, Present, Future)
  const pastClicks = pahmSession.regretClicks + pahmSession.pastClicks + pahmSession.nostalgiaClicks;
  const presentClicks = pahmSession.dislikesClicks + pahmSession.presentClicks + pahmSession.likesClicks;
  const futureClicks = pahmSession.worryClicks + pahmSession.futureClicks + pahmSession.anticipationClicks;

  const timeDistribution = {
    past: Math.round((pastClicks / totalClicks) * 100),
    present: Math.round((presentClicks / totalClicks) * 100),
    future: Math.round((futureClicks / totalClicks) * 100)
  };

  // Calculate emotion distribution (Dislikes, Neutral, Likes)
  const dislikesClicks = pahmSession.regretClicks + pahmSession.dislikesClicks + pahmSession.worryClicks;
  const neutralClicks = pahmSession.pastClicks + pahmSession.presentClicks + pahmSession.futureClicks;
  const likesClicks = pahmSession.nostalgiaClicks + pahmSession.likesClicks + pahmSession.anticipationClicks;

  const emotionDistribution = {
    dislikes: Math.round((dislikesClicks / totalClicks) * 100),
    neutral: Math.round((neutralClicks / totalClicks) * 100),
    likes: Math.round((likesClicks / totalClicks) * 100)
  };

  // Determine dominant patterns
  const dominantTime = timeDistribution.past > timeDistribution.present && timeDistribution.past > timeDistribution.future ? 'past' :
                      timeDistribution.future > timeDistribution.present ? 'future' : 'present';

  const dominantEmotion = emotionDistribution.dislikes > emotionDistribution.neutral && emotionDistribution.dislikes > emotionDistribution.likes ? 'dislikes' :
                         emotionDistribution.likes > emotionDistribution.neutral ? 'likes' : 'neutral';

  // Generate insights
  const insights = [];
  if (dominantTime === 'past') {
    insights.push('Your attention was frequently drawn to past experiences');
  } else if (dominantTime === 'future') {
    insights.push('Your mind often wandered to future concerns or plans');
  } else {
    insights.push('You maintained good present-moment awareness');
  }

  if (dominantEmotion === 'dislikes') {
    insights.push('You noticed more challenging or uncomfortable thoughts');
  } else if (dominantEmotion === 'likes') {
    insights.push('You experienced more pleasant or enjoyable thoughts');
  } else {
    insights.push('You maintained balanced emotional awareness');
  }

  // Generate recommendations
  const recommendations = [];
  if (dominantTime !== 'present') {
    recommendations.push('Practice returning attention to present-moment awareness');
  }
  if (dominantEmotion === 'dislikes') {
    recommendations.push('Notice difficult thoughts without judgment - simply observe');
  }
  if (totalClicks < 5) {
    recommendations.push('Try to track your attention more frequently during sessions');
  }

  return {
    dominantTime,
    dominantEmotion,
    timeDistribution,
    emotionDistribution,
    insights,
    recommendations,
    attentionScore: Math.max(1, Math.min(10, Math.round(10 - (Math.abs(50 - timeDistribution.present) / 10))))
  };
}