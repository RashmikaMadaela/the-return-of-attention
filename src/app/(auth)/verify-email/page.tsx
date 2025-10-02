'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function VerifyEmailContent() {
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
          <div className="w-16 h-16 mb-4 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
        )
      case 'success':
        return (
          <div className="flex items-center justify-center w-16 h-16 mb-4 bg-green-100 rounded-full">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      case 'already-verified':
        return (
          <div className="flex items-center justify-center w-16 h-16 mb-4 bg-blue-100 rounded-full">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
      case 'error':
        return (
          <div className="flex items-center justify-center w-16 h-16 mb-4 bg-red-100 rounded-full">
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
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
        </div>

        <div className="p-8 bg-white rounded-lg shadow-md">
          <div className="flex flex-col items-center">
            {getStatusIcon()}
            
            <h3 className={`text-lg font-semibold mb-4 ${getStatusColor()}`}>
              {status === 'loading' && 'Verifying your email...'}
              {status === 'success' && 'Email Verified Successfully!'}
              {status === 'already-verified' && 'Already Verified'}
              {status === 'error' && 'Verification Failed'}
            </h3>

            {message && (
              <p className="mb-6 text-center text-gray-600">
                {message}
              </p>
            )}

            {error && (
              <div className="w-full p-4 mb-6 border border-red-200 rounded-md bg-red-50">
                <p className="text-sm text-center text-red-600">
                  {error}
                </p>
              </div>
            )}

            <div className="w-full space-y-4">
              {(status === 'success' || status === 'already-verified') && (
                <a
                  href="/signin"
                  className="inline-block w-full px-4 py-3 text-center text-white transition-colors bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Sign In to Your Account
                </a>
              )}

              {status === 'error' && (
                <div className="space-y-3">
                  <a
                    href="/register"
                    className="inline-block w-full px-4 py-3 text-center text-white transition-colors bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    Register New Account
                  </a>
                  <a
                    href="/resend-verification"
                    className="inline-block w-full px-4 py-3 text-center text-white transition-colors bg-gray-600 rounded-md hover:bg-gray-700"
                  >
                    Resend Verification Email
                  </a>
                </div>
              )}

              <a
                href="/"
                className="inline-block w-full py-2 text-center text-gray-600 hover:text-gray-900"
              >
                ← Back to Home
              </a>
            </div>
          </div>
        </div>

        {/* Instructions for testing */}
        {status === 'loading' && (
          <div className="p-4 text-left border border-yellow-200 rounded-lg bg-yellow-50">
            <h4 className="mb-2 font-semibold text-yellow-800">🧪 Testing Mode</h4>
            <p className="text-sm text-yellow-700">
              If you don't have Resend configured, check your terminal console for the verification link.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="p-8 bg-white rounded-lg shadow-md">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 mb-4 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
              <h3 className="mb-4 text-lg font-semibold text-gray-800">
                Loading...
              </h3>
            </div>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}