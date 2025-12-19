import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, ADMIN_PERMISSIONS, createAdminAuditLog } from '@/lib/admin-auth';

/**
 * GET /api/admin/users/[userId]
 * Get comprehensive details for specific user (admin view)
 * 
 * Features:
 * - Complete user profile and progress information
 * - Assessment history and scores
 * - Session statistics and activity summary
 * - Happiness score calculations and trends
 * - System data for admin monitoring
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Check admin authentication and permissions
    const authResult = await requireAdmin(ADMIN_PERMISSIONS.USER_MANAGEMENT);
    if (authResult.error) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status }
      );
    }

    const { adminUser } = authResult;
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch comprehensive user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            age: true,
            gender: true,
            nationality: true,
            country: true,
            createdAt: true,
            updatedAt: true,
          }
        },
        questionnaire: {
          select: {
            isCompleted: true,
            createdAt: true,
            // Include key questionnaire fields for admin insight
            experienceLevel: true,
            mainGoals: true,
            ageRange: true,
            location: true,
            occupation: true,
            meditationBackground: true,
          }
        },
        selfAssessments: {
          select: {
            id: true,
            type: true,
            totalScore: true,
            foodTaste: true,
            scentsAromas: true,
            soundsMusic: true,
            visualBeauty: true,
            touchTextures: true,
            thoughtsImages: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        sessions: {
          select: {
            id: true,
            stageNumber: true,
            subStage: true,
            sessionType: true,
            duration: true,
            status: true,
            qualityRating: true,
            startedAt: true,
            completedAt: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 50 // Limit to recent sessions
        },
        pahmSessions: {
          select: {
            id: true,
            sessionId: true,
            totalClicks: true,
            patternNotes: true,
            clickTimestamps: true,
            createdAt: true,
          },
          take: 20
        },
        dailyNotes: {
          select: {
            id: true,
            type: true,
            moodRating: true,
            emotion: true,
            intensity: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 30
        },
        happinessScores: {
          select: {
            id: true,
            finalScore: true,
            userLevel: true,
            calculatedAt: true,
          },
          orderBy: {
            calculatedAt: 'desc'
          },
          take: 10
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate detailed progress statistics
    const completedSessions = user.sessions.filter(s => s.status === 'COMPLETED');
    const totalHours = completedSessions.reduce((sum, session) => sum + (session.duration || 0), 0) / 60;
    
    // Calculate stage progress
    const stageCompletionCounts = completedSessions.reduce((acc, session) => {
      const stage = session.stageNumber;
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Calculate current streak (consecutive days with sessions)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let currentStreak = 0;
    let checkDate = new Date(today);
    
    const sessionDates = completedSessions
      .map(s => s.completedAt ? new Date(s.completedAt) : null)
      .filter(Boolean)
      .map(date => {
        const d = new Date(date!);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      });
    
    const uniqueSessionDates = Array.from(new Set(sessionDates)).sort().reverse();
    
    for (const sessionTime of uniqueSessionDates) {
      if (sessionTime === checkDate.getTime()) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate activity metrics
    const now = new Date();
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const sessionsThisWeek = completedSessions.filter(s => 
      s.completedAt && new Date(s.completedAt) >= thisWeek
    ).length;
    
    const sessionsThisMonth = completedSessions.filter(s => 
      s.completedAt && new Date(s.completedAt) >= thisMonth
    ).length;

    const averageQuality = completedSessions
      .filter(s => s.qualityRating)
      .reduce((sum, s) => sum + (s.qualityRating || 0), 0) / 
      completedSessions.filter(s => s.qualityRating).length || 0;

    // Calculate mood statistics
    const moodEntries = user.dailyNotes.filter(note => note.moodRating);
    const averageMood = moodEntries.length > 0 
      ? moodEntries.reduce((sum, note) => sum + (note.moodRating || 0), 0) / moodEntries.length
      : 0;

    // Get latest happiness score info
    const latestHappinessScore = user.happinessScores[0];
    const happinessTrend = user.happinessScores.length >= 2 
      ? user.happinessScores[0].finalScore > user.happinessScores[1].finalScore ? 'improving' : 'declining'
      : 'stable';

    // Create audit log
    if (adminUser) {
      await createAdminAuditLog(
        adminUser.id,
        'admin_user_details_accessed',
        { targetUserId: userId, targetUserEmail: user.email }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          lastActivity: user.updatedAt,
        },
        profile: user.profile,
        detailedProgress: {
          stages: {
            completed: Math.max(...Object.keys(stageCompletionCounts).map(Number), 0),
            current: Math.max(...completedSessions.map(s => s.stageNumber), 1),
            totalSessions: completedSessions.length,
            totalHours: Math.round(totalHours * 100) / 100,
            stageBreakdown: stageCompletionCounts,
          },
          assessments: {
            questionnaire: user.questionnaire ? {
              completed: !!user.questionnaire.isCompleted,
              completedAt: user.questionnaire.createdAt,
              keyInsights: {
                experienceLevel: user.questionnaire.experienceLevel,
                mainGoals: user.questionnaire.mainGoals,
                meditationBackground: user.questionnaire.meditationBackground,
              }
            } : null,
            selfAssessments: user.selfAssessments.map(assessment => ({
              type: assessment.type,
              score: assessment.totalScore,
              completedAt: assessment.createdAt,
              breakdown: {
                foodTaste: assessment.foodTaste,
                scentsAromas: assessment.scentsAromas,
                soundsMusic: assessment.soundsMusic,
                visualBeauty: assessment.visualBeauty,
                touchTextures: assessment.touchTextures,
                thoughtsImages: assessment.thoughtsImages,
              }
            }))
          },
          happiness: {
            currentScore: latestHappinessScore?.finalScore || 0,
            level: latestHappinessScore?.userLevel || 'Seeker',
            calculations: user.happinessScores.length,
            trend: happinessTrend,
            history: user.happinessScores.map(score => ({
              score: score.finalScore,
              level: score.userLevel,
              date: score.calculatedAt,
            }))
          }
        },
        activitySummary: {
          sessionsThisWeek,
          sessionsThisMonth,
          currentStreak,
          averageQuality: Math.round(averageQuality * 100) / 100,
          moodEntries: moodEntries.length,
          averageMood: Math.round(averageMood * 100) / 100,
          recentSessions: user.sessions.slice(0, 10).map(session => ({
            id: session.id,
            stage: session.stageNumber,
            subStage: session.subStage,
            type: session.sessionType,
            duration: session.duration,
            status: session.status,
            quality: session.qualityRating,
            completedAt: session.completedAt,
          })),
          recentNotes: user.dailyNotes.slice(0, 5).map(note => ({
            type: note.type,
            mood: note.moodRating,
            emotion: note.emotion,
            date: note.createdAt,
          }))
        },
        systemData: {
          accountAge: Math.floor((now.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
          totalLogins: 'N/A', // Could be tracked with additional logging
          lastSignIn: user.updatedAt,
          pahmSessionCount: user.pahmSessions.length,
          notesCount: user.dailyNotes.length,
        }
      }
    });

  } catch (error) {
    console.error('Admin user details error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        code: 'ADMIN_USER_DETAILS_ERROR'
      },
      { status: 500 }
    );
  }
}
