import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { generateResetToken, sendPasswordResetEmail } from '@/lib/email'

// Password reset request validation schema
const resetRequestSchema = z.object({
  email: z.string().email('Invalid email address')
})

// Password reset validation schema  
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

function hasToken(payload: unknown): payload is { token: string } {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'token' in payload &&
    typeof (payload as { token?: unknown }).token === 'string'
  )
}

// POST - Request password reset (send email)
export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json()
    
    // Check if this is a reset request or password reset
    if (hasToken(body)) {
      // This is a password reset with token
      return handlePasswordReset(body)
    } else {
      // This is a reset request (send email)
      return handleResetRequest(body)
    }

  } catch (error) {
    console.error('Password reset error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error. Please try again later.'
      },
      { status: 500 }
    )
  }
}

// Handle password reset request (send email)
async function handleResetRequest(body: unknown) {
  // Validate input data
  const validationResult = resetRequestSchema.safeParse(body)
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

  const { email } = validationResult.data

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email }
  })

  // Always return success for security (don't reveal if email exists)
  // But only send email if user exists
  if (user && user.emailVerified) {
    // Generate reset token
    const resetToken = generateResetToken()
    const tokenExpires = new Date()
    tokenExpires.setHours(tokenExpires.getHours() + 1) // 1 hour expiry

    // Delete any existing reset tokens for this email
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email,
        type: 'password_reset'
      }
    })

    // Create new reset token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: resetToken,
        type: 'password_reset',
        expires: tokenExpires
      }
    })

    // Send reset email
    try {
      await sendPasswordResetEmail(email, resetToken)
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send reset email. Please try again later.'
        },
        { status: 500 }
      )
    }
  }

  return NextResponse.json(
    {
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.'
    },
    { status: 200 }
  )
}

// Handle password reset with token
async function handlePasswordReset(body: unknown) {
  // Validate input data
  const validationResult = resetPasswordSchema.safeParse(body)
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

  const { token, password } = validationResult.data

  // Find reset token
  const resetToken = await prisma.verificationToken.findFirst({
    where: {
      token: token,
      type: 'password_reset',
      expires: {
        gt: new Date() // Token must not be expired
      }
    }
  })

  if (!resetToken) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid or expired reset token'
      },
      { status: 400 }
    )
  }

  // Find user by email from token
  const user = await prisma.user.findUnique({
    where: { email: resetToken.identifier }
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

  // Hash new password
  const hashedPassword = await hashPassword(password)

  // Update password and delete reset token in a transaction
  await prisma.$transaction(async (prisma) => {
    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        updatedAt: new Date()
      }
    })

    // Delete used reset token
    await prisma.verificationToken.delete({
      where: { id: resetToken.id }
    })

    // Delete any other reset tokens for this email
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: resetToken.identifier,
        type: 'password_reset'
      }
    })
  })

  return NextResponse.json(
    {
      success: true,
      message: 'Password has been reset successfully. You can now sign in with your new password.'
    },
    { status: 200 }
  )
}