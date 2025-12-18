/**
 * SESSION EXPIRY NOTIFICATION COMPONENT
 * Shows warning to user when session is about to expire due to inactivity
 */

'use client'

import { useEffect, useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid'

interface SessionExpiryNotificationProps {
  show: boolean
  timeRemaining: number
  onDismiss: () => void
  onStayLoggedIn: () => void
}

export function SessionExpiryNotification({
  show,
  timeRemaining,
  onDismiss,
  onStayLoggedIn,
}: SessionExpiryNotificationProps) {
  const [minutesRemaining, setMinutesRemaining] = useState(0)

  useEffect(() => {
    if (show && timeRemaining > 0) {
      const minutes = Math.ceil(timeRemaining / 1000 / 60)
      setMinutesRemaining(minutes)
    }
  }, [show, timeRemaining])

  if (!show) {
    return null
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 max-w-md animate-slide-in-right"
      role="alert"
      aria-live="assertive"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-yellow-500 overflow-hidden">
        {/* Header */}
        <div className="bg-yellow-500 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-6 w-6 text-white" />
            <h3 className="text-white font-semibold text-lg">
              Session Expiring Soon
            </h3>
          </div>
          <button
            onClick={onDismiss}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Dismiss notification"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Your session will expire in{' '}
            <span className="font-bold text-yellow-600 dark:text-yellow-400">
              {minutesRemaining} minute{minutesRemaining !== 1 ? 's' : ''}
            </span>{' '}
            due to inactivity.
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            You'll be automatically logged out to protect your account. Click below to stay logged in.
          </p>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onStayLoggedIn}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Stay Logged In
            </button>
            <button
              onClick={onDismiss}
              className="px-4 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add animation styles to globals.css if not already present
// @keyframes slide-in-right {
//   from {
//     transform: translateX(100%);
//     opacity: 0;
//   }
//   to {
//     transform: translateX(0);
//     opacity: 1;
//   }
// }
// .animate-slide-in-right {
//   animation: slide-in-right 0.3s ease-out;
// }
