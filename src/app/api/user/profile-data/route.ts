import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/user/profile-data
 * Retrieve user profile data for the profile page
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: true,
        questionnaire: {
          select: {
            isCompleted: true
          }
        },
        selfAssessments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        happinessScores: {
          select: {
            finalScore: true,
            userLevel: true
          },
          orderBy: { calculatedAt: 'desc' },
          take: 1
        },
        stageProgress: {
          select: {
            hoursCompleted: true,
            sessionsCompleted: true
          }
        },
        sessions: {
          where: { status: 'completed' },
          select: {
            id: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate total completed sessions from both Session table and UserStageProgress
    const sessionTableCount = user.sessions.length
    const stageProgressSessions = user.stageProgress.reduce((sum, progress) => {
      return sum + (progress.sessionsCompleted || 0)
    }, 0)
    const totalSessions = Math.max(sessionTableCount, stageProgressSessions)

    // Calculate total hours from stage progress
    const totalHours = user.stageProgress.reduce((sum, progress) => {
      return sum + parseFloat(progress.hoursCompleted.toString())
    }, 0)

    // Get latest happiness score and user level
    const latestHappinessScore = user.happinessScores[0]
    const happiness = latestHappinessScore ? parseFloat(latestHappinessScore.finalScore.toString()) : 0
    const userLevel = latestHappinessScore?.userLevel || 'Seeker'

    // Check assessment completion status
    const questionnaireCompleted = !!user.questionnaire?.isCompleted
    const selfAssessmentCompleted = user.selfAssessments.length > 0

    // Get user role separately using raw query since Prisma client doesn't recognize it yet
    const userRoleResult = await prisma.$queryRaw<Array<{role: string}>>`
      SELECT role FROM users WHERE email = ${session.user.email}
    `
    const userRole = userRoleResult[0]?.role || 'user'

    const profileData = {
      name: user.name || user.email.split('@')[0],
      email: user.email,
      role: userRole, // Use actual role from database
      profile: user.profile,
      happiness: Math.round(happiness),
      sessions: totalSessions,
      userLevel: userLevel,
      hours: Math.round(totalHours),
      questionnaireCompleted,
      selfAssessmentCompleted
    }

    return NextResponse.json({
      success: true,
      data: profileData
    })

  } catch (error) {
    console.error('Error fetching user profile data:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/user/profile-data
 * Update user profile data
 */
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Get user profile separately
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: user.id }
    })

    // Parse request body
    const body = await request.json()
    const { name, email, age, gender, nationality, currentCountry } = body

    // Validation
    const validationErrors: string[] = []

    // Validate name
    if (name && name.trim().length < 2) {
      validationErrors.push('Name must be at least 2 characters long')
    }

    // Validate email format
    if (email && email !== user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        validationErrors.push('Please enter a valid email address')
      }

      // Check if email is already in use by another user
      const existingUser = await prisma.user.findUnique({
        where: { email: email }
      })
      
      if (existingUser && existingUser.id !== user.id) {
        validationErrors.push('This email is already in use by another account')
      }
    }

    // Validate age
    if (age !== undefined && age !== null) {
      const numAge = Number(age)
      if (isNaN(numAge) || numAge < 13 || numAge > 120) {
        validationErrors.push('Age must be between 13 and 120 years')
      }
    }

    // Return validation errors if any
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, error: validationErrors.join('. ') },
        { status: 400 }
      )
    }

    // Track if email is being changed
    const emailChanged = email && email.trim().toLowerCase() !== user.email

    // Update user basic info
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name?.trim() || user.name,
        email: email?.trim().toLowerCase() || user.email,
        updatedAt: new Date()
      }
    })

    // Update or create user profile
    if (userProfile) {
      await prisma.userProfile.update({
        where: { userId: user.id },
        data: {
          age: age || userProfile.age,
          gender: gender || userProfile.gender,
          nationality: nationality || userProfile.nationality,
          country: currentCountry || userProfile.country,
          updatedAt: new Date()
        }
      })
    } else {
      await prisma.userProfile.create({
        data: {
          userId: user.id,
          age: age || 18,
          gender: gender || 'prefer_not_to_say',
          nationality: nationality || '',
          country: currentCountry || ''
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      emailChanged: emailChanged
    })

  } catch (error: any) {
    console.error('Error updating user profile:', error)
    
    // Handle specific Prisma errors
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Email is already in use by another account' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}