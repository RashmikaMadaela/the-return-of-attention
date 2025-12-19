/**
 * Loading Skeleton Components for Home and Profile Pages
 * Updated to match design system colors
 */
import React from 'react'

/**
 * Welcome Card Skeleton for HomePage
 */
export function WelcomeCardSkeleton() {
  return (
    <div className="bg-[#e5f3ff] rounded-3xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 shadow-lg">
      <div className="text-center sm:text-left flex-1 space-y-2 sm:space-y-3">
        <div className="h-8 sm:h-10 bg-gray-200 rounded-lg w-48 sm:w-64 mb-2 mx-auto sm:mx-0 animate-pulse"></div>
        <div className="h-8 sm:h-10 bg-gray-200 rounded-lg w-32 sm:w-48 mb-4 mx-auto sm:mx-0 animate-pulse"></div>
        <div className="h-5 bg-gray-200 rounded-lg w-64 sm:w-96 mx-auto sm:mx-0 animate-pulse"></div>
      </div>
      
      <div className="hidden sm:block h-full w-1 bg-[#6465e0] mx-4 lg:mx-8"></div>
      
      <div className="space-y-3 sm:space-y-4">
        <div className="bg-[#d0d1f9] px-6 sm:px-8 lg:px-12 py-3 sm:py-4 rounded-xl min-w-[250px] sm:min-w-[280px] lg:min-w-[300px] h-16 sm:h-20 animate-pulse"></div>
        <div className="bg-[#d0d1f9] px-6 sm:px-8 lg:px-12 py-3 sm:py-4 rounded-xl min-w-[250px] sm:min-w-[280px] lg:min-w-[300px] h-16 sm:h-20 animate-pulse"></div>
      </div>
    </div>
  )
}

/**
 * Stage Card Skeleton for HomePage
 */
export function StageCardSkeleton() {
  return (
    <div className="bg-[#e5f3ff] rounded-[25px] shadow-2xl overflow-hidden">
      <div className="relative h-48 sm:h-56 lg:h-64 bg-gray-200 animate-pulse"></div>
      <div className="p-4 sm:p-6 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        <div className="h-12 bg-[#d0d1f9] rounded-[15px] animate-pulse"></div>
      </div>
    </div>
  )
}

/**
 * Profile Stats Skeleton
 */
export function ProfileStatsSkeleton() {
  return (
    <div className="bg-[#e5f3ff] rounded-3xl p-8 shadow-2xl">
      <div className="grid grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 text-center">
            <div className="h-14 bg-gray-200 rounded-lg w-16 mx-auto mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-24 mx-auto animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Profile Info Skeleton
 */
export function ProfileInfoSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 space-y-6">
      <div className="text-center border-b-4 border-[#6465e0] pb-3">
        <div className="h-8 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between border-l-4 border-[#6465e0] pl-4 py-2">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Completion Status Skeleton
 */
export function CompletionStatusSkeleton() {
  return (
    <div className="bg-[#e5f3ff] rounded-3xl p-8 shadow-2xl">
      <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-6 animate-pulse"></div>
      
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between bg-white rounded-2xl p-6">
            <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-10 bg-[#d0d1f9] rounded-xl w-32 animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Assessment Notice Skeleton
 */
export function AssessmentNoticeSkeleton() {
  return (
    <div className="bg-yellow-100 border-2 border-yellow-300 rounded-[15px] p-4 sm:p-6 max-w-md animate-pulse">
      <div className="h-5 bg-yellow-300 rounded w-48 mb-3 mx-auto sm:mx-0"></div>
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-yellow-300"></div>
            <div className="h-4 bg-yellow-300 rounded w-full"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Full Page Loading Skeleton for HomePage
 */
export function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-[#fffafa]">
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <WelcomeCardSkeleton />
        
        <div className="mb-4 sm:mb-8">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4 sm:mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <StageCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Full Page Loading Skeleton for ProfilePage
 */
export function ProfilePageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#b9d4ee] to-[#fffafa]">
      <div className="p-8 pt-24">
        <div className="max-w-7xl mx-auto bg-[#e5f3ff] rounded-3xl shadow-2xl p-8">
          <div className="flex justify-end gap-4 mb-8">
            <div className="bg-[#d0d1f9] h-12 w-24 rounded-xl animate-pulse"></div>
            <div className="bg-[#d0d1f9] h-12 w-24 rounded-xl animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-lg">
                <div className="flex justify-center mb-6">
                  <div className="w-32 h-32 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                <ProfileInfoSkeleton />
              </div>
            </div>

            <div className="space-y-6">
              <ProfileStatsSkeleton />
              <CompletionStatusSkeleton />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Stage 1 Sub-Stage Card Skeleton
 */
export function Stage1CardSkeleton() {
  return (
    <div className="bg-[#e5f3ff] rounded-xl p-6 shadow-2xl">
      <div className="h-7 bg-gray-200 rounded-lg w-3/4 mb-4 animate-pulse"></div>
      <div className="space-y-2 mb-4">
        <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        <div className="h-5 bg-gray-200 rounded w-2/3 animate-pulse"></div>
      </div>
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2 animate-pulse"></div>
      </div>
      <div className="h-12 bg-[#d0d1f9] rounded-lg w-full animate-pulse"></div>
    </div>
  )
}

/**
 * Stage 1 Progress Summary Skeleton
 */
export function Stage1ProgressSkeleton() {
  return (
    <div className="bg-[#e5f3ff] shadow-2xl rounded-xl p-6">
      <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-4 animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center">
            <div className="h-10 bg-gray-200 rounded-lg w-16 mx-auto mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-24 mx-auto animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Full Stage 1 Page Skeleton
 */
export function Stage1PageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#b9d4ee] to-[#fffafa]">
      <div className="p-8 pt-24">
        <div className="max-w-6xl mx-auto">
          {/* Header Skeleton */}
          <div className="text-center mb-8">
            <div className="h-10 bg-gray-200 rounded-lg w-96 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded-lg w-full max-w-2xl mx-auto animate-pulse"></div>
          </div>

          {/* Stage Cards Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Stage1CardSkeleton key={i} />
            ))}
          </div>

          {/* Progress Summary Skeleton */}
          <div className="mt-8">
            <Stage1ProgressSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}

