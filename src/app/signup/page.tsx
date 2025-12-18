import { Suspense } from 'react'
import SignUpPage from '@/components/SignUpPage'

// Loading fallback for Suspense boundary
function SignUpLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-purple-500 via-blue-600 to-blue-500">
      <div className="w-full max-w-md p-6 shadow-2xl bg-white/95 backdrop-blur-sm rounded-3xl sm:p-10">
        <div className="animate-pulse">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gray-300 rounded-full sm:w-20 sm:h-20"></div>
          </div>
          <div className="h-8 mb-4 bg-gray-300 rounded"></div>
          <div className="h-4 mb-6 bg-gray-200 rounded"></div>
          <div className="space-y-3">
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

export default function SignUp() {
  return (
    <Suspense fallback={<SignUpLoading />}>
      <SignUpPage />
    </Suspense>
  )
}