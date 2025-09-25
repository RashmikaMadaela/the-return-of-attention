'use client'

import { useState } from 'react'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

const API_ENDPOINTS = [
  // Authentication APIs
  { method: 'POST' as HttpMethod, path: '/api/auth/register', description: 'Register new user', category: 'Auth' },
  { method: 'POST' as HttpMethod, path: '/api/auth/reset-password', description: 'Reset password', category: 'Auth' },
  
  // User Management APIs
  { method: 'GET' as HttpMethod, path: '/api/user/profile', description: 'Get user profile', category: 'User' },
  { method: 'PUT' as HttpMethod, path: '/api/user/profile', description: 'Update user profile', category: 'User' },
  { method: 'GET' as HttpMethod, path: '/api/user/personal-info', description: 'Get personal info', category: 'User' },
  { method: 'POST' as HttpMethod, path: '/api/user/personal-info', description: 'Create personal info', category: 'User' },
  { method: 'PUT' as HttpMethod, path: '/api/user/personal-info', description: 'Update personal info', category: 'User' },
  { method: 'GET' as HttpMethod, path: '/api/user/preferences', description: 'Get preferences', category: 'User' },
  { method: 'PUT' as HttpMethod, path: '/api/user/preferences', description: 'Update preferences', category: 'User' },
  { method: 'PUT' as HttpMethod, path: '/api/user/change-password', description: 'Change password', category: 'User' },
  { method: 'DELETE' as HttpMethod, path: '/api/user/delete-account', description: 'Delete account', category: 'User' },
  
  // Assessment APIs
  { method: 'POST' as HttpMethod, path: '/api/assessment/questionnaire', description: 'Submit questionnaire (27 questions)', category: 'Assessment' },
  { method: 'GET' as HttpMethod, path: '/api/assessment/questionnaire', description: 'Get questionnaire results', category: 'Assessment' },
  { method: 'POST' as HttpMethod, path: '/api/assessment/self-assessment', description: 'Submit self assessment (6 categories)', category: 'Assessment' },
  { method: 'GET' as HttpMethod, path: '/api/assessment/self-assessment', description: 'Get self assessment results', category: 'Assessment' },
  { method: 'GET' as HttpMethod, path: '/api/assessment/results', description: 'Get comprehensive assessment results', category: 'Assessment' },
  { method: 'DELETE' as HttpMethod, path: '/api/assessment/reset', description: 'Reset assessments (testing only)', category: 'Assessment' },
  
  // Happiness Tracking APIs
  { method: 'POST' as HttpMethod, path: '/api/happiness', description: 'Submit happiness score', category: 'Happiness' },
  { method: 'GET' as HttpMethod, path: '/api/happiness', description: 'Get happiness history', category: 'Happiness' },
]

const SAMPLE_PAYLOADS = {
  // Authentication APIs
  '/api/auth/register': {
    name: 'Test User',
    email: 'test@example.com',
    password: 'TestPassword123!',
    confirmPassword: 'TestPassword123!'
  },
  '/api/auth/reset-password': {
    email: 'test@example.com'
  },
  
  // User Management APIs
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
  },
  
  // Assessment APIs
  '/api/assessment/questionnaire': {
    // Phase 1: Demographics & Background
    experienceLevel: 5,
    mainGoals: ["Stress Reduction", "Better Sleep", "Emotional Balance"],
    ageRange: "25-34 years",
    location: "Urban area",
    occupation: "Software Developer",
    educationLevel: "Bachelor's degree",
    meditationBackground: "Some guided meditation experience",
    
    // Phase 2: Lifestyle Patterns
    sleepPattern: 6,
    physicalActivity: "Moderate (regular exercise)",
    stressTrigers: ["Work Pressure", "Social Media", "Traffic"],
    dailyRoutine: "Structured but flexible",
    dietPattern: "Balanced with occasional treats",
    screenTime: "6-8 hours daily",
    socialConnections: "Good friends and family relationships",
    workLifeBalance: "Sometimes struggle but generally good",
    
    // Phase 3: Thinking Patterns
    emotionalAwareness: 6,
    stressResponse: "Usually manage well",
    decisionMaking: "Balanced approach",
    selfReflection: "Weekly reflection time",
    thoughtPatterns: "Generally positive with some worry",
    mindfulnessInDailyLife: "Try to be mindful but forget",
    
    // Phase 4: Mindfulness Specific
    mindfulnessExperience: 4,
    meditationBackgroundDetail: "Guided meditations, apps",
    practiceGoals: "Better sleep",
    preferredDuration: "10 minutes",
    biggestChallenges: "Finding time and staying consistent",
    motivation: "Stress reduction and emotional balance"
  },
  '/api/assessment/self-assessment': {
    type: "initial",
    foodTaste: "some",
    scentsAromas: "none",
    soundsMusic: "strong",
    visualBeauty: "some",
    touchTextures: "none",
    thoughtsImages: "strong"
  },
  '/api/assessment/reset': {
    confirmReset: "DELETE_ALL_ASSESSMENTS"
  },
  
  // Happiness Tracking APIs
  '/api/happiness': {
    overallHappiness: 7,
    stressLevel: 4,
    mindfulnessLevel: 6,
    notes: "Feeling good today after morning meditation"
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
            <h1 className="text-2xl font-bold">Comprehensive API Testing Interface</h1>
            <p className="text-gray-300 mt-1">Test authentication, user management, assessment, and happiness tracking APIs</p>
          </div>

          <div className="p-6">
            {/* Endpoint Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select API Endpoint
              </label>
              
              {/* Group endpoints by category */}
              {['Auth', 'User', 'Assessment', 'Happiness'].map((category) => (
                <div key={category} className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2 px-2">
                    {category} APIs
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {API_ENDPOINTS.filter(endpoint => endpoint.category === category).map((endpoint, index) => (
                      <button
                        key={`${category}-${index}`}
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
              ))}
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
                    <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                      💡 <strong>Customize as needed:</strong> Sample payloads are pre-filled but you can modify any values, 
                      add/remove fields, or test edge cases. For assessments, try different combinations of choices.
                    </div>
                    <textarea
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      rows={16}
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
                <li>• <strong>Authentication:</strong> Required for all /api/user/*, /api/assessment/*, and /api/happiness/* endpoints</li>
                <li>• <strong>Testing Flow:</strong> Register → Sign in → Test user management → Test assessments → Test happiness tracking</li>
                <li>• <strong>Assessment System:</strong> Questionnaire (27 questions, one-time) + Self-assessment (6 categories, 3 types)</li>
                <li>• <strong>Self-Assessment Types:</strong> 'initial' (after registration), 'mid' (after stage 3), 'final' (after stage 6)</li>
                <li>• <strong>Sample Payloads:</strong> Pre-filled for POST/PUT requests - customize as needed</li>
                <li>• <strong>Debugging:</strong> Check browser dev tools Network tab for additional info</li>
                <li>• <strong>Reset Testing:</strong> Use DELETE /api/assessment/reset to clear test data</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}