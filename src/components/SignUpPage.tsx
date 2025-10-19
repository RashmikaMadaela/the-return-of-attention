'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { UserPlus, Mail, Lock, User, ArrowRight, Shield } from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({})
  const [loading, setLoading] = useState(false)

  const handleSignUp = async () => {
    setError('')
    setFieldErrors({})

    const errs: { name?: string; email?: string; password?: string; confirmPassword?: string } = {}
    if (!name) errs.name = 'Name is required'
    if (!email) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email'
    if (!password) errs.password = 'Password is required'
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password'
    else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match'
    if (!agreeToTerms) {
      setError('Please agree to the Terms of Service & Privacy Policy')
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
        setError(data?.message || 'Registration failed')
        setLoading(false)
        return
      }

      // Auto sign in after successful registration using NextAuth credentials
      const signInRes = await signIn('credentials', {
        redirect: false,
        email,
        password
      })

      if (signInRes && (signInRes as any).error) {
        // signIn may return an object with an `error` property
        setError((signInRes as any).error || 'Sign in failed after registration')
        setLoading(false)
        return
      }

      // Redirect to personal-info to collect profile
      router.push('/personal-info')
    } catch (err) {
      console.error('Registration error', err)
      setError('Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = () => {
    router.push('/signin')
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-purple-500 via-blue-600 to-blue-500 sm:p-6">
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
            <input
              type="password"
              placeholder="Create a password (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 text-sm transition-all duration-200 border-2 border-gray-200 sm:p-4 rounded-xl bg-gray-50 sm:text-base focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-lg"
            />
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
            <input
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 text-sm transition-all duration-200 border-2 border-gray-200 sm:p-4 rounded-xl bg-gray-50 sm:text-base focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-lg"
            />
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
            I agree to the <span className="font-medium text-purple-600">Terms of Service</span> & <span className="font-medium text-purple-600">Privacy Policy</span>
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