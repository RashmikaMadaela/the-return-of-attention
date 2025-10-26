import React, { Suspense } from 'react'
import Stage1Page from '../../components/Stage1Page'

export default function Page() {
  return (
    <Suspense fallback={<div /> }>
      <Stage1Page />
    </Suspense>
  )
}