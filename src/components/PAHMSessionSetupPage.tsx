'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navigation from './Navigation'
import { startSession, type StartSessionRequest, type ExerciseType } from '@/lib/api/sessions'
import { useThemeColors } from '@/hooks/useThemeColors'

interface SessionSettings {
  posture: string
  duration: number
  bells: boolean
  voiceCommands: boolean
  useRemote: boolean
}

export default function PAHMSessionSetupPage() {
  const { bgGradientTop, bgGradientBottom, topicColor, buttonColor, containerColor, textColor1, textColor2 } = useThemeColors()
  const router = useRouter()
  const searchParams = useSearchParams()
  const stageId = searchParams.get('stage')
  const sessionType = searchParams.get('type') // 'pahm' for stage 2+ or 'mind-recovery'
  const mindRecoverySession = searchParams.get('session') // specific mind recovery session
  
  const [sessionSettings, setSessionSettings] = useState<SessionSettings>({
    posture: 'sitting',
    duration: 30,
    bells: true,
    voiceCommands: true,
    useRemote: false
  })
  
  const [isMindRecovery, setIsMindRecovery] = useState(false)
  
  // Loading and error states
  const [isStarting, setIsStarting] = useState(false)
  const [startError, setStartError] = useState<string | null>(null)

  // Get stage info for PAHM stages and mind recovery
  const getStageInfo = () => {
    // Handle mind recovery sessions
    if (sessionType === 'mind-recovery' && mindRecoverySession) {
      const mindRecoveryDurations: { [key: string]: number } = {
        'morning': 5,
        'midday': 3,
        'emotional': 5,
        'transition': 5,
        'bedtime': 8
      }
      
      const mindRecoveryTitles: { [key: string]: string } = {
        'morning': 'Morning Recharge',
        'midday': 'Mid Day Reset',
        'emotional': 'Emotional Reset',
        'transition': 'Work-Home Transition',
        'bedtime': 'Bedtime Wind Down'
      }
      
      return {
        id: 'mind-recovery',
        name: mindRecoveryTitles[mindRecoverySession] || 'Mind Recovery',
        minTime: mindRecoveryDurations[mindRecoverySession] || 5,
        maxTime: mindRecoveryDurations[mindRecoverySession] || 5,
        isPAHM: true,
        isFixedDuration: true,
        isMindRecovery: true
      }
    }
    
    // PAHM stages 2-6 with 30-120 minute duration range
    const stageNum = parseInt(stageId || '2')
    const stageNames = {
      2: 'PAHM Trainee',
      3: 'PAHM Beginner', 
      4: 'PAHM Practitioner',
      5: 'PAHM Master',
      6: 'PAHM Illuminator'
    }
    
    return {
      id: stageNum,
      name: stageNames[stageNum as keyof typeof stageNames] || 'PAHM Trainee',
      minTime: 30,
      maxTime: 120,
      isPAHM: true
    }
  }

  const stage = getStageInfo()

  useEffect(() => {
    // Set mind recovery state based on session type
    if (sessionType === 'mind-recovery' && mindRecoverySession) {
      setIsMindRecovery(true)
    }
    
    // Set default duration based on stage
    setSessionSettings(prev => ({
      ...prev,
      duration: stage.minTime
    }))
    
    // Load existing mind recovery settings if available
    if (stage.isMindRecovery) {
      const existingSettings = sessionStorage.getItem('sessionSettings')
      if (existingSettings) {
        const parsed = JSON.parse(existingSettings)
        if (parsed.stage === 'mind-recovery') {
          setSessionSettings(prev => ({
            ...prev,
            duration: parsed.duration
          }))
        }
      }
    }
  }, [stage.minTime, sessionType, mindRecoverySession])

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
    if (stage.isMindRecovery) {
      router.push('/mind-recovery')
      return
    }
    
    const previousPage = sessionStorage.getItem('previousPage')
    if (previousPage) {
      router.push(previousPage)
    } else {
      router.push('/pahm-matrix-intro')
    }
  }

  const handleStart = async () => {
    setIsStarting(true)
    setStartError(null)

    // Map mind recovery session names to API exercise types
    const exerciseTypeMap: { [key: string]: ExerciseType } = {
      'morning': 'morning_recharge',
      'midday': 'midday_reset',
      'emotional': 'emotional_reset',
      'transition': 'work_home_transition',
      'bedtime': 'bedtime_wind_down'
    }

    // Determine session type and prepare request
    const isMindRecoverySession = stage.isMindRecovery
    const sessionTypeValue = isMindRecoverySession ? 'mind_recovery' : 'pahm_matrix'
    
    // Prepare session start request
    const request: StartSessionRequest = {
      stageNumber: isMindRecoverySession ? parseInt(stageId || '2') : parseInt(stageId || '2'),
      sessionType: sessionTypeValue as any,
      duration: sessionSettings.duration,
      posture: sessionSettings.posture as any,
      meditationBells: sessionSettings.bells,
      voiceCommands: sessionSettings.voiceCommands,
      useRemote: sessionSettings.useRemote,
    }

    // Add exercise type for mind recovery sessions
    if (isMindRecoverySession && mindRecoverySession) {
      request.exerciseType = exerciseTypeMap[mindRecoverySession]
    }

    try {
      // Call API to start session
      const response = await startSession(request)

      if (!response.success) {
        setStartError(response.message)
        setIsStarting(false)
        return
      }

      // Save session data for timer page
      const sessionData = {
        sessionId: response.data!.id,
        pahmSessionId: response.data!.pahmSessionId,
        stageNumber: response.data!.stageNumber,
        sessionType: response.data!.sessionType,
        duration: response.data!.duration,
        posture: response.data!.posture,
        startedAt: response.data!.startedAt,
        settings: sessionSettings,
        stage: stage.isMindRecovery ? 'mind-recovery' : (stageId || '2'),
        mindRecoverySession: mindRecoverySession,
        title: stage.name
      }
      
      sessionStorage.setItem('activeSession', JSON.stringify(sessionData))
      sessionStorage.setItem('currentStage', stageId || '2')
      
      if (stage.isMindRecovery) {
        sessionStorage.setItem('previousPage', `/pahm-session-setup?type=mind-recovery&session=${mindRecoverySession}`)
        // Mind recovery uses PAHM timer with mind-recovery stage identifier
        router.push(`/pahm-timer?stage=mind-recovery&session=${mindRecoverySession}&sessionId=${response.data!.id}`)
      } else {
        sessionStorage.setItem('previousPage', `/pahm-session-setup?stage=${stageId}${sessionType ? `&type=${sessionType}` : ''}`)
        // Navigate to PAHM timer
        router.push(`/pahm-timer?stage=${stageId}&sessionId=${response.data!.id}`)
      }
    } catch (error) {
      console.error('Error starting session:', error)
      setStartError('Failed to start session. Please try again.')
      setIsStarting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b" style={{ backgroundImage: `linear-gradient(to bottom, ${bgGradientTop}, ${bgGradientBottom})` }}>
      {/* Navigation */}
      <Navigation currentPage="pahm-session" />
      
      <div className="p-3 pt-20 sm:p-6 sm:pt-24 md:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="mb-4 text-2xl font-bold text-center sm:text-3xl md:text-4xl sm:mb-6 md:mb-8" style={{ color: topicColor }}>'</h1>
          
          <div className="p-4 rounded-xl sm:rounded-2xl sm:p-6 md:p-8 shadow-2xl" style={{ backgroundColor: containerColor }}>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 sm:gap-6 md:gap-8">
              {/* Posture Selection */}
              <div className="p-4 bg-white rounded-lg sm:rounded-xl sm:p-5 md:p-6 shadow-md">
                <h2 className="mb-3 text-lg font-bold sm:text-xl md:text-2xl sm:mb-4 md:mb-6" style={{ color: topicColor }}>Select Your Posture</h2>
                <div className="grid grid-cols-3 gap-2 mb-4 sm:gap-3 md:gap-4 sm:mb-5 md:mb-6">
                  {postures.map(posture => (
                    <button
                      key={posture.id}
                      onClick={() => setSessionSettings(prev => ({ ...prev, posture: posture.id }))}
                      className={`aspect-square p-2 sm:p-3 md:p-4 rounded-lg border-2 flex flex-col items-center justify-center gap-1 sm:gap-2 transition-all ${
                        sessionSettings.posture === posture.id 
                          ? 'text-white' 
                          : 'bg-white border-gray-300'
                      }`}
                      style={sessionSettings.posture === posture.id ? { backgroundColor: buttonColor, borderColor: buttonColor } : {}}
                    >
                      <span className="text-2xl sm:text-3xl md:text-4xl">{posture.icon}</span>
                      <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-center leading-tight">{posture.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration and Audio Settings */}
              <div>
                <div className="p-4 mb-4 bg-white rounded-lg sm:rounded-xl sm:p-5 md:p-6 sm:mb-5 md:mb-6 shadow-md">
                  <h2 className="mb-3 text-lg font-bold text-center sm:text-xl md:text-2xl sm:mb-4 md:mb-6" style={{ color: topicColor }}>
                    {stage.isMindRecovery ? 'Fixed Duration' : 'Select Duration'}
                  </h2>
                  <div className="flex items-center justify-center gap-3 sm:gap-4">
                    <div className={`text-4xl sm:text-5xl md:text-6xl font-bold text-center px-4 py-3 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-lg ${
                      stage.isMindRecovery ? 'bg-gray-300 text-gray-600' : 'bg-gray-100'
                    }`}>
                      {String(sessionSettings.duration).padStart(2, '0')}
                    </div>
                    {!stage.isMindRecovery && (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setSessionSettings(prev => ({ 
                            ...prev, 
                            duration: Math.min(prev.duration + 1, stage.maxTime || 120) 
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
                    )}
                  </div>
                  {stage.isMindRecovery && (
                    <p className="mt-3 text-xs text-center text-gray-600 sm:mt-4 sm:text-sm">
                      Duration is pre-set for this mind recovery session
                    </p>
                  )}
                </div>

                <div className="p-4 bg-white rounded-lg sm:rounded-xl sm:p-5 md:p-6 shadow-md">
                    <h2 className="mb-3 text-lg font-bold sm:text-xl md:text-2xl sm:mb-4 md:mb-6" style={{ color: topicColor }}>Settings</h2>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold sm:text-base">Meditation Bells</span>
                      <button
                        onClick={() => setSessionSettings(prev => ({ ...prev, bells: !prev.bells }))}
                        className={`w-12 h-7 sm:w-14 sm:h-8 rounded-full transition-colors ${
                          sessionSettings.bells ? '' : 'bg-gray-300'
                        }`}
                        style={sessionSettings.bells ? { backgroundColor: buttonColor } : {}}
                      >
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full transition-transform ${
                          sessionSettings.bells ? 'translate-x-6 sm:translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold sm:text-base">Voice Commands</span>
                      <button
                        onClick={() => setSessionSettings(prev => ({ ...prev, voiceCommands: !prev.voiceCommands }))}
                        className={`w-12 h-7 sm:w-14 sm:h-8 rounded-full transition-colors ${
                          sessionSettings.voiceCommands ? '' : 'bg-gray-300'
                        }`}
                        style={sessionSettings.voiceCommands ? { backgroundColor: buttonColor } : {}}
                      >
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full transition-transform ${
                          sessionSettings.voiceCommands ? 'translate-x-6 sm:translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                      {/* Remote toggle only relevant for PAHM sessions (this setup page) */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold sm:text-base">Use Remote</span>
                        <button
                          onClick={() => setSessionSettings(prev => ({ ...prev, useRemote: !prev.useRemote }))}
                          className={`w-12 h-7 sm:w-14 sm:h-8 rounded-full transition-colors ${
                            sessionSettings.useRemote ? '' : 'bg-gray-300'
                          }`}
                          style={sessionSettings.useRemote ? { backgroundColor: buttonColor } : {}}
                        >
                          <div className={`w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full transition-transform ${
                            sessionSettings.useRemote ? 'translate-x-6 sm:translate-x-7' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                  </div>
                </div>

                {/* Error Display */}
                {startError && (
                  <div className="px-3 py-2 mb-3 text-sm text-red-800 border border-red-200 rounded-lg bg-red-50 sm:px-4 sm:py-3 sm:mb-4 sm:text-base">
                    <p className="font-semibold">⚠️ Error</p>
                    <p className="text-xs sm:text-sm">{startError}</p>
                    <button 
                      onClick={() => setStartError(null)}
                      className="mt-2 text-xs underline sm:text-sm hover:no-underline"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                <div className="flex gap-3 mt-4 sm:gap-4 sm:mt-5 md:mt-6">
                  <button
                    onClick={handleBack}
                    disabled={isStarting}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2.5 sm:py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleStart}
                    disabled={isStarting}
                    className="flex-1 text-white py-2.5 sm:py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base hover:opacity-90"
                    style={{ backgroundColor: buttonColor }}
                  >
                    {isStarting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white rounded-full animate-spin sm:h-5 sm:w-5 border-t-transparent" />
                        <span>Starting...</span>
                      </>
                    ) : (
                      'Start PAHM Session'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Stage Info */}
            <div className="p-3 mt-4 bg-white rounded-lg sm:mt-5 md:mt-6 sm:rounded-xl sm:p-4 shadow-md">
              <div className="text-center text-black">
                <h3 className="mb-1 text-base font-bold sm:text-lg md:text-xl sm:mb-2" style={{ color: topicColor }}>
                  {stage.isMindRecovery ? stage.name : `Stage ${stage.id}: ${stage.name}`}
                </h3>
                <p className="text-xs sm:text-sm">
                  {stage.isMindRecovery 
                    ? `Fixed duration: ${stage.minTime} minutes`
                    : `Duration: ${stage.minTime}-${stage.maxTime} minutes (min ${stage.minTime} required for completion)`
                  }
                </p>
                <p className="text-[10px] sm:text-xs mt-1 opacity-90">
                  Use the PAHM Matrix to track your attention patterns during meditation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}