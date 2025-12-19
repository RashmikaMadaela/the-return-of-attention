import { Suspense } from 'react'
import PersonalInfoPage from '@/components/PersonalInfoPage'

// Loading fallback for Suspense boundary
function PersonalInfoLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-10">
        <div className="animate-pulse">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gray-300 rounded-full sm:w-20 sm:h-20"></div>
          </div>
          <div className="h-8 mb-4 bg-gray-300 rounded"></div>
          <div className="h-4 mb-6 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded-xl"></div>
            <div className="h-12 bg-gray-200 rounded-xl"></div>
            <div className="h-12 bg-gray-200 rounded-xl"></div>
            <div className="h-12 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PersonalInfo() {
  return (
    <Suspense fallback={<PersonalInfoLoading />}>
      <PersonalInfoPage />
    </Suspense>
  )
}