'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [error, setError] = useState('')

  const handleSignUp = () => {
    setError('')
    
    // Validation
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match!')
      return
    }
    
    if (!agreeToTerms) {
      setError('Please agree to the Terms of Service & Privacy Policy')
      return
    }
    
    // If all validation passes, redirect to personal info page
    console.log('Sign up successful, redirecting to personal info page...')
    router.push('/personal-info')
  }

  const handleSignIn = () => {
    router.push('/signin')
  }

  const handleGoogleSignUp = () => {
    // TODO: Implement Google sign up
    console.log('Google Sign Up clicked')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-5">
      <div className="bg-white rounded-lg shadow-lg p-10 w-full max-w-md">
        <h1 className="text-center text-3xl mb-8 text-gray-800 font-medium">Create Account</h1>
        
        <div className="space-y-5">
          {/* Email Field */}
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 border-l-4 border-l-purple-600 rounded bg-gray-50/50 text-sm transition-colors focus:outline-none focus:border-l-purple-700"
            />
          </div>

          {/* Password Field */}
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 border-l-4 border-l-purple-600 rounded bg-gray-50/50 text-sm transition-colors focus:outline-none focus:border-l-purple-700"
            />
          </div>

          {/* Confirm Password Field */}
          <div>
            <input
              type="password"
              placeholder="re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 border-l-4 border-l-purple-600 rounded bg-gray-50/50 text-sm transition-colors focus:outline-none focus:border-l-purple-700"
            />
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start mt-6 mb-5 text-xs">
          <input
            type="checkbox"
            id="agreeTerms"
            checked={agreeToTerms}
            onChange={(e) => setAgreeToTerms(e.target.checked)}
            className="mr-2 w-4 h-4 mt-0.5"
          />
          <label htmlFor="agreeTerms" className="leading-relaxed cursor-pointer">
            I agree to the Terms of Service & Privacy Policy
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm mb-5 text-center bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {/* Sign Up Button */}
        <button
          onClick={handleSignUp}
          className="w-full p-3 bg-blue-500 text-white rounded-full text-sm font-semibold transition-colors hover:bg-blue-600 mb-5"
        >
          SIGN UP
        </button>

        {/* Divider */}
        <div className="text-center my-5 text-gray-500 text-xs relative">
          <span className="bg-white px-4">Or sign up with</span>
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
        </div>

        {/* Google Sign Up Button */}
        <button 
          onClick={handleGoogleSignUp}
          className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm flex items-center justify-center gap-3 transition-colors hover:bg-gray-50 mb-5"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Sign In Link */}
        <div className="text-center text-xs text-gray-600">
          Already have an account?{' '}
          <button 
            onClick={handleSignIn}
            className="text-blue-500 font-medium hover:underline cursor-pointer">
            Sign in
          </button>
        </div>
      </div>
    </div>
  )
}