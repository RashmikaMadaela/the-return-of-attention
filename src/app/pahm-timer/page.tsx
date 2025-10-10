import React from 'react'
import PAHMTimerPage from '../../components/PAHMTimerPage'
import Loading from '@/components/Loading'

export default function Page() {
  return (
    <React.Suspense fallback={<Loading />}>
      <PAHMTimerPage />
    </React.Suspense>
  )
}