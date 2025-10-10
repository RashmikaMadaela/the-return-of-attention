'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PasswordChangePage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChangePassword = () => {
    setError('')
    setSuccess('')
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long')
      return
    }

    // TODO: Implement actual password change logic with backend
    console.log('Password change data:', { currentPassword, newPassword })
    
    setSuccess('Password changed successfully!')
    setTimeout(() => {
      const previousPage = sessionStorage.getItem('previousPage')
      if (previousPage) {
        sessionStorage.removeItem('previousPage')
        router.push(previousPage)
      } else {
        router.push('/user-profile')
      }
    }, 2000)
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
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-5">
      <div className="bg-white rounded-lg shadow-lg p-10 w-full max-w-md">
        <h1 className="text-center text-3xl mb-8 text-gray-800 font-medium">Change Password</h1>
        
        <div className="space-y-5">
          {/* Current Password Field */}
          <div>
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 border-l-4 border-l-purple-600 rounded bg-gray-50/50 text-sm transition-colors focus:outline-none focus:border-l-purple-700"
            />
          </div>

          {/* New Password Field */}
          <div>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 border-l-4 border-l-purple-600 rounded bg-gray-50/50 text-sm transition-colors focus:outline-none focus:border-l-purple-700"
            />
          </div>

          {/* Confirm New Password Field */}
          <div>
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 border-l-4 border-l-purple-600 rounded bg-gray-50/50 text-sm transition-colors focus:outline-none focus:border-l-purple-700"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm mt-5 text-center bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="text-green-500 text-sm mt-5 text-center bg-green-50 p-2 rounded">
            {success}
          </div>
        )}

        {/* Change Password Button */}
        <button
          onClick={handleChangePassword}
          className="w-full mt-6 p-3 bg-orange-500 text-white rounded-full text-sm font-semibold transition-colors hover:bg-orange-600 mb-3"
        >
          CHANGE PASSWORD
        </button>

        {/* Back Button */}
        <button
          onClick={handleBack}
          className="w-full p-3 bg-blue-500 text-white rounded-full text-sm font-semibold transition-colors hover:bg-blue-600"
        >
          BACK
        </button>
      </div>
    </div>
  )
}
