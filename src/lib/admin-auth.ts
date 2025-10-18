import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Admin Authentication & Authorization Middleware
 * Provides enhanced security for admin-only routes
 */

export interface AdminUser {
  id: string;
  userId: string;
  role: 'admin' | 'user';
  permissions: string[];
  isActive: boolean;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * Get admin user from session with enhanced validation
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    // Get the current session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return null;
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      }
    });

    if (!user || !user.isActive) {
      return null;
    }

    // Check if user has admin role
    if (user.role !== 'admin') {
      return null;
    }

    // Define permissions based on role
    // All admins have basic admin permissions
    const permissions = [
      'user_management',
      'system_monitoring',
      'analytics_access',
      'session_management',
      'users.write',
      'users.delete',
      'admin.manage'
    ];

    return {
      id: user.id,
      userId: user.id,
      role: user.role as 'admin' | 'user',
      permissions,
      isActive: user.isActive,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || '',
      }
    };
  } catch (error) {
    console.error('Admin authentication error:', error);
    return null;
  }
}

/**
 * Check if admin user has specific permission
 */
export function hasPermission(adminUser: AdminUser, permission: string): boolean {
  // All admins in this system have all permissions
  // (since we're using a simple role-based system with User.role)
  if (adminUser.role === 'admin') {
    return true;
  }

  // Check specific permission
  return adminUser.permissions.includes(permission);
}

/**
 * Admin authorization middleware
 */
export async function requireAdmin(requiredPermission?: string) {
  const adminUser = await getAdminUser();
  
  if (!adminUser) {
    return { error: 'Admin authentication required', status: 401 };
  }

  if (requiredPermission && !hasPermission(adminUser, requiredPermission)) {
    return { error: 'Insufficient permissions', status: 403 };
  }

  return { adminUser, error: null, status: 200 };
}

/**
 * Default admin permissions
 */
export const ADMIN_PERMISSIONS = {
  USER_MANAGEMENT: 'user_management',
  SYSTEM_MONITORING: 'system_monitoring',
  ANALYTICS_ACCESS: 'analytics_access',
  SESSION_MANAGEMENT: 'session_management',
  SYSTEM_ADMIN: 'system_admin',
} as const;

/**
 * Create admin audit log entry
 */
export async function createAdminAuditLog(
  adminId: string,
  action: string,
  details: Record<string, any>,
  targetUserId?: string
) {
  try {
    // Note: We could implement an audit log table later
    // For now, we'll just log to console in development
    console.log('Admin Audit Log:', {
      adminId,
      action,
      details,
      targetUserId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}