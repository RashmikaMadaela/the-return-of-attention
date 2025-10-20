/**
 * Custom hook for fetching user profile data with SWR
 */
import useSWR from 'swr'

interface UserProfileData {
  name: string
  email: string
  role: string
  profile: {
    age: number
    gender: string
    nationality: string
    country: string
  } | null
  happiness: number
  sessions: number
  userLevel: string
  hours: number
  questionnaireCompleted: boolean
  selfAssessmentCompleted: boolean
}

interface UseUserProfileReturn {
  data: UserProfileData | undefined
  error: any
  isLoading: boolean
  isValidating: boolean
  mutate: (data?: UserProfileData | Promise<UserProfileData>, opts?: boolean | { revalidate?: boolean }) => Promise<UserProfileData | undefined>
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  
  if (res.status === 401) {
    throw new Error('UNAUTHORIZED')
  }
  
  if (!res.ok) {
    throw new Error('Failed to fetch user profile')
  }
  
  const data = await res.json()
  return data.data
}

export function useUserProfile(): UseUserProfileReturn {
  const { data, error, isValidating, mutate } = useSWR<UserProfileData>(
    '/api/user/profile-data',
    fetcher,
    {
      // Cache for 15 minutes (profile changes less frequently)
      dedupingInterval: 15 * 60 * 1000,
      // Don't revalidate on focus - only when we know data changed
      revalidateOnFocus: false,
      // Don't revalidate on reconnect
      revalidateOnReconnect: false,
      // Don't auto-refresh - use manual mutate()
      refreshInterval: 0,
      // Don't revalidate stale data automatically
      revalidateIfStale: false,
      // Don't retry on auth errors
      shouldRetryOnError: (error: any) => {
        return error.message !== 'UNAUTHORIZED'
      },
      // Keep previous data while revalidating
      keepPreviousData: true,
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
