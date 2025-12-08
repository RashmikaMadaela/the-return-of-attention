'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { UserPlus, Mail, Lock, User, ArrowRight, Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignUp = async () => {
    setError('')
    setFieldErrors({})

    const errs: { name?: string; email?: string; password?: string; confirmPassword?: string } = {}
    
    // Validate name - matches backend: min 2, max 100 characters
    if (!name) {
      errs.name = 'Name is required'
    } else if (name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters'
    } else if (name.trim().length > 100) {
      errs.name = 'Name cannot exceed 100 characters'
    }
    
    // Validate email - matches backend validation
    if (!email) {
      errs.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Invalid email address'
    }
    
    // Validate password - matches backend: min 8 chars, 1 lowercase, 1 uppercase, 1 number
    if (!password) {
      errs.password = 'Password is required'
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])/.test(password)) {
      errs.password = 'Password must contain at least one lowercase letter'
    } else if (!/(?=.*[A-Z])/.test(password)) {
      errs.password = 'Password must contain at least one uppercase letter'
    } else if (!/(?=.*\d)/.test(password)) {
      errs.password = 'Password must contain at least one number'
    }
    
    // Validate confirm password - matches backend refine check
    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords don't match"
    }
    
    // Check terms agreement
    if (!agreeToTerms) {
      setError('You must agree to the Terms of Service & Privacy Policy to continue')
      return
    }

    if (Object.keys(errs).length) {
      setFieldErrors(errs)
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, confirmPassword, name })
      })

      const data = await response.json()
      
      if (!response.ok) {
        // Handle specific backend error responses
        let errorMessage = 'Registration failed. Please try again.'
        
        if (response.status === 400) {
          // Validation failed - show backend validation errors
          if (data.errors && Array.isArray(data.errors)) {
            // Map backend validation errors to field errors
            const backendErrors: { name?: string; email?: string; password?: string; confirmPassword?: string } = {}
            data.errors.forEach((err: any) => {
              const field = err.path?.[0] || err.field
              if (field === 'email') backendErrors.email = err.message
              else if (field === 'password') backendErrors.password = err.message
              else if (field === 'name') backendErrors.name = err.message
              else if (field === 'confirmPassword') backendErrors.confirmPassword = err.message
            })
            if (Object.keys(backendErrors).length > 0) {
              setFieldErrors(backendErrors)
              setLoading(false)
              return
            }
          }
          errorMessage = data.message || 'Validation failed. Please check your information.'
        } else if (response.status === 409) {
          // User already exists (CommonErrors.userExists)
          errorMessage = data.message || 'An account with this email already exists. Please sign in instead.'
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again later.'
        } else if (data.message) {
          errorMessage = data.message
        }
        
        setError(errorMessage)
        setLoading(false)
        return
      }

      // Auto sign in after successful registration
      const signInRes = await signIn('credentials', {
        redirect: false,
        email,
        password
      })

      if (signInRes?.error) {
        setError('Account created successfully! Please sign in to continue.')
        setLoading(false)
        // Redirect to sign in page after a delay
        setTimeout(() => router.push('/signin'), 2000)
        return
      }

      // Success - redirect to personal-info
      router.push('/personal-info')
    } catch (err) {
      console.error('Registration error', err)
      
      // Provide specific error messages based on error type
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error. Please check your internet connection and try again.')
      } else if (err instanceof Error) {
        setError(`Registration error: ${err.message}`)
      } else {
        setError('An unexpected error occurred during registration. Please try again.')
      }
      setLoading(false)
    }
  }

  const handleSignIn = () => {
    router.push('/signin')
  }

  const handleBackToHome = () => {
    router.push('/')
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-purple-500 via-blue-600 to-blue-500 sm:p-6">
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
        <div className="mb-6 text-center sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full shadow-lg sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-blue-600">
            <UserPlus className="w-8 h-8 text-white sm:w-10 sm:h-10" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800 sm:text-3xl">Create Account</h1>
          <p className="text-sm text-gray-600 sm:text-base">Join us on your mindfulness journey</p>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          {/* Name Field */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              <User className="inline w-4 h-4 mr-1" />
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 text-sm transition-all duration-200 border-2 border-gray-200 sm:p-4 rounded-xl bg-gray-50 sm:text-base focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-lg"
            />
            {fieldErrors.name && (
              <div className="flex items-center gap-1 mt-1 text-xs text-red-500 sm:text-sm">
                <span>⚠️</span> {fieldErrors.name}
              </div>
            )}
          </div>

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
              className="w-full p-3 text-sm transition-all duration-200 border-2 border-gray-200 sm:p-4 rounded-xl bg-gray-50 sm:text-base focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-lg"
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
                placeholder="Create a password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 pr-12 text-sm transition-all duration-200 border-2 border-gray-200 sm:p-4 sm:pr-12 rounded-xl bg-gray-50 sm:text-base focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-lg"
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

          {/* Confirm Password Field */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              <Shield className="inline w-4 h-4 mr-1" />
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 pr-12 text-sm transition-all duration-200 border-2 border-gray-200 sm:p-4 sm:pr-12 rounded-xl bg-gray-50 sm:text-base focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-lg"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute text-gray-500 transition-colors transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-700 focus:outline-none"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <div className="flex items-center gap-1 mt-1 text-xs text-red-500 sm:text-sm">
                <span>⚠️</span> {fieldErrors.confirmPassword}
              </div>
            )}
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start mt-5 mb-4 text-xs sm:mt-6 sm:mb-5 sm:text-sm">
          <input
            type="checkbox"
            id="agreeTerms"
            checked={agreeToTerms}
            onChange={(e) => setAgreeToTerms(e.target.checked)}
            className="mr-2 sm:mr-3 w-4 h-4 sm:w-5 sm:h-5 mt-0.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <label htmlFor="agreeTerms" className="leading-relaxed text-gray-700 cursor-pointer">
            I agree to the{' '}
            <a
              href="/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault()
                sessionStorage.setItem('previousPage', '/signup')
                router.push('/terms-of-service')
              }}
              className="font-medium text-purple-600 underline hover:text-purple-700"
            >
              Terms of Service
            </a>
            {' '}&{' '}
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault()
                sessionStorage.setItem('previousPage', '/signup')
                router.push('/privacy-policy')
              }}
              className="font-medium text-purple-600 underline hover:text-purple-700"
            >
              Privacy Policy
            </a>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center justify-center gap-2 p-3 mb-5 text-sm text-center text-red-600 border border-red-200 bg-red-50 rounded-xl">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Sign Up Button */}
        <button
          onClick={handleSignUp}
          disabled={loading}
          className="w-full p-3 sm:p-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl text-sm sm:text-base font-semibold transition-all duration-200 hover:shadow-xl hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin"></div>
              CREATING ACCOUNT...
            </>
          ) : (
            <>
              CREATE ACCOUNT
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        {/* Sign In Link */}
        <div className="mt-6 text-xs text-center text-gray-600 sm:text-sm">
          Already have an account?{' '}
          <button 
            onClick={handleSignIn}
            className="font-semibold text-purple-600 cursor-pointer hover:text-purple-700 hover:underline">
            Sign In
          </button>
        </div>
      </div>
    </div>
  )
}