/**
 * Server Actions for user profile operations
 * Optimized for Next.js 15
 */
'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

export interface UpdateProfileData {
  name?: string
  email?: string
  age?: number
  gender?: string
  nationality?: string
  currentCountry?: string
}

export interface ActionResult {
  success: boolean
  message?: string
  error?: string
  emailChanged?: boolean
}

/**
 * Update user profile data
 */
export async function updateUserProfile(data: UpdateProfileData): Promise<ActionResult> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'Authentication required'
      }
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      }
    }

    // Get user profile separately
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: user.id }
    })

    const { name, email, age, gender, nationality, currentCountry } = data

    // Validation
    const validationErrors: string[] = []

    // Validate name
    if (name && name.trim().length < 2) {
      validationErrors.push('Name must be at least 2 characters long')
    }

    // Validate email format
    if (email && email !== user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        validationErrors.push('Please enter a valid email address')
      }

      // Check if email is already in use by another user
      const existingUser = await prisma.user.findUnique({
        where: { email: email }
      })
      
      if (existingUser && existingUser.id !== user.id) {
        validationErrors.push('This email is already in use by another account')
      }
    }

    // Validate age
    if (age !== undefined && age !== null) {
      const numAge = Number(age)
      if (isNaN(numAge) || numAge < 13 || numAge > 120) {
        validationErrors.push('Age must be between 13 and 120 years')
      }
    }

    // Return validation errors if any
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: validationErrors.join('. ')
      }
    }

    // Track if email is being changed
    const emailChanged = email && email.trim().toLowerCase() !== user.email.toLowerCase()

    // Update user basic info
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name?.trim() || user.name,
        email: email?.trim().toLowerCase() || user.email,
        updatedAt: new Date()
      }
    })

    // Update or create user profile
    if (userProfile) {
      await prisma.userProfile.update({
        where: { userId: user.id },
        data: {
          age: age || userProfile.age,
          gender: gender || userProfile.gender,
          nationality: nationality || userProfile.nationality,
          country: currentCountry || userProfile.country,
          updatedAt: new Date()
        }
      })
    } else {
      await prisma.userProfile.create({
        data: {
          userId: user.id,
          age: age || 18,
          gender: gender || 'prefer_not_to_say',
          nationality: nationality || '',
          country: currentCountry || ''
        }
      })
    }

    // Revalidate relevant pages
    revalidatePath('/user-profile')
    revalidatePath('/home')

    return {
      success: true,
      message: 'Profile updated successfully',
      emailChanged: emailChanged || false
    }

  } catch (error: any) {
    console.error('Error updating user profile:', error)
    
    // Handle specific Prisma errors
    if (error?.code === 'P2002') {
      return {
        success: false,
        error: 'Email is already in use by another account'
      }
    }

    return {
      success: false,
      error: 'Internal server error'
    }
  }
}

/**
 * Delete user account
 */
export async function deleteUserAccount(): Promise<ActionResult> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'Authentication required'
      }
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      }
    }

    // Delete user account (cascading deletes will handle related records)
    await prisma.user.delete({
      where: { id: user.id }
    })

    return {
      success: true,
      message: 'Account deleted successfully'
    }

  } catch (error) {
    console.error('Error deleting user account:', error)
    return {
      success: false,
      error: 'Failed to delete account'
    }
  }
}

/**
 * Change user password
 */
export async function changeUserPassword(currentPassword: string, newPassword: string): Promise<ActionResult> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'Authentication required'
      }
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      }
    }

    // Verify current password
    if (!user.password) {
      return {
        success: false,
        error: 'No password set for this account'
      }
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password)
    if (!isValidPassword) {
      return {
        success: false,
        error: 'Current password is incorrect'
      }
    }

    // Validate new password
    if (newPassword.length < 8) {
      return {
        success: false,
        error: 'New password must be at least 8 characters long'
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        updatedAt: new Date()
      }
    })

    return {
      success: true,
      message: 'Password changed successfully'
    }

  } catch (error) {
    console.error('Error changing password:', error)
    return {
      success: false,
      error: 'Failed to change password'
    }
  }
}
