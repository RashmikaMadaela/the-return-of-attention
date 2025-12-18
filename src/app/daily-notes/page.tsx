/**
 * DAILY NOTES PAGE - SERVER COMPONENT
 * Optimized with server-side data fetching
 */

import { redirect } from 'next/navigation'
import { getTodaysDailyNotes } from '@/lib/data/daily-notes-data'
import { DailyNotesClient } from '@/components/DailyNotesClient'

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DailyNotesPage() {
  // Fetch data on the server (fast, direct database access)
  const notesData = await getTodaysDailyNotes()

  // Redirect if not authenticated
  if (!notesData) {
    redirect('/signin')
  }

  // Pass initial data to client component for instant render
  return <DailyNotesClient initialData={notesData} />
}