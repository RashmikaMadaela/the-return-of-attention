'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/useToast'
import { Shield, Lock, Trash2, AlertTriangle } from 'lucide-react'
import { signOut } from 'next-auth/react'

export default function PrivacyPage() {
  const router = useRouter()
  const { showSuccess, showError, showInfo, ToastContainer } = useToast()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleteReason, setDeleteReason] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleChangePassword = () => {
    sessionStorage.setItem('previousPage', '/privacy')
    router.push('/password-change')
  }

  const handleDeleteAccount = () => {
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    // Validation
    if (!deletePassword) {
      showError('Please enter your password')
      return
    }

    if (deleteConfirmation !== 'DELETE') {
      showError('Please type "DELETE" to confirm')
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: deletePassword,
          confirmation: deleteConfirmation,
          reason: deleteReason || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          showError('Session expired. Please sign in again.')
          setTimeout(() => router.push('/signin'), 2000)
          return
        }

        if (response.status === 400) {
          if (data.code === 'INVALID_PASSWORD') {
            showError('Incorrect password. Please try again.')
          } else if (data.code === 'INVALID_CONFIRMATION') {
            showError('Please type "DELETE" exactly to confirm')
          } else if (data.errors && Array.isArray(data.errors)) {
            showError(data.errors.map((e: any) => e.message).join(', '))
          } else {
            showError(data.message || 'Failed to delete account')
          }
          setIsDeleting(false)
          return
        }

        if (response.status === 429) {
          showError('Too many attempts. Please try again later.')
          setIsDeleting(false)
          return
        }

        showError(data.message || 'Failed to delete account. Please try again.')
        setIsDeleting(false)
        return
      }

      // Success
      showSuccess('Account deleted successfully. Goodbye!')
      
      // Clear modal
      setShowDeleteModal(false)
      
      // Sign out and redirect after a brief delay
      setTimeout(async () => {
        await signOut({ callbackUrl: '/signin' })
      }, 2000)

    } catch (error) {
      console.error('Delete account error:', error)
      showError('An unexpected error occurred. Please try again.')
      setIsDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteModal(false)
    setDeletePassword('')
    setDeleteConfirmation('')
    setDeleteReason('')
    setIsDeleting(false)
  }

  const handleBack = () => {
    const previousPage = sessionStorage.getItem('previousPage')
    if (previousPage) {
      sessionStorage.removeItem('previousPage')
      router.push(previousPage)
    } else {
      router.push('/user-profile')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-300 flex items-center justify-center p-5">
      <ToastContainer />
      
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <Shield className="w-10 h-10 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-800">Privacy & Security</h1>
        </div>

        {/* Change Password Section */}
        <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
          <div className="flex items-start mb-4">
            <Lock className="w-6 h-6 text-blue-600 mr-3 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Change Password</h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                Keep your account secure by regularly updating your password. Use a strong, unique
                password with at least 8 characters, including uppercase, lowercase, and numbers.
              </p>
            </div>
          </div>
          <button
            onClick={handleChangePassword}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors shadow-md"
          >
            Change Password
          </button>
        </div>

        {/* Delete Account Section */}
        <div className="mb-8 p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border border-red-200">
          <div className="flex items-start mb-4">
            <Trash2 className="w-6 h-6 text-red-600 mr-3 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Delete Your Account</h2>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <div className="bg-red-200 border border-red-300 rounded-lg p-3 mb-3">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-700 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-900 font-medium">
                    Warning: All your sessions, notes, assessments, and progress will be permanently deleted.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleDeleteAccount}
            className="w-full sm:w-auto px-6 py-2.5 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition-colors shadow-md"
          >
            Delete Account
          </button>
        </div>

        {/* Back Button */}
        <div className="flex justify-center">
          <button
            onClick={handleBack}
            className="px-12 py-3 bg-blue-600 text-white rounded-full font-bold uppercase tracking-wide hover:bg-blue-700 transition-colors shadow-lg"
          >
            BACK
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-center mb-6">
              <AlertTriangle className="w-12 h-12 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
              Delete Account
            </h2>
            
            <p className="text-sm text-gray-700 text-center mb-6">
              This action is permanent and cannot be undone. All your data will be deleted.
            </p>

            <div className="space-y-4">
              {/* Password Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter Your Password
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  disabled={isDeleting}
                />
              </div>

              {/* Confirmation Text */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type "DELETE" to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="DELETE"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  disabled={isDeleting}
                />
              </div>

              {/* Reason (Optional) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Tell us why you're leaving..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm h-20 resize-none"
                  maxLength={500}
                  disabled={isDeleting}
                />
                <p className="text-xs text-gray-500 mt-1">{deleteReason.length}/500</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting || !deletePassword || deleteConfirmation !== 'DELETE'}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete Forever'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
