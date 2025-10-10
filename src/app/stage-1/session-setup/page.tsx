import React from 'react'
import SessionSetupPage from '../../../components/SessionSetupPage'
import Loading from '@/components/Loading'

export default function Page() {
  return (
    <React.Suspense fallback={<Loading />}>
      <SessionSetupPage />
    </React.Suspense>
  )
}