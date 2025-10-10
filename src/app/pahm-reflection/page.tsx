import React from 'react'
import PAHMReflectionPage from '../../components/PAHMReflectionPage'
import Loading from '@/components/Loading'

export default function Page() {
  return (
    <React.Suspense fallback={<Loading />}>
      <PAHMReflectionPage />
    </React.Suspense>
  )
}