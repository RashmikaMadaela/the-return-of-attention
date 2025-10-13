import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/happiness/breakdown
 * Get detailed breakdown of happiness score components
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const scoreId = searchParams.get('scoreId'); // Specific score to analyze
    const latest = searchParams.get('latest') === 'true'; // Use latest score if no ID provided

    let happinessScore;

    if (scoreId) {
      // Get specific score
      happinessScore = await prisma.happinessScore.findFirst({
        where: {
          id: scoreId,
          userId: user.id
        }
      });
    } else if (latest) {
      // Get latest score
      happinessScore = await prisma.happinessScore.findFirst({
        where: {
          userId: user.id
        },
        orderBy: {
          calculatedAt: 'desc'
        }
      });
    }

    if (!happinessScore) {
      return NextResponse.json(
        { success: false, error: 'Happiness score not found' },
        { status: 404 }
      );
    }

    // Define component weights and descriptions (v3 STRICT mode)
    const componentDetails = {
      currentStateScore: {
        weight: 0.12,
        percentage: 12,
        title: 'Current State Assessment',
        description: 'Your present emotional and mental state based on questionnaire and daily notes',
        value: Number(happinessScore.currentStateScore),
        weightedValue: Number(happinessScore.currentStateScore) * 0.12,
        category: 'Assessment'
      },
      attachmentScore: {
        weight: 0.20,
        percentage: 20,
        title: 'Attachment-Based Happiness',
        description: 'Your level of attachment to sensory experiences (non-attachment brings happiness)',
        value: Number(happinessScore.attachmentScore),
        weightedValue: Number(happinessScore.attachmentScore) * 0.20,
        category: 'Assessment'
      },
      pahmScore: {
        weight: 0.25,
        percentage: 25,
        title: 'PAHM Development (PRIMARY)',
        description: 'Your attention awareness and Present Attention Happiness Matrix practice progress',
        value: Number(happinessScore.pahmScore),
        weightedValue: Number(happinessScore.pahmScore) * 0.25,
        category: 'Practice',
        isPrimary: true
      },
      emotionalStabilityScore: {
        weight: 0.18,
        percentage: 18,
        title: 'Emotional Stability Progress',
        description: 'Your emotional awareness, stress management, and thought patterns',
        value: Number(happinessScore.emotionalStabilityScore),
        weightedValue: Number(happinessScore.emotionalStabilityScore) * 0.18,
        category: 'Progress'
      },
      mindRecoveryScore: {
        weight: 0.08,
        percentage: 8,
        title: 'Mind Recovery Effectiveness',
        description: 'Effectiveness of your practice sessions in recovering present-moment awareness',
        value: Number(happinessScore.mindRecoveryScore),
        weightedValue: Number(happinessScore.mindRecoveryScore) * 0.08,
        category: 'Practice'
      },
      emotionalRegulationScore: {
        weight: 0.10,
        percentage: 10,
        title: 'Emotional Regulation',
        description: 'Your ability to maintain mindful awareness and make intuitive decisions',
        value: Number(happinessScore.emotionalRegulationScore),
        weightedValue: Number(happinessScore.emotionalRegulationScore) * 0.10,
        category: 'Progress'
      },
      practiceConsistencyScore: {
        weight: 0.03,
        percentage: 3,
        title: 'Practice Consistency',
        description: 'Regularity of your meditation practice and daily engagement',
        value: Number(happinessScore.practiceConsistencyScore),
        weightedValue: Number(happinessScore.practiceConsistencyScore) * 0.03,
        category: 'Practice'
      },
      socialConnectionScore: {
        weight: 0.04,
        percentage: 4,
        title: 'Social Connection',
        description: 'Quality of your social relationships and service motivation',
        value: Number(happinessScore.socialConnectionScore),
        weightedValue: Number(happinessScore.socialConnectionScore) * 0.04,
        category: 'Integration'
      }
    };

    // Calculate category totals
    const categoryTotals = Object.values(componentDetails).reduce((acc, component) => {
      if (!acc[component.category]) {
        acc[component.category] = {
          total: 0,
          weightedTotal: 0,
          components: []
        };
      }
      acc[component.category].total += component.value;
      acc[component.category].weightedTotal += component.weightedValue;
      acc[component.category].components.push(component.title);
      return acc;
    }, {} as Record<string, any>);

    // Identify strengths and areas for improvement
    const sortedComponents = Object.entries(componentDetails).sort(
      ([, a], [, b]) => b.value - a.value
    );

    const strengths = sortedComponents.slice(0, 3).map(([key, component]) => ({
      component: component.title,
      score: component.value,
      description: component.description
    }));

    const improvementAreas = sortedComponents.slice(-3).map(([key, component]) => ({
      component: component.title,
      score: component.value,
      description: component.description,
      potentialGain: Number(((100 - component.value) * component.weight).toFixed(1))
    }));

    // Generate insights and recommendations
    const insights = generateInsights(happinessScore, componentDetails);

    return NextResponse.json({
      success: true,
      data: {
        scoreId: happinessScore.id,
        finalScore: Number(happinessScore.finalScore),
        userLevel: happinessScore.userLevel,
        calculatedAt: happinessScore.calculatedAt,
        calculationBasis: {
          questionnaireBased: happinessScore.questionnaireBased,
          selfAssessmentBased: happinessScore.selfAssessmentBased,
          practiceEnhanced: happinessScore.practiceEnhanced
        },
        componentBreakdown: componentDetails,
        categoryAnalysis: categoryTotals,
        analysis: {
          strengths,
          improvementAreas,
          insights
        }
      }
    });

  } catch (error) {
    console.error('Error getting happiness score breakdown:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to generate insights based on score breakdown
 */
function generateInsights(score: any, components: any) {
  const insights = [];
  const finalScore = Number(score.finalScore);

  // Overall level insight
  if (finalScore >= 80) {
    insights.push({
      type: 'achievement',
      message: 'Excellent progress! You\'re demonstrating advanced understanding of mindfulness and happiness.',
      priority: 'high'
    });
  } else if (finalScore >= 60) {
    insights.push({
      type: 'progress',
      message: 'Good progress! You\'re developing a solid foundation in meditation and awareness.',
      priority: 'medium'
    });
  } else {
    insights.push({
      type: 'encouragement',
      message: 'You\'re on the right path! Every step in your mindfulness journey is valuable.',
      priority: 'medium'
    });
  }

  // PAHM Matrix specific insights
  const pahmScore = components.pahmScore.value;
  if (pahmScore < 50) {
    insights.push({
      type: 'suggestion',
      message: 'Focus on your PAHM Matrix practice - it has the highest impact on your happiness score (25% weight).',
      priority: 'high'
    });
  } else if (pahmScore >= 80) {
    insights.push({
      type: 'achievement',
      message: 'Excellent PAHM Matrix understanding! Your attention awareness is developing beautifully.',
      priority: 'medium'
    });
  }

  // Attachment insights
  const attachmentScore = components.attachmentScore.value;
  if (attachmentScore < 40) {
    insights.push({
      type: 'insight',
      message: 'Working on reducing attachments will significantly boost your happiness (20% of total score).',
      priority: 'high'
    });
  } else if (attachmentScore >= 70) {
    insights.push({
      type: 'achievement',
      message: 'Great work on managing attachments! This is a key foundation for lasting happiness.',
      priority: 'medium'
    });
  }

  // Practice consistency insights
  const consistencyScore = components.practiceConsistencyScore.value;
  const mindRecoveryScore = components.mindRecoveryScore.value;
  if (consistencyScore < mindRecoveryScore - 20) {
    insights.push({
      type: 'suggestion',
      message: 'Your practice quality is good, but more consistency could enhance your overall progress.',
      priority: 'medium'
    });
  }

  // Balance insights
  const assessmentTotal = components.currentStateScore.value + components.attachmentScore.value;
  const practiceTotal = components.pahmScore.value + components.mindRecoveryScore.value + components.practiceConsistencyScore.value;
  
  if (Math.abs(assessmentTotal - practiceTotal) > 30) {
    if (assessmentTotal > practiceTotal) {
      insights.push({
        type: 'suggestion',
        message: 'Your self-awareness is strong. Focus more on regular practice to balance your development.',
        priority: 'medium'
      });
    } else {
      insights.push({
        type: 'suggestion',
        message: 'Your practice is solid. Consider deepening your self-reflection and assessment work.',
        priority: 'medium'
      });
    }
  }

  return insights;
}