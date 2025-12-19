import { Suspense } from 'react'
import AdminUserProgressClient from '@/components/AdminUserProgressClient'
import { getAdminStats } from '@/lib/data/admin-stats-data'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminUserProgress() {
  // Fetch stats server-side
  const data = await getAdminStats()

  if (!data) {
    redirect('/signin')
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800" />}>
      <AdminUserProgressClient initialData={data} />
    </Suspense>
  )
}
