import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { generateVerificationToken, sendVerificationEmail } from '@/lib/email'

// Resend verification validation schema
const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input data
    const validationResult = resendVerificationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email address',
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const { email } = validationResult.data

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        {
          success: true,
          message: 'If an account with this email exists and is not verified, a verification email has been sent.',
          details: 'Check your terminal console if Resend is not configured.'
        },
        { status: 200 }
      )
    }

    // Check if user is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        {
          success: true,
          message: 'This email is already verified. You can sign in to your account.',
        },
        { status: 200 }
      )
    }

    // Delete any existing verification tokens for this email
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email,
        type: 'email_verification'
      }
    })

    // Generate new verification token
    const verificationToken = generateVerificationToken()
    const tokenExpires = new Date()
    tokenExpires.setHours(tokenExpires.getHours() + 24) // 24 hours expiry

    // Create new verification token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        type: 'email_verification',
        expires: tokenExpires
      }
    })

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send verification email. Please try again later.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Verification email sent successfully! Please check your email and click the verification link.',
        details: 'If you don\'t receive the email, check your spam folder or check the terminal console if Resend is not configured.'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Resend verification error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error. Please try again later.'
      },
      { status: 500 }
    )
  }
}