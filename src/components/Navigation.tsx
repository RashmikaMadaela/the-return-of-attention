'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getStageProgress } from '@/lib/api/sessions'

interface NavigationProps {
  currentPage?: string
}

export default function Navigation({ currentPage = 'home' }: NavigationProps) {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hasCompletedStage1, setHasCompletedStage1] = useState(false)

  const navItems = [
    { label: 'Home', path: '/home', key: 'home' },
    { label: 'Mind Recovery', path: '/mind-recovery', key: 'mind-recovery' },
    { label: 'Daily Notes', path: '/daily-notes', key: 'daily-notes' },
    { label: 'My Analytics', path: '/my-analytics', key: 'my-analytics' },
    { label: 'Learn', path: '/learn', key: 'learn' },
    { label: 'Wisdom Guide', path: '/wisdom-guide', key: 'wisdom-guide' },
  ]

  const handleNavigation = (path: string, key: string) => {
    // Store current page before navigation for back button functionality
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('previousPage', window.location.pathname || '/home');
    }
    // Close mobile menu after navigation
    setIsMobileMenuOpen(false)
    // Do nothing for My Analytics and Wisdom Guide as specified
    if (key === 'my-analytics' || key === 'wisdom-guide') {
      return;
    }
    router.push(path);
  };

  const handleProfile = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('previousPage', window.location.pathname || '/home');
    }
    setIsMobileMenuOpen(false)
    router.push('/user-profile');
  };

  // Query server for stage progress and unlock status.
  // Prefer server's `isUnlocked` flag for stage 2 (i.e. stage 1 completed).
  // Fall back to localStorage if the API call fails or returns unexpected data.
  useEffect(() => {
    if (typeof window === 'undefined') return

    const CACHE_KEY = 'stage1CompletionCache'
    const TTL_MS = 1000 * 60 * 60 // 1 hour
    let mounted = true

    const readCache = () => {
      try {
        const raw = localStorage.getItem(CACHE_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed.value === 'boolean' && typeof parsed.ts === 'number') {
          if (Date.now() - parsed.ts < TTL_MS) return parsed.value
        }
      } catch (e) {
        // ignore
      }
      return null
    }

    const writeCache = (val: boolean) => {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ value: Boolean(val), ts: Date.now() }))
      } catch (e) {
        // ignore
      }
    }

    const storageHandler = (e: StorageEvent) => {
      if (e.key === CACHE_KEY) {
        try {
          const parsed = e.newValue ? JSON.parse(e.newValue) : null
          if (parsed && typeof parsed.value === 'boolean') {
            setHasCompletedStage1(Boolean(parsed.value))
          }
        } catch (err) {
          // ignore
        }
      }
    }

    // Try cache first
    const cached = readCache()
    if (typeof cached === 'boolean') {
      setHasCompletedStage1(cached)
    }

    const controller = new AbortController()

    ;(async () => {
      try {
        const res = await getStageProgress()
        if (!mounted) return

        if (res && res.success && res.data && Array.isArray(res.data.stages)) {
          const stage2 = res.data.stages.find((s: any) => s.stageNumber === 2)
          const completed = stage2 ? Boolean(stage2.isUnlocked) : (Number(res.data.overall?.completedStages ?? 0) >= 1)
          setHasCompletedStage1(completed)
          writeCache(completed)
          return
        }

        // fallback: try legacy completedStages in localStorage
        try {
          const completedLocal = JSON.parse(localStorage.getItem('completedStages') || '[]')
          const derived = Array.isArray(completedLocal) && (completedLocal.includes(1) || completedLocal.includes('1'))
          setHasCompletedStage1(Boolean(derived))
        } catch (e) {
          setHasCompletedStage1(false)
        }
      } catch (err) {
        // On network/api error fallback to previous localStorage flag
        try {
          const completedLocal = JSON.parse(localStorage.getItem('completedStages') || '[]')
          const derived = Array.isArray(completedLocal) && (completedLocal.includes(1) || completedLocal.includes('1'))
          setHasCompletedStage1(Boolean(derived))
        } catch (e) {
          // if nothing, keep whatever cached state we had or false
        }
      }
    })()

    window.addEventListener('storage', storageHandler)

    return () => {
      mounted = false
      controller.abort()
      window.removeEventListener('storage', storageHandler)
    }
  }, [])





  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b shadow-sm bg-white/80 backdrop-blur-md border-gray-200/50">
      <div className="flex items-center justify-between h-16 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Logo with Animated PAHM Grid */}
        <Link 
          href="/home" 
          prefetch={true}
          className="flex items-center space-x-3 transition-opacity hover:opacity-80"
          onClick={() => {
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('previousPage', window.location.pathname || '/home')
            }
          }}
        >
          {/* Animated PAHM Grid Logo */}
          <div className="relative flex-shrink-0 w-10 h-10 grid grid-cols-3 gap-0.5" suppressHydrationWarning={true}>
            {/* Row 1 */}
            <div className="w-full bg-orange-300 rounded-sm aspect-square animate-pulse" style={{animationDelay: '0s', animationDuration: '3s'}} suppressHydrationWarning={true}></div>
            <div className="w-full rounded-sm aspect-square bg-cyan-300 animate-pulse" style={{animationDelay: '0.5s', animationDuration: '2.5s'}} suppressHydrationWarning={true}></div>
            <div className="w-full bg-purple-300 rounded-sm aspect-square animate-pulse" style={{animationDelay: '1s', animationDuration: '4s'}} suppressHydrationWarning={true}></div>
            
            {/* Row 2 */}
            <div className="w-full bg-yellow-400 rounded-sm aspect-square animate-pulse" style={{animationDelay: '1.5s', animationDuration: '3.5s'}} suppressHydrationWarning={true}></div>
            <div className="w-full bg-gray-200 rounded-sm aspect-square animate-pulse" style={{animationDelay: '2s', animationDuration: '2s'}} suppressHydrationWarning={true}></div>
            <div className="w-full bg-blue-300 rounded-sm aspect-square animate-pulse" style={{animationDelay: '0.3s', animationDuration: '3.2s'}} suppressHydrationWarning={true}></div>
            
            {/* Row 3 */}
            <div className="w-full bg-orange-300 rounded-sm aspect-square animate-pulse" style={{animationDelay: '2.5s', animationDuration: '2.8s'}} suppressHydrationWarning={true}></div>
            <div className="w-full bg-pink-300 rounded-sm aspect-square animate-pulse" style={{animationDelay: '1.2s', animationDuration: '3.8s'}} suppressHydrationWarning={true}></div>
            <div className="w-full bg-purple-200 rounded-sm aspect-square animate-pulse" style={{animationDelay: '0.8s', animationDuration: '2.3s'}} suppressHydrationWarning={true}></div>
          </div>
          
          {/* Text Logo */}
          <div className="text-xs font-bold leading-tight text-gray-800 sm:text-sm">
            <div>RETURN OF</div>
            <div>ATTENTION</div>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="items-center hidden space-x-1 lg:flex">
          {navItems.map((item) => {
            // Gate Mind Recovery until Stage 1 is completed
            if (item.key === 'mind-recovery' && !hasCompletedStage1) {
              return (
                <button
                  key={item.key}
                  onClick={() => { /* locked - no-op */ }}
                  title="Locked — complete Stage 1 to unlock"
                  aria-disabled={true}
                  className="px-4 py-2 text-sm font-medium text-gray-400 transition rounded-lg cursor-not-allowed opacity-60 hover:text-gray-500"
                >
                  {item.label} 🔒
                </button>
              )
            }

            // Skip creating Link for disabled nav items
            if (item.key === 'my-analytics' || item.key === 'wisdom-guide') {
              return (
                <button
                  key={item.key}
                  className="px-4 py-2 text-sm font-medium text-gray-400 transition rounded-lg cursor-not-allowed opacity-60"
                  disabled
                >
                  {item.label}
                </button>
              )
            }

            return (
              <Link
                key={item.key}
                href={item.path}
                prefetch={true}
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    sessionStorage.setItem('previousPage', window.location.pathname || '/home')
                  }
                }}
                className={`px-4 py-2 rounded-lg font-medium transition text-sm ${
                  currentPage === item.key
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3">
          {/* Profile Icon - Desktop */}
          <Link
            href="/user-profile"
            prefetch={true}
            onClick={() => {
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('previousPage', window.location.pathname || '/home')
              }
            }}
            className="items-center justify-center hidden w-10 h-10 text-gray-600 transition border-2 border-gray-300 rounded-full lg:flex hover:text-gray-900 hover:border-gray-400"
            title="Profile"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>

          {/* Profile Icon - Mobile/Tablet */}
          <Link
            href="/user-profile"
            prefetch={true}
            onClick={() => {
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('previousPage', window.location.pathname || '/home')
              }
            }}
            className="flex items-center justify-center w-10 h-10 text-gray-600 transition border-2 border-gray-300 rounded-full lg:hidden hover:text-gray-900 hover:border-gray-400"
            title="Profile"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600 transition rounded-lg lg:hidden hover:text-gray-900"
            title="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="border-t lg:hidden border-gray-200/50 bg-white/95 backdrop-blur-md">
          <nav className="px-4 py-4 mx-auto max-w-7xl">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                if (item.key === 'mind-recovery' && !hasCompletedStage1) {
                  return (
                    <button
                      key={item.key}
                      onClick={() => {}}
                      title="Locked — complete Stage 1 to unlock"
                      aria-disabled={true}
                      className="px-4 py-3 font-medium text-left text-gray-400 transition rounded-lg cursor-not-allowed opacity-60"
                    >
                      {item.label} 🔒
                    </button>
                  )
                }

                // Skip creating Link for disabled nav items
                if (item.key === 'my-analytics' || item.key === 'wisdom-guide') {
                  return (
                    <button
                      key={item.key}
                      className="px-4 py-3 font-medium text-left text-gray-400 transition rounded-lg cursor-not-allowed opacity-60"
                      disabled
                    >
                      {item.label}
                    </button>
                  )
                }

                return (
                  <Link
                    key={item.key}
                    href={item.path}
                    prefetch={true}
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        sessionStorage.setItem('previousPage', window.location.pathname || '/home')
                      }
                      setIsMobileMenuOpen(false)
                    }}
                    className={`px-4 py-3 rounded-lg font-medium transition text-left ${
                      currentPage === item.key
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
