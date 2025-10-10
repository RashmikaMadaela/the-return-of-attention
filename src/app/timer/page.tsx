import React from 'react'
import TimerPage from '../../components/TimerPage'
import Loading from '@/components/Loading'

export default function Timer() {
  return (
    <React.Suspense fallback={<Loading />}>
      <TimerPage />
    </React.Suspense>
  )
}