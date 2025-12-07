/**
 * Central export for all server-side data fetching functions
 * These functions are optimized for Next.js 15 Server Components
 * using React's cache() for automatic request deduplication
 */

export { getUserProfile } from './user-profile'
export type { UserProfileData } from './user-profile'

export { getProgressOverview } from './progress-overview'
export type { ProgressOverviewData } from './progress-overview'

export { getStage1Progress } from './stage1-progress'
export type { Stage1ProgressData, SubStageProgress } from './stage1-progress'
