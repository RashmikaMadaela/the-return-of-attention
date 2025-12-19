/**
 * NEXT.JS MIDDLEWARE
 * Handles session validation and expiry at the edge
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Protected routes that require authentication
const protectedRoutes = [
  '/home',
  '/personal-info',
  '/questionnaire',
  '/self-assessment',
  '/all-stages',
  '/stage-1',
  '/stage-2',
  '/stage-3',
  '/stage-4',
  '/stage-5',
  '/stage-6',
  '/mind-recovery',
  '/session-setup',
  '/timer',
  '/daily-notes',
  '/pahm-session-setup',
  '/pahm-timer',
  '/pahm-reflection',
  '/user-profile',
  '/password-change',
  '/admin',
]

// Public routes that should redirect to home if authenticated
const authRoutes = ['/signin', '/signup']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // Get the session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // If accessing protected route without valid token, redirect to signin
  if (isProtectedRoute && !token) {
    const url = new URL('/signin', request.url)
    url.searchParams.set('expired', 'true')
    return NextResponse.redirect(url)
  }

  // If accessing auth route with valid token, redirect to home
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  // Check if session has expired due to inactivity
  if (token && token.lastActivity) {
    const now = Math.floor(Date.now() / 1000)
    const timeSinceLastActivity = now - (token.lastActivity as number)
    const ONE_HOUR = 60 * 60

    // If more than 1 hour of inactivity, redirect to signin
    if (timeSinceLastActivity > ONE_HOUR) {
      const url = new URL('/signin', request.url)
      url.searchParams.set('expired', 'true')
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (all API routes - they handle auth themselves)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder and assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|images|audio|png_images).*)',
  ],
}
