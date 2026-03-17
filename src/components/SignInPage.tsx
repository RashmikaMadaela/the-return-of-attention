'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { LogIn, Mail, Lock, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [emailVerificationNotice, setEmailVerificationNotice] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)

  // Check query-string based status messages
  useEffect(() => {
    const expired = searchParams.get('expired')
    const verificationPending = searchParams.get('verifyEmail')
    const verified = searchParams.get('verified')

    if (expired === 'true') {
      setSessionExpired(true)
      setError('Your session has expired due to inactivity. Please sign in again.')
    }

    if (verificationPending === 'true') {
      setEmailVerificationNotice(true)
    }

    if (verified === 'true') {
      setEmailVerified(true)
    }
  }, [searchParams])

  const handleSignIn = async () => {
    setError('')
    setFieldErrors({})

    const errs: { email?: string; password?: string } = {}
    
    // Validate email - matches backend loginSchema
    if (!email) {
      errs.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Invalid email address'
    }
    
    // Validate password - matches backend: min 1 char for login
    if (!password) {
      errs.password = 'Password is required'
    }

    if (Object.keys(errs).length) {
      setFieldErrors(errs)
      return
    }

    setLoading(true)
    try {
      const res = await signIn('credentials', { 
        redirect: false, 
        email, 
        password,
        rememberMe: String(rememberMe) // Pass rememberMe as string
      })
      
      // Check if sign in was successful
      if (!res) {
        setError('Unable to connect to authentication service. Please try again.')
        setLoading(false)
        return
      }

      // Handle authentication errors with specific messages matching backend CommonErrors
      if (res.error) {
        let errorMessage = 'Sign in failed. Please try again.'
        
        const errorLower = res.error.toLowerCase()
        
        // Map backend error codes to user-friendly messages
        if (errorLower.includes('invalid email or password') || 
            errorLower.includes('invalid credentials') ||
            errorLower.includes('credentials')) {
          // CommonErrors.invalidCredentials
          errorMessage = 'Invalid email or password'
        } else if (errorLower.includes('verify your email') || 
                   errorLower.includes('email not verified')) {
          // CommonErrors.emailNotVerified
          errorMessage = 'Please verify your email address first'
        } else if (errorLower.includes('account is inactive') || 
                   errorLower.includes('inactive')) {
          // CommonErrors.accountInactive
          errorMessage = 'Account is inactive. Please contact support.'
        } else if (errorLower.includes('authentication required') || 
                   errorLower.includes('unauthorized')) {
          // CommonErrors.unauthorized
          errorMessage = 'Authentication failed. Please try again.'
        } else if (errorLower.includes('user') && errorLower.includes('not found')) {
          // CommonErrors.userNotFound
          errorMessage = 'No account found with this email. Please sign up first.'
        } else if (errorLower.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection.'
        } else if (errorLower.includes('rate limit') || errorLower.includes('too many')) {
          // CommonErrors.rateLimitExceeded
          errorMessage = 'Too many login attempts. Please try again later.'
        } else if (res.error.length > 10) {
          // Use the actual error message if it's descriptive
          errorMessage = res.error
        }
        
        setError(errorMessage)
        setLoading(false)
        return
      }

      // Check if sign in was successful (no error and ok status)
      if (res.ok) {
        // Success - redirect to home
        router.push('/home')
      } else {
        setError('Authentication failed. Please verify your credentials.')
        setLoading(false)
      }
    } catch (err) {
      console.error('Sign in error', err)
      
      // Provide specific error messages based on error type
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error. Please check your internet connection and try again.')
      } else if (err instanceof Error) {
        setError(`Error: ${err.message}`)
      } else {
        setError('An unexpected error occurred. Please try again later.')
      }
      setLoading(false)
    }
  }

  const handleSignUp = () => {
    router.push('/signup')
  }

  const handleBackToHome = () => {
    router.push('/')
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 sm:p-6">
      {/* Back Button - Top Left */}
      <button
        onClick={handleBackToHome}
        className="fixed z-10 flex items-center gap-2 p-2 text-white transition-all duration-200 rounded-full top-4 left-4 sm:top-6 sm:left-6 sm:p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm hover:scale-110 group"
      >
        <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="hidden text-sm font-medium transition-opacity duration-200 opacity-0 sm:inline-block group-hover:opacity-100">
          Back
        </span>
      </button>

      <div className="w-full max-w-md p-6 shadow-2xl bg-white/95 backdrop-blur-sm rounded-3xl sm:p-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full shadow-lg sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600">
            <LogIn className="w-8 h-8 text-white sm:w-10 sm:h-10" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800 sm:text-3xl">Welcome Back</h1>
          <p className="text-sm text-gray-600 sm:text-base">Sign in to continue your journey</p>
        </div>
        
        <div className="space-y-4 sm:space-y-5">
          {/* Email Field */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              <Mail className="inline w-4 h-4 mr-1" />
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 text-sm transition-all duration-200 border-2 border-gray-200 sm:p-4 rounded-xl bg-gray-50 sm:text-base focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-lg"
            />
            {fieldErrors.email && (
              <div className="flex items-center gap-1 mt-1 text-xs text-red-500 sm:text-sm">
                <span>⚠️</span> {fieldErrors.email}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              <Lock className="inline w-4 h-4 mr-1" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 pr-12 text-sm transition-all duration-200 border-2 border-gray-200 sm:p-4 sm:pr-12 rounded-xl bg-gray-50 sm:text-base focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-lg"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute text-gray-500 transition-colors transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <div className="flex items-center gap-1 mt-1 text-xs text-red-500 sm:text-sm">
                <span>⚠️</span> {fieldErrors.password}
              </div>
            )}
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex flex-col gap-3 my-5 sm:flex-row sm:justify-between sm:items-center">
          <div className="flex items-center text-xs sm:text-sm">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 mr-2 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="rememberMe" className="text-gray-700 cursor-pointer">Remember me</label>
          </div>
          <button
            type="button"
            onClick={() => router.push('/reset-password')}
            className="text-xs font-medium text-blue-600 transition hover:text-blue-700 hover:underline sm:text-sm"
          >
            Forgot password?
          </button>
        </div>

        {/* Session Expired Message */}
        {sessionExpired && !error && (
          <div className="flex items-center justify-center gap-2 p-3 mb-5 text-sm text-center text-yellow-700 border border-yellow-300 bg-yellow-50 rounded-xl">
            <span>⏱️</span>
            <span>Your session has expired due to inactivity. Please sign in again.</span>
          </div>
        )}

        {emailVerificationNotice && (
          <div className="flex items-center justify-center gap-2 p-3 mb-5 text-sm text-center text-blue-700 border border-blue-200 bg-blue-50 rounded-xl">
            <span>✉️</span>
            <span>Your account was created. Verify your email before signing in.</span>
          </div>
        )}

        {emailVerified && (
          <div className="flex items-center justify-center gap-2 p-3 mb-5 text-sm text-center text-green-700 border border-green-200 bg-green-50 rounded-xl">
            <span>✅</span>
            <span>Your email has been verified. You can sign in now.</span>
          </div>
        )}

        {/* Error Message */}
        {error && !sessionExpired && (
          <div className="flex items-center justify-center gap-2 p-3 mb-5 text-sm text-center text-red-600 border border-red-200 bg-red-50 rounded-xl">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        
        {/* Error Message with Session Expired */}
        {error && sessionExpired && (
          <div className="flex items-center justify-center gap-2 p-3 mb-5 text-sm text-center text-red-600 border border-red-200 bg-red-50 rounded-xl">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Sign In Button */}
        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-sm sm:text-base font-semibold transition-all duration-200 hover:shadow-xl hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin"></div>
              SIGNING IN...
            </>
          ) : (
            <>
              SIGN IN
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        {/* Sign Up Link */}
        <div className="mt-6 text-xs text-center text-gray-600 sm:text-sm">
          Don't have an account?{' '}
          <button 
            onClick={handleSignUp}
            className="font-semibold text-blue-600 cursor-pointer hover:text-blue-700 hover:underline">
            Sign Up
          </button>
        </div>
      </div>
    </div>
  )
}