/**
 * useWakeLock Hook
 * 
 * Prevents the device screen from dimming or locking during meditation sessions.
 * Uses the Screen Wake Lock API to keep the screen active while the timer is running.
 * 
 * Features:
 * - Automatic wake lock when timer starts
 * - Automatic release when timer stops
 * - Reacquires lock when app becomes visible again
 * - Handles browser compatibility gracefully
 * - Error handling for system restrictions (low battery, etc.)
 */

import { useEffect, useRef, useState } from 'react'

interface UseWakeLockOptions {
  isActive: boolean // Whether the timer is running
}

interface UseWakeLockReturn {
  isSupported: boolean
  isLocked: boolean
  error: string | null
}

export function useWakeLock({ isActive }: UseWakeLockOptions): UseWakeLockReturn {
  const [isSupported, setIsSupported] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  // Check if Wake Lock API is supported
  useEffect(() => {
    if (typeof window !== 'undefined' && 'wakeLock' in navigator) {
      setIsSupported(true)
    }
  }, [])

  // Request wake lock
  const requestWakeLock = async () => {
    if (!isSupported || wakeLockRef.current) return

    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen')
      setIsLocked(true)
      setError(null)

      // Listen for wake lock release
      wakeLockRef.current.addEventListener('release', () => {
        setIsLocked(false)
        wakeLockRef.current = null
      })

      console.log('Wake lock acquired - screen will stay on')
    } catch (err) {
      const error = err as Error
      setError(error.message)
      console.warn('Wake lock request failed:', error.name, error.message)
      // Common failures: low battery, permission denied, etc.
    }
  }

  // Release wake lock
  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release()
        wakeLockRef.current = null
        setIsLocked(false)
        console.log('Wake lock released - screen can dim/lock normally')
      } catch (err) {
        console.warn('Wake lock release failed:', err)
      }
    }
  }

  // Handle visibility change - reacquire lock when app becomes visible
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isActive && !wakeLockRef.current) {
        await requestWakeLock()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isActive, isSupported])

  // Request/release wake lock based on isActive state
  useEffect(() => {
    if (isActive && isSupported) {
      requestWakeLock()
    } else if (!isActive) {
      releaseWakeLock()
    }

    // Cleanup on unmount
    return () => {
      releaseWakeLock()
    }
  }, [isActive, isSupported])

  return {
    isSupported,
    isLocked,
    error
  }
}
