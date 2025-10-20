/**
 * Custom hook for fetching progress overview data with SWR
 * Provides automatic caching, revalidation, and optimistic updates
 */
import useSWR from 'swr'

interface ProgressOverviewData {
  user: {
    name: string
    email: string
    memberSince: string
    accountAge: number
  }
  journey: {
    currentStage: {
      number: number
      name: string
      progress: number
    } | null
    totalStages: number
    completedStages: number
    journeyProgress: number
    nextMilestone: string
  }
  practice: {
    totalSessions: number
    totalHours: number
    averageQuality: number | null
    currentStreak: number
    longestStreak: number
    weeklyGoals: {
      sessionsGoal: number
      sessionsCompleted: number
      hoursGoal: number
      hoursCompleted: number
      onTrack: boolean
    }
  }
  pahm: {
    totalSessions: number
    totalClicks: number
    averageClicksPerSession: number
  }
  happiness: {
    currentScore: {
      score: number
      level: string
      calculatedAt: string
    } | null
    scoreHistory: Array<{
      score: number
      level: string
      date: string
    }>
  }
  assessments: {
    questionnaire: {
      completed: boolean
      completedAt?: string
    }
    initial: {
      completed: boolean
      completedAt?: string
    }
    mid: {
      completed: boolean
      completedAt?: string
    }
    final: {
      completed: boolean
      completedAt?: string
    }
  }
  milestones: any[]
  recentActivity: any[]
  stages: Array<{
    stageNumber: number
    name: string
    progress: number
    isCompleted: boolean
    sessionsCompleted: number
    hoursCompleted: number
  }>
}

interface UseProgressOverviewReturn {
  data: ProgressOverviewData | undefined
  error: any
  isLoading: boolean
  isValidating: boolean
  mutate: () => void
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  
  if (res.status === 401) {
    throw new Error('UNAUTHORIZED')
  }
  
  if (!res.ok) {
    throw new Error('Failed to fetch progress overview')
  }
  
  const data = await res.json()
  return data.overview
}

export function useProgressOverview(): UseProgressOverviewReturn {
  const { data, error, isValidating, mutate } = useSWR<ProgressOverviewData>(
    '/api/progress/overview',
    fetcher,
    {
      // Cache for 10 minutes - only fetch if data is truly stale
      dedupingInterval: 10 * 60 * 1000,
      // Don't revalidate on focus - only fetch when explicitly needed
      revalidateOnFocus: false,
      // Don't revalidate on reconnect to reduce server load
      revalidateOnReconnect: false,
      // Don't auto-refresh - rely on manual mutate() calls
      refreshInterval: 0,
      // Don't revalidate stale data automatically
      revalidateIfStale: false,
      // Don't retry on 401 errors
      shouldRetryOnError: (error) => {
        return error.message !== 'UNAUTHORIZED'
      },
      // Use cache first, only fetch if missing
      fallbackData: undefined,
      // Error retry config
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      // Keep previous data while revalidating
      keepPreviousData: true,
    }
  )

  return {
    data,
    error,
    isLoading: !error && !data,
    isValidating,
    mutate
  }
}
