/**
 * USER PROFILE PAGE - SERVER COMPONENT
 * Optimized with server-side data fetching and Supabase realtime
 */

import { redirect } from 'next/navigation'
import { getUserProfileData } from '@/lib/data/user-profile-data'
import { UserProfileClient } from '@/components/UserProfileClient'

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function UserProfilePage() {
  // Fetch data on the server (fast, direct database access)
  const profileData = await getUserProfileData()

  // Redirect if not authenticated
  if (!profileData) {
    redirect('/signin')
  }

  // Pass initial data to client component for instant render
  return <UserProfileClient initialData={profileData} />
}
