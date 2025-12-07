import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getProgressOverview } from '@/lib/data/progress-overview'

/**
 * GET /api/progress/overview
 * Fetch comprehensive progress overview
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
    const overview = await getProgressOverview()

    if (!overview) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch progress overview' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      overview
    })

  } catch (error) {
    console.error('Progress overview error:', error)
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}