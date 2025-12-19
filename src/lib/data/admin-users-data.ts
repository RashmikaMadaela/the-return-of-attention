import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export interface UserProgressSummary {
  currentStage: number
  totalSessions: number
  totalHours: number
  happinessScore: number
  userLevel: string
}

export interface AdminUser {
  id: string
  name: string | null
  email: string
  isActive: boolean
  emailVerified: Date | null
  createdAt: Date
  lastActivity: Date
  progressSummary: UserProgressSummary
}

export interface AdminUsersData {
  users: AdminUser[]
  pagination: {
    currentPage: number
    totalPages: number
    totalUsers: number
    pageSize: number
    hasMore: boolean
  }
  filters: {
    searchTerm: string | null
    status: string | null
    sortBy: string
  }
}

export interface AdminUsersParams {
  page?: number
  pageSize?: number
  search?: string
  status?: 'active' | 'inactive' | 'all'
  sortBy?: 'joinedDate' | 'lastActivity' | 'name'
  order?: 'asc' | 'desc'
}

/**
 * Server-side data fetcher for admin users list with pagination and filtering
 */
export const getAdminUsers = cache(async (params: AdminUsersParams = {}): Promise<AdminUsersData | null> => {
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

    // Default params
    const {
      page = 1,
      pageSize = 20,
      search = '',
      status = 'all',
      sortBy = 'joinedDate',
      order = 'desc'
    } = params

    // Build filter conditions
    const whereConditions: any = {}

    // Search by name or email
    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Status filtering
    if (status === 'active') {
      whereConditions.isActive = true
    } else if (status === 'inactive') {
      whereConditions.isActive = false
    }

    // Calculate pagination
    const skip = (page - 1) * pageSize

    // Build sort conditions
    let orderBy: any = {}
    switch (sortBy) {
      case 'joinedDate':
        orderBy = { createdAt: order }
        break
      case 'lastActivity':
        orderBy = { updatedAt: order }
        break
      case 'name':
        orderBy = { name: order }
        break
      default:
        orderBy = { createdAt: order }
    }

    // Execute parallel queries for users and count
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereConditions,
        skip,
        take: pageSize,
        orderBy,
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          stageProgress: {
            select: {
              stageNumber: true,
              sessionsCompleted: true,
              hoursCompleted: true
            },
            orderBy: {
              stageNumber: 'desc'
            },
            take: 1
          },
          sessions: {
            where: { status: 'COMPLETED' },
            select: {
              createdAt: true
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          },
          happinessScores: {
            select: {
              finalScore: true,
              userLevel: true
            },
            orderBy: {
              calculatedAt: 'desc'
            },
            take: 1
          }
        }
      }),
      prisma.user.count({ where: whereConditions })
    ])

    // Transform to AdminUser format
    const adminUsers: AdminUser[] = users.map(user => {
      // Calculate total sessions from stageProgress
      const totalSessions = user.stageProgress.reduce((sum, progress) => 
        sum + (progress.sessionsCompleted || 0), 0
      )
      
      // Calculate total hours from stageProgress
      const totalHours = Math.floor(
        user.stageProgress.reduce((sum, progress) => 
          sum + parseFloat(progress.hoursCompleted.toString()), 0
        )
      )
      
      // Get current stage (highest stage number)
      const currentStage = user.stageProgress[0]?.stageNumber || 1
      
      // Get happiness score and level
      const latestHappiness = user.happinessScores[0]
      const happinessScore = latestHappiness ? parseFloat(latestHappiness.finalScore.toString()) : 0
      const userLevel = latestHappiness?.userLevel || 'Seeker'
      
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        lastActivity: user.sessions[0]?.createdAt || user.updatedAt,
        progressSummary: {
          currentStage,
          totalSessions,
          totalHours,
          happinessScore: Math.round(happinessScore),
          userLevel
        }
      }
    })

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / pageSize)
    const hasMore = page < totalPages

    return {
      users: adminUsers,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers: totalCount,
        pageSize,
        hasMore
      },
      filters: {
        searchTerm: search || null,
        status: status !== 'all' ? status : null,
        sortBy
      }
    }

  } catch (error) {
    console.error('Error fetching admin users:', error)
    return null
  }
})
