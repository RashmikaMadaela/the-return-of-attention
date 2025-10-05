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

      {/* Right Side - Sign Up Form */}
      <div className="flex-1 bg-white flex flex-col items-center justify-center px-16">
        <div className="w-full max-w-[400px]">
          {/* Create Account Title */}
          <h1 className="text-[36px] font-normal text-black text-center mb-12 font-arimo">
            Create Account
          </h1>

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

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="relative">
              <div className="w-[6px] h-[52px] bg-[#AB77FF]/60 absolute left-0 top-0"></div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
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
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full h-[52px] bg-[#ECECEC] pl-8 pr-4 text-[26px] font-arimo placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-[#AB77FF]"
              />
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <div className="w-[6px] h-[52px] bg-[#AB77FF]/60 absolute left-0 top-0"></div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full h-[52px] bg-[#ECECEC] pl-8 pr-4 text-[26px] font-arimo placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-[#AB77FF]"
              />
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center mt-8 mb-4">
              <div className="relative">
                <input
                  type="checkbox"
                  id="terms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="w-[15px] h-[15px] bg-white border border-gray-300 shadow-inner appearance-none checked:bg-[#24A0ED] checked:border-[#24A0ED] focus:outline-none"
                />
                {formData.agreeToTerms && (
                  <svg className="absolute top-0 left-0 w-[15px] h-[15px] text-white pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <label htmlFor="terms" className="ml-3 text-[15px] font-normal text-black font-arimo">
                I agree to the Terms of Service & Privacy Policy
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm mb-4 text-center">
                {error}
              </div>
            )}

            {/* Success Message */}
            {result && (
              <div className="text-green-500 text-sm mb-4 text-center">
                {result.message}
              </div>
            )}

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-[211px] h-[48px] bg-[#24A0ED] text-white text-[26px] font-normal font-arimo rounded-[25px] mx-auto block mb-8 shadow-lg transition-all duration-300 hover:bg-[#1e8bc3] hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'CREATING...' : 'SIGN UP'}
            </button>
          </form>

          {/* Or sign up with */}
          <p className="text-[16px] font-normal text-black text-center mb-4 font-arimo">
            Or sign up with
          </p>

          {/* Google Sign Up Button */}
          <button 
            onClick={() => signIn('google', { callbackUrl: '/personal-info' })}
            className="w-full h-[47px] bg-[#FCF8F8] border border-gray-200 rounded flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-[41px] h-[39px] mr-4 bg-cover bg-center" 
                 style={{ backgroundImage: "url('/images/google-logo.png')" }}></div>
            <span className="text-[20px] font-normal text-black font-arimo">Continue with Google</span>
          </button>

          {/* Sign In Link */}
          <div className="text-center mt-8">
            <span className="text-[15px] font-normal text-black font-arimo">
              Already have an account ?{' '}
            </span>
            <Link 
              href="/signin"
              className="text-[15px] font-normal text-[#24A0ED] font-arimo hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}