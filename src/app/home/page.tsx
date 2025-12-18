/**
 * HOME PAGE - Server Component
 * Optimized with direct database queries and Supabase realtime
 * NO MORE SLOW API ROUTES!
 */

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getHomePageData } from '@/lib/data/home-page-data'
import { HomePageClient } from '@/components/HomePageClient'
import Navigation from '@/components/Navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HomePage() {
  // Check authentication
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/signin')
  }

  // Fetch data directly from database (FAST!)
  const data = await getHomePageData()

  if (!data) {
    redirect('/signin')
  }

  return (
    <>
      <Navigation currentPage="home" />
      <HomePageClient initialData={data} />
    </>
  )
}
