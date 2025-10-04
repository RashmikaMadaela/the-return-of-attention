'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  ChartBarIcon,
  BookOpenIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  requireAuth?: boolean
}

const navigationItems: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, requireAuth: true },
  { name: 'Progress', href: '/progress', icon: ChartBarIcon, requireAuth: true },
  { name: 'Library', href: '/library', icon: BookOpenIcon, requireAuth: true },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, requireAuth: true },
]

const publicNavigationItems: NavigationItem[] = [
  { name: 'About', href: '/about', icon: BookOpenIcon },
  { name: 'Questionnaire', href: '/questionnaire', icon: ChartBarIcon },
]

interface NavigationMenuProps {
  className?: string
}

export default function NavigationMenu({ className }: NavigationMenuProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()

  const isAuthenticated = status === 'authenticated'
  const items = isAuthenticated ? navigationItems : publicNavigationItems

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  return (
    <nav className={cn('bg-white shadow-sm border-b border-gray-200', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg, var(--blue-500) 0%, var(--teal-500) 100%)' }}>
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-h4 font-bold hidden sm:block">PAHM</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {items.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                {/* User Menu */}
                <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-gray-50">
                  <UserCircleIcon className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {session.user?.name || session.user?.email}
                  </span>
                </div>
                
                {/* Sign Out */}
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/signin"
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="btn btn-primary btn-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {items.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
            
            {/* Mobile Auth Section */}
            <div className="pt-4 border-t border-gray-200 space-y-1">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <UserCircleIcon className="h-6 w-6 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {session.user?.name || session.user?.email}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: '/' })
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-3 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/signin"
                    className="flex items-center space-x-3 px-3 py-3 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center space-x-3 px-3 py-3 text-base font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>Get Started</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}