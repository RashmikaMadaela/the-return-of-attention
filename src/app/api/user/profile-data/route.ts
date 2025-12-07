import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserProfile } from '@/lib/data/user-profile'

/**
 * GET /api/user/profile-data
 * Retrieve user profile data for the profile page
 * Optimized to use server-side data fetching
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

    // Use optimized data fetching function
    const profileData = await getUserProfile()

    if (!profileData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
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
 * Uses Server Action for optimized server-side processing
 */
export async function PUT(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    
    // Import and use the Server Action
    const { updateUserProfile } = await import('@/lib/actions/user-profile')
    const result = await updateUserProfile(body)
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error === 'Authentication required' ? 401 : 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      emailChanged: result.emailChanged
    })

  } catch (error: any) {
    console.error('Error updating user profile:', error)
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}