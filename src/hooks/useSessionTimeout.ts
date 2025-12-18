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

  // Check session timeout
  const checkTimeout = useCallback(async () => {
    if (status !== 'authenticated' || !session) {
      return
    }

    const now = Date.now()
    const timeSinceLastActivity = now - lastActivityRef.current
    const remaining = INACTIVITY_TIMEOUT - timeSinceLastActivity

    setTimeRemaining(remaining)

    // Session expired - force logout
    if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
      console.log('Session expired due to inactivity')
      
      // Clear interval
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
        checkIntervalRef.current = null
      }

      // Call custom expiry handler
      if (options.onExpire) {
        options.onExpire()
      }

      // Sign out and redirect
      await signOut({ redirect: false })
      router.push('/signin?expired=true')
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
    if (status !== 'authenticated') {
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

    // Start interval to check timeout
    checkIntervalRef.current = setInterval(checkTimeout, CHECK_INTERVAL)

    // Initial check
    checkTimeout()

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
      
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
        checkIntervalRef.current = null
      }
    }
  }, [status, handleActivity, checkTimeout])

  // Handle page visibility change
  useEffect(() => {
    if (status !== 'authenticated') {
      return
    }

    const handleVisibilityChange = () => {
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

  return {
    showWarning,
    timeRemaining,
    resetActivity,
    isAuthenticated: status === 'authenticated',
  }
}
