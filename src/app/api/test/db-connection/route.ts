import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/test/db-connection
 * Test database connection and schema
 */
export async function GET(request: NextRequest) {
  try {
    // Try to connect to database and check if users table exists
    const userCount = await prisma.user.count()
    
    // Test if role field exists by trying to select it
    const sampleUser = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        role: true, // This should work now after regenerating client
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        userCount,
        hasRoleField: true,
        sampleUser: sampleUser ? {
          id: sampleUser.id,
          email: sampleUser.email,
          role: sampleUser.role,
          createdAt: sampleUser.createdAt
        } : null
      }
    })

  } catch (error: any) {
    console.error('Database connection test error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Database connection failed',
      code: error.code || 'UNKNOWN_ERROR'
    }, { status: 500 })
  }
}