'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function AssessmentTestingPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Sample questionnaire data for testing
  const sampleQuestionnaire = {
    // Phase 1: Demographics & Background
    experienceLevel: 5,
    mainGoals: ['Stress Reduction', 'Better Sleep', 'Inner Peace'],
    ageRange: '25-34 years',
    location: 'Urban area',
    occupation: 'Software Developer',
    educationLevel: "Bachelor's degree",
    meditationBackground: 'Some guided meditation experience',
    
    // Phase 2: Lifestyle Patterns
    sleepPattern: 6,
    physicalActivity: 'Moderate (regular exercise)',
    stressTrigers: ['Work Pressure', 'Traffic', 'Social Media'],
    dailyRoutine: 'Structured but flexible',
    dietPattern: 'Balanced with occasional treats',
    screenTime: '6-8 hours daily',
    socialConnections: 'Good friends and family relationships',
    workLifeBalance: 'Sometimes struggle but generally good',
    
    // Phase 3: Thinking Patterns
    emotionalAwareness: 6,
    stressResponse: 'Usually manage well',
    decisionMaking: 'Balanced approach',
    selfReflection: 'Weekly reflection time',
    thoughtPatterns: 'Generally positive with some worry',
    mindfulnessInDailyLife: 'Try to be mindful but forget',
    
    // Phase 4: Mindfulness Specific
    mindfulnessExperience: 4,
    meditationBackgroundDetail: 'Guided meditations, apps',
    practiceGoals: 'Daily 15-20 minutes',
    preferredDuration: '20 minutes',
    biggestChallenges: 'Finding time and staying consistent',
    motivation: 'Stress reduction and emotional balance'
  };

  // Sample self-assessment data for testing
  const sampleSelfAssessment = {
    type: 'initial' as const,
    foodTaste: 'some' as const,
    scentsAromas: 'none' as const,
    soundsMusic: 'strong' as const,
    visualBeauty: 'some' as const,
    touchTextures: 'none' as const,
    thoughtsImages: 'strong' as const,
  };

  // Sample happiness score data for testing
  const sampleHappinessScore = {
    currentStateScore: 65,
    attachmentScore: 70,
    pahmScore: 45,
    practiceScore: 55,
    progressScore: 40,
    consistencyScore: 35,
    reflectionScore: 60,
    dailyLifeScore: 50,
    questionnaireBased: true,
    selfAssessmentBased: true,
    practiceEnhanced: false,
  };

  const apiCall = async (endpoint: string, method: string = 'GET', data?: any) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
      }

      const res = await fetch(endpoint, options);
      const result = await res.json();
      
      setResponse({
        status: res.status,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Assessment API Testing</h1>
          <p className="text-gray-600">Please sign in to test assessment APIs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Assessment API Testing</h1>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* API Testing Controls */}
          <div className="space-y-4">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h2 className="mb-4 text-xl font-semibold">Assessment APIs</h2>
              
              <div className="space-y-3">
                {/* Questionnaire APIs */}
                <div className="pl-4 border-l-4 border-blue-500">
                  <h3 className="mb-2 font-medium text-blue-700">Questionnaire (27 Questions)</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => apiCall('/api/assessment/questionnaire', 'POST', sampleQuestionnaire)}
                      disabled={loading}
                      className="w-full px-3 py-2 text-sm text-left transition-colors rounded bg-blue-50 hover:bg-blue-100 disabled:opacity-50"
                    >
                      POST - Submit Questionnaire
                    </button>
                    <button
                      onClick={() => apiCall('/api/assessment/questionnaire')}
                      disabled={loading}
                      className="w-full px-3 py-2 text-sm text-left transition-colors rounded bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
                    >
                      GET - Get Questionnaire
                    </button>
                  </div>
                </div>

                {/* Self Assessment APIs */}
                <div className="pl-4 border-l-4 border-green-500">
                  <h3 className="mb-2 font-medium text-green-700">Self Assessment (6 Categories)</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => apiCall('/api/assessment/self-assessment', 'POST', sampleSelfAssessment)}
                      disabled={loading}
                      className="w-full px-3 py-2 text-sm text-left transition-colors rounded bg-green-50 hover:bg-green-100 disabled:opacity-50"
                    >
                      POST - Submit Initial Assessment
                    </button>
                    <button
                      onClick={() => apiCall('/api/assessment/self-assessment', 'POST', { ...sampleSelfAssessment, type: 'mid' })}
                      disabled={loading}
                      className="w-full px-3 py-2 text-sm text-left transition-colors rounded bg-green-50 hover:bg-green-100 disabled:opacity-50"
                    >
                      POST - Submit Mid Assessment
                    </button>
                    <button
                      onClick={() => apiCall('/api/assessment/self-assessment')}
                      disabled={loading}
                      className="w-full px-3 py-2 text-sm text-left transition-colors rounded bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
                    >
                      GET - Get All Assessments
                    </button>
                  </div>
                </div>

                {/* Status & Results APIs */}
                <div className="pl-4 border-l-4 border-purple-500">
                  <h3 className="mb-2 font-medium text-purple-700">Status & Results</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => apiCall('/api/assessment/status')}
                      disabled={loading}
                      className="w-full px-3 py-2 text-sm text-left transition-colors rounded bg-purple-50 hover:bg-purple-100 disabled:opacity-50"
                    >
                      GET - Assessment Status
                    </button>
                    <button
                      onClick={() => apiCall('/api/assessment/results')}
                      disabled={loading}
                      className="w-full px-3 py-2 text-sm text-left transition-colors rounded bg-purple-50 hover:bg-purple-100 disabled:opacity-50"
                    >
                      GET - Complete Results
                    </button>
                  </div>
                </div>

                {/* Happiness Score API */}
                <div className="pl-4 border-l-4 border-yellow-500">
                  <h3 className="mb-2 font-medium text-yellow-700">Happiness Score (PAHM)</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => apiCall('/api/happiness', 'POST', sampleHappinessScore)}
                      disabled={loading}
                      className="w-full px-3 py-2 text-sm text-left transition-colors rounded bg-yellow-50 hover:bg-yellow-100 disabled:opacity-50"
                    >
                      POST - Calculate Happiness Score
                    </button>
                    <button
                      onClick={() => apiCall('/api/happiness')}
                      disabled={loading}
                      className="w-full px-3 py-2 text-sm text-left transition-colors rounded bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
                    >
                      GET - Get Happiness History
                    </button>
                  </div>
                </div>

                {/* Reset API */}
                <div className="pl-4 border-l-4 border-red-500">
                  <h3 className="mb-2 font-medium text-red-700">Reset (Testing)</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => apiCall('/api/assessment/reset?type=all', 'DELETE')}
                      disabled={loading}
                      className="w-full px-3 py-2 text-sm text-left transition-colors rounded bg-red-50 hover:bg-red-100 disabled:opacity-50"
                    >
                      DELETE - Reset All Assessments
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Response Display */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-xl font-semibold">API Response</h2>
            
            {loading && (
              <div className="flex items-center justify-center p-8">
                <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                <span className="ml-2 text-gray-600">Loading...</span>
              </div>
            )}

            {error && (
              <div className="p-4 mb-4 border border-red-200 rounded-lg bg-red-50">
                <h3 className="font-medium text-red-800">Error:</h3>
                <p className="mt-1 text-red-700">{error}</p>
              </div>
            )}

            {response && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    response.status < 300 ? 'bg-green-100 text-green-800' : 
                    response.status < 400 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    Status: {response.status}
                  </span>
                  <span className="text-sm text-gray-500">{response.timestamp}</span>
                </div>
                
                <div className="p-4 overflow-auto rounded-lg bg-gray-50 max-h-96">
                  <pre className="text-sm">{JSON.stringify(response.data, null, 2)}</pre>
                </div>
              </div>
            )}

            {!loading && !error && !response && (
              <div className="py-8 text-center text-gray-500">
                Click an API button to see the response here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}