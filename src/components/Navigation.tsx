'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface NavigationProps {
  stageProgress?: {
    hasCompletedStage1: boolean
    hasCompletedOnboarding: boolean
  }
}

export function Navigation({ stageProgress }: NavigationProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [userProgress, setUserProgress] = useState<any>(null)

  useEffect(() => {
    if (session?.user?.id && !stageProgress) {
      fetchUserProgress()
    }
  }, [session])

  const fetchUserProgress = async () => {
    try {
      const response = await fetch('/api/assessment/status')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUserProgress(data.data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch user progress:', error)
    }
  }

  const isLinkActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const hasCompletedOnboarding = stageProgress?.hasCompletedOnboarding || 
    userProgress?.overallStatus?.hasCompletedOnboarding || false

  const mindRecoveryUnlocked = stageProgress?.hasCompletedStage1 || false // Mind Recovery unlocks after Stage 1

  if (status === 'loading') {
    return (
      <nav className="sticky top-0 z-50 border-b shadow-sm bg-white/80 backdrop-blur-md border-white/20">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 animate-pulse"></div>
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="sticky top-0 z-50 border-b shadow-sm bg-white/80 backdrop-blur-md border-white/20">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                </svg>
              </div>
              <span className="text-xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
                Return of Attention
              </span>
            </Link>
            
            {/* Main Navigation - Only show for authenticated users */}
            {session && (
              <div className="hidden space-x-1 md:flex">
                <Link 
                  href="/dashboard"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isLinkActive('/dashboard')
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Home
                </Link>
                
                {/* Mind Recovery - Locked until Stage 1 complete */}
                <Link 
                  href="/mind-recovery"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center space-x-1 ${
                    !mindRecoveryUnlocked
                      ? 'text-gray-400 cursor-not-allowed'
                      : isLinkActive('/mind-recovery')
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  {...(!mindRecoveryUnlocked && { 
                    onClick: (e) => e.preventDefault(),
                    'aria-disabled': true 
                  })}
                >
                  <span>Mind Recovery</span>
                  {!mindRecoveryUnlocked && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                </Link>
                
                <Link 
                  href="/daily-notes"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isLinkActive('/daily-notes')
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Daily Notes
                </Link>
                
                <Link 
                  href="/analytics"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isLinkActive('/analytics')
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  My Analytics
                </Link>
                
                <Link 
                  href="/learn"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isLinkActive('/learn')
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Learn
                </Link>
                
                <Link 
                  href="/wisdom"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isLinkActive('/wisdom')
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Wisdom Guide
                </Link>
              </div>
            )}
          </div>

          {/* Right side - User menu or auth buttons */}
          <div className="flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-4">
                {/* User info */}
                <div className="items-center hidden space-x-3 sm:flex">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600">
                    <span className="text-sm font-semibold text-white">
                      {(session.user?.name || session.user?.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">
                      {session.user?.name || 'Seeker'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {hasCompletedOnboarding ? 'Active Journey' : 'Setup Required'}
                    </p>
                  </div>
                </div>
                
                {/* Sign out button */}
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="px-4 py-2 text-sm font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/signin"
                  className="px-4 py-2 text-sm font-medium text-gray-600 transition-colors rounded-lg hover:text-gray-900 hover:bg-gray-100"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}