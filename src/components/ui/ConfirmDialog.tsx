import React from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'danger' | 'warning' | 'info'
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'warning'
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const variantStyles = {
    danger: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  }

  const buttonStyles = {
    danger: 'bg-red-500 hover:bg-red-600',
    warning: 'bg-yellow-500 hover:bg-yellow-600',
    info: 'bg-blue-500 hover:bg-blue-600'
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 sm:mx-auto overflow-hidden animate-scale-in">
        {/* Header with color bar */}
        <div className={`${variantStyles[variant]} h-2`} />
        
        <div className="p-6 sm:p-8">
          {/* Icon and Title */}
          <div className="flex items-start gap-4 mb-4">
            <div className={`${variantStyles[variant]} p-2 rounded-full`}>
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {title}
              </h3>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Message */}
          <div className="mb-6 ml-14">
            <p className="text-gray-700 text-sm sm:text-base whitespace-pre-line leading-relaxed">
              {message}
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors text-sm sm:text-base"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-6 py-2.5 ${buttonStyles[variant]} text-white font-semibold rounded-lg transition-colors shadow-lg text-sm sm:text-base`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
