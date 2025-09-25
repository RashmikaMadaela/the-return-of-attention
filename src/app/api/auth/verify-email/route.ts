import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Email verification validation schema
const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  email: z.string().email('Invalid email address')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input data
    const validationResult = verifyEmailSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const { token, email } = validationResult.data

    // Find verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: token,
        type: 'email_verification',
        expires: {
          gt: new Date() // Token must not be expired
        }
      }
    })

    if (!verificationToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired verification token'
        },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found'
        },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        {
          success: true,
          message: 'Email already verified'
        },
        { status: 200 }
      )
    }

    // Update user and delete verification token in a transaction
    await prisma.$transaction(async (prisma) => {
      // Update user email verification status
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
          isActive: true // Activate user after email verification
        }
      })

      // Delete used verification token
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id }
      })
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Email verified successfully. You can now sign in to your account.'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Email verification error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error. Please try again later.'
      },
      { status: 500 }
    )
  }
}

// GET method to handle verification links from email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing token or email parameter'
        },
        { status: 400 }
      )
    }

    // Use the same verification logic as POST
    const body = { token, email }
    const validationResult = verifyEmailSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid parameters'
        },
        { status: 400 }
      )
    }

    // Find and verify token (same logic as POST)
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: token,
        type: 'email_verification',
        expires: {
          gt: new Date()
        }
      }
    })

    if (!verificationToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired verification token'
        },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found'
        },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        {
          success: true,
          message: 'Email already verified',
          redirect: '/auth/signin?verified=true'
        },
        { status: 200 }
      )
    }

    // Verify email
    await prisma.$transaction(async (prisma) => {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
          isActive: true
        }
      })

      await prisma.verificationToken.delete({
        where: { id: verificationToken.id }
      })
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Email verified successfully',
        redirect: '/auth/signin?verified=true'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Email verification GET error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}