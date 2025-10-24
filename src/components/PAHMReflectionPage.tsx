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
        router.push('/home-qa')
      }
      return
    }

    // Load session data from sessionStorage
    const activeSession = sessionStorage.getItem('activeSession')
    if (activeSession) {
      const parsedSession: SessionData = JSON.parse(activeSession)
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

    // All PAHM sessions count
    setShouldCountAsSession(true)

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
          router.push('/home-qa')
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
    
    // Only count as completed if minimum 30 minutes
    if (shouldCountAsSession && actualSessionDuration >= 30) {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700">
      {/* Navigation */}
      <Navigation currentPage="pahm-reflection" />
      
      <div className="p-8 pt-24">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-8">Practice Reflection</h1>
          
          <div className="bg-white rounded-2xl p-8">
            {/* Session Counting Status */}
            {!shouldCountAsSession && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-black p-4 mb-6 rounded">
                <p className="font-semibold">Note: This session will not count towards your progress.</p>
                <p className="text-sm">You need to complete at least 30 minutes for it to count as a completed session.</p>
                <p className="text-sm">Actual time spent: {actualSessionDuration} minutes</p>
              </div>
            )}
            
            {shouldCountAsSession && (
              <div className="bg-green-100 border-l-4 border-green-500 text-black p-4 mb-6 rounded">
                <p className="font-semibold">Great job! This session will count towards your progress.</p>
                <p className="text-sm">Time completed: {actualSessionDuration} minutes</p>
              </div>
            )}

            {/* Stage and Session Info */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-bold text-black mb-2">Session Summary</h3>
              <div className="text-black">
                <p>• Stage {stageId}: {stage?.name}</p>
                <p>• Planned Duration: {sessionDuration} minutes</p>
                <p>• Actual Duration: {actualSessionDuration} minutes</p>
                <p>• Total Matrix Clicks: {pahmStats.totals.total}</p>
                <p>• Completed: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <h2 className="text-xl font-bold text-black mb-4">What did you notice during practice</h2>
            <textarea
              value={reflection.notes}
              onChange={(e) => setReflection(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Enter your reflections and insights here"
              className="w-full h-32 p-4 border-2 border-gray-200 rounded-lg mb-8 resize-none focus:outline-none focus:border-blue-500 text-black"
            />

            {/* Quality Rating Slider */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-black mb-2">Session Quality Rating</h2>
              <p className="text-gray-600 text-sm mb-4">How would you rate the overall quality of this practice session?</p>
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
              <div className="text-center mt-2">
                <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-bold text-lg">
                  {reflection.qualityRating} / 10
                </span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-black mb-4">Challenges</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {challenges.map(challenge => (
                <button
                  key={challenge}
                  onClick={() => toggleChallenge(challenge)}
                  className={`p-4 rounded-lg border-2 text-left transition-all text-black ${
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

            <h2 className="text-xl font-bold text-black mb-4">PAHM Tracking Results</h2>
            <div className="overflow-x-auto mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="bg-teal-600 text-white p-3 text-center font-bold border border-gray-300">Time/Emotion</th>
                    <th className="bg-orange-300 text-black p-3 text-center font-bold border border-gray-300">Attachment</th>
                    <th className="bg-gray-300 text-black p-3 text-center font-bold border border-gray-300">Neutral</th>
                    <th className="bg-pink-300 text-black p-3 text-center font-bold border border-gray-300">Aversion</th>
                    <th className="bg-gray-600 text-white p-3 text-center font-bold border border-gray-300">Total</th>
                    <th className="bg-teal-600 text-white p-3 text-center font-bold border border-gray-300">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="bg-green-300 text-black p-3 text-center font-bold border border-gray-300">Present</td>
                    <td className="bg-white text-black p-3 text-center border border-gray-300">{pahmStats.present.attachment}</td>
                    <td className="bg-white text-black p-3 text-center border border-gray-300">{pahmStats.present.neutral}</td>
                    <td className="bg-white text-black p-3 text-center border border-gray-300">{pahmStats.present.aversion}</td>
                    <td className="bg-white text-black p-3 text-center border border-gray-300">{pahmStats.present.total}</td>
                    <td className="bg-white text-black p-3 text-center border border-gray-300">{pahmStats.present.percentage}%</td>
                  </tr>
                  <tr>
                    <td className="bg-yellow-300 text-black p-3 text-center font-bold border border-gray-300">Past</td>
                    <td className="bg-white text-black p-3 text-center border border-gray-300">{pahmStats.past.attachment}</td>
                    <td className="bg-white text-black p-3 text-center border border-gray-300">{pahmStats.past.neutral}</td>
                    <td className="bg-white text-black p-3 text-center border border-gray-300">{pahmStats.past.aversion}</td>
                    <td className="bg-white text-black p-3 text-center border border-gray-300">{pahmStats.past.total}</td>
                    <td className="bg-white text-black p-3 text-center border border-gray-300">{pahmStats.past.percentage}%</td>
                  </tr>
                  <tr>
                    <td className="bg-blue-300 text-black p-3 text-center font-bold border border-gray-300">Future</td>
                    <td className="bg-white text-black p-3 text-center border border-gray-300">{pahmStats.future.attachment}</td>
                    <td className="bg-white text-black p-3 text-center border border-gray-300">{pahmStats.future.neutral}</td>
                    <td className="bg-white text-black p-3 text-center border border-gray-300">{pahmStats.future.aversion}</td>
                    <td className="bg-white text-black p-3 text-center border border-gray-300">{pahmStats.future.total}</td>
                    <td className="bg-white text-black p-3 text-center border border-gray-300">{pahmStats.future.percentage}%</td>
                  </tr>
                  <tr>
                    <td className="bg-gray-600 text-white p-3 text-center font-bold border border-gray-300">Total</td>
                    <td className="bg-white text-black p-3 text-center border border-gray-300">{pahmStats.totals.attachment}</td>
                    <td className="bg-white text-black p-3 text-center border border-gray-300">{pahmStats.totals.neutral}</td>
                    <td className="bg-white text-black p-3 text-center border border-gray-300">{pahmStats.totals.aversion}</td>
                    <td className="bg-teal-700 text-white p-3 text-center font-bold border border-gray-300">{pahmStats.totals.total}</td>
                    <td className="bg-teal-600 text-white p-3 text-center font-bold border border-gray-300">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Individual Matrix Clicks Detail */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-black mb-4">Detailed Matrix Clicks</h3>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(pahmData).map(([key, value]) => (
                  <div key={key} className="bg-gray-100 p-3 rounded-lg text-center">
                    <div className="font-semibold capitalize text-black">{key}</div>
                    <div className="text-2xl font-bold text-blue-600">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Display */}
            {saveError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-800 mb-1">Error Saving Reflection</h3>
                    <p className="text-sm text-red-700">{saveError}</p>
                  </div>
                  <button
                    onClick={() => setSaveError(null)}
                    className="ml-4 text-red-600 hover:text-red-800 font-bold"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Success Display */}
            {saveSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-green-800 mb-1">✓ Reflection Saved Successfully!</h3>
                    {stageCompleted && (
                      <p className="text-sm text-green-700 font-medium">
                        🎉 Congratulations! You've completed this stage!
                      </p>
                    )}
                    <p className="text-sm text-green-600 mt-1">Redirecting...</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving || saveSuccess}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center ${
                saveSuccess
                  ? 'bg-green-600 text-white cursor-default'
                  : isSaving
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isSaving && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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