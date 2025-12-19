import { redirect } from 'next/navigation'
import AssessmentStatsClient from '@/components/AssessmentStatsClient'
import { getAssessmentStats } from '@/lib/data/assessment-stats-data'

// Force dynamic rendering for always-fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AssessmentStatsPage() {
  // Fetch assessment stats on the server
  const statsData = await getAssessmentStats()

  // Redirect to sign-in if not authenticated
  if (!statsData) {
    redirect('/signin')
  }

  return <AssessmentStatsClient initialData={statsData} />
}
