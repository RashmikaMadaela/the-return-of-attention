import React from 'react'
import PAHMSessionSetupPage from '../../components/PAHMSessionSetupPage'
import Loading from '@/components/Loading'

export default function Page() {
  return (
    <React.Suspense fallback={<Loading />}>
      <PAHMSessionSetupPage />
    </React.Suspense>
  )
}