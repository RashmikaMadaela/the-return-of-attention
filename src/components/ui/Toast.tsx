'use client'

import React, { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose: () => void
  title?: string
}

export default function Toast({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose,
  title 
}: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const icons = {
    success: <CheckCircle className="w-6 h-6" />,
    error: <AlertCircle className="w-6 h-6" />,
    warning: <AlertTriangle className="w-6 h-6" />,
    info: <Info className="w-6 h-6" />
  }

  const colors = {
    success: 'bg-green-50 border-green-500 text-green-800',
    error: 'bg-red-50 border-red-500 text-red-800',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
    info: 'bg-blue-50 border-blue-500 text-blue-800'
  }

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  }

  return (
    <div className="fixed top-20 right-4 left-4 sm:left-auto sm:right-4 z-[100] animate-slide-in-right">
      <div className={`max-w-md mx-auto sm:mx-0 rounded-lg border-l-4 shadow-lg ${colors[type]} p-4`}>
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 ${iconColors[type]}`}>
            {icons[type]}
          </div>
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="font-semibold mb-1 text-sm sm:text-base">{title}</h3>
            )}
            <p className="text-xs sm:text-sm whitespace-pre-line break-words">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 hover:opacity-70 transition-opacity"
            aria-label="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
