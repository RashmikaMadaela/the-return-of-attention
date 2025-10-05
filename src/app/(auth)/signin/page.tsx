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
    <div className="w-full h-screen flex">
      {/* Left Side - Welcome Section */}
      <div className="w-[650px] h-full bg-cover bg-center relative" 
           style={{ backgroundImage: "url('/images/meditation-background.jpg')" }}>
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-8">
          <h1 className="text-[48px] font-bold mb-4 text-center font-arimo">WELCOME</h1>
          <h2 className="text-[48px] font-bold mb-8 text-center font-arimo">The Return Of Attention</h2>
          
          {/* White divider line */}
          <div className="w-[543px] h-[9px] bg-white rounded-[26px] mb-12"></div>
          
          {/* Description text */}
          <div className="max-w-[507px] text-center">
            <p className="text-[27px] font-bold leading-[1.15] font-arimo">
              "You are not your thoughts"<br/>
              Practices for the Happiness that Stays<br/>
              A simple, practical guide to happiness that actually stays
            </p>
          </div>
          
          {/* Back to Landing Button */}
          <div className="absolute top-6 left-6">
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
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="flex-1 bg-white flex flex-col items-center justify-center px-16">
        <div className="w-full max-w-[400px]">
          {/* Sign In Title */}
          <h1 className="text-[36px] font-normal text-black text-center mb-12 font-arimo">
            Sign In
          </h1>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Email Field */}
            <div className="relative">
              <div className="w-[6px] h-[52px] bg-[#AB77FF]/60 absolute left-0 top-0"></div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={credentials.email}
                onChange={handleChange}
                required
                className="w-full h-[52px] bg-[#ECECEC] pl-8 pr-4 text-[26px] font-arimo placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-[#AB77FF]"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="w-[6px] h-[52px] bg-[#AB77FF]/60 absolute left-0 top-0"></div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={credentials.password}
                onChange={handleChange}
                required
                className="w-full h-[52px] bg-[#ECECEC] pl-8 pr-4 text-[26px] font-arimo placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-[#AB77FF]"
              />
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex justify-between items-center mt-6 mb-8">
            <div className="flex items-center">
              <div className="relative">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-[15px] h-[15px] bg-white border border-gray-300 shadow-inner appearance-none checked:bg-[#24A0ED] checked:border-[#24A0ED] focus:outline-none"
                />
                {rememberMe && (
                  <svg className="absolute top-0 left-0 w-[15px] h-[15px] text-white pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <label htmlFor="remember" className="ml-3 text-[15px] font-normal text-black font-arimo">
                Remember me
              </label>
            </div>
            <Link 
              href="/reset-password"
              className="text-[15px] font-normal text-[#24A0ED] font-arimo hover:underline">
              Forgot Password?
            </Link>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm mb-4 text-center">
              {error}
            </div>
          )}

          {/* Sign In Button */}
          <form onSubmit={handleSubmit}>
            <button
              type="submit"
              disabled={loading}
              className="w-[211px] h-[48px] bg-[#24A0ED] text-white text-[26px] font-normal font-arimo rounded-[25px] mx-auto block mb-8 shadow-lg transition-all duration-300 hover:bg-[#1e8bc3] hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>

          {/* Or sign in with */}
          <p className="text-[16px] font-normal text-black text-center mb-4 font-arimo">
            Or sign in with
          </p>

          {/* Google Sign In Button */}
          <button 
            onClick={() => signIn('google', { callbackUrl: searchParams.get('callbackUrl') || '/dashboard' })}
            className="w-full h-[47px] bg-[#FCF8F8] border border-gray-200 rounded flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-[41px] h-[39px] mr-4 bg-cover bg-center" 
                 style={{ backgroundImage: "url('/images/google-logo.png')" }}></div>
            <span className="text-[20px] font-normal text-black font-arimo">Continue with Google</span>
          </button>

          {/* Sign Up Link */}
          <div className="text-center mt-8">
            <span className="text-[15px] font-normal text-black font-arimo">
              Don't have an account ?{' '}
            </span>
            <Link 
              href="/register"
              className="text-[15px] font-normal text-[#24A0ED] font-arimo hover:underline">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}