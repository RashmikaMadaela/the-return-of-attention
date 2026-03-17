'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

type VerificationState = 'loading' | 'success' | 'error'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const [state, setState] = useState<VerificationState>('loading')
  const [message, setMessage] = useState('Verifying your email address...')

  useEffect(() => {
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      setState('error')
      setMessage('The verification link is incomplete or invalid.')
      return
    }

    async function verifyEmail() {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email })
        })

        const data = await response.json()

        if (!response.ok) {
          setState('error')
          setMessage(data.error || 'Unable to verify your email address.')
          return
        }

        setState('success')
        setMessage(data.message || 'Your email has been verified. You can sign in now.')
      } catch (error) {
        console.error('Email verification failed:', error)
        setState('error')
        setMessage('A network error prevented email verification. Please try again.')
      }
    }

    void verifyEmail()
  }, [searchParams])

  const isSuccess = state === 'success'

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-white to-emerald-100 p-6">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
        <div className="mb-6 text-center">
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl ${isSuccess ? 'bg-emerald-100 text-emerald-700' : state === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
            {isSuccess ? '✓' : state === 'error' ? '!' : '…'}
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Email Verification</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
        </div>

        <div className="flex justify-center">
          <Link
            href={isSuccess ? '/signin?verified=true' : '/signin'}
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    </main>
  )
}