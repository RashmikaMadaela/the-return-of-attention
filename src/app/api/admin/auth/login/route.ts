import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createAdminAuditLog } from '@/lib/admin-auth';

// Validation schema for admin login
const adminLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  mfaToken: z.string().optional(), // Optional MFA token for future enhancement
});

/**
 * POST /api/admin/auth/login
 * Admin-specific authentication with enhanced security measures
 * 
 * Features:
 * - Enhanced password validation
 * - Admin role verification
 * - Audit logging
 * - IP tracking (future enhancement)
 * - MFA support (future enhancement)
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = adminLoginSchema.safeParse(body);

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

    const { email, password, mfaToken } = validation.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        isActive: true,
        emailVerified: true,
        role: true,
      }
    });

    if (!user) {
      // Log failed login attempt
      console.warn('Admin login attempt with non-existent email:', email);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credentials',
        },
        { status: 401 }
      );
    }

    // Check if user account is active and verified
    if (!user.isActive || !user.emailVerified) {
      await createAdminAuditLog(
        'system',
        'admin_login_failed',
        { reason: 'inactive_or_unverified_account', email }
      );
      
      return NextResponse.json(
        {
          success: false,
          error: 'Account is inactive or not verified',
        },
        { status: 401 }
      );
    }

    // Verify password
    if (!user.password) {
      await createAdminAuditLog(
        'system',
        'admin_login_failed',
        { reason: 'no_password_hash', email }
      );
      
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credentials',
        },
        { status: 401 }
      );
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      await createAdminAuditLog(
        'system',
        'admin_login_failed',
        { reason: 'invalid_password', email }
      );
      
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credentials',
        },
        { status: 401 }
      );
    }

    // Check if user has admin role (we use User.role for admin checks)
    if (user.role !== 'admin') {
      await createAdminAuditLog(
        'system',
        'admin_login_failed',
        { reason: 'no_admin_privileges', email, userId: user.id }
      );

      return NextResponse.json(
        {
          success: false,
          error: 'Admin access denied',
        },
        { status: 403 }
      );
    }

    // TODO: Implement MFA validation if mfaToken is provided
    if (mfaToken) {
      // Future MFA implementation
      console.log('MFA token provided (not yet implemented):', mfaToken);
    }

    // Define admin permissions (role-based system)
    const permissions = [
      'user_management',
      'system_monitoring',
      'analytics_access',
      'session_management',
      'users.write',
      'users.delete',
      'admin.manage'
    ];

    // Create audit log for successful login
    await createAdminAuditLog(
      user.id,
      'admin_login_success',
      {
        email,
        role: user.role,
        permissions: permissions.length
      }
    );

    // Calculate session expiry (7 days from now)
    const sessionExpiry = new Date();
    sessionExpiry.setDate(sessionExpiry.getDate() + 7);

    // Return success response (Note: Session is managed by NextAuth)
    return NextResponse.json({
      success: true,
      message: 'Admin authenticated successfully',
      data: {
        adminId: user.id,
        userId: user.id,
        role: user.role,
        permissions,
        sessionExpiry: sessionExpiry.toISOString(),
        lastLogin: new Date().toISOString(),
        user: {
          email: user.email,
          name: user.name,
        }
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        code: 'ADMIN_AUTH_ERROR'
      },
      { status: 500 }
    );
  }
}
