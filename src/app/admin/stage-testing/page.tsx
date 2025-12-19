import { Suspense } from 'react'
import AdminStageTestingPage from '@/components/AdminStageTestingPage'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function AdminStageTesting() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800" />}>
      <AdminStageTestingPage />
    </Suspense>
  )
}
