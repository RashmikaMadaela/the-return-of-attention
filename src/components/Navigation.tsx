'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface NavigationProps {
  currentPage?: string
}

export default function Navigation({ currentPage = 'home' }: NavigationProps) {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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





  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-500/20 to-blue-400/20 backdrop-blur-sm p-4 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo with Animated PAHM Grid */}
        <div className="flex items-center space-x-3">
          {/* Animated PAHM Grid Logo */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-purple-600 rounded-lg flex-shrink-0" suppressHydrationWarning={true}>
            <div className="absolute inset-1 sm:inset-1.5 grid grid-cols-3 gap-0.5 sm:gap-1" suppressHydrationWarning={true}>
              {/* Row 1 */}
              <div className="w-full aspect-square bg-orange-300 rounded-md animate-pulse" style={{animationDelay: '0s', animationDuration: '3s'}} suppressHydrationWarning={true}></div>
              <div className="w-full aspect-square bg-cyan-300 rounded-sm animate-pulse" style={{animationDelay: '0.5s', animationDuration: '2.5s'}} suppressHydrationWarning={true}></div>
              <div className="w-full aspect-square bg-purple-300 rounded-md animate-pulse" style={{animationDelay: '1s', animationDuration: '4s'}} suppressHydrationWarning={true}></div>
              
              {/* Row 2 */}
              <div className="w-full aspect-square bg-yellow-400 rounded-sm animate-pulse" style={{animationDelay: '1.5s', animationDuration: '3.5s'}} suppressHydrationWarning={true}></div>
              <div className="w-full aspect-square bg-gray-200 rounded-sm animate-pulse" style={{animationDelay: '2s', animationDuration: '2s'}} suppressHydrationWarning={true}></div>
              <div className="w-full aspect-square bg-blue-300 rounded-sm animate-pulse" style={{animationDelay: '0.3s', animationDuration: '3.2s'}} suppressHydrationWarning={true}></div>
              
              {/* Row 3 */}
              <div className="w-full aspect-square bg-orange-300 rounded-md animate-pulse" style={{animationDelay: '2.5s', animationDuration: '2.8s'}} suppressHydrationWarning={true}></div>
              <div className="w-full aspect-square bg-pink-300 rounded-sm animate-pulse" style={{animationDelay: '1.2s', animationDuration: '3.8s'}} suppressHydrationWarning={true}></div>
              <div className="w-full aspect-square bg-purple-200 rounded-md animate-pulse" style={{animationDelay: '0.8s', animationDuration: '2.3s'}} suppressHydrationWarning={true}></div>
            </div>
          </div>
          
          {/* Text Logo */}
          <div className="text-white font-bold text-xs sm:text-sm">
            <div>RETURN</div>
            <div>OF</div>
            <div>ATTENTION</div>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex space-x-2">
          {navItems.map((item) => (
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
          ))}
        </nav>

        {/* Mobile/Tablet Navigation Button & Profile */}
        <div className="flex items-center space-x-2">
          {/* Profile Button */}
          <button 
            onClick={handleProfile}
            className="bg-blue-600 p-2 sm:p-3 rounded-lg hover:bg-blue-700 transition"
            title="Profile"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </button>

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
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-gradient-to-r from-blue-500/95 to-blue-400/95 backdrop-blur-sm border-t border-white/10">
          <nav className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {navItems.map((item) => (
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
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
