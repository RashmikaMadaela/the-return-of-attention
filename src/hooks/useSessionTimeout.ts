/**
 * SESSION TIMEOUT HOOK
 * Tracks user activity and handles session expiration
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const INACTIVITY_TIMEOUT = 60 * 60 * 1000 // 1 hour in milliseconds
const WARNING_TIME = 5 * 60 * 1000 // Show warning 5 minutes before expiry
const CHECK_INTERVAL = 60 * 1000 // Check every minute

interface UseSessionTimeoutOptions {
  onWarning?: () => void
  onExpire?: () => void
}

export function useSessionTimeout(options: UseSessionTimeoutOptions = {}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const lastActivityRef = useRef<number>(Date.now())
  const warningShownRef = useRef<boolean>(false)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isSigningOutRef = useRef<boolean>(false) // Prevent infinite signout loop
  
  const [showWarning, setShowWarning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number>(INACTIVITY_TIMEOUT)

  // Reset activity timer
  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now()
    warningShownRef.current = false
    setShowWarning(false)
    setTimeRemaining(INACTIVITY_TIMEOUT)
  }, [])

  // Handle user activity
  const handleActivity = useCallback(() => {
    resetActivity()
  }, [resetActivity])

  const checkTimeout = useCallback(async () => {
    if (isSigningOutRef.current || status !== 'authenticated' || !session) {
      return
    }

    const now = Date.now()
    const timeSinceLastActivity = now - lastActivityRef.current
    const remaining = INACTIVITY_TIMEOUT - timeSinceLastActivity

    setTimeRemaining(remaining)

    if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
      if (isSigningOutRef.current) {
        return
      }
      
      isSigningOutRef.current = true
      
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
        checkIntervalRef.current = null
      }

      // Call custom expiry handler
      if (options.onExpire) {
        options.onExpire()
      }

      try {
        // Sign out and redirect
        await signOut({ redirect: false })
        router.push('/signin?expired=true')
      } catch (error) {
        console.error('Error during signout:', error)
        // Force redirect even if signout fails
        router.push('/signin?expired=true')
      }
      return
    }

    // Show warning if approaching timeout
    if (remaining <= WARNING_TIME && !warningShownRef.current) {
      console.log('Session expiring soon - showing warning')
      warningShownRef.current = true
      setShowWarning(true)
      
      if (options.onWarning) {
        options.onWarning()
      }
    }
  }, [status, session, router, options])

  // Set up activity listeners
  useEffect(() => {
    // Don't set up if already signing out or not authenticated
    if (isSigningOutRef.current || status !== 'authenticated') {
      return
    }

    // Activity events to track
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ]

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })

    checkIntervalRef.current = setInterval(checkTimeout, CHECK_INTERVAL)

    checkTimeout()

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
      
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
        checkIntervalRef.current = null
      }
    }
  }, [status, session, handleActivity, checkTimeout])

  // Handle page visibility change
  useEffect(() => {
    // Don't check if already signing out or not authenticated
    if (isSigningOutRef.current || status !== 'authenticated') {
      return
    }

    const handleVisibilityChange = () => {
      // Don't check if already signing out
      if (isSigningOutRef.current) {
        return
      }
      
      if (document.visibilityState === 'visible') {
        // User returned to the page - check if session expired while away
        checkTimeout()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [status, checkTimeout])
  
  // Clean up when component unmounts or user logs out
  useEffect(() => {
    if (status === 'unauthenticated') {
      // Clear the signing out flag when logged out
      isSigningOutRef.current = false
    }
  }, [status])

  return {
    showWarning,
    timeRemaining,
    resetActivity,
    isAuthenticated: status === 'authenticated',
  }
}
