'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    setError('')
    setFieldErrors({})

    const errs: { email?: string; password?: string } = {}
    if (!email) errs.email = 'Email is required'
    // basic email format
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email'
    if (!password) errs.password = 'Password is required'

    if (Object.keys(errs).length) {
      setFieldErrors(errs)
      return
    }

    setLoading(true)
    try {
      const res = await signIn('credentials', { redirect: false, email, password })
      // res can be undefined if provider not found
      if (!res) {
        setError('Sign in failed')
        setLoading(false)
        return
      }

      // NextAuth sets res.error when credentials invalid
      // Narrow by checking 'error' property exists on the returned value
      if ((res as unknown) && typeof (res as any).error === 'string') {
        setError((res as any).error || 'Invalid credentials')
        setLoading(false)
        return
      }

      // Success
      router.push('/home')
    } catch (err) {
      console.error('Sign in error', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = () => {
    router.push('/signup')
  }

  const handleForgotPassword = () => {
    sessionStorage.setItem('previousPage', '/signin')
    router.push('/password-change')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex justify-center items-center p-4 sm:p-6">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
            <LogIn className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-sm sm:text-base text-gray-600">Sign in to continue your journey</p>
        </div>
        
        <div className="space-y-4 sm:space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl bg-gray-50 text-sm sm:text-base transition-all duration-200 focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-lg"
            />
            {fieldErrors.email && (
              <div className="text-xs sm:text-sm text-red-500 mt-1 flex items-center gap-1">
                <span>⚠️</span> {fieldErrors.email}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-1" />
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl bg-gray-50 text-sm sm:text-base transition-all duration-200 focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-lg"
            />
            {fieldErrors.password && (
              <div className="text-xs sm:text-sm text-red-500 mt-1 flex items-center gap-1">
                <span>⚠️</span> {fieldErrors.password}
              </div>
            )}
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 my-5">
          <div className="flex items-center text-xs sm:text-sm">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="mr-2 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="rememberMe" className="text-gray-700 cursor-pointer">Remember me</label>
          </div>
          <button 
            onClick={handleForgotPassword}
            className="text-blue-600 text-xs sm:text-sm font-medium hover:text-blue-700 hover:underline text-left sm:text-right">
            Forgot Password?
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-600 text-sm mb-5 text-center bg-red-50 p-3 rounded-xl border border-red-200 flex items-center justify-center gap-2">
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
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
        <div className="text-center text-xs sm:text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <button 
            onClick={handleSignUp}
            className="text-blue-600 font-semibold hover:text-blue-700 hover:underline cursor-pointer">
            Sign Up
          </button>
        </div>
      </div>
    </div>
  )
}