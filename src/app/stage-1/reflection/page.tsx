import React from 'react'
import ReflectionPage from '../../../components/ReflectionPage'
import Loading from '@/components/Loading'

export default function Page() {
  return (
    <React.Suspense fallback={<Loading />}>
      <ReflectionPage />
    </React.Suspense>
  )
}