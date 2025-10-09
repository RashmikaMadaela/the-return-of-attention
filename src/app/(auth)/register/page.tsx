'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!formData.agreeToTerms) {
      setError('You must agree to the Terms of Service')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        }),
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        setResult(data)
        setFormData({ name: '', email: '', password: '', confirmPassword: '', agreeToTerms: false })
        
        // Auto-signin after successful registration
        const signInResult = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })
        
        if (signInResult?.ok) {
          // Auto-redirect to personal info after successful signin
          setTimeout(() => {
            router.push('/personal-info')
          }, 2000)
        } else {
          setError('Registration successful but auto-signin failed. Please sign in manually.')
        }
      } else {
        setError(data.message || 'Registration failed')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="flex min-h-screen">
        {/* Left Side - Welcome Content */}
        <div className="relative hidden overflow-hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-12 xl:px-20 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-indigo-600/10 to-purple-700/20"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}></div>
          
          {/* Back to Landing Button */}
          <div className="absolute z-10 top-6 left-6">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 text-sm font-medium transition-all duration-200 border rounded-lg text-white/90 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 hover:text-white"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
          </div>
          
          <div className="relative z-10 max-w-xl">
            {/* Brand Badge */}
            <div className="inline-flex items-center px-4 py-2 mb-8 text-sm font-medium text-white border rounded-full bg-white/20 backdrop-blur-sm border-white/30">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Begin Your Mindfulness Journey
            </div>
            
            <div className="mb-12">
              <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-white">
                Transform Your
                <span className="block text-indigo-100">Inner World</span>
              </h1>
              <p className="text-xl leading-relaxed text-indigo-100">
                Join thousands discovering the power of mindful attention through our scientifically-backed 6-stage progressive system.
              </p>
            </div>
            
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl">
                    <span className="text-lg font-bold text-white">1</span>
                  </div>
                </div>
                <div className="pt-1">
                  <h3 className="mb-2 text-lg font-semibold text-white">Physical Stillness</h3>
                  <p className="text-indigo-100">Master the foundation of meditation through mindful body awareness and breath control</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl">
                    <span className="text-lg font-bold text-white">2</span>
                  </div>
                </div>
                <div className="pt-1">
                  <h3 className="mb-2 text-lg font-semibold text-white">Thought Patterns</h3>
                  <p className="text-indigo-100">Understand and skillfully observe your mental activities without judgment</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl">
                    <span className="text-lg font-bold text-white">3</span>
                  </div>
                </div>
                <div className="pt-1">
                  <h3 className="mb-2 text-lg font-semibold text-white">PAHM Matrix</h3>
                  <p className="text-indigo-100">Interactive attention tracking across Past, Present, and Future states of mind</p>
                </div>
              </div>
            </div>
            

          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="flex flex-col justify-center flex-1 px-6 py-12 lg:px-8 xl:px-12">
          <div className="w-full max-w-lg mx-auto">
            {/* Mobile Back Button */}
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <Link
                href="/"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 transition-all duration-200 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Link>
              <div className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-full">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Begin Your Journey
              </div>
            </div>
            
            <div className="mb-8 text-center lg:text-left">
              <h2 className="mb-3 text-3xl font-bold tracking-tight text-gray-900">
                Create Account
              </h2>
              <p className="text-lg text-gray-600">
                Start your mindfulness transformation today
              </p>
            </div>

            {result && (
              <div className="p-6 mb-6 border border-green-200 shadow-sm rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                      <svg className="w-5 h-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="mb-1 text-base font-semibold text-green-800">
                      Welcome aboard! 🎉
                    </h3>
                    <p className="mb-2 text-sm text-green-700">
                      {result.message}
                    </p>
                    <p className="mb-4 text-sm text-green-600">
                      Redirecting to personal information page in 2 seconds...
                    </p>
                    <div className="space-y-2">
                      <Link
                        href="/personal-info"
                        className="inline-flex items-center text-sm font-semibold text-green-800 transition-colors hover:text-green-600"
                      >
                        Continue Now
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-6 mb-6 border border-red-200 shadow-sm rounded-2xl bg-gradient-to-r from-red-50 to-pink-50">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                      <svg className="w-5 h-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-8 border shadow-xl bg-white/70 backdrop-blur-lg rounded-3xl border-white/20">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block mb-2 text-sm font-semibold text-gray-900">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full px-4 py-3.5 text-gray-900 bg-white border border-gray-200 rounded-xl shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 sm:text-sm"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block mb-2 text-sm font-semibold text-gray-900">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full px-4 py-3.5 text-gray-900 bg-white border border-gray-200 rounded-xl shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 sm:text-sm"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block mb-2 text-sm font-semibold text-gray-900">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full px-4 py-3.5 text-gray-900 bg-white border border-gray-200 rounded-xl shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 sm:text-sm"
                    placeholder="Create a strong password"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block mb-2 text-sm font-semibold text-gray-900">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full px-4 py-3.5 text-gray-900 bg-white border border-gray-200 rounded-xl shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 sm:text-sm"
                    placeholder="Confirm your password"
                  />
                </div>

                <div className="flex items-start">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className="w-5 h-5 mt-0.5 text-indigo-600 border-gray-300 rounded-lg focus:ring-indigo-500 focus:ring-2"
                  />
                  <label htmlFor="agreeToTerms" className="ml-3 text-sm leading-6 text-gray-700">
                    I agree to the{' '}
                    <a href="/terms" className="font-semibold text-indigo-600 transition-colors hover:text-indigo-500">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="font-semibold text-indigo-600 transition-colors hover:text-indigo-500">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center px-4 py-4 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl shadow-lg hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <svg className="w-5 h-5 mr-3 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm font-medium leading-6">
                  <span className="px-6 text-gray-600 bg-gradient-to-br from-indigo-50 via-white to-purple-50">Already have an account?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/signin"
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-gray-700 transition-all duration-200 bg-white border border-gray-200 shadow-sm rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-500/10"
                >
                  Sign In Instead
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}