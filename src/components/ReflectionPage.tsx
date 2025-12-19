'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navigation from './Navigation'
import { completeSessionAction } from '@/lib/actions/session-actions'
import type { CompleteSessionRequest, SessionChallenges } from '@/lib/api/sessions'

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
  const [actualDurationMinutes, setActualDurationMinutes] = useState<number | null>(null)
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
      
      // Determine if session should count: only count when actual practiced minutes
      // equal the planned session duration. Try to read actual minutes from
      // sessionStorage (set by timer). If not present, fall back to computing
      // elapsed minutes from startedAt. Default to not counting.
      const actualFromStorage = sessionStorage.getItem('actualSessionDuration')
      let actualMins: number | null = null
      if (actualFromStorage) {
        const parsed = Number(actualFromStorage)
        if (!Number.isNaN(parsed)) {
          actualMins = parsed
          setActualDurationMinutes(parsed)
        }
      }

      if (actualMins == null && parsedSession.startedAt) {
        try {
          const start = new Date(parsedSession.startedAt).getTime()
          const now = Date.now()
          const diffMs = Math.max(0, now - start)
          // use ceil to match frontend rounding (partial minute counts as a minute)
          const computed = Math.max(1, Math.ceil(diffMs / 60000))
          actualMins = computed
          setActualDurationMinutes(computed)
        } catch (e) {
          // leave actualMins as null
        }
      }

      const shouldCount = typeof actualMins === 'number' && parsedSession.duration !== undefined
        ? actualMins === parsedSession.duration
        : false

      setReflection(prev => ({ ...prev, shouldCountAsSession: shouldCount }))
    }

    // Load stage info
    // Parse stage ID: 'T1' -> 1, 'T2' -> 2, etc.
    const stageNum = stageId?.startsWith('T') ? parseInt(stageId.substring(1)) : parseInt(stageId || '1')
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
      // Determine duration values to send: prefer actual measured minutes from sessionStorage
      let actualMinutes = actualDurationMinutes

      // If not available, try to compute from sessionData.startedAt
      if (actualMinutes == null && sessionData?.startedAt) {
        try {
          const start = new Date(sessionData.startedAt).getTime()
          const now = Date.now()
          const diffMs = Math.max(0, now - start)
          // Count partial minutes as full minute and ensure at least 1 minute if any time elapsed
          actualMinutes = Math.max(1, Math.ceil(diffMs / 60000))
        } catch (e) {
          // ignore and fallback to planned duration below
          actualMinutes = null
        }
      }

      const request: CompleteSessionRequest = {
        sessionId,
        qualityRating: reflection.qualityRating,
        insights: reflection.notes,
        challenges,
        // include both planned duration and actual measured duration when available
        duration: sessionSettings?.duration,
        actualDuration: actualMinutes ?? sessionSettings?.duration,
      }

      // Call server action to complete session (faster than REST API)
      const response = await completeSessionAction(request)

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

      // Navigate back to stage selection after showing success with refresh parameter
      setTimeout(() => {
        router.push('/stage-1?refresh=true')
      }, 2000)
    } catch (error) {
      console.error('Error completing session:', error)
      setSaveError('Failed to save reflection. Please try again.')
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#b9d4ee] to-[#fffafa]">
      {/* Navigation */}
      <Navigation currentPage="stage-1" />
      
      <div className="p-4 sm:p-6 md:p-8 pt-20 sm:pt-24">
        <div className="max-w-5xl mx-auto">
          <h1 className="mb-4 sm:mb-6 md:mb-8 text-2xl sm:text-3xl md:text-4xl font-bold text-center text-[#03478f]">'</h1>
          
          {!reflection.shouldCountAsSession && (
            <div className="p-3 sm:p-4 mb-4 sm:mb-6 text-yellow-700 bg-yellow-100 border-l-4 border-yellow-500 rounded">
              <p className="text-sm sm:text-base font-semibold">Note: This session will not count towards your progress.</p>
              <p className="text-xs sm:text-sm mt-1">You need to complete at least {stage?.minTime || 0} minutes for it to count as a completed session.</p>
            </div>
          )}
          
          {reflection.shouldCountAsSession && (
            <div className="p-3 sm:p-4 mb-4 sm:mb-6 text-green-700 bg-green-100 border-l-4 border-green-500 rounded">
              <p className="text-sm sm:text-base font-semibold">Great job! This session will count towards your progress.</p>
            </div>
          )}
          
          <div className="p-4 sm:p-6 md:p-8 bg-[#e5f3ff] rounded-xl sm:rounded-2xl shadow-2xl">
            <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-[#03478f]">What did you notice during practice</h2>
            <textarea
              value={reflection.notes}
              onChange={(e) => setReflection(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Enter your reflections and insights here"
              className="w-full h-32 sm:h-40 p-3 sm:p-4 mb-6 sm:mb-8 text-sm sm:text-base bg-white border-2 border-gray-200 rounded-lg resize-none focus:outline-none focus:border-[#6465e0]"
            />

            {/* Quality Rating Slider */}
            <div className="mb-6 sm:mb-8">
              <h2 className="mb-2 text-lg sm:text-xl font-bold text-[#03478f]">Session Quality Rating</h2>
              <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">How would you rate the overall quality of this practice session?</p>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                <span className="text-xs sm:text-sm font-medium text-gray-700 w-full sm:w-auto text-center sm:text-left sm:min-w-[80px]">Poor (1)</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={reflection.qualityRating}
                  onChange={(e) => setReflection(prev => ({ ...prev, qualityRating: parseInt(e.target.value) }))}
                  className="flex-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#6465e0]"
                />
                <span className="text-xs sm:text-sm font-medium text-gray-700 w-full sm:w-auto text-center sm:text-left sm:min-w-[100px]">Excellent (10)</span>
              </div>
              <div className="mt-3 sm:mt-2 text-center">
                <span className="inline-block px-4 sm:px-6 py-2 sm:py-3 text-lg sm:text-xl font-bold text-white bg-gradient-to-r from-[#6465e0] to-[#7c7de8] rounded-lg">
                  {reflection.qualityRating} / 10
                </span>
              </div>
            </div>

            <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-[#03478f]">Challenges</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
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
                  className={`p-3 sm:p-4 rounded-lg border-2 text-left transition-all text-sm sm:text-base ${
                    reflection.challenges.includes(challenge)
                      ? 'bg-white border-[#6465e0] shadow-md'
                      : 'bg-white border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={reflection.challenges.includes(challenge)}
                    readOnly
                    className="mr-2 sm:mr-3"
                  />
                  {challenge}
                </button>
              ))}
            </div>

            {/* Session Summary */}
            {/** compute display duration: prefer actual measured duration, fallback to startedAt computation, then planned duration */}
            <div className="p-3 sm:p-4 mb-4 sm:mb-6 rounded-lg bg-blue-50">
              <h3 className="mb-2 sm:mb-3 text-base sm:text-lg font-bold text-blue-800">Session Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-blue-700">
                <div className="p-2 bg-white rounded">• <span className="font-semibold">Stage:</span> {stage?.name} - Physical Stillness</div>
                <div className="p-2 bg-white rounded">• <span className="font-semibold">Duration:</span> {
                  (function() {
                    // prefer explicit actual duration from sessionStorage/state
                    if (actualDurationMinutes != null) return actualDurationMinutes

                    // try to compute from startedAt
                    if (sessionData?.startedAt) {
                      try {
                        const start = new Date(sessionData.startedAt).getTime()
                        const now = Date.now()
                        const diffMs = Math.max(0, now - start)
                        return Math.max(1, Math.ceil(diffMs / 60000))
                      } catch (e) {
                        // fallthrough
                      }
                    }

                    // fallback to planned setting
                    return sessionSettings?.duration || 10
                  })()
                } min</div>
                <div className="p-2 bg-white rounded">• <span className="font-semibold">Posture:</span> {sessionSettings?.posture?.replace('-', ' ') || 'Not specified'}</div>
                <div className="p-2 bg-white rounded">• <span className="font-semibold">Completed:</span> {new Date().toLocaleDateString()}</div>
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
              className="w-full py-3 sm:py-4 text-base sm:text-lg font-semibold text-white transition-all bg-gradient-to-r from-[#6465e0] to-[#7c7de8] hover:from-[#5658d1] hover:to-[#6465e0] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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