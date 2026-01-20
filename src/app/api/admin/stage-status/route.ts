import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Admin Stage Status API
 * 
 * GET /api/admin/stage-status
 * Returns the unlock status of all stages for the current admin user
 */

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check admin role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    // Get all stages with user progress
    const stages = await prisma.stage.findMany({
      include: {
        userProgress: {
          where: { userId: user.id },
          select: {
            stageNumber: true,
            isCompleted: true
          }
        }
      },
      orderBy: { stageNumber: 'asc' }
    })

    // Build status object
    const stageStatus: Record<number, { isUnlocked: boolean }> = {}
    
    stages.forEach(stage => {
      // A stage is unlocked if it has user progress entry
      const isUnlocked = stage.userProgress.length > 0
      stageStatus[stage.stageNumber] = { isUnlocked }
    })

    return NextResponse.json({
      success: true,
      stages: stageStatus
    })
  } catch (error) {
    console.error('Stage status fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
