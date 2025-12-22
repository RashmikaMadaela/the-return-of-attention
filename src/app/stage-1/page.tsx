import { redirect } from 'next/navigation'
import Stage1Client from '@/components/Stage1Client'
import { getStage1Progress } from '@/lib/data/stage1-data'
import { CardGridLoadingSkeleton } from '@/components/LoadingUI'
import { Suspense } from 'react'

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Stage1Page() {
  // Fetch stage progress on the server
  const stage1Data = await getStage1Progress()

  // Redirect to sign-in if not authenticated
  if (!stage1Data) {
    redirect('/signin')
  }

  return (
    <Suspense fallback={<CardGridLoadingSkeleton />}>
      <Stage1Client initialData={stage1Data} />
    </Suspense>
  )
}