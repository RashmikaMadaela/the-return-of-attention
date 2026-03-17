import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { registerSchema, validateRequestBody } from '@/lib/validation'
import { handleApiError, createSuccessResponse, CommonErrors } from '@/lib/errors'
import { generateVerificationToken, sendVerificationEmail } from '@/lib/email'

const isEmailVerificationEnabled = process.env.ENABLE_EMAIL_VERIFICATION === 'true'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input data using centralized validation
    const validation = validateRequestBody(registerSchema, body)
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      }, { status: 400 })
    }

    const { email, password, name } = validation.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw CommonErrors.userExists(email)
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    const verificationToken = isEmailVerificationEnabled
      ? generateVerificationToken()
      : null
    const tokenExpires = new Date()
    tokenExpires.setHours(tokenExpires.getHours() + 24) // 24 hours expiry

    // Create user and verification token in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          emailVerified: isEmailVerificationEnabled ? null : new Date(),
          isActive: !isEmailVerificationEnabled,
        }
      })

      if (isEmailVerificationEnabled && verificationToken) {
        await prisma.verificationToken.create({
          data: {
            identifier: email,
            token: verificationToken,
            type: 'email_verification',
            expires: tokenExpires
          }
        })
      }

      return user
    })

    const user = result
    
    if (isEmailVerificationEnabled && verificationToken) {
      await sendVerificationEmail(email, verificationToken)
    }

    // Return success response (don't include password or sensitive data)
    return createSuccessResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      requiresEmailVerification: isEmailVerificationEnabled
    }, isEmailVerificationEnabled
      ? 'Account created successfully. Please verify your email before signing in.'
      : 'Account created successfully! You can now sign in immediately.', 201)

  } catch (error) {
    return handleApiError(error)
  }
}