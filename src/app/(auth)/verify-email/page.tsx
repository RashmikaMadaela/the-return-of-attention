'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already-verified'>('loading')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      setStatus('error')
      setError('Invalid verification link. Missing token or email.')
      return
    }

    // Verify the email
    verifyEmail(token, email)
  }, [searchParams])

  const verifyEmail = async (token: string, email: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, email }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.message?.includes('already verified')) {
          setStatus('already-verified')
          setMessage('Your email is already verified! You can sign in to your account.')
        } else {
          setStatus('success')
          setMessage(data.message || 'Email verified successfully!')
        }
      } else {
        setStatus('error')
        setError(data.error || 'Verification failed')
      }
    } catch (err) {
      setStatus('error')
      setError('Network error. Please try again.')
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mb-4"></div>
        )
      case 'success':
        return (
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      case 'already-verified':
        return (
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
      case 'error':
        return (
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-800'
      case 'already-verified':
        return 'text-blue-800'
      case 'error':
        return 'text-red-800'
      default:
        return 'text-gray-800'
    }
  }

  const getBackgroundColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-50'
      case 'already-verified':
        return 'bg-blue-50'
      case 'error':
        return 'bg-red-50'
      default:
        return 'bg-gray-50'
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${getBackgroundColor()}`}>
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex flex-col items-center">
            {getStatusIcon()}
            
            <h3 className={`text-lg font-semibold mb-4 ${getStatusColor()}`}>
              {status === 'loading' && 'Verifying your email...'}
              {status === 'success' && 'Email Verified Successfully!'}
              {status === 'already-verified' && 'Already Verified'}
              {status === 'error' && 'Verification Failed'}
            </h3>

            {message && (
              <p className="text-gray-600 mb-6 text-center">
                {message}
              </p>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 w-full">
                <p className="text-sm text-red-600 text-center">
                  {error}
                </p>
              </div>
            )}

            <div className="space-y-4 w-full">
              {(status === 'success' || status === 'already-verified') && (
                <a
                  href="/signin"
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors inline-block text-center"
                >
                  Sign In to Your Account
                </a>
              )}

              {status === 'error' && (
                <div className="space-y-3">
                  <a
                    href="/register"
                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors inline-block text-center"
                  >
                    Register New Account
                  </a>
                  <a
                    href="/resend-verification"
                    className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition-colors inline-block text-center"
                  >
                    Resend Verification Email
                  </a>
                </div>
              )}

              <a
                href="/"
                className="w-full text-gray-600 hover:text-gray-900 py-2 text-center inline-block"
              >
                ← Back to Home
              </a>
            </div>
          </div>
        </div>

        {/* Instructions for testing */}
        {status === 'loading' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
            <h4 className="font-semibold text-yellow-800 mb-2">🧪 Testing Mode</h4>
            <p className="text-sm text-yellow-700">
              If you don't have Resend configured, check your terminal console for the verification link.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}