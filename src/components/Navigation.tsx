'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'

export function Navigation() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (status === 'loading') {
    return (
      <nav className="bg-white border-b shadow-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="text-lg font-semibold">Loading...</div>
          </div>
        </div>
      </nav>
    )
  }

  // Landing page navigation (for non-authenticated users)
  if (!session) {
    return (
      <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold text-gray-900">
              The Return of Attention
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/signin"
                className="px-4 py-2 text-sm font-medium transition-colors rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  // Main app navigation (for authenticated users)
  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="text-xl font-bold text-gray-900 truncate">
            Return of Attention
          </Link>
          
          {/* Desktop Navigation */}
          <div className="items-center hidden space-x-1 md:flex">
            <Link 
              href="/dashboard" 
              className="px-3 py-2 text-sm font-medium text-gray-600 transition-colors rounded-md hover:text-gray-900"
            >
              Home
            </Link>
            <Link 
              href="/mind-recovery" 
              className="px-3 py-2 text-sm font-medium text-gray-600 transition-colors rounded-md hover:text-gray-900"
            >
              Mind Recovery
            </Link>
            <Link 
              href="/daily-notes" 
              className="px-3 py-2 text-sm font-medium text-gray-600 transition-colors rounded-md hover:text-gray-900"
            >
              Daily Notes
            </Link>
            <Link 
              href="/analytics" 
              className="px-3 py-2 text-sm font-medium text-gray-600 transition-colors rounded-md hover:text-gray-900"
            >
              My Analytics
            </Link>
            <Link 
              href="/learn" 
              className="px-3 py-2 text-sm font-medium text-gray-600 transition-colors rounded-md hover:text-gray-900"
            >
              Learn
            </Link>
            <Link 
              href="/wisdom" 
              className="px-3 py-2 text-sm font-medium text-gray-600 transition-colors rounded-md hover:text-gray-900"
            >
              Wisdom Guide
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* User Avatar/Menu */}
            <div className="flex items-center space-x-3">
              <span className="hidden text-sm text-gray-600 sm:block">
                {session.user?.name || session.user?.email}
              </span>
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                <span className="text-sm font-medium text-blue-600">
                  {(session.user?.name || session.user?.email || 'U')[0].toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="text-gray-400 transition-colors hover:text-gray-600"
                title="Sign Out"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="p-2 text-gray-400 rounded-md md:hidden hover:text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-200 md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href="/dashboard" 
                className="block px-3 py-2 text-base font-medium text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/mind-recovery" 
                className="block px-3 py-2 text-base font-medium text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Mind Recovery
              </Link>
              <Link 
                href="/daily-notes" 
                className="block px-3 py-2 text-base font-medium text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Daily Notes
              </Link>
              <Link 
                href="/analytics" 
                className="block px-3 py-2 text-base font-medium text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Analytics
              </Link>
              <Link 
                href="/learn" 
                className="block px-3 py-2 text-base font-medium text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Learn
              </Link>
              <Link 
                href="/wisdom" 
                className="block px-3 py-2 text-base font-medium text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Wisdom Guide
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}