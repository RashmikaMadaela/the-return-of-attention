/**
 * REUSABLE LOADING UI COMPONENTS
 * Mobile-responsive loading skeletons matching app design system
 */

import React from 'react'

/**
 * Base page loading skeleton with PAHM matrix animation
 */
export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#b9d4ee] to-[#fffafa] flex items-center justify-center px-4">
      <div className="space-y-6 text-center sm:space-y-8">
        {/* Animated PAHM Matrix Logo */}
        <div className="flex justify-center">
          <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-[#03478f]/10 rounded-2xl p-2.5 sm:p-3 md:p-4 shadow-lg">
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 h-full">
              {/* Row 1 */}
              <div className="w-full bg-orange-300 rounded-md aspect-square animate-pulse" style={{animationDelay: '0s', animationDuration: '2.5s'}}></div>
              <div className="w-full rounded-md aspect-square bg-cyan-300 animate-pulse" style={{animationDelay: '0.3s', animationDuration: '2s'}}></div>
              <div className="w-full bg-purple-300 rounded-md aspect-square animate-pulse" style={{animationDelay: '0.6s', animationDuration: '3s'}}></div>
              
              {/* Row 2 */}
              <div className="w-full bg-yellow-400 rounded-md aspect-square animate-pulse" style={{animationDelay: '0.9s', animationDuration: '2.8s'}}></div>
              <div className="w-full bg-gray-200 rounded-md aspect-square animate-pulse" style={{animationDelay: '1.2s', animationDuration: '1.8s'}}></div>
              <div className="w-full bg-blue-300 rounded-md aspect-square animate-pulse" style={{animationDelay: '0.2s', animationDuration: '2.3s'}}></div>
              
              {/* Row 3 */}
              <div className="w-full bg-orange-300 rounded-md aspect-square animate-pulse" style={{animationDelay: '1.5s', animationDuration: '2.6s'}}></div>
              <div className="w-full bg-pink-300 rounded-md aspect-square animate-pulse" style={{animationDelay: '0.8s', animationDuration: '2.9s'}}></div>
              <div className="w-full bg-purple-200 rounded-md aspect-square animate-pulse" style={{animationDelay: '0.5s', animationDuration: '2.2s'}}></div>
            </div>
          </div>
        </div>

        {/* Loading text */}
        <div className="space-y-2 animate-pulse">
          <div className="h-6 sm:h-7 bg-[#d0d1f9]/50 rounded-lg w-40 sm:w-48 mx-auto"></div>
          <div className="h-3 sm:h-4 bg-[#d0d1f9]/40 rounded-lg w-24 sm:w-32 mx-auto"></div>
        </div>
      </div>
    </div>
  )
}

/**
 * Card grid loading skeleton
 */
export function CardGridLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#b9d4ee] to-[#fffafa] pt-20 sm:pt-24">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto space-y-6 max-w-7xl sm:space-y-8">
          {/* Title */}
          <div className="h-10 sm:h-12 bg-[#d0d1f9]/50 rounded-lg w-48 sm:w-64 mx-auto animate-pulse"></div>
          
          {/* Card grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[#e5f3ff] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl animate-pulse">
                <div className="h-48 sm:h-56 bg-[#d0d1f9]/50"></div>
                <div className="p-4 space-y-3 sm:p-6">
                  <div className="h-4 bg-[#d0d1f9]/50 rounded w-3/4"></div>
                  <div className="h-4 bg-[#d0d1f9]/50 rounded w-1/2"></div>
                  <div className="h-12 bg-[#d0d1f9]/50 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Form page loading skeleton
 */
export function FormLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#b9d4ee] to-[#fffafa] pt-20 sm:pt-24">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="h-10 sm:h-12 bg-[#d0d1f9]/50 rounded-lg w-64 sm:w-80 mx-auto mb-6 sm:mb-8 animate-pulse"></div>
          
          {/* Form card */}
          <div className="bg-[#e5f3ff] rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl">
            <div className="space-y-6 sm:space-y-8 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-5 bg-[#d0d1f9]/50 rounded w-32"></div>
                  <div className="h-12 bg-white rounded-lg"></div>
                </div>
              ))}
              <div className="h-12 bg-[#6465e0]/30 rounded-xl w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Session setup loading skeleton
 */
export function SessionSetupLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#b9d4ee] to-[#fffafa] pt-20 sm:pt-24">
      <div className="p-3 sm:p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="h-10 sm:h-12 bg-[#d0d1f9]/50 rounded-lg w-64 sm:w-80 mx-auto mb-6 sm:mb-8 animate-pulse"></div>
          
          {/* Setup card */}
          <div className="bg-[#e5f3ff] rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 sm:gap-6 md:gap-8 animate-pulse">
              {/* Left column - posture selection */}
              <div className="p-4 bg-white rounded-lg shadow-md sm:rounded-xl sm:p-5 md:p-6">
                <div className="h-6 bg-[#d0d1f9]/50 rounded w-48 mb-4"></div>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-20 sm:h-24 bg-[#d0d1f9]/50 rounded-lg"></div>
                  ))}
                </div>
              </div>
              
              {/* Right column - duration & settings */}
              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                <div className="p-4 bg-white rounded-lg shadow-md sm:rounded-xl sm:p-5 md:p-6">
                  <div className="h-6 bg-[#d0d1f9]/50 rounded w-40 mx-auto mb-4"></div>
                  <div className="h-24 bg-[#d0d1f9]/50 rounded-xl"></div>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-md sm:rounded-xl sm:p-5 md:p-6">
                  <div className="h-6 bg-[#d0d1f9]/50 rounded w-36 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-12 bg-[#d0d1f9]/50 rounded-lg"></div>
                    <div className="h-12 bg-[#d0d1f9]/50 rounded-lg"></div>
                  </div>
                </div>
                <div className="flex gap-3 sm:gap-4">
                  <div className="h-12 bg-[#d0d1f9]/50 rounded-lg flex-1"></div>
                  <div className="h-12 bg-[#6465e0]/30 rounded-lg flex-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Timer page loading skeleton
 */
export function TimerLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#b9d4ee] to-[#fffafa] flex flex-col pt-20 sm:pt-24">
      <div className="flex items-center justify-center flex-1 p-4 sm:p-8">
        <div className="w-full max-w-2xl animate-pulse">
          {/* Timer display */}
          <div className="bg-[#e5f3ff] rounded-3xl sm:rounded-[40px] p-8 sm:p-12 lg:p-16 shadow-2xl">
            <div className="space-y-8 sm:space-y-12">
              {/* Title */}
              <div className="h-8 sm:h-10 bg-[#d0d1f9]/50 rounded-lg w-48 sm:w-64 mx-auto"></div>
              
              {/* Timer circle */}
              <div className="relative w-56 h-56 mx-auto sm:w-80 sm:h-80">
                <div className="absolute inset-0 rounded-full bg-[#d0d1f9]/50"></div>
              </div>
              
              {/* Controls */}
              <div className="flex justify-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#6465e0]/30 rounded-full"></div>
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#6465e0]/30 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Reflection page loading skeleton
 */
export function ReflectionLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#b9d4ee] to-[#fffafa] pt-20 sm:pt-24">
      <div className="p-4 sm:p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <div className="h-10 sm:h-12 bg-[#d0d1f9]/50 rounded-lg w-64 sm:w-80 mx-auto mb-6 sm:mb-8 animate-pulse"></div>
          
          {/* Reflection card */}
          <div className="bg-[#e5f3ff] rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 sm:space-y-8 animate-pulse">
            {/* Quality rating */}
            <div className="space-y-3">
              <div className="h-6 bg-[#d0d1f9]/50 rounded w-48"></div>
              <div className="h-16 bg-white rounded-xl"></div>
            </div>
            
            {/* Notes */}
            <div className="space-y-3">
              <div className="h-6 bg-[#d0d1f9]/50 rounded w-36"></div>
              <div className="h-32 bg-white rounded-xl"></div>
            </div>
            
            {/* Challenges */}
            <div className="space-y-3">
              <div className="h-6 bg-[#d0d1f9]/50 rounded w-40"></div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-12 bg-white rounded-lg"></div>
                ))}
              </div>
            </div>
            
            {/* Save button */}
            <div className="h-14 bg-[#6465e0]/30 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Admin page loading skeleton
 */
export function AdminLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#b9d4ee] to-[#fffafa] pt-20 sm:pt-24">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto space-y-6 max-w-7xl sm:space-y-8">
          {/* Header */}
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center animate-pulse">
            <div className="h-10 bg-[#d0d1f9]/50 rounded-lg w-48"></div>
            <div className="h-10 bg-[#6465e0]/30 rounded-lg w-32"></div>
          </div>
          
          {/* Stats cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[#e5f3ff] rounded-2xl p-6 shadow-lg">
                <div className="h-12 bg-[#d0d1f9]/50 rounded-lg mb-2"></div>
                <div className="h-4 bg-[#d0d1f9]/50 rounded w-24"></div>
              </div>
            ))}
          </div>
          
          {/* Table */}
          <div className="bg-[#e5f3ff] rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl animate-pulse">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-white rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Auth page loading skeleton (sign in / sign up)
 */
export function AuthLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#b9d4ee] to-[#fffafa] flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-pulse">
        <div className="bg-[#e5f3ff] rounded-2xl sm:rounded-3xl p-8 sm:p-10 shadow-2xl">
          {/* Logo/Title */}
          <div className="h-12 bg-[#d0d1f9]/50 rounded-lg w-48 mx-auto mb-8"></div>
          
          {/* Form fields */}
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-[#d0d1f9]/50 rounded w-24"></div>
                <div className="h-12 bg-white rounded-lg"></div>
              </div>
            ))}
            
            {/* Submit button */}
            <div className="h-12 bg-[#6465e0]/30 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Intro/Landing page loading skeleton
 * For the main landing page with hero, features, and footer
 */
export function IntroLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#b9d4ee] to-[#fffafa]">
      {/* Navigation Bar Skeleton */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b shadow-md border-white/20 bg-white/80 backdrop-blur-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 animate-pulse">
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Logo skeleton */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#d0d1f9]/50 rounded"></div>
              <div className="h-6 bg-[#d0d1f9]/50 rounded w-32 sm:w-48"></div>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <div className="w-16 h-8 sm:w-20 sm:h-10 bg-[#d0d1f9]/50 rounded-lg"></div>
              <div className="w-20 h-8 sm:w-24 sm:h-10 bg-[#6465e0]/30 rounded-lg"></div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section Skeleton */}
      <section className="relative flex items-center justify-center min-h-screen px-4 py-20 bg-gradient-to-b from-[#b9d4ee] to-[#fffafa]" style={{paddingTop: '80px'}}>
        <div className="relative w-full max-w-4xl mx-auto text-center animate-pulse">
          {/* Animated Grid Icon Skeleton */}
          <div className="flex justify-center mb-6 sm:mb-8 md:mb-10">
            <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 bg-[#03478f]/20 rounded-lg"></div>
          </div>

          {/* Title skeleton */}
          <div className="flex flex-col items-center gap-3 mb-4 sm:mb-6">
            <div className="h-8 sm:h-10 md:h-12 lg:h-14 bg-[#d0d1f9]/50 rounded-lg w-3/4 max-w-2xl"></div>
            <div className="h-6 sm:h-7 md:h-8 lg:h-10 bg-[#d0d1f9]/50 rounded-lg w-2/3 max-w-xl"></div>
          </div>
          
          {/* Subtitle skeleton */}
          <div className="flex justify-center mb-8 sm:mb-10 md:mb-12">
            <div className="h-5 sm:h-6 md:h-7 bg-[#d0d1f9]/50 rounded-lg w-1/2 max-w-md"></div>
          </div>
          
          {/* Button skeleton */}
          <div className="flex justify-center">
            <div className="h-12 sm:h-14 md:h-16 bg-[#6465e0]/30 rounded-full w-48 sm:w-56 md:w-64"></div>
          </div>
        </div>
      </section>

      {/* Two Column Section Skeleton */}
      <section className="px-4 py-12 sm:py-16 bg-[#fffafa]">
        <div className="grid max-w-6xl gap-6 mx-auto sm:gap-8 md:grid-cols-2 animate-pulse">
          {/* Left card */}
          <div className="bg-[#e5f3ff] rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="h-8 bg-[#d0d1f9]/50 rounded-lg w-3/4 mx-auto mb-6"></div>
            <div className="space-y-3 sm:space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 sm:h-16 bg-white/50 rounded-lg border-l-4 border-[#6465e0]/30"></div>
              ))}
            </div>
          </div>
          
          {/* Right card */}
          <div className="bg-[#e5f3ff] rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="h-8 bg-[#d0d1f9]/50 rounded-lg w-3/4 mx-auto mb-6"></div>
            <div className="p-6 space-y-4 bg-white shadow-md sm:p-8 rounded-xl">
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#6465e0]/30 rounded-full"></div>
              </div>
              <div className="h-6 bg-[#d0d1f9]/50 rounded w-3/4 mx-auto"></div>
              <div className="space-y-2">
                <div className="h-4 bg-[#d0d1f9]/50 rounded w-full"></div>
                <div className="h-4 bg-[#d0d1f9]/50 rounded w-5/6 mx-auto"></div>
              </div>
              <div className="h-20 bg-[#6465e0]/30 rounded-lg mt-4"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Section Skeleton */}
      <section className="px-4 py-12 sm:py-16 bg-gradient-to-b from-[#fffafa] to-[#b9d4ee]">
        <div className="max-w-6xl mx-auto animate-pulse">
          <div className="h-10 bg-[#d0d1f9]/50 rounded-lg w-64 sm:w-96 mx-auto mb-8 sm:mb-12"></div>
          
          {/* Grid of cards */}
          <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-6 bg-white shadow-lg rounded-xl">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#d0d1f9]/50 rounded-xl"></div>
                </div>
                <div className="h-6 bg-[#d0d1f9]/50 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-[#d0d1f9]/50 rounded w-full"></div>
              </div>
            ))}
          </div>

          {/* Bottom card */}
          <div className="max-w-3xl p-6 mx-auto space-y-4 bg-white shadow-2xl rounded-xl sm:p-8">
            <div className="h-8 bg-[#d0d1f9]/50 rounded-lg w-1/2 mx-auto"></div>
            <div className="space-y-2">
              <div className="h-4 bg-[#d0d1f9]/50 rounded w-full"></div>
              <div className="h-4 bg-[#d0d1f9]/50 rounded w-4/5 mx-auto"></div>
            </div>
            <div className="pt-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-[#e5f3ff] rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Begin Section Skeleton */}
      <section className="px-4 py-12 sm:py-16 bg-[#b9d4ee]">
        <div className="flex flex-col items-center max-w-4xl gap-6 mx-auto md:flex-row sm:gap-8 animate-pulse">
          <div className="flex-shrink-0">
            <div className="w-48 h-48 sm:w-64 sm:h-64 bg-[#6465e0]/30 rounded-full"></div>
          </div>
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="h-10 bg-[#d0d1f9]/50 rounded-lg w-3/4 mx-auto md:mx-0"></div>
            <div className="space-y-2">
              <div className="h-4 bg-[#d0d1f9]/50 rounded w-full"></div>
              <div className="h-4 bg-[#d0d1f9]/50 rounded w-5/6 mx-auto md:mx-0"></div>
            </div>
            <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row md:justify-start">
              <div className="h-12 bg-[#6465e0]/30 rounded-full w-48"></div>
              <div className="w-40 h-12 rounded-full bg-white/50"></div>
            </div>
            <div className="h-3 bg-[#d0d1f9]/50 rounded w-2/3 mx-auto md:mx-0"></div>
          </div>
        </div>
      </section>

      {/* Footer Skeleton */}
      <footer className="px-4 py-8 sm:py-12 bg-gradient-to-r from-[#6465e0] to-[#7c7de8]">
        <div className="max-w-4xl mx-auto space-y-4 text-center animate-pulse">
          <div className="w-3/4 h-5 mx-auto rounded bg-white/30"></div>
          <div className="w-1/3 h-4 mx-auto rounded bg-white/30"></div>
          <div className="my-6 border-t border-white/30"></div>
          <div className="w-48 h-5 mx-auto rounded bg-white/30"></div>
          <div className="w-32 h-4 mx-auto rounded bg-white/30"></div>
        </div>
      </footer>
    </div>
  )
}
