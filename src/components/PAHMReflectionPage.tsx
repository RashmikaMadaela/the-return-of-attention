'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navigation from './Navigation'
import { completeSession, type CompleteSessionRequest, type SessionChallenges, type PAHMClick, type PAHMData as APIPAHMData } from '@/lib/api/sessions'

interface PAHMData {
  nostalgia: number
  likes: number
  anticipation: number
  past: number
  present: number
  future: number
  regret: number
  dislikes: number
  worry: number
}

interface ReflectionData {
  notes: string
  challenges: string[]
  qualityRating: number
}

interface SessionData {
  sessionId: string
  pahmSessionId?: string
  stageNumber: number
  sessionType: string
  duration: number
  posture: string
  startedAt: string
  settings: any
  stage: string
  mindRecoverySession?: string
  title: string
}

export default function PAHMReflectionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const stageId = searchParams.get('stage') || '2'
  const sessionId = searchParams.get('sessionId') // Get sessionId from URL
  const mindRecoverySession = searchParams.get('session')
  
  const isMindRecovery = stageId === 'mind-recovery'

  const [pahmData, setPahmData] = useState<PAHMData>({
    nostalgia: 0,
    likes: 0,
    anticipation: 0,
    past: 0,
    present: 0,
    future: 0,
    regret: 0,
    dislikes: 0,
    worry: 0
  })

  const [pahmClicks, setPahmClicks] = useState<PAHMClick[]>([]) // Full click data for API

  const [reflection, setReflection] = useState<ReflectionData>({
    notes: '',
    challenges: [],
    qualityRating: 5
  })

  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [sessionDuration, setSessionDuration] = useState(30)
  const [actualSessionDuration, setActualSessionDuration] = useState(30)
  const [stage, setStage] = useState<any>(null)
  const [shouldCountAsSession, setShouldCountAsSession] = useState(true)
  
  // API state
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
      console.warn('No sessionId found, redirecting...')
      if (isMindRecovery) {
        router.push('/mind-recovery')
      } else {
        router.push('/home')
      }
      return
    }

    // Load session data from sessionStorage
    const activeSession = sessionStorage.getItem('activeSession')
    let parsedSession: SessionData | null = null
    if (activeSession) {
      parsedSession = JSON.parse(activeSession) as SessionData
      setSessionData(parsedSession)
      setSessionDuration(parsedSession.duration)
      setActualSessionDuration(parsedSession.duration)
    }

    // Load PAHM click data (full data for API)
    const pahmClickDataStr = sessionStorage.getItem('pahmClickData')
    if (pahmClickDataStr) {
      const clickData: PAHMClick[] = JSON.parse(pahmClickDataStr)
      setPahmClicks(clickData)
    }

    // Load PAHM tracking (simple counts for display)
    const pahmTrackingStr = sessionStorage.getItem('pahmTracking')
    if (pahmTrackingStr) {
      setPahmData(JSON.parse(pahmTrackingStr))
    }

    // Determine whether this PAHM session should count towards progress.
    // We prefer an explicit actual duration written to sessionStorage by the timer,
    // otherwise compute from startedAt. Only count the session when actual minutes
    // equal the planned session duration.
    let actualFromStorage = null
    try {
      actualFromStorage = sessionStorage.getItem('actualSessionDuration')
    } catch (e) {
      actualFromStorage = null
    }

    let actualMins: number | null = null
    if (actualFromStorage) {
      const parsed = Number(actualFromStorage)
      if (!Number.isNaN(parsed)) {
        actualMins = parsed
        setActualSessionDuration(parsed)
      }
    }

    if (actualMins == null && parsedSession && parsedSession.startedAt) {
      try {
        const start = new Date(parsedSession.startedAt).getTime()
        const now = Date.now()
        const diffMs = Math.max(0, now - start)
        const computed = Math.max(1, Math.ceil(diffMs / 60000))
        actualMins = computed
        setActualSessionDuration(computed)
      } catch (e) {
        // leave actualMins as null
      }
    }

    const shouldCount = (typeof actualMins === 'number' && parsedSession && parsedSession.duration !== undefined)
      ? actualMins === parsedSession.duration
      : false

    setShouldCountAsSession(Boolean(shouldCount))

    // Load stage info
    const currentStage = getStageInfo(parseInt(stageId))
    setStage(currentStage)
  }, [stageId, sessionId, isMindRecovery, router])

  const getStageInfo = (stageNum: number) => {
    const stageNames = {
      2: 'PAHM Trainee',
      3: 'PAHM Beginner', 
      4: 'PAHM Practitioner',
      5: 'PAHM Master',
      6: 'PAHM Illuminator'
    }
    return {
      id: stageNum,
      name: stageNames[stageNum as keyof typeof stageNames] || 'PAHM Trainee'
    }
  }

  const toggleChallenge = (challenge: string) => {
    setReflection(prev => ({
      ...prev,
      challenges: prev.challenges.includes(challenge)
        ? prev.challenges.filter(c => c !== challenge)
        : [...prev.challenges, challenge]
    }))
  }

  // Calculate PAHM statistics
  const calculateStats = () => {
    const presentTotal = pahmData.present
    const pastTotal = pahmData.past + pahmData.nostalgia + pahmData.regret
    const futureTotal = pahmData.future + pahmData.anticipation + pahmData.worry
    const attachmentTotal = pahmData.nostalgia + pahmData.likes + pahmData.anticipation
    const neutralTotal = pahmData.past + pahmData.present + pahmData.future
    const aversionTotal = pahmData.regret + pahmData.dislikes + pahmData.worry
    const grandTotal = presentTotal + pastTotal + futureTotal + pahmData.likes + pahmData.dislikes

    return {
      present: {
        attachment: pahmData.likes,
        neutral: pahmData.present,
        aversion: pahmData.dislikes,
        total: presentTotal + pahmData.likes + pahmData.dislikes,
        percentage: grandTotal > 0 ? Math.round(((presentTotal + pahmData.likes + pahmData.dislikes) / grandTotal) * 100) : 0
      },
      past: {
        attachment: pahmData.nostalgia,
        neutral: pahmData.past,
        aversion: pahmData.regret,
        total: pastTotal,
        percentage: grandTotal > 0 ? Math.round((pastTotal / grandTotal) * 100) : 0
      },
      future: {
        attachment: pahmData.anticipation,
        neutral: pahmData.future,
        aversion: pahmData.worry,
        total: futureTotal,
        percentage: grandTotal > 0 ? Math.round((futureTotal / grandTotal) * 100) : 0
      },
      totals: {
        attachment: attachmentTotal,
        neutral: neutralTotal,
        aversion: aversionTotal,
        total: grandTotal
      }
    }
  }

  const pahmStats = calculateStats()

  const handleSave = async () => {
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

      // Prepare PAHM data for API
      const pahmDataForAPI: APIPAHMData = {
        totalClicks: pahmClicks.length,
        clickData: pahmClicks,
        patternNotes: reflection.notes
      }

      // Prepare complete session request
      const request: CompleteSessionRequest = {
        sessionId,
        qualityRating: reflection.qualityRating,
        insights: reflection.notes,
        pahmData: pahmDataForAPI,
        challenges,
        duration: sessionDuration,
        actualDuration: actualSessionDuration
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
      sessionStorage.removeItem('pahmClickData')
      sessionStorage.removeItem('pahmTracking')
      sessionStorage.removeItem('sessionDuration')
      sessionStorage.removeItem('actualSessionDuration')

      // Navigate back after showing success
      setTimeout(() => {
        if (isMindRecovery) {
          router.push('/mind-recovery')
        } else {
          router.push('/home')
        }
      }, 2000)
    } catch (error) {
      console.error('Error completing session:', error)
      setSaveError('Failed to save reflection. Please try again.')
      setIsSaving(false)
    }
  }

  const updateStageProgress = () => {
    // Skip progress updates for mind recovery sessions
    if (isMindRecovery) {
      return
    }
    
    const currentStageProgress = JSON.parse(localStorage.getItem(`stage${stageId}Progress`) || '{"sessions": 0, "totalTime": 0}')
    
    // Only count the session when the actual practiced minutes exactly match planned duration
    if (shouldCountAsSession && typeof actualSessionDuration === 'number' && typeof sessionData?.duration === 'number' && actualSessionDuration === sessionData.duration) {
      currentStageProgress.sessions = (currentStageProgress.sessions || 0) + 1
      currentStageProgress.totalTime = (currentStageProgress.totalTime || 0) + actualSessionDuration
      currentStageProgress.lastCompleted = new Date().toISOString()
      
      localStorage.setItem(`stage${stageId}Progress`, JSON.stringify(currentStageProgress))
      
      // Check if stage is completed and unlock next stage
      const sessionRequirements = {
        2: 30, // 30 sessions
        3: 30, // 30 sessions  
        4: 40, // 40 sessions
        5: 50, // 50 sessions
        6: 60  // 60 sessions
      }
      
      const requiredSessions = sessionRequirements[parseInt(stageId) as keyof typeof sessionRequirements] || 30
      
      if (currentStageProgress.sessions >= requiredSessions && currentStageProgress.totalTime >= 900) {
        // Mark stage as completed and unlock next stage
        const completedStages = JSON.parse(localStorage.getItem('completedStages') || '[]')
        if (!completedStages.includes(parseInt(stageId))) {
          completedStages.push(parseInt(stageId))
          localStorage.setItem('completedStages', JSON.stringify(completedStages))
          
          // Unlock next stage if it exists
          const nextStageId = parseInt(stageId) + 1
          if (nextStageId <= 6) {
            const unlockedStages = JSON.parse(localStorage.getItem('unlockedStages') || '[1]')
            if (!unlockedStages.includes(nextStageId)) {
              unlockedStages.push(nextStageId)
              localStorage.setItem('unlockedStages', JSON.stringify(unlockedStages))
            }
          }
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#b9d4ee] to-[#fffafa]">
      {/* Navigation */}
      <Navigation currentPage="pahm-reflection" />
      
      <div className="p-4 sm:p-6 md:p-8 pt-20 sm:pt-24">
        <div className="max-w-5xl mx-auto">
          <h1 className="mb-4 sm:mb-6 md:mb-8 text-2xl sm:text-3xl md:text-4xl font-bold text-center text-[#03478f]">'</h1>
          
          <div className="p-4 sm:p-6 md:p-8 bg-[#e5f3ff] rounded-xl sm:rounded-2xl shadow-2xl">
            {/* Session Counting Status */}
            {!shouldCountAsSession && (
              <div className="p-3 sm:p-4 mb-4 sm:mb-6 text-black bg-yellow-100 border-l-4 border-yellow-500 rounded">
                <p className="text-sm sm:text-base font-semibold">Note: This session will not count towards your progress.</p>
                <p className="text-xs sm:text-sm mt-1">You need to complete at least 30 minutes for it to count as a completed session.</p>
                <p className="text-xs sm:text-sm mt-1">Actual time spent: {actualSessionDuration} minutes</p>
              </div>
            )}
            
            {shouldCountAsSession && (
              <div className="p-3 sm:p-4 mb-4 sm:mb-6 text-black bg-green-100 border-l-4 border-green-500 rounded">
                <p className="text-sm sm:text-base font-semibold">Great job! This session will count towards your progress.</p>
                <p className="text-xs sm:text-sm mt-1">Time completed: {actualSessionDuration} minutes</p>
              </div>
            )}

            {/* Stage and Session Info */}
            <div className="p-3 sm:p-4 mb-4 sm:mb-6 rounded-lg bg-white shadow-md">
              <h3 className="mb-2 sm:mb-3 text-base sm:text-lg font-bold text-[#03478f]">Session Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-black">
                <div className="p-2 bg-blue-50 rounded">• <span className="font-semibold">Stage:</span> {stageId} - {stage?.name}</div>
                <div className="p-2 bg-blue-50 rounded">• <span className="font-semibold">Planned:</span> {sessionDuration} min</div>
                <div className="p-2 bg-blue-50 rounded">• <span className="font-semibold">Actual:</span> {actualSessionDuration} min</div>
                <div className="p-2 bg-blue-50 rounded">• <span className="font-semibold">Clicks:</span> {pahmStats.totals.total}</div>
                <div className="p-2 bg-blue-50 rounded col-span-1 sm:col-span-2">• <span className="font-semibold">Completed:</span> {new Date().toLocaleDateString()}</div>
              </div>
            </div>

            <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-[#03478f]">What did you notice during practice</h2>
            <textarea
              value={reflection.notes}
              onChange={(e) => setReflection(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Enter your reflections and insights here"
              className="w-full h-32 sm:h-40 p-3 sm:p-4 mb-6 sm:mb-8 text-sm sm:text-base text-black bg-white border-2 border-gray-200 rounded-lg resize-none focus:outline-none focus:border-[#6465e0]"
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
                  onClick={() => toggleChallenge(challenge)}
                  className={`p-3 sm:p-4 rounded-lg border-2 text-left transition-all text-sm sm:text-base text-black ${
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

            <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-[#03478f]">PAHM Tracking Results</h2>
            <div className="mb-6 sm:mb-8 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full border-collapse min-w-[600px] text-xs sm:text-sm">
                <thead>
                  <tr>
                    <th className="p-2 sm:p-3 font-bold text-center text-white bg-teal-600 border border-gray-300">Time/Emotion</th>
                    <th className="p-2 sm:p-3 font-bold text-center text-black bg-orange-300 border border-gray-300">Attachment</th>
                    <th className="p-2 sm:p-3 font-bold text-center text-black bg-gray-300 border border-gray-300">Neutral</th>
                    <th className="p-2 sm:p-3 font-bold text-center text-black bg-pink-300 border border-gray-300">Aversion</th>
                    <th className="p-2 sm:p-3 font-bold text-center text-white bg-gray-600 border border-gray-300">Total</th>
                    <th className="p-2 sm:p-3 font-bold text-center text-white bg-teal-600 border border-gray-300">%</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 sm:p-3 font-bold text-center text-black bg-green-300 border border-gray-300">Present</td>
                    <td className="p-2 sm:p-3 text-center text-black bg-white border border-gray-300">{pahmStats.present.attachment}</td>
                    <td className="p-2 sm:p-3 text-center text-black bg-white border border-gray-300">{pahmStats.present.neutral}</td>
                    <td className="p-2 sm:p-3 text-center text-black bg-white border border-gray-300">{pahmStats.present.aversion}</td>
                    <td className="p-2 sm:p-3 text-center text-black bg-white border border-gray-300">{pahmStats.present.total}</td>
                    <td className="p-2 sm:p-3 text-center text-black bg-white border border-gray-300">{pahmStats.present.percentage}%</td>
                  </tr>
                  <tr>
                    <td className="p-2 sm:p-3 font-bold text-center text-black bg-yellow-300 border border-gray-300">Past</td>
                    <td className="p-2 sm:p-3 text-center text-black bg-white border border-gray-300">{pahmStats.past.attachment}</td>
                    <td className="p-2 sm:p-3 text-center text-black bg-white border border-gray-300">{pahmStats.past.neutral}</td>
                    <td className="p-2 sm:p-3 text-center text-black bg-white border border-gray-300">{pahmStats.past.aversion}</td>
                    <td className="p-2 sm:p-3 text-center text-black bg-white border border-gray-300">{pahmStats.past.total}</td>
                    <td className="p-2 sm:p-3 text-center text-black bg-white border border-gray-300">{pahmStats.past.percentage}%</td>
                  </tr>
                  <tr>
                    <td className="p-2 sm:p-3 font-bold text-center text-black bg-blue-300 border border-gray-300">Future</td>
                    <td className="p-2 sm:p-3 text-center text-black bg-white border border-gray-300">{pahmStats.future.attachment}</td>
                    <td className="p-2 sm:p-3 text-center text-black bg-white border border-gray-300">{pahmStats.future.neutral}</td>
                    <td className="p-2 sm:p-3 text-center text-black bg-white border border-gray-300">{pahmStats.future.aversion}</td>
                    <td className="p-2 sm:p-3 text-center text-black bg-white border border-gray-300">{pahmStats.future.total}</td>
                    <td className="p-2 sm:p-3 text-center text-black bg-white border border-gray-300">{pahmStats.future.percentage}%</td>
                  </tr>
                  <tr>
                    <td className="p-2 sm:p-3 font-bold text-center text-white bg-gray-600 border border-gray-300">Total</td>
                    <td className="p-2 sm:p-3 text-center text-black bg-white border border-gray-300">{pahmStats.totals.attachment}</td>
                    <td className="p-2 sm:p-3 text-center text-black bg-white border border-gray-300">{pahmStats.totals.neutral}</td>
                    <td className="p-2 sm:p-3 text-center text-black bg-white border border-gray-300">{pahmStats.totals.aversion}</td>
                    <td className="p-2 sm:p-3 font-bold text-center text-white bg-teal-700 border border-gray-300">{pahmStats.totals.total}</td>
                    <td className="p-2 sm:p-3 font-bold text-center text-white bg-teal-600 border border-gray-300">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Individual Matrix Clicks Detail */}
            <div className="mb-6 sm:mb-8">
              <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-bold text-[#03478f]">Detailed Matrix Clicks</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                {Object.entries(pahmData).map(([key, value]) => (
                  <div key={key} className="p-2 sm:p-3 text-center bg-gray-100 rounded-lg">
                    <div className="text-xs sm:text-sm font-semibold text-black capitalize truncate">{key}</div>
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Display */}
            {saveError && (
              <div className="p-4 mb-6 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="mb-1 text-sm font-semibold text-red-800">Error Saving Reflection</h3>
                    <p className="text-sm text-red-700">{saveError}</p>
                  </div>
                  <button
                    onClick={() => setSaveError(null)}
                    className="ml-4 font-bold text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Success Display */}
            {saveSuccess && (
              <div className="p-4 mb-6 border border-green-200 rounded-lg bg-green-50">
                <div className="flex items-center">
                  <div className="flex-1">
                    <h3 className="mb-1 text-sm font-semibold text-green-800">✓ Reflection Saved Successfully!</h3>
                    {stageCompleted && (
                      <p className="text-sm font-medium text-green-700">
                        🎉 Congratulations! You've completed this stage!
                      </p>
                    )}
                    <p className="mt-1 text-sm text-green-600">Redirecting...</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving || saveSuccess}
              className={`w-full py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all flex items-center justify-center ${
                saveSuccess
                  ? 'bg-green-600 text-white cursor-default'
                  : isSaving
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#6465e0] to-[#7c7de8] hover:from-[#5658d1] hover:to-[#6465e0] text-white'
              }`}
            >
              {isSaving && (
                <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isSaving ? 'Saving...' : saveSuccess ? '✓ Saved!' : 'Save Reflection & Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}