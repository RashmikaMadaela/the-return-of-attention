'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

type RequestState = 'idle' | 'submitting' | 'success' | 'error'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [state, setState] = useState<RequestState>('idle')

  const isTokenFlow = Boolean(token)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState('submitting')
    setMessage('')

    try {
      const payload = isTokenFlow
        ? { token, password, confirmPassword }
        : { email }

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        setState('error')
        setMessage(data.error || 'Unable to complete the password reset request.')
        return
      }

      setState('success')
      setMessage(data.message || 'Password reset request completed successfully.')
      if (isTokenFlow) {
        setPassword('')
        setConfirmPassword('')
      } else {
        setEmail('')
      }
    } catch (error) {
      console.error('Password reset request failed:', error)
      setState('error')
      setMessage('A network error prevented the request from completing.')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-amber-100 p-6">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            {isTokenFlow ? 'Choose a new password' : 'Reset your password'}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {isTokenFlow
              ? 'Enter a new password for your account.'
              : 'Enter your account email and we will send you a reset link.'}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isTokenFlow && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                placeholder="you@example.com"
              />
            </div>
          )}

          {isTokenFlow && (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">
                  New password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                  placeholder="Minimum 8 characters"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="confirmPassword">
                  Confirm new password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                  placeholder="Repeat the new password"
                />
              </div>
            </>
          )}

          {message && (
            <div className={`rounded-xl border px-4 py-3 text-sm ${state === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={state === 'submitting'}
            className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {state === 'submitting'
              ? 'Submitting...'
              : isTokenFlow
                ? 'Update password'
                : 'Send reset link'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          <Link href="/signin" className="font-medium text-slate-900 underline underline-offset-4">
            Back to sign in
          </Link>
        </div>
      </div>
    </main>
  )
}