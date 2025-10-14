'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navigation from './Navigation'
import { completeSession, type CompleteSessionRequest, type SessionChallenges } from '@/lib/api/sessions'

interface SessionData {
  sessionId: string
  stageNumber: number
  subStage?: string
  sessionType: string
  duration: number
  posture: string
  startedAt: string
  settings: any
  title: string
}

export default function ReflectionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const stageId = searchParams.get('stage')
  const sessionId = searchParams.get('sessionId') // Get sessionId from URL

  const [reflection, setReflection] = useState({
    notes: '',
    challenges: [] as string[],
    qualityRating: 5,
    shouldCountAsSession: false
  })

  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [stage, setStage] = useState<any>(null)
  const [sessionSettings, setSessionSettings] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [stageCompleted, setStageCompleted] = useState(false)

  const challenges = [
    'Mind Wandering',
    'Physical Discomfort', 
    'Sleepiness',
    'Restlessness',
    'Strong Emotions',
    'External Distractions'
  ]

  useEffect(() => {
    // Verify sessionId is present
    if (!sessionId) {
      console.warn('No sessionId found, redirecting to stage selection...')
      router.push('/stage-1')
      return
    }

    // Load session data from sessionStorage
    const activeSession = sessionStorage.getItem('activeSession')
    if (activeSession) {
      const parsedSession: SessionData = JSON.parse(activeSession)
      setSessionData(parsedSession)
      setSessionSettings(parsedSession.settings)
      
      // Determine if session should count (all timer-only sessions count)
      setReflection(prev => ({ ...prev, shouldCountAsSession: true }))
    }

    // Load stage info
    const stageNum = parseInt(stageId || '1')
    const stageDurations = {
      1: { name: 'T1', minTime: 10 },
      2: { name: 'T2', minTime: 15 },
      3: { name: 'T3', minTime: 20 },
      4: { name: 'T4', minTime: 25 },
      5: { name: 'T5', minTime: 30 }
    }
    
    const stageInfo = stageDurations[stageNum as keyof typeof stageDurations] || stageDurations[1]
    setStage({ id: stageNum, ...stageInfo })
  }, [stageId, sessionId, router])

  const saveReflection = async () => {
    if (!sessionId) {
      setSaveError('No active session found')
      return
    }

    setIsSaving(true)
    setSaveError(null)

    try {
      // Prepare challenges data
      const challenges: SessionChallenges = {
        mindWandering: reflection.challenges.includes('Mind Wandering'),
        physicalDiscomfort: reflection.challenges.includes('Physical Discomfort'),
        sleepiness: reflection.challenges.includes('Sleepiness'),
        restlessness: reflection.challenges.includes('Restlessness'),
        strongEmotions: reflection.challenges.includes('Strong Emotions'),
        externalDistractions: reflection.challenges.includes('External Distractions'),
        notes: reflection.notes
      }

      // Prepare complete session request
      const request: CompleteSessionRequest = {
        sessionId,
        qualityRating: reflection.qualityRating,
        insights: reflection.notes,
        challenges
      }

      // Call API to complete session
      const response = await completeSession(request)

      if (!response.success) {
        setSaveError(response.message)
        setIsSaving(false)
        return
      }

      // Check if stage was completed
      const progress = response.data!.progress
      if (progress.isStageCompleted) {
        setStageCompleted(true)
      }

      // Show success message
      setSaveSuccess(true)

      // Clear session storage
      sessionStorage.removeItem('activeSession')
      sessionStorage.removeItem('actualSessionDuration')

      // Navigate back to stage selection after showing success
      setTimeout(() => {
        router.push('/stage-1')
      }, 2000)
    } catch (error) {
      console.error('Error completing session:', error)
      setSaveError('Failed to save reflection. Please try again.')
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700">
      {/* Navigation */}
      <Navigation currentPage="stage-1" />
      
      <div className="p-8 pt-24">
        <div className="max-w-5xl mx-auto">
          <h1 className="mb-8 text-4xl font-bold text-center text-white">Practice Reflection</h1>
          
          {!reflection.shouldCountAsSession && (
            <div className="p-4 mb-6 text-yellow-700 bg-yellow-100 border-l-4 border-yellow-500 rounded">
              <p className="font-semibold">Note: This session will not count towards your progress.</p>
              <p className="text-sm">You need to complete at least {stage?.minTime || 0} minutes for it to count as a completed session.</p>
            </div>
          )}
          
          {reflection.shouldCountAsSession && (
            <div className="p-4 mb-6 text-green-700 bg-green-100 border-l-4 border-green-500 rounded">
              <p className="font-semibold">Great job! This session will count towards your progress.</p>
            </div>
          )}
          
          <div className="p-8 bg-white rounded-2xl">
            <h2 className="mb-4 text-xl font-bold">What did you notice during practice</h2>
            <textarea
              value={reflection.notes}
              onChange={(e) => setReflection(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Enter your reflections and insights here"
              className="w-full h-32 p-4 mb-8 border-2 border-gray-200 rounded-lg resize-none focus:outline-none focus:border-blue-500"
            />

            {/* Quality Rating Slider */}
            <div className="mb-8">
              <h2 className="mb-2 text-xl font-bold">Session Quality Rating</h2>
              <p className="mb-4 text-sm text-gray-600">How would you rate the overall quality of this practice session?</p>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 min-w-[80px]">Poor (1)</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={reflection.qualityRating}
                  onChange={(e) => setReflection(prev => ({ ...prev, qualityRating: parseInt(e.target.value) }))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-sm font-medium text-gray-700 min-w-[100px]">Excellent (10)</span>
              </div>
              <div className="mt-2 text-center">
                <span className="inline-block px-4 py-2 text-lg font-bold text-blue-800 bg-blue-100 rounded-lg">
                  {reflection.qualityRating} / 10
                </span>
              </div>
            </div>

            <h2 className="mb-4 text-xl font-bold">Challenges</h2>
            <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
              {challenges.map(challenge => (
                <button
                  key={challenge}
                  onClick={() => {
                    setReflection(prev => ({
                      ...prev,
                      challenges: prev.challenges.includes(challenge)
                        ? prev.challenges.filter((c: string) => c !== challenge)
                        : [...prev.challenges, challenge]
                    }))
                  }}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    reflection.challenges.includes(challenge)
                      ? 'bg-blue-100 border-blue-500'
                      : 'bg-white border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={reflection.challenges.includes(challenge)}
                    readOnly
                    className="mr-3"
                  />
                  {challenge}
                </button>
              ))}
            </div>

            {/* Session Summary */}
            <div className="p-4 mb-6 rounded-lg bg-blue-50">
              <h3 className="mb-2 text-lg font-bold text-blue-800">Session Summary</h3>
              <div className="space-y-1 text-blue-700">
                <p>• Stage: {stage?.name} - Physical Stillness</p>
                <p>• Duration: {sessionSettings?.duration || 10} minutes</p>
                <p>• Posture: {sessionSettings?.posture?.replace('-', ' ') || 'Not specified'}</p>
                <p>• Completed: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Error Display */}
            {saveError && (
              <div className="p-4 mb-6 text-red-800 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-semibold">⚠️ Error</p>
                <p className="text-sm">{saveError}</p>
                <button 
                  onClick={() => setSaveError(null)}
                  className="mt-2 text-sm underline hover:no-underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Success Display */}
            {saveSuccess && (
              <div className="p-4 mb-6 text-green-800 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-semibold">✅ Session Completed!</p>
                {stageCompleted && (
                  <p className="mt-2 text-lg font-bold">🎉 Congratulations! You've completed this stage!</p>
                )}
                <p className="mt-2 text-sm">Redirecting to stage selection...</p>
              </div>
            )}

            <button
              onClick={saveReflection}
              disabled={isSaving || saveSuccess}
              className="w-full py-4 text-lg font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  <span>Saving...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <span>✓ Saved!</span>
                </>
              ) : (
                'Save Reflection'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}