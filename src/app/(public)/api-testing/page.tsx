'use client'

import { useState } from 'react'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

const API_ENDPOINTS = [
  { method: 'POST' as HttpMethod, path: '/api/auth/register', description: 'Register new user' },
  { method: 'POST' as HttpMethod, path: '/api/auth/reset-password', description: 'Reset password' },
  { method: 'GET' as HttpMethod, path: '/api/user/profile', description: 'Get user profile' },
  { method: 'PUT' as HttpMethod, path: '/api/user/profile', description: 'Update user profile' },
  { method: 'GET' as HttpMethod, path: '/api/user/personal-info', description: 'Get personal info' },
  { method: 'POST' as HttpMethod, path: '/api/user/personal-info', description: 'Create personal info' },
  { method: 'PUT' as HttpMethod, path: '/api/user/personal-info', description: 'Update personal info' },
  { method: 'GET' as HttpMethod, path: '/api/user/preferences', description: 'Get preferences' },
  { method: 'PUT' as HttpMethod, path: '/api/user/preferences', description: 'Update preferences' },
  { method: 'PUT' as HttpMethod, path: '/api/user/change-password', description: 'Change password' },
  { method: 'DELETE' as HttpMethod, path: '/api/user/delete-account', description: 'Delete account' },
]

const SAMPLE_PAYLOADS = {
  '/api/auth/register': {
    name: 'Test User',
    email: 'test@example.com',
    password: 'TestPassword123!',
    confirmPassword: 'TestPassword123!'
  },
  '/api/auth/reset-password': {
    email: 'test@example.com'
  },
  '/api/user/profile': {
    name: 'Updated User',
    image: 'https://example.com/avatar.jpg'
  },
  '/api/user/personal-info': {
    age: 30,
    gender: 'prefer_not_to_say',
    nationality: 'Test Nation',
    country: 'Test Country'
  },
  '/api/user/preferences': {
    emailNotifications: false,
    theme: 'dark',
    language: 'es'
  },
  '/api/user/change-password': {
    currentPassword: 'TestPassword123!',
    newPassword: 'NewPassword456!',
    confirmPassword: 'NewPassword456!'
  },
  '/api/user/delete-account': {
    password: 'TestPassword123!',
    confirmation: 'DELETE',
    reason: 'Testing account deletion API'
  }
}

export default function ApiTestingPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(API_ENDPOINTS[0])
  const [requestBody, setRequestBody] = useState('')
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [responseStatus, setResponseStatus] = useState<number | null>(null)

  const handleEndpointChange = (endpoint: typeof API_ENDPOINTS[0]) => {
    setSelectedEndpoint(endpoint)
    setResponse(null)
    setResponseStatus(null)
    
    // Set sample payload if available
    const samplePayload = SAMPLE_PAYLOADS[endpoint.path as keyof typeof SAMPLE_PAYLOADS]
    if (samplePayload && ['POST', 'PUT', 'DELETE'].includes(endpoint.method)) {
      setRequestBody(JSON.stringify(samplePayload, null, 2))
    } else {
      setRequestBody('')
    }
  }

  const makeRequest = async () => {
    setLoading(true)
    setResponse(null)
    setResponseStatus(null)

    try {
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      }

      if (['POST', 'PUT', 'DELETE'].includes(selectedEndpoint.method) && requestBody.trim()) {
        options.body = requestBody
      }

      const res = await fetch(selectedEndpoint.path, options)
      const data = await res.json()
      
      setResponseStatus(res.status)
      setResponse(data)
    } catch (error) {
      setResponseStatus(0)
      setResponse({ error: 'Network error occurred', details: error })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: number | null) => {
    if (status === null) return 'text-gray-500'
    if (status >= 200 && status < 300) return 'text-green-600'
    if (status >= 400 && status < 500) return 'text-orange-600'
    if (status >= 500) return 'text-red-600'
    return 'text-gray-500'
  }

  const getMethodColor = (method: HttpMethod) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800'
      case 'POST': return 'bg-green-100 text-green-800'
      case 'PUT': return 'bg-yellow-100 text-yellow-800'
      case 'DELETE': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-800 text-white">
            <h1 className="text-2xl font-bold">API Testing Interface</h1>
            <p className="text-gray-300 mt-1">Test all authentication and user management APIs</p>
          </div>

          <div className="p-6">
            {/* Endpoint Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select API Endpoint
              </label>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {API_ENDPOINTS.map((endpoint, index) => (
                  <button
                    key={index}
                    onClick={() => handleEndpointChange(endpoint)}
                    className={`p-3 text-left rounded-lg border-2 transition-colors ${
                      selectedEndpoint === endpoint
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                        {endpoint.method}
                      </span>
                    </div>
                    <div className="text-sm font-mono text-gray-600 mb-1">
                      {endpoint.path}
                    </div>
                    <div className="text-xs text-gray-500">
                      {endpoint.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Request Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Request</h2>
                
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-3 py-1 rounded text-sm font-medium ${getMethodColor(selectedEndpoint.method)}`}>
                      {selectedEndpoint.method}
                    </span>
                    <span className="font-mono text-sm text-gray-600">
                      {selectedEndpoint.path}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{selectedEndpoint.description}</p>
                </div>

                {['POST', 'PUT', 'DELETE'].includes(selectedEndpoint.method) && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Request Body (JSON)
                      {selectedEndpoint.method === 'DELETE' && (
                        <span className="text-xs text-gray-500 ml-1">(Required for account deletion)</span>
                      )}
                    </label>
                    <textarea
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      rows={12}
                      className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter JSON request body..."
                    />
                  </div>
                )}

                <button
                  onClick={makeRequest}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Sending Request...' : 'Send Request'}
                </button>
              </div>

              {/* Response Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Response</h2>
                  {responseStatus !== null && (
                    <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(responseStatus)} bg-gray-100`}>
                      Status: {responseStatus}
                    </span>
                  )}
                </div>

                <div className="min-h-[400px] p-4 bg-gray-900 rounded-md overflow-auto">
                  {response ? (
                    <pre className="text-green-400 text-sm whitespace-pre-wrap font-mono">
                      {JSON.stringify(response, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-gray-500 text-sm">
                      No response yet. Send a request to see the response here.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Usage Notes */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">📝 Usage Notes</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Authentication required for all /api/user/* endpoints</li>
                <li>• Sign in first to get a session, then test user management APIs</li>
                <li>• Check browser dev tools Network tab for additional debugging info</li>
                <li>• Sample payloads are pre-filled for POST/PUT requests</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}