import { Suspense } from 'react'
import QuestionnairePage from '../../components/QuestionnairePage'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-[#b9d4ee] to-[#fffafa]" />}>
      <QuestionnairePage />
    </Suspense>
  )
}