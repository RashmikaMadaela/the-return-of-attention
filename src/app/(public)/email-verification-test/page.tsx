'use client'

import { useState } from 'react'

export default function EmailVerificationTestPage() {
  const [testEmail, setTestEmail] = useState('test-verification@example.com')
  const [step, setStep] = useState(1)
  const [registrationResult, setRegistrationResult] = useState<any>(null)
  const [verificationStatus, setVerificationStatus] = useState<string>('')

  const steps = [
    {
      title: "Register New Account",
      description: "Create a new account that requires email verification"
    },
    {
      title: "Check Console for Verification Link",
      description: "Since Resend might not be configured, check the terminal console"
    },
    {
      title: "Click Verification Link",
      description: "Open the verification URL to verify the email"
    },
    {
      title: "Sign In",
      description: "Sign in with the verified account"
    }
  ]

  const registerTestAccount = async () => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Email Test User',
          email: testEmail,
          password: 'TestPassword123!',
          confirmPassword: 'TestPassword123!'
        })
      })

      const data = await response.json()
      setRegistrationResult(data)
      
      if (response.ok) {
        setStep(2)
        setVerificationStatus('Registration successful! Check console for verification link.')
      }
    } catch (error) {
      setVerificationStatus('Registration failed: ' + error)
    }
  }

  const testResendVerification = async () => {
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail })
      })

      const data = await response.json()
      setVerificationStatus(data.message || 'Resend request sent')
    } catch (error) {
      setVerificationStatus('Resend failed: ' + error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-indigo-800 text-white">
            <h1 className="text-2xl font-bold">Email Verification Testing</h1>
            <p className="text-indigo-200 mt-1">Complete email verification workflow testing</p>
          </div>

          <div className="p-6">
            {/* Step Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {steps.map((stepInfo, index) => (
                  <div
                    key={index}
                    className={`flex-1 ${index < steps.length - 1 ? 'pr-4' : ''}`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          step > index + 1
                            ? 'bg-green-500 text-white'
                            : step === index + 1
                            ? 'bg-indigo-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        {step > index + 1 ? '✓' : index + 1}
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`flex-1 h-1 ml-4 ${
                            step > index + 1 ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        />
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-900">{stepInfo.title}</p>
                      <p className="text-xs text-gray-500">{stepInfo.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Step Content */}
            <div className="space-y-6">
              {step === 1 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-blue-900 mb-4">Step 1: Register Test Account</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Test Email Address
                      </label>
                      <input
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter test email"
                      />
                    </div>
                    
                    <button
                      onClick={registerTestAccount}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Register Test Account
                    </button>
                  </div>

                  {registrationResult && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                      <h3 className="font-medium text-gray-900 mb-2">Registration Result:</h3>
                      <pre className="text-sm text-gray-600 overflow-auto">
                        {JSON.stringify(registrationResult, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-yellow-900 mb-4">Step 2: Get Verification Link</h2>
                  
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded border">
                      <h3 className="font-medium text-gray-900 mb-2">🖥️ Check Terminal Console</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Look for output like this in your terminal:
                      </p>
                      <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                        === EMAIL VERIFICATION ===<br/>
                        To: {testEmail}<br/>
                        URL: http://localhost:3000/verify-email?token=...&email=...<br/>
                        ===============================
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded border">
                      <h3 className="font-medium text-gray-900 mb-2">📧 Or Configure Resend (Optional)</h3>
                      <p className="text-sm text-gray-600">
                        Add RESEND_API_KEY to your .env file to send real emails.
                      </p>
                    </div>

                    <div className="flex space-x-4">
                      <button
                        onClick={() => setStep(3)}
                        className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                      >
                        I Found the Link → Next Step
                      </button>
                      
                      <button
                        onClick={testResendVerification}
                        className="bg-yellow-600 text-white px-6 py-2 rounded-md hover:bg-yellow-700 transition-colors"
                      >
                        Resend Verification Email
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-green-900 mb-4">Step 3: Verify Email</h2>
                  
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      Copy the verification URL from the terminal and open it in a new tab, or click the button below to simulate the verification process.
                    </p>

                    <div className="bg-white p-4 rounded border">
                      <h3 className="font-medium text-gray-900 mb-2">Manual Verification Test</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Enter the verification token and email to test the verification endpoint directly:
                      </p>
                      
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Verification token (from URL)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm">
                          Test Verification
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => setStep(4)}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Email Verified → Next Step
                    </button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-indigo-900 mb-4">Step 4: Sign In</h2>
                  
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      Now try signing in with your verified account:
                    </p>

                    <div className="bg-white p-4 rounded border">
                      <h3 className="font-medium text-gray-900 mb-2">Test Credentials</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Email:</strong> {testEmail}</p>
                        <p><strong>Password:</strong> TestPassword123!</p>
                      </div>
                    </div>

                    <div className="space-x-4">
                      <a
                        href="/signin"
                        className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        Go to Sign In Page
                      </a>
                      
                      <button
                        onClick={() => setStep(1)}
                        className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
                      >
                        Start Over
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Messages */}
              {verificationStatus && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-sm text-blue-700">{verificationStatus}</p>
                </div>
              )}
            </div>

            {/* API Endpoints Reference */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Email Verification API Endpoints</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">POST /api/auth/register</h4>
                  <p className="text-sm text-gray-600">Creates account and sends verification email</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">POST /api/auth/resend-verification</h4>
                  <p className="text-sm text-gray-600">Resends verification email</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">GET /verify-email?token=...&email=...</h4>
                  <p className="text-sm text-gray-600">Verifies email via link click</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">POST /api/auth/verify-email</h4>
                  <p className="text-sm text-gray-600">Verifies email via API call</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}