import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/admin/manage-user-role
 * Change user role (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if current user is admin
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (currentUser?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Parse request body
    const { email, role } = await request.json()

    // Validate input
    if (!email || !role) {
      return NextResponse.json(
        { success: false, error: 'Email and role are required' },
        { status: 400 }
      )
    }

    if (!['admin', 'user'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Role must be either "admin" or "user"' },
        { status: 400 }
      )
    }

    // Find target user
    const targetUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true }
    })

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role },
      select: { id: true, email: true, name: true, role: true }
    })

    return NextResponse.json({
      success: true,
      message: `User ${email} role updated to ${role}`,
      data: updatedUser
    })

  } catch (error: any) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}