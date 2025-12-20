/**
 * Server-side data provider for Mind Recovery sessions
 * Static session data with server-side recommendation calculation
 */

export interface Session {
  id: string
  title: string
  description: string
  duration: number // in minutes
  imageName: string
  timeRange: { start: number; end: number }
}

export interface MindRecoveryData {
  sessions: Session[]
  recommendedSessionId: string
}

/**
 * Static session data
 */
export const MIND_RECOVERY_SESSIONS: Session[] = [
  {
    id: 'morning',
    title: 'Morning Recharge',
    description: 'Start your day with clarity and focus',
    duration: 5,
    imageName: 'Flux_Dev_A_breathtaking_sunrise_desktop_wallpaper_in_ultrahigh_2.jpg',
    timeRange: { start: 5, end: 10 }
  },
  {
    id: 'midday',
    title: 'Mid Day Reset',
    description: 'Quick refresh to maintain focus',
    duration: 3,
    imageName: 'Flux_Dev_A_serene_midday_wallpaper_in_ultrahigh_resolution_wit_2.jpg',
    timeRange: { start: 10, end: 14 }
  },
  {
    id: 'emotional',
    title: 'Emotional Reset',
    description: 'Settle your emotions and find balance',
    duration: 5,
    imageName: 'Flux_Dev_A_realistic_image_of_a_beginner_meditator_sitting_cal_1.jpg',
    timeRange: { start: 14, end: 17 }
  },
  {
    id: 'transition',
    title: 'Work-Home Transition',
    description: 'Shift from work mode to personal time',
    duration: 5,
    imageName: 'freepik__the-style-is-candid-image-photography-with-natural__86908.png',
    timeRange: { start: 17, end: 19 }
  },
  {
    id: 'bedtime',
    title: 'Bedtime Wind Down',
    description: 'Gentle preparation for restful sleep',
    duration: 8,
    imageName: 'Flux_Dev_A_hyperrealistic_nighttime_desktop_wallpaper_with_a_v_2.jpg',
    timeRange: { start: 19, end: 26 } // 26 = 2am next day
  }
]

/**
 * Calculate recommended session based on user's local time
 * @param userLocalHour - Optional hour (0-23) from user's timezone. If not provided, uses server time as fallback.
 * @returns Session ID that matches the time range
 */
export function getRecommendedSession(userLocalHour?: number): string {
  const currentHour = userLocalHour ?? new Date().getHours()
  
  for (const session of MIND_RECOVERY_SESSIONS) {
    if (session.timeRange.end > 24) {
      // Handle overnight sessions (like bedtime)
      if (currentHour >= session.timeRange.start || currentHour <= (session.timeRange.end - 24)) {
        return session.id
      }
    } else {
      if (currentHour >= session.timeRange.start && currentHour < session.timeRange.end) {
        return session.id
      }
    }
  }
  
  // Default to morning if no match
  return 'morning'
}

/**
 * Get all Mind Recovery data for the page
 * @param userLocalHour - Optional hour (0-23) from user's timezone for accurate recommendations
 * @returns Mind recovery data with sessions and recommended session ID
 */
export function getMindRecoveryData(userLocalHour?: number): MindRecoveryData {
  return {
    sessions: MIND_RECOVERY_SESSIONS,
    recommendedSessionId: getRecommendedSession(userLocalHour)
  }
}
