import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStage1Progress } from '@/lib/data/stage1-progress'

/**
 * GET /api/progress/stage-1
 * Fetch Stage 1 (Seeker) progress with all sub-stages (T1-T5) and PAHM intro
 * Optimized to use server-side data fetching
 */
export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Use optimized data fetching function
    const data = await getStage1Progress()

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Stage 1 not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Stage 1 progress error:', error)
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
