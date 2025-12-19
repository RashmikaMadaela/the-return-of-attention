import { Suspense } from 'react'
import AdminUserManagementClient from '@/components/AdminUserManagementClient'
import { getAdminUsers } from '@/lib/data/admin-users-data'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AdminUserManagement({ searchParams }: PageProps) {
  // Await search params (Next.js 15 requirement)
  const params = await searchParams
  
  // Parse search params
  const page = Number(params.page) || 1
  const search = typeof params.search === 'string' ? params.search : ''
  const status = typeof params.status === 'string' ? params.status as 'active' | 'inactive' | 'all' : 'all'
  const sortBy = typeof params.sortBy === 'string' ? params.sortBy as 'joinedDate' | 'lastActivity' | 'name' : 'joinedDate'

  // Fetch users server-side with pagination
  const data = await getAdminUsers({
    page,
    pageSize: 20,
    search,
    status,
    sortBy
  })

  if (!data) {
    redirect('/signin')
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800" />}>
      <AdminUserManagementClient initialData={data} />
    </Suspense>
  )
}
