import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get Stage 1
    const stage1 = await prisma.stage.findUnique({
      where: { stageNumber: 1 }
    })

    if (!stage1) {
      return NextResponse.json(
        { success: false, message: 'Stage 1 not found' },
        { status: 404 }
      )
    }

    // Upsert PAHM intro progress
    const pahmIntroProgress = await prisma.userStageProgress.upsert({
      where: {
        userId_stageId_subStage: {
          userId: session.user.id,
          stageId: stage1.id,
          subStage: 'PAHM'
        }
      },
      create: {
        userId: session.user.id,
        stageId: stage1.id,
        stageNumber: 1,
        subStage: 'PAHM',
        sessionsCompleted: 1,
        hoursCompleted: 0,
        isCompleted: true,
        completedAt: new Date()
      },
      update: {
        sessionsCompleted: 1,
        isCompleted: true,
        completedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'PAHM intro marked as complete',
      data: {
        isCompleted: pahmIntroProgress.isCompleted,
        completedAt: pahmIntroProgress.completedAt
      }
    })

  } catch (error) {
    console.error('Error completing PAHM intro:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
