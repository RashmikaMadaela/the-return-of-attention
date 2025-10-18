/**
 * Custom hook for fetching Stage 1 progress data with SWR
 * Optimized with caching and background revalidation
 */
import useSWR from 'swr'

interface SubStageProgress {
  id: string
  name: string
  duration: number
  minSessions: number
  sessionsCompleted: number
  isCompleted: boolean
  isUnlocked: boolean
  progressPercent: number
}

interface Stage1ProgressData {
  subStages: SubStageProgress[]
  pahmIntro: {
    isCompleted: boolean
    isUnlocked: boolean
  }
  summary: {
    completedLevels: number
    totalSessions: number
    completionPercent: number
    totalHours: number
  }
}

interface UseStage1ProgressReturn {
  data: Stage1ProgressData | undefined
  error: any
  isLoading: boolean
  isValidating: boolean
  mutate: (data?: Stage1ProgressData | Promise<Stage1ProgressData>, opts?: boolean | { revalidate?: boolean }) => Promise<Stage1ProgressData | undefined>
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  
  if (res.status === 401) {
    throw new Error('UNAUTHORIZED')
  }
  
  if (!res.ok) {
    throw new Error('Failed to fetch Stage 1 progress')
  }
  
  const data = await res.json()
  return data.data
}

export function useStage1Progress(): UseStage1ProgressReturn {
  const { data, error, isValidating, mutate } = useSWR<Stage1ProgressData>(
    '/api/progress/stage-1',
    fetcher,
    {
      // Cache for 3 minutes (stage progress changes during sessions)
      dedupingInterval: 3 * 60 * 1000,
      // Revalidate on focus to catch session completions
      revalidateOnFocus: true,
      // Don't revalidate on reconnect
      revalidateOnReconnect: false,
      // Don't auto-refresh
      refreshInterval: 0,
      // Don't retry on auth errors
      shouldRetryOnError: (error: any) => {
        return error.message !== 'UNAUTHORIZED'
      },
      // Keep previous data while revalidating
      revalidateIfStale: true,
      // Error retry
      errorRetryCount: 3,
      errorRetryInterval: 5000,
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
