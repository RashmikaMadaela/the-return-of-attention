'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navigation from './Navigation'
import { startSessionAction } from '@/lib/actions/session-actions'
import type { StartSessionRequest } from '@/lib/api/sessions'

interface SessionSettings {
  posture: string
  duration: number
  bells: boolean
  voiceCommands: boolean
}

export default function SessionSetupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const stageId = searchParams.get('stage')
  const [sessionSettings, setSessionSettings] = useState<SessionSettings>({
    posture: 'sitting',
    duration: 10,
    bells: true,
    voiceCommands: true
  })
  
  // Loading and error states
  const [isStarting, setIsStarting] = useState(false)
  const [startError, setStartError] = useState<string | null>(null)

  // Get stage info - Only handles Stage 1 T1-T5
  const getStageInfo = () => {
    // Stage 1 T1-T5 with fixed durations
    const stageDurations: Record<string, { name: string; minTime: number; maxTime: number }> = {
      'T1': { name: 'T1', minTime: 10, maxTime: 30 },
      'T2': { name: 'T2', minTime: 15, maxTime: 30 },
      'T3': { name: 'T3', minTime: 20, maxTime: 30 },
      'T4': { name: 'T4', minTime: 25, maxTime: 30 },
      'T5': { name: 'T5', minTime: 30, maxTime: 30 }
    }
    
    const stageInfo = stageDurations[stageId || 'T1'] || stageDurations['T1']
    return {
      id: stageId || 'T1',
      name: stageInfo.name,
      minTime: stageInfo.minTime,
      maxTime: stageInfo.maxTime,
      isPAHM: false
    }
  }

  const stage = getStageInfo()

  useEffect(() => {
    // Set default duration based on stage
    setSessionSettings(prev => ({
      ...prev,
      duration: stage.minTime
    }))
  }, [stage.minTime])

  const postures = [
    { id: 'sitting', icon: '🪑', label: 'Sitting' },
    { id: 'cushion', icon: '🧘', label: 'Cushion Sitting' },
    { id: 'half-lotus', icon: '🧘', label: 'Half Lotus' },
    { id: 'lying', icon: '🛏️', label: 'Lying Down' },
    { id: 'standing', icon: '🧍', label: 'Standing' },
    { id: 'full-lotus', icon: '🧘', label: 'Full Lotus' },
    { id: 'burmese', icon: '🕉️', label: 'Burmese' },
    { id: 'seiza', icon: '🙏', label: 'Seiza Position' },
    { id: 'other', icon: '❓', label: 'Other' }
  ]

  const handleBack = () => {
    const previousPage = sessionStorage.getItem('previousPage')
    if (previousPage) {
      router.push(previousPage)
    } else {
      router.push('/stage-1')
    }
  }

  const handleStart = async () => {
    setIsStarting(true)
    setStartError(null)

    // Prepare session start request
    const request: StartSessionRequest = {
      stageNumber: 1, // Stage 1 always
      subStage: stage.name, // T1, T2, T3, T4, T5
      sessionType: 'timer_only',
      duration: sessionSettings.duration,
      posture: sessionSettings.posture as any, // Cast to match API type
      meditationBells: sessionSettings.bells,
      voiceCommands: sessionSettings.voiceCommands,
    }

    try {
      // Call server action to start session (faster than REST API)
      const response = await startSessionAction(request)

      if (!response.success) {
        setStartError(response.message)
        setIsStarting(false)
        return
      }

      // Save session ID and settings for timer page
      const sessionData = {
        sessionId: response.data!.id,
        stageNumber: response.data!.stageNumber,
        subStage: response.data!.subStage,
        sessionType: response.data!.sessionType,
        duration: response.data!.duration,
        posture: response.data!.posture,
        startedAt: response.data!.startedAt,
        settings: sessionSettings,
        title: `${stage.name}: Physical Stillness Training`
      }
      
      sessionStorage.setItem('activeSession', JSON.stringify(sessionData))
      sessionStorage.setItem('currentStage', stageId || '1')
      sessionStorage.setItem('previousPage', `/stage-1/session-setup?stage=${stageId}`)
      
      // Navigate to timer page with sessionId
      router.push(`/timer?stage=${stageId}&sessionId=${response.data!.id}`)
    } catch (error) {
      console.error('Error starting session:', error)
      setStartError('Failed to start session. Please try again.')
      setIsStarting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#b9d4ee] to-[#fffafa]">
      {/* Navigation */}
      <Navigation currentPage="stage-1" />
      
      <div className="p-3 pt-20 sm:p-6 sm:pt-24 md:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#03478f] text-center mb-4 sm:mb-6 md:mb-8 invisible">'</h1>
          
          <div className="bg-[#e5f3ff] rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              {/* Posture Selection */}
              <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 shadow-md">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 md:mb-6 text-[#03478f]">Select Your Posture</h2>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
                  {postures.map(posture => (
                    <button
                      key={posture.id}
                      onClick={() => setSessionSettings(prev => ({ ...prev, posture: posture.id }))}
                      className={`aspect-square p-2 sm:p-3 md:p-4 rounded-lg border-2 flex flex-col items-center justify-center gap-1 sm:gap-2 transition-all ${
                        sessionSettings.posture === posture.id 
                          ? 'bg-gradient-to-r from-[#6465e0] to-[#7c7de8] border-[#6465e0] text-white' 
                          : 'bg-white border-gray-300 hover:border-[#6465e0]'
                      }`}
                    >
                      <span className="text-2xl sm:text-3xl md:text-4xl">{posture.icon}</span>
                      <span className="text-[10px] sm:text-xs md:text-sm font-medium text-center leading-tight">{posture.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration and Audio Settings */}
              <div>
                <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6 shadow-md">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 md:mb-6 text-center text-[#03478f]">
                    Select Duration
                  </h2>
                  <div className="flex items-center justify-center gap-3 sm:gap-4">
                    <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-center px-4 py-3 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-lg bg-gray-100">
                      {String(sessionSettings.duration).padStart(2, '0')}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setSessionSettings(prev => ({ 
                          ...prev, 
                          duration: Math.min(prev.duration + 1, stage.maxTime) 
                        }))}
                        className="bg-gray-200 hover:bg-gray-300 p-1.5 sm:p-2 rounded text-sm sm:text-base"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => setSessionSettings(prev => ({ 
                          ...prev, 
                          duration: Math.max(prev.duration - 1, stage.minTime) 
                        }))}
                        className="bg-gray-200 hover:bg-gray-300 p-1.5 sm:p-2 rounded text-sm sm:text-base"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 shadow-md">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 md:mb-6 text-[#03478f]">Audio Settings</h2>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm sm:text-base">Meditation Bells</span>
                      <button
                        onClick={() => setSessionSettings(prev => ({ ...prev, bells: !prev.bells }))}
                        className={`w-12 h-7 sm:w-14 sm:h-8 rounded-full transition-colors ${
                          sessionSettings.bells ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full transition-transform ${
                          sessionSettings.bells ? 'translate-x-6 sm:translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm sm:text-base">Voice Commands</span>
                      <button
                        onClick={() => setSessionSettings(prev => ({ ...prev, voiceCommands: !prev.voiceCommands }))}
                        className={`w-12 h-7 sm:w-14 sm:h-8 rounded-full transition-colors ${
                          sessionSettings.voiceCommands ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full transition-transform ${
                          sessionSettings.voiceCommands ? 'translate-x-6 sm:translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Error Display */}
                {startError && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 sm:px-4 sm:py-3 rounded-lg mb-3 sm:mb-4 text-sm sm:text-base">
                    <p className="font-semibold">⚠️ Error</p>
                    <p className="text-xs sm:text-sm">{startError}</p>
                    <button 
                      onClick={() => setStartError(null)}
                      className="mt-2 text-xs sm:text-sm underline hover:no-underline"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                <div className="flex gap-3 sm:gap-4 mt-4 sm:mt-5 md:mt-6">
                  <button
                    onClick={handleBack}
                    disabled={isStarting}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 sm:py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-base min-h-[48px]"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleStart}
                    disabled={isStarting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 sm:py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base sm:text-base min-h-[48px]"
                  >
                    {isStarting ? (
                      <>
                        <div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent rounded-full" />
                        <span>Starting...</span>
                      </>
                    ) : (
                      'Start'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Stage Info */}
            <div className="mt-4 sm:mt-5 md:mt-6 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="text-black text-center">
                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">
                  {stage.name}: Physical Stillness
                </h3>
                <p className="text-xs sm:text-sm">
                  Duration: {stage.minTime}-{stage.maxTime} minutes (minimum {stage.minTime} required)
                </p>
                <p className="text-[10px] sm:text-xs mt-1 opacity-90">
                  Focus on maintaining complete physical stillness during your meditation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}