import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createAdminAuditLog } from '@/lib/admin-auth';

// Validation schema for admin registration
const adminRegisterSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['super_admin', 'admin', 'moderator']).default('admin'),
  permissions: z.array(z.string()).optional(),
  registrationKey: z.string().min(1, 'Registration key is required'), // Security key for admin registration
});

/**
 * POST /api/admin/auth/register
 * Admin user registration with enhanced security
 * 
 * Features:
 * - Secure admin registration with registration key
 * - Role-based permission assignment
 * - Audit logging
 * - Password hashing
 * - Duplicate prevention
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = adminRegisterSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input data',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password, name, role, permissions, registrationKey } = validation.data;

    // Verify registration key (in production, this should be from environment variables)
    const validRegistrationKey = process.env.ADMIN_REGISTRATION_KEY || 'admin-registration-2024';
    if (registrationKey !== validRegistrationKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid registration key',
        },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // If the user already has a non-default role, treat as existing admin
      if (existingUser.role && existingUser.role !== 'user') {
        return NextResponse.json(
          {
            success: false,
            error: 'Admin user already exists',
          },
          { status: 409 }
        );
      }

      // User exists but not admin - promote to admin by updating role
      const hashedPassword = await bcrypt.hash(password, 12);

      // Update user password, verification status and role
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: hashedPassword,
          emailVerified: new Date(),
          isActive: true,
          role: role,
        }
      });

      const defaultPermissions = permissions || getDefaultPermissions(role);

      // Create audit log
      await createAdminAuditLog(
        updatedUser.id,
        'admin_user_promoted',
        {
          email,
          role,
          permissions: defaultPermissions,
          promotedFrom: 'existing_user'
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Existing user promoted to admin successfully',
        data: {
          adminId: updatedUser.id,
          userId: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role,
          permissions: defaultPermissions,
        }
      });
    }

    // Create new user and admin in transaction
    const hashedPassword = await bcrypt.hash(password, 12);
    const defaultPermissions = permissions || getDefaultPermissions(role);

    const result = await prisma.$transaction(async (tx) => {
      // Create user with admin role
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: role,
          emailVerified: new Date(), // Admin users are pre-verified
          isActive: true,
        }
      });

      return { user: newUser };
    });

    // Create audit log
    await createAdminAuditLog(
      result.user.id,
      'admin_user_created',
      {
        email,
        role,
        permissions: defaultPermissions,
        createdFrom: 'registration'
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        adminId: result.user.id,
        userId: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role,
        permissions: defaultPermissions,
      }
    });

  } catch (error) {
    console.error('Admin registration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        code: 'ADMIN_REGISTRATION_ERROR'
      },
      { status: 500 }
    );
  }
}

/**
 * Get default permissions based on admin role
 */
function getDefaultPermissions(role: string): string[] {
  switch (role) {
    case 'super_admin':
      return [
        'users.read',
        'users.write',
        'users.delete',
        'stats.read',
        'sessions.manage',
        'stages.manage',
        'admin.manage',
        'system.configure'
      ];
    case 'admin':
      return [
        'users.read',
        'users.write',
        'stats.read',
        'sessions.manage',
        'stages.manage'
      ];
    case 'moderator':
      return [
        'users.read',
        'stats.read',
        'sessions.view'
      ];
    default:
      return ['users.read', 'stats.read'];
  }
}