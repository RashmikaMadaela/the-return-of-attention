'use client'

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
    <header className="fixed top-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-blue-500/20 to-blue-400/20 backdrop-blur-sm">
      <div className="flex items-center justify-between mx-auto max-w-7xl">
        {/* Logo with Animated PAHM Grid */}
        <div className="flex items-center space-x-3">
          {/* Animated PAHM Grid Logo */}
          <div className="relative flex-shrink-0 w-12 h-12 bg-purple-600 rounded-lg sm:w-14 sm:h-14" suppressHydrationWarning={true}>
            <div className="absolute inset-1 sm:inset-1.5 grid grid-cols-3 gap-0.5 sm:gap-1" suppressHydrationWarning={true}>
              {/* Row 1 */}
              <div className="w-full bg-orange-300 rounded-md aspect-square animate-pulse" style={{animationDelay: '0s', animationDuration: '3s'}} suppressHydrationWarning={true}></div>
              <div className="w-full rounded-sm aspect-square bg-cyan-300 animate-pulse" style={{animationDelay: '0.5s', animationDuration: '2.5s'}} suppressHydrationWarning={true}></div>
              <div className="w-full bg-purple-300 rounded-md aspect-square animate-pulse" style={{animationDelay: '1s', animationDuration: '4s'}} suppressHydrationWarning={true}></div>
              
              {/* Row 2 */}
              <div className="w-full bg-yellow-400 rounded-sm aspect-square animate-pulse" style={{animationDelay: '1.5s', animationDuration: '3.5s'}} suppressHydrationWarning={true}></div>
              <div className="w-full bg-gray-200 rounded-sm aspect-square animate-pulse" style={{animationDelay: '2s', animationDuration: '2s'}} suppressHydrationWarning={true}></div>
              <div className="w-full bg-blue-300 rounded-sm aspect-square animate-pulse" style={{animationDelay: '0.3s', animationDuration: '3.2s'}} suppressHydrationWarning={true}></div>
              
              {/* Row 3 */}
              <div className="w-full bg-orange-300 rounded-md aspect-square animate-pulse" style={{animationDelay: '2.5s', animationDuration: '2.8s'}} suppressHydrationWarning={true}></div>
              <div className="w-full bg-pink-300 rounded-sm aspect-square animate-pulse" style={{animationDelay: '1.2s', animationDuration: '3.8s'}} suppressHydrationWarning={true}></div>
              <div className="w-full bg-purple-200 rounded-md aspect-square animate-pulse" style={{animationDelay: '0.8s', animationDuration: '2.3s'}} suppressHydrationWarning={true}></div>
            </div>
          </div>
          
          {/* Text Logo */}
          <div className="text-xs font-bold text-white sm:text-sm">
            <div>RETURN</div>
            <div>OF</div>
            <div>ATTENTION</div>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden space-x-2 lg:flex">
          {navItems.map((item) => {
            // Gate Mind Recovery until Stage 1 is completed
            if (item.key === 'mind-recovery' && !hasCompletedStage1) {
              return (
                <button
                  key={item.key}
                  onClick={() => { /* locked - no-op */ }}
                  title="Locked — complete Stage 1 to unlock"
                  aria-disabled={true}
                  className={`text-white px-3 xl:px-6 py-2 rounded-lg font-semibold transition text-sm xl:text-base opacity-60 cursor-not-allowed bg-gray-500`}
                >
                  {item.label} 🔒
                </button>
              )
            }

            return (
              <button
                key={item.key}
                onClick={() => handleNavigation(item.path, item.key)}
                className={`text-white px-3 xl:px-6 py-2 rounded-lg font-semibold transition text-sm xl:text-base ${
                  currentPage === item.key
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-pink-500 hover:bg-pink-600'
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Mobile/Tablet Navigation Button & Profile */}
        <div className="flex items-center space-x-2">
          {/* Profile Button */}
          <button 
            onClick={handleProfile}
            className="p-2 transition bg-blue-600 rounded-lg sm:p-3 hover:bg-blue-700"
            title="Profile"
          >
            <svg className="w-5 h-5 text-white sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 transition bg-pink-500 rounded-lg lg:hidden sm:p-3 hover:bg-pink-600"
            title="Menu"
          >
            <svg className="w-5 h-5 text-white sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="absolute left-0 right-0 border-t lg:hidden top-full bg-gradient-to-r from-blue-500/95 to-blue-400/95 backdrop-blur-sm border-white/10">
          <nav className="px-4 py-4 mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {navItems.map((item) => {
                if (item.key === 'mind-recovery' && !hasCompletedStage1) {
                  return (
                    <button
                      key={item.key}
                      onClick={() => {}}
                      title="Locked — complete Stage 1 to unlock"
                      aria-disabled={true}
                      className={`text-white px-4 py-3 rounded-lg font-semibold transition text-center opacity-60 cursor-not-allowed bg-gray-500`}
                    >
                      {item.label} 🔒
                    </button>
                  )
                }

                return (
                  <button
                    key={item.key}
                    onClick={() => handleNavigation(item.path, item.key)}
                    className={`text-white px-4 py-3 rounded-lg font-semibold transition text-center ${
                      currentPage === item.key
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-pink-500 hover:bg-pink-600'
                    }`}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
