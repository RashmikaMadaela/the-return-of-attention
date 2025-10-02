'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export default function TrackingNotesTestingPage() {
  const { data: session, status } = useSession();
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // State for form inputs
  const [emojiNoteData, setEmojiNoteData] = useState({
    moodRating: 7
  });

  const [detailedNoteData, setDetailedNoteData] = useState({
    emotion: 'peaceful',
    intensity: 8,
    context: 'Deep meditation experience with clear awareness',
    trigger: 'meditation'
  });

  const [happinessData, setHappinessData] = useState({
    currentStateScore: 75,
    attachmentScore: 60,
    pahmScore: 80,
    practiceScore: 70,
    progressScore: 65,
    consistencyScore: 85,
    reflectionScore: 72,
    dailyLifeScore: 68,
    questionnaireBased: true,
    selfAssessmentBased: true,
    practiceEnhanced: true
  });

  const makeApiCall = async (endpoint: string, method: string = 'GET', body?: any) => {
    setLoading(prev => ({ ...prev, [endpoint]: true }));
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        ...(body && { body: JSON.stringify(body) })
      });

      const data = await response.json();
      setResults(prev => ({ ...prev, [endpoint]: data }));
      return data;
    } catch (error) {
      const errorData = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      setResults(prev => ({ ...prev, [endpoint]: errorData }));
      return errorData;
    } finally {
      setLoading(prev => ({ ...prev, [endpoint]: false }));
    }
  };

  const resetResults = () => {
    setResults({});
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to test the tracking and notes APIs.</p>
          <a href="/signin" className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Phase 4: Tracking & Notes APIs Testing</h1>
          <p className="text-lg text-gray-600">Test Daily Notes and Happiness Score APIs</p>
          <p className="text-sm text-gray-500 mt-2">
            Logged in as: <span className="font-semibold">{session?.user?.email}</span>
          </p>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={resetResults}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear Results
            </button>
          </div>
        </div>

        {/* Daily Notes APIs Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-purple-600 mb-6">📝 Daily Notes APIs</h2>
          
          {/* Emoji Notes Testing */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Emoji Notes</h3>
            
            {/* Emoji Note Form */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold mb-3">Create/Update Emoji Note</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mood Rating (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={emojiNoteData.moodRating}
                    onChange={(e) => setEmojiNoteData(prev => ({ ...prev, moodRating: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Rate your mood from 1 (poor) to 10 (excellent)"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-4">
              <button
                onClick={() => makeApiCall('/api/notes/emoji', 'POST', emojiNoteData)}
                disabled={loading['/api/notes/emoji']}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {loading['/api/notes/emoji'] ? 'Creating...' : 'Create Emoji Note'}
              </button>
              <button
                onClick={() => makeApiCall('/api/notes/emoji', 'GET')}
                disabled={loading['/api/notes/emoji']}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading['/api/notes/emoji'] ? 'Loading...' : 'Get Emoji Notes'}
              </button>
            </div>
          </div>

          {/* Detailed Notes Testing */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Detailed Notes</h3>
            
            {/* Detailed Note Form */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold mb-3">Create Detailed Note</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Primary Emotion</label>
                  <select
                    value={detailedNoteData.emotion}
                    onChange={(e) => setDetailedNoteData(prev => ({ ...prev, emotion: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="peaceful">Peaceful</option>
                    <option value="joyful">Joyful</option>
                    <option value="content">Content</option>
                    <option value="excited">Excited</option>
                    <option value="grateful">Grateful</option>
                    <option value="anxious">Anxious</option>
                    <option value="frustrated">Frustrated</option>
                    <option value="sad">Sad</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Intensity (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={detailedNoteData.intensity}
                    onChange={(e) => setDetailedNoteData(prev => ({ ...prev, intensity: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Trigger</label>
                  <select
                    value={detailedNoteData.trigger}
                    onChange={(e) => setDetailedNoteData(prev => ({ ...prev, trigger: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="meditation">Meditation Practice</option>
                    <option value="work">Work</option>
                    <option value="relationships">Relationships</option>
                    <option value="health">Health</option>
                    <option value="finances">Finances</option>
                    <option value="weather">Weather</option>
                    <option value="news">News</option>
                    <option value="nature">Nature</option>
                    <option value="learning">Learning</option>
                    <option value="exercise">Exercise</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Context (What's happening?)</label>
                  <textarea
                    value={detailedNoteData.context}
                    onChange={(e) => setDetailedNoteData(prev => ({ ...prev, context: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={2}
                    placeholder="Describe what's happening in detail..."
                  />
                </div>

              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-4">
              <button
                onClick={() => makeApiCall('/api/notes/detailed', 'POST', detailedNoteData)}
                disabled={loading['/api/notes/detailed']}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {loading['/api/notes/detailed'] ? 'Creating...' : 'Create Detailed Note'}
              </button>
              <button
                onClick={() => makeApiCall('/api/notes/detailed', 'GET')}
                disabled={loading['/api/notes/detailed']}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading['/api/notes/detailed'] ? 'Loading...' : 'Get Detailed Notes'}
              </button>
            </div>
          </div>

          {/* Notes History & Trends */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">History & Analytics</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => makeApiCall('/api/notes/history', 'GET')}
                disabled={loading['/api/notes/history']}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading['/api/notes/history'] ? 'Loading...' : 'Get Notes History'}
              </button>
              <button
                onClick={() => makeApiCall('/api/notes/trends?period=30&granularity=daily', 'GET')}
                disabled={loading['/api/notes/trends']}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {loading['/api/notes/trends'] ? 'Analyzing...' : 'Get Mood Trends'}
              </button>
            </div>
          </div>
        </div>

        {/* Happiness Score APIs Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-pink-600 mb-6">😊 Happiness Score APIs</h2>
          
          {/* Happiness Score Calculation Form */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="font-semibold mb-3">Calculate Happiness Score</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(happinessData)
                .filter(([key]) => !['questionnaireBased', 'selfAssessmentBased', 'practiceEnhanced'].includes(key))
                .map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={value as number}
                    onChange={(e) => setHappinessData(prev => ({ 
                      ...prev, 
                      [key]: Number(e.target.value) 
                    }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-4">
              {(['questionnaireBased', 'selfAssessmentBased', 'practiceEnhanced'] as const).map(key => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={happinessData[key]}
                    onChange={(e) => setHappinessData(prev => ({ 
                      ...prev, 
                      [key]: e.target.checked 
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => makeApiCall('/api/happiness', 'POST', happinessData)}
              disabled={loading['/api/happiness']}
              className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
            >
              {loading['/api/happiness'] ? 'Calculating...' : 'Calculate Happiness Score'}
            </button>
            <button
              onClick={() => makeApiCall('/api/happiness', 'GET')}
              disabled={loading['/api/happiness']}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading['/api/happiness'] ? 'Loading...' : 'Get Score History'}
            </button>
            <button
              onClick={() => makeApiCall('/api/happiness/history', 'GET')}
              disabled={loading['/api/happiness/history']}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading['/api/happiness/history'] ? 'Loading...' : 'Get Detailed History'}
            </button>
            <button
              onClick={() => makeApiCall('/api/happiness/breakdown?latest=true', 'GET')}
              disabled={loading['/api/happiness/breakdown']}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading['/api/happiness/breakdown'] ? 'Analyzing...' : 'Get Score Breakdown'}
            </button>
            <button
              onClick={() => makeApiCall('/api/happiness/trends?period=90&granularity=weekly&includeComponents=true', 'GET')}
              disabled={loading['/api/happiness/trends']}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              {loading['/api/happiness/trends'] ? 'Analyzing...' : 'Get Happiness Trends'}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 API Results</h2>
          
          {Object.keys(results).length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No API calls made yet. Click any button above to test the APIs.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(results).map(([endpoint, result]) => (
                <div key={endpoint} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-700">{endpoint}</h3>
                    <span className={`px-2 py-1 rounded text-sm ${
                      result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {result.success ? 'Success' : 'Error'}
                    </span>
                  </div>
                  
                  {result.message && (
                    <div className="mb-3 p-2 bg-blue-50 text-blue-800 rounded text-sm">
                      {result.message}
                    </div>
                  )}
                  
                  {result.error && (
                    <div className="mb-3 p-2 bg-red-50 text-red-800 rounded text-sm">
                      Error: {result.error}
                    </div>
                  )}
                  
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                      View Full Response
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-8">
          <a 
            href="/dashboard" 
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}