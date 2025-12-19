import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export interface AdminStatsData {
  dashboardCounts: {
    practiceSessions: number
    mindRecoverySessions: number
    dailyNotes: number
    totalUsers: number
  }
  systemMetrics: {
    activeUsers: number
    newUsersThisMonth: number
    totalPracticeHours: number
    averageSessionDuration: number
  }
  engagementMetrics: {
    dailyActiveUsers: number
    weeklyActiveUsers: number
    monthlyActiveUsers: number
  }
}

/**
 * Server-side data fetcher for admin dashboard statistics
 */
export const getAdminStats = cache(async (): Promise<AdminStatsData | null> => {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      redirect('/signin')
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { role: true }
    })

    if (user?.role !== 'admin') {
      redirect('/home')
    }

    // Calculate date ranges for analytics
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Execute parallel queries for all statistics
    const [
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      totalSessions,
      mindRecoverySessions,
      dailyNotes,
      dailyActiveUsers,
      weeklyActiveUsers,
      monthlyActiveUsers,
      sessionMetrics
    ] = await Promise.all([
      // Basic counts
      prisma.user.count(),
      prisma.user.count({ where: { updatedAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      
      // Session counts
      prisma.session.count(),
      prisma.session.count({ where: { sessionType: 'mind_recovery' } }),
      
      // Daily notes count
      prisma.dailyNote.count(),
      
      // Activity metrics
      prisma.user.count({ where: { updatedAt: { gte: oneDayAgo } } }),
      prisma.user.count({ where: { updatedAt: { gte: sevenDaysAgo } } }),
      prisma.user.count({ where: { updatedAt: { gte: thirtyDaysAgo } } }),
      
      // Session duration metrics
      prisma.session.aggregate({
        _avg: { duration: true },
        _sum: { duration: true },
        where: { status: 'completed' }
      })
    ])

    // Calculate practice sessions (total sessions minus mind recovery)
    const practiceSessions = totalSessions - mindRecoverySessions
    
    // Calculate total hours from minutes
    const totalPracticeHours = Math.floor((sessionMetrics._sum.duration || 0) / 60)
    const averageSessionDuration = Math.round(sessionMetrics._avg.duration || 0)

    return {
      dashboardCounts: {
        practiceSessions,
        mindRecoverySessions,
        dailyNotes,
        totalUsers
      },
      systemMetrics: {
        activeUsers,
        newUsersThisMonth,
        totalPracticeHours,
        averageSessionDuration
      },
      engagementMetrics: {
        dailyActiveUsers,
        weeklyActiveUsers,
        monthlyActiveUsers
      }
    }

  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return null
  }
})
