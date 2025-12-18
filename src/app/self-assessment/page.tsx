import { Suspense } from 'react'
import SelfAssessmentPage from '@/components/SelfAssessmentPage'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function SelfAssessment() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-[#b9d4ee] to-[#fffafa]" />}>
      <SelfAssessmentPage />
    </Suspense>
  )
}
