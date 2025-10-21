'use client'

import { useState, useCallback } from 'react'
import Toast, { ToastType } from '@/components/ui/Toast'

interface ToastConfig {
  message: string
  type?: ToastType
  duration?: number
  title?: string
}

export function useToast() {
  const [toasts, setToasts] = useState<Array<ToastConfig & { id: number }>>([])

  const showToast = useCallback((config: ToastConfig) => {
    const id = Date.now()
    setToasts(prev => [...prev, { ...config, id }])
  }, [])

  const showSuccess = useCallback((message: string, title?: string) => {
    showToast({ message, type: 'success', title })
  }, [showToast])

  const showError = useCallback((message: string, title?: string) => {
    showToast({ message, type: 'error', title })
  }, [showToast])

  const showWarning = useCallback((message: string, title?: string) => {
    showToast({ message, type: 'warning', title })
  }, [showToast])

  const showInfo = useCallback((message: string, title?: string) => {
    showToast({ message, type: 'info', title })
  }, [showToast])

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const ToastContainer = useCallback(() => (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          title={toast.title}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  ), [toasts, removeToast])

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    ToastContainer
  }
}
