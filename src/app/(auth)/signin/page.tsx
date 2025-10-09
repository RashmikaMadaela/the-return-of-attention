'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function SignInPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | React.ReactNode>('')
  const [rememberMe, setRememberMe] = useState(false)

  // Handle redirect after successful authentication
  useEffect(() => {
    if (session && status === 'authenticated') {
      const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
      router.push(callbackUrl)
    }
  }, [session, status, router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        callbackUrl,
        redirect: false,
      })

      if (result?.error) {
        if (result.error.includes('verify your email')) {
          setError(
            <div>
              {result.error}
              <br />
              <Link href="/resend-verification" className="text-indigo-600 underline hover:text-indigo-500">
                Resend verification email
              </Link>
            </div>
          )
        } else {
          setError(result.error)
        }
      } else if (result?.ok) {
        // Success - user will be redirected via useEffect
        setCredentials({ email: '', password: '' })
      }
    } catch (err) {
      setError('An error occurred during sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (session) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome Back!
            </h2>
            <p className="mt-2 text-gray-600">
              You're signed in as <span className="font-medium">{session.user?.email}</span>
            </p>
          </div>

          <div className="p-6 border shadow-lg bg-white/70 backdrop-blur-sm rounded-2xl border-white/20">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Ready to continue your journey?</h3>
            <div className="space-y-4">
              <Link
                href="/dashboard"
                className="flex justify-center w-full px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Go to Dashboard
              </Link>
              
              <button
                onClick={() => signOut()}
                className="flex justify-center w-full px-4 py-3 text-sm font-semibold text-gray-700 transition-colors duration-200 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    )
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Welcome Back to Your Journey
            </div>
            
            <div className="mb-12">
              <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-white">
                Continue Your
                <span className="block text-indigo-100">Mindful Path</span>
              </h1>
              <p className="text-xl leading-relaxed text-indigo-100">
                Welcome back! Access your personalized dashboard and continue your transformative journey through mindful attention practices.
              </p>
            </div>
            
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                  </div>
                </div>
                <div className="pt-1">
                  <h3 className="mb-2 text-lg font-semibold text-white">Track Your Progress</h3>
                  <p className="text-indigo-100">Monitor your journey through each meditation stage and celebrate your achievements</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                  </div>
                </div>
                <div className="pt-1">
                  <h3 className="mb-2 text-lg font-semibold text-white">Daily Check-ins</h3>
                  <p className="text-indigo-100">Record your emotional state and mindfulness insights with our simple tracking tools</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 shadow-lg bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
                </div>
                <div className="pt-1">
                  <h3 className="mb-2 text-lg font-semibold text-white">PAHM Matrix</h3>
                  <p className="text-indigo-100">Practice attention awareness with our interactive matrix and track your mental states</p>
                </div>
              </div>
            </div>
            

          </div>
        </div>

        {/* Right Side - Sign In Form */}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Welcome Back
              </div>
            </div>
            
            <div className="mb-8 text-center lg:text-left">
              <h2 className="mb-3 text-3xl font-bold tracking-tight text-gray-900">
                Sign In
              </h2>
              <p className="text-lg text-gray-600">
                Access your mindfulness dashboard
              </p>
            </div>

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
                    <div className="text-sm font-medium text-red-800">{error}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="p-8 border shadow-xl bg-white/70 backdrop-blur-lg rounded-3xl border-white/20">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block mb-2 text-sm font-semibold text-gray-900">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={credentials.email}
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
                    value={credentials.password}
                    onChange={handleChange}
                    className="block w-full px-4 py-3.5 text-gray-900 bg-white border border-gray-200 rounded-xl shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 sm:text-sm"
                    placeholder="Enter your password"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-5 h-5 text-indigo-600 border-gray-300 rounded-lg focus:ring-indigo-500 focus:ring-2"
                    />
                    <label htmlFor="remember-me" className="ml-3 text-sm font-medium text-gray-700">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link href="/reset-password" className="font-semibold text-indigo-600 transition-colors hover:text-indigo-500">
                      Forgot password?
                    </Link>
                  </div>
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
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
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
                  <span className="px-6 text-gray-600 bg-gradient-to-br from-indigo-50 via-white to-purple-50">New to our platform?</span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/register"
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-gray-700 transition-all duration-200 bg-white border border-gray-200 shadow-sm rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-500/10"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}