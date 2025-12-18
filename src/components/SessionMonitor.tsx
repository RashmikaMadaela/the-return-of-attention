/**
 * SESSION MONITOR COMPONENT
 * Client-side component that monitors session activity and shows expiry warnings
 */

'use client'

import { useSessionTimeout } from '@/hooks/useSessionTimeout'
import { SessionExpiryNotification } from './SessionExpiryNotification'
import { useCallback, useState } from 'react'

export function SessionMonitor() {
  const [dismissed, setDismissed] = useState(false)

  const handleWarning = useCallback(() => {
    console.log('Session expiry warning triggered')
    setDismissed(false)
  }, [])

  const handleExpire = useCallback(() => {
    console.log('Session expired')
  }, [])

  const { showWarning, timeRemaining, resetActivity, isAuthenticated } = useSessionTimeout({
    onWarning: handleWarning,
    onExpire: handleExpire,
  })

  const handleDismiss = useCallback(() => {
    setDismissed(true)
  }, [])

  const handleStayLoggedIn = useCallback(() => {
    resetActivity()
    setDismissed(true)
  }, [resetActivity])

  // Only show for authenticated users
  if (!isAuthenticated) {
    return null
  }

  return (
    <SessionExpiryNotification
      show={showWarning && !dismissed}
      timeRemaining={timeRemaining}
      onDismiss={handleDismiss}
      onStayLoggedIn={handleStayLoggedIn}
    />
  )
}
