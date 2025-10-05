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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-500/20 to-blue-400/20 backdrop-blur-sm p-4 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-white font-bold text-xs sm:text-sm">
            <div>RETURN</div>
            <div>OF</div>
            <div>ATTENTION</div>
          </Link>
        </div>
        
        {/* Desktop Navigation - Only show for authenticated users */}
        {session && (
          <nav className="hidden lg:flex space-x-2">
            <Link 
              href="/dashboard"
              className={`text-white px-3 xl:px-6 py-2 rounded-lg font-semibold transition text-sm xl:text-base ${
                isLinkActive('/dashboard')
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-pink-500 hover:bg-pink-600'
              }`}
            >
              Home
            </Link>
            
            {/* Mind Recovery - Locked until Stage 1 complete */}
            <Link 
              href="/mind-recovery"
              className={`text-white px-3 xl:px-6 py-2 rounded-lg font-semibold transition text-sm xl:text-base flex items-center space-x-1 ${
                !mindRecoveryUnlocked
                  ? 'bg-gray-400 cursor-not-allowed opacity-50'
                  : isLinkActive('/mind-recovery')
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-pink-500 hover:bg-pink-600'
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
              className={`text-white px-3 xl:px-6 py-2 rounded-lg font-semibold transition text-sm xl:text-base ${
                isLinkActive('/daily-notes')
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-pink-500 hover:bg-pink-600'
              }`}
            >
              Daily Notes
            </Link>
            
            <Link 
              href="/analytics"
              className={`text-white px-3 xl:px-6 py-2 rounded-lg font-semibold transition text-sm xl:text-base ${
                isLinkActive('/analytics')
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-pink-500 hover:bg-pink-600'
              }`}
            >
              My Analytics
            </Link>
            
            <Link 
              href="/learn"
              className={`text-white px-3 xl:px-6 py-2 rounded-lg font-semibold transition text-sm xl:text-base ${
                isLinkActive('/learn')
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-pink-500 hover:bg-pink-600'
              }`}
            >
              Learn
            </Link>
            
            <Link 
              href="/wisdom"
              className={`text-white px-3 xl:px-6 py-2 rounded-lg font-semibold transition text-sm xl:text-base ${
                isLinkActive('/wisdom')
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-pink-500 hover:bg-pink-600'
              }`}
            >
              Wisdom Guide
            </Link>
          </nav>
        )}

        {/* Mobile/Tablet Navigation Button & Profile */}
        <div className="flex items-center space-x-2">
          {session ? (
            <>
              {/* Profile Button */}
              <Link 
                href="/profile"
                className="bg-blue-600 p-2 sm:p-3 rounded-lg hover:bg-blue-700 transition"
                title="Profile"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden bg-pink-500 p-2 sm:p-3 rounded-lg hover:bg-pink-600 transition"
                title="Menu"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              {/* Sign out button for mobile */}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="hidden sm:block px-3 py-2 text-sm font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                href="/signin"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && session && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-gradient-to-r from-blue-500/95 to-blue-400/95 backdrop-blur-sm border-t border-white/10">
          <nav className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-white px-4 py-3 rounded-lg font-semibold transition text-center ${
                  isLinkActive('/dashboard')
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-pink-500 hover:bg-pink-600'
                }`}
              >
                Home
              </Link>
              
              <Link
                href="/mind-recovery"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-white px-4 py-3 rounded-lg font-semibold transition text-center flex items-center justify-center space-x-1 ${
                  !mindRecoveryUnlocked
                    ? 'bg-gray-400 cursor-not-allowed opacity-50'
                    : isLinkActive('/mind-recovery')
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-pink-500 hover:bg-pink-600'
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
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-white px-4 py-3 rounded-lg font-semibold transition text-center ${
                  isLinkActive('/daily-notes')
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-pink-500 hover:bg-pink-600'
                }`}
              >
                Daily Notes
              </Link>
              
              <Link
                href="/analytics"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-white px-4 py-3 rounded-lg font-semibold transition text-center ${
                  isLinkActive('/analytics')
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-pink-500 hover:bg-pink-600'
                }`}
              >
                My Analytics
              </Link>
              
              <Link
                href="/learn"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-white px-4 py-3 rounded-lg font-semibold transition text-center ${
                  isLinkActive('/learn')
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-pink-500 hover:bg-pink-600'
                }`}
              >
                Learn
              </Link>
              
              <Link
                href="/wisdom"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-white px-4 py-3 rounded-lg font-semibold transition text-center ${
                  isLinkActive('/wisdom')
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-pink-500 hover:bg-pink-600'
                }`}
              >
                Wisdom Guide
              </Link>
              
              {/* Mobile Sign Out */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  signOut({ callbackUrl: '/' })
                }}
                className="sm:hidden text-white px-4 py-3 rounded-lg font-semibold transition text-center bg-red-500 hover:bg-red-600"
              >
                Sign Out
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}