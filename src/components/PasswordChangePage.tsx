'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, KeyRound } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { useThemeColors } from '@/hooks/useThemeColors'

export default function PasswordChangePage() {
  const { bgGradientTop, bgGradientBottom, topicColor, buttonColor, containerColor, textColor1, textColor2 } = useThemeColors()
  const router = useRouter()
  const { showSuccess, showError, ToastContainer } = useToast()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChanging, setIsChanging] = useState(false)

  const handleChangePassword = async () => {
    // Client-side validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      showError('Please fill in all fields')
      return
    }

    if (newPassword !== confirmPassword) {
      showError('New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      showError('New password must be at least 8 characters long')
      return
    }

    // Check password strength
    const hasUpperCase = /[A-Z]/.test(newPassword)
    const hasLowerCase = /[a-z]/.test(newPassword)
    const hasNumber = /\d/.test(newPassword)

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      showError('Password must contain at least one uppercase letter, one lowercase letter, and one number')
      return
    }

    if (currentPassword === newPassword) {
      showError('New password must be different from current password')
      return
    }

    setIsChanging(true)

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
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
          if (data.code === 'INVALID_CURRENT_PASSWORD') {
            showError('Current password is incorrect')
          } else if (data.code === 'SAME_PASSWORD') {
            showError('New password must be different from current password')
          } else if (data.code === 'OAUTH_ACCOUNT') {
            showError('Cannot change password for social login accounts')
          } else if (data.errors && Array.isArray(data.errors)) {
            showError(data.errors.map((e: any) => e.message).join(', '))
          } else {
            showError(data.message || 'Failed to change password')
          }
          setIsChanging(false)
          return
        }

        if (response.status === 429) {
          showError('Too many attempts. Please try again later.')
          setIsChanging(false)
          return
        }

        showError(data.message || 'Failed to change password. Please try again.')
        setIsChanging(false)
        return
      }

      // Success
      showSuccess('Password changed successfully!')
      
      // Clear form
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      
      // Navigate back after a brief delay
      setTimeout(() => {
        const previousPage = sessionStorage.getItem('previousPage')
        if (previousPage) {
          sessionStorage.removeItem('previousPage')
          router.push(previousPage)
        } else {
          router.push('/user-profile')
        }
      }, 2000)

    } catch (error) {
      console.error('Password change error:', error)
      showError('An unexpected error occurred. Please try again.')
      setIsChanging(false)
    }
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
    <div className="min-h-screen bg-gradient-to-b flex items-center justify-center p-5" style={{ backgroundImage: `linear-gradient(to bottom, ${bgGradientTop}, ${bgGradientBottom})` }}>
      <ToastContainer />
      
      <div className="rounded-3xl shadow-2xl p-8 w-full max-w-md" style={{ backgroundColor: containerColor }}>
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <KeyRound className="w-10 h-10 text-[#6465e0] mr-3" />
          <h1 className="text-3xl font-bold" style={{ color: topicColor }}>Change Password</h1>
        </div>
        
        <div className="space-y-5">
          {/* Current Password Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={isChanging}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={isChanging}
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* New Password Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={isChanging}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={isChanging}
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Min 8 characters, with uppercase, lowercase & number
            </p>
          </div>

          {/* Confirm New Password Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={isChanging}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={isChanging}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Change Password Button */}
        <button
          onClick={handleChangePassword}
          disabled={isChanging || !currentPassword || !newPassword || !confirmPassword}
          className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-[#6465e0] to-[#7c7de8] text-white rounded-full font-bold uppercase tracking-wide hover:from-[#5658d1] hover:to-[#6465e0] transition-colors shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isChanging ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Changing...
            </>
          ) : (
            'CHANGE PASSWORD'
          )}
        </button>

        {/* Back Button */}
        <button
          onClick={handleBack}
          className="w-full mt-3 px-6 py-3 bg-gray-200 text-gray-800 rounded-full font-bold uppercase tracking-wide hover:bg-gray-300 transition-colors"
          disabled={isChanging}
        >
          BACK
        </button>
      </div>
    </div>
  )
}
