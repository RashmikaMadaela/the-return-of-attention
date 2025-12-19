import MindRecoveryClient from '@/components/MindRecoveryClient'
import { getMindRecoveryData } from '@/lib/data/mind-recovery-data'

// Force dynamic rendering for time-based recommendations
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function MindRecoveryPage() {
  // Get session data with server-side recommendation
  const mindRecoveryData = getMindRecoveryData()

  return <MindRecoveryClient initialData={mindRecoveryData} />
}