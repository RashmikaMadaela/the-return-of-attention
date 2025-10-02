import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: pahmSessionId } = await params;

    // Validate CUID format (basic validation)
    if (!pahmSessionId || pahmSessionId.length < 20) {
      return NextResponse.json(
        { success: false, error: 'Invalid PAHM session ID format' },
        { status: 400 }
      );
    }

    // Find PAHM session with related data
    const pahmSession = await prisma.pAHMSession.findFirst({
      where: {
        id: pahmSessionId,
        userId: session.user.id
      },
      include: {
        session: {
          select: {
            id: true,
            stageNumber: true,
            subStage: true,
            sessionType: true,
            duration: true,
            status: true,
            startedAt: true,
            completedAt: true,
            qualityRating: true,
            insights: true,
            stage: {
              select: {
                name: true,
                description: true,
                sessionType: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!pahmSession) {
      return NextResponse.json(
        { success: false, error: 'PAHM session not found' },
        { status: 404 }
      );
    }

    // Calculate click distribution percentages
    const totalClicks = pahmSession.totalClicks;
    const clickPercentages = totalClicks > 0 ? {
      regret: Math.round((pahmSession.regretClicks / totalClicks) * 100),
      past: Math.round((pahmSession.pastClicks / totalClicks) * 100),
      nostalgia: Math.round((pahmSession.nostalgiaClicks / totalClicks) * 100),
      dislikes: Math.round((pahmSession.dislikesClicks / totalClicks) * 100),
      present: Math.round((pahmSession.presentClicks / totalClicks) * 100),
      likes: Math.round((pahmSession.likesClicks / totalClicks) * 100),
      worry: Math.round((pahmSession.worryClicks / totalClicks) * 100),
      future: Math.round((pahmSession.futureClicks / totalClicks) * 100),
      anticipation: Math.round((pahmSession.anticipationClicks / totalClicks) * 100),
    } : {};

    // Calculate time and emotion analysis
    const analysis = calculateDetailedAnalysis(pahmSession);

    // Process click timestamps for timeline view
    const clickTimestamps = Array.isArray(pahmSession.clickTimestamps) 
      ? pahmSession.clickTimestamps as any[]
      : [];

    const processedTimeline = clickTimestamps.map((click, index) => ({
      index: index + 1,
      position: click.position,
      timestamp: click.timestamp,
      timeFromStart: click.timeFromStart,
      coordinates: click.coordinates,
      relativeTime: formatRelativeTime(click.timeFromStart)
    }));

    return NextResponse.json({
      success: true,
      pahmSession: {
        id: pahmSession.id,
        sessionId: pahmSession.sessionId,
        stageNumber: pahmSession.stageNumber,
        exerciseType: pahmSession.exerciseType,
        totalClicks: pahmSession.totalClicks,
        patternNotes: pahmSession.patternNotes,
        createdAt: pahmSession.createdAt,
        updatedAt: pahmSession.updatedAt,
        clickCounts: {
          regret: pahmSession.regretClicks,
          past: pahmSession.pastClicks,
          nostalgia: pahmSession.nostalgiaClicks,
          dislikes: pahmSession.dislikesClicks,
          present: pahmSession.presentClicks,
          likes: pahmSession.likesClicks,
          worry: pahmSession.worryClicks,
          future: pahmSession.futureClicks,
          anticipation: pahmSession.anticipationClicks,
        },
        clickPercentages,
        matrix: {
          positions: [
            { id: 'regret', name: 'Regret', time: 'Past', emotion: 'Dislikes', clicks: pahmSession.regretClicks, percentage: clickPercentages.regret || 0 },
            { id: 'past', name: 'Past', time: 'Past', emotion: 'Neutral', clicks: pahmSession.pastClicks, percentage: clickPercentages.past || 0 },
            { id: 'nostalgia', name: 'Nostalgia', time: 'Past', emotion: 'Likes', clicks: pahmSession.nostalgiaClicks, percentage: clickPercentages.nostalgia || 0 },
            { id: 'dislikes', name: 'Dislikes', time: 'Present', emotion: 'Dislikes', clicks: pahmSession.dislikesClicks, percentage: clickPercentages.dislikes || 0 },
            { id: 'present', name: 'Present', time: 'Present', emotion: 'Neutral', clicks: pahmSession.presentClicks, percentage: clickPercentages.present || 0 },
            { id: 'likes', name: 'Likes', time: 'Present', emotion: 'Likes', clicks: pahmSession.likesClicks, percentage: clickPercentages.likes || 0 },
            { id: 'worry', name: 'Worry', time: 'Future', emotion: 'Dislikes', clicks: pahmSession.worryClicks, percentage: clickPercentages.worry || 0 },
            { id: 'future', name: 'Future', time: 'Future', emotion: 'Neutral', clicks: pahmSession.futureClicks, percentage: clickPercentages.future || 0 },
            { id: 'anticipation', name: 'Anticipation', time: 'Future', emotion: 'Likes', clicks: pahmSession.anticipationClicks, percentage: clickPercentages.anticipation || 0 }
          ]
        },
        timeline: processedTimeline,
        analysis: analysis
      },
      session: pahmSession.session,
      user: pahmSession.user
    });

  } catch (error) {
    console.error('PAHM session data error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function for detailed analysis
function calculateDetailedAnalysis(pahmSession: any) {
  const totalClicks = pahmSession.totalClicks;
  
  if (totalClicks === 0) {
    return {
      dominantTime: 'present',
      dominantEmotion: 'neutral',
      timeDistribution: { past: 0, present: 0, future: 0 },
      emotionDistribution: { dislikes: 0, neutral: 0, likes: 0 },
      insights: ['No attention tracking recorded'],
      recommendations: ['Try to track your attention more frequently during sessions'],
      attentionScore: 5,
      focusQuality: 'Unknown'
    };
  }

  // Calculate time distribution
  const pastClicks = pahmSession.regretClicks + pahmSession.pastClicks + pahmSession.nostalgiaClicks;
  const presentClicks = pahmSession.dislikesClicks + pahmSession.presentClicks + pahmSession.likesClicks;
  const futureClicks = pahmSession.worryClicks + pahmSession.futureClicks + pahmSession.anticipationClicks;

  const timeDistribution = {
    past: Math.round((pastClicks / totalClicks) * 100),
    present: Math.round((presentClicks / totalClicks) * 100),
    future: Math.round((futureClicks / totalClicks) * 100)
  };

  // Calculate emotion distribution
  const dislikesClicks = pahmSession.regretClicks + pahmSession.dislikesClicks + pahmSession.worryClicks;
  const neutralClicks = pahmSession.pastClicks + pahmSession.presentClicks + pahmSession.futureClicks;
  const likesClicks = pahmSession.nostalgiaClicks + pahmSession.likesClicks + pahmSession.anticipationClicks;

  const emotionDistribution = {
    dislikes: Math.round((dislikesClicks / totalClicks) * 100),
    neutral: Math.round((neutralClicks / totalClicks) * 100),
    likes: Math.round((likesClicks / totalClicks) * 100)
  };

  // Determine patterns
  const dominantTime = timeDistribution.past > timeDistribution.present && timeDistribution.past > timeDistribution.future ? 'past' :
                      timeDistribution.future > timeDistribution.present ? 'future' : 'present';

  const dominantEmotion = emotionDistribution.dislikes > emotionDistribution.neutral && emotionDistribution.dislikes > emotionDistribution.likes ? 'dislikes' :
                         emotionDistribution.likes > emotionDistribution.neutral ? 'likes' : 'neutral';

  // Calculate attention score (higher present-moment awareness = higher score)
  const attentionScore = Math.max(1, Math.min(10, Math.round(10 - (Math.abs(50 - timeDistribution.present) / 10))));

  // Determine focus quality
  let focusQuality = 'Good';
  if (attentionScore >= 8) focusQuality = 'Excellent';
  else if (attentionScore >= 6) focusQuality = 'Good';
  else if (attentionScore >= 4) focusQuality = 'Fair';
  else focusQuality = 'Needs Improvement';

  // Generate insights
  const insights = [];
  if (timeDistribution.present >= 50) {
    insights.push('Strong present-moment awareness maintained');
  } else if (dominantTime === 'past') {
    insights.push('Attention frequently drawn to past experiences');
  } else if (dominantTime === 'future') {
    insights.push('Mind often engaged with future thoughts');
  }

  if (emotionDistribution.neutral >= 40) {
    insights.push('Balanced emotional awareness');
  } else if (dominantEmotion === 'dislikes') {
    insights.push('More challenging thoughts noticed');
  } else if (dominantEmotion === 'likes') {
    insights.push('Pleasant experiences dominated attention');
  }

  return {
    dominantTime,
    dominantEmotion,
    timeDistribution,
    emotionDistribution,
    insights,
    attentionScore,
    focusQuality,
    clickFrequency: totalClicks > 20 ? 'High' : totalClicks > 10 ? 'Medium' : 'Low'
  };
}

// Helper function to format relative time
function formatRelativeTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${remainingSeconds}s`;
  } else {
    return `${minutes}m ${remainingSeconds}s`;
  }
}