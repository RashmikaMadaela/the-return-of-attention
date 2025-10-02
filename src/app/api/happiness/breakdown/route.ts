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

    // Define component weights and descriptions
    const componentDetails = {
      currentStateScore: {
        weight: 0.12,
        percentage: 12,
        title: 'Current State',
        description: 'Your present emotional and mental state',
        value: Number(happinessScore.currentStateScore),
        weightedValue: Number(happinessScore.currentStateScore) * 0.12,
        category: 'Assessment'
      },
      attachmentScore: {
        weight: 0.20,
        percentage: 20,
        title: 'Attachment Levels',
        description: 'Your attachment to sensory experiences and thoughts',
        value: Number(happinessScore.attachmentScore),
        weightedValue: Number(happinessScore.attachmentScore) * 0.20,
        category: 'Assessment'
      },
      pahmScore: {
        weight: 0.25,
        percentage: 25,
        title: 'PAHM Matrix',
        description: 'Your attention awareness and matrix practice progress',
        value: Number(happinessScore.pahmScore),
        weightedValue: Number(happinessScore.pahmScore) * 0.25,
        category: 'Practice'
      },
      practiceScore: {
        weight: 0.15,
        percentage: 15,
        title: 'Practice Quality',
        description: 'Consistency and quality of your meditation practice',
        value: Number(happinessScore.practiceScore),
        weightedValue: Number(happinessScore.practiceScore) * 0.15,
        category: 'Practice'
      },
      progressScore: {
        weight: 0.10,
        percentage: 10,
        title: 'Progress Tracking',
        description: 'Your advancement through meditation stages',
        value: Number(happinessScore.progressScore),
        weightedValue: Number(happinessScore.progressScore) * 0.10,
        category: 'Progress'
      },
      consistencyScore: {
        weight: 0.08,
        percentage: 8,
        title: 'Consistency',
        description: 'Regularity of your practice and engagement',
        value: Number(happinessScore.consistencyScore),
        weightedValue: Number(happinessScore.consistencyScore) * 0.08,
        category: 'Practice'
      },
      reflectionScore: {
        weight: 0.05,
        percentage: 5,
        title: 'Self-Reflection',
        description: 'Quality of your notes and self-awareness',
        value: Number(happinessScore.reflectionScore),
        weightedValue: Number(happinessScore.reflectionScore) * 0.05,
        category: 'Progress'
      },
      dailyLifeScore: {
        weight: 0.05,
        percentage: 5,
        title: 'Daily Life Integration',
        description: 'Application of mindfulness in everyday activities',
        value: Number(happinessScore.dailyLifeScore),
        weightedValue: Number(happinessScore.dailyLifeScore) * 0.05,
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
  const consistencyScore = components.consistencyScore.value;
  const practiceScore = components.practiceScore.value;
  if (consistencyScore < practiceScore - 20) {
    insights.push({
      type: 'suggestion',
      message: 'Your practice quality is good, but consistency could enhance your overall progress.',
      priority: 'medium'
    });
  }

  // Balance insights
  const assessmentTotal = components.currentStateScore.value + components.attachmentScore.value;
  const practiceTotal = components.pahmScore.value + components.practiceScore.value + components.consistencyScore.value;
  
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