/**
 * Cache Invalidation Utility Hook
 * 
 * This hook provides functions to manually invalidate SWR cache
 * when we know the database has changed (e.g., after mutations).
 * 
 * Usage:
 * - Call invalidateProgress() after completing a session, PAHM practice, etc.
 * - Call invalidateProfile() after updating user profile
 * - Call invalidateAll() after major changes (assessments, stage completion)
 */

import { mutate } from 'swr'

export function useCacheInvalidation() {
  /**
   * Invalidate progress overview cache
   * Call this after: session completion, PAHM practice, happiness assessment
   */
  const invalidateProgress = async () => {
    await mutate('/api/progress/overview')
  }

  /**
   * Invalidate user profile cache
   * Call this after: profile updates, assessment completion
   */
  const invalidateProfile = async () => {
    await mutate('/api/user/profile-data')
  }

  /**
   * Invalidate all caches
   * Call this after: major state changes, stage completion
   */
  const invalidateAll = async () => {
    await Promise.all([
      mutate('/api/progress/overview'),
      mutate('/api/user/profile-data')
    ])
  }

  return {
    invalidateProgress,
    invalidateProfile,
    invalidateAll
  }
}

/**
 * Helper function to invalidate cache from anywhere (even non-React contexts)
 */
export const cacheInvalidation = {
  invalidateProgress: () => mutate('/api/progress/overview'),
  invalidateProfile: () => mutate('/api/user/profile-data'),
  invalidateAll: () => Promise.all([
    mutate('/api/progress/overview'),
    mutate('/api/user/profile-data')
  ])
}
