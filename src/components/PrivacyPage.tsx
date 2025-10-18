'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/useToast'

export default function PrivacyPage() {
  const router = useRouter()
  const { showInfo, ToastContainer } = useToast()

  const handleChangePassword = () => {
    sessionStorage.setItem('previousPage', '/privacy')
    router.push('/password-change')
  }

  const handleDeleteAccount = () => {
    // TODO: Implement delete account functionality
    showInfo('Delete account functionality to be implemented')
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
          Privacy Policy
        </h1>

        {/* Change Password Section */}
        <div className="bg-gradient-to-br from-purple-300 to-purple-400 rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
            Change Password
          </h2>
          <p className="text-gray-800 text-sm sm:text-base mb-5 sm:mb-6 leading-relaxed">
            Keep your account secure by regularly updating your password. Use a strong, unique
            password that you don't use elsewhere.
          </p>
          <button
            onClick={handleChangePassword}
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg w-full sm:w-auto"
          >
            Change Password
          </button>
        </div>

        {/* Delete Account Section */}
        <div className="bg-gradient-to-br from-purple-300 to-purple-400 rounded-2xl shadow-lg p-6 sm:p-8 mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
            Delete Your Account
          </h2>
          <p className="text-gray-800 text-sm sm:text-base mb-5 sm:mb-6 leading-relaxed">
            If you wish to permanently delete your account and all associated data, this action
            cannot be undone. Please contact support for assistance.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg w-full sm:w-auto"
          >
            Delete Account
          </button>
        </div>

        {/* Back Button */}
        <div className="flex justify-center">
          <button
            onClick={handleBack}
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-12 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg uppercase tracking-wide"
          >
            BACK
          </button>
        </div>
      </div>
    </div>
  )
}
