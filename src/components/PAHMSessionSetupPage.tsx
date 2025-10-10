'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navigation from './Navigation'

interface SessionSettings {
  posture: string
  duration: number
  bells: boolean
  voiceCommands: boolean
}

export default function PAHMSessionSetupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const stageId = searchParams.get('stage')
  const sessionType = searchParams.get('type') // 'pahm' for stage 2+ or 'mind-recovery'
  const mindRecoverySession = searchParams.get('session') // specific mind recovery session
  
  const [sessionSettings, setSessionSettings] = useState<SessionSettings>({
    posture: 'sitting',
    duration: 30,
    bells: true,
    voiceCommands: true
  })
  
  const [isMindRecovery, setIsMindRecovery] = useState(false)

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
            duration: parsed.duration,
            posture: parsed.posture || 'comfortable-seated'
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

  const handleStart = () => {
    // Store session settings and stage info
    const settingsToStore = {
      ...sessionSettings,
      stage: stage.isMindRecovery ? 'mind-recovery' : (stageId || '2'),
      sessionType: mindRecoverySession || sessionType,
      title: stage.name
    }
    
    sessionStorage.setItem('sessionSettings', JSON.stringify(settingsToStore))
    sessionStorage.setItem('currentStage', stageId || '2')
    
    if (stage.isMindRecovery) {
      sessionStorage.setItem('previousPage', `/pahm-session-setup?type=mind-recovery&session=${mindRecoverySession}`)
      // Mind recovery uses PAHM timer with mind-recovery stage identifier
      router.push(`/pahm-timer?stage=mind-recovery&session=${mindRecoverySession}`)
    } else {
      sessionStorage.setItem('previousPage', `/pahm-session-setup?stage=${stageId}${sessionType ? `&type=${sessionType}` : ''}`)
      // Navigate to PAHM timer
      router.push(`/pahm-timer?stage=${stageId}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800">
      {/* Navigation */}
      <Navigation currentPage="pahm-session" />
      
      <div className="p-8 pt-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-8">PAHM Session Setup</h1>
          
          <div className="bg-purple-900 rounded-2xl p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Posture Selection */}
              <div className="bg-white rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-6">Select Your Posture</h2>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {postures.map(posture => (
                    <button
                      key={posture.id}
                      onClick={() => setSessionSettings(prev => ({ ...prev, posture: posture.id }))}
                      className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                        sessionSettings.posture === posture.id 
                          ? 'bg-purple-400 border-purple-600' 
                          : 'bg-purple-300 border-purple-400 hover:bg-purple-400'
                      }`}
                    >
                      <span className="text-3xl">{posture.icon}</span>
                      <span className="text-sm font-semibold text-center">{posture.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration and Audio Settings */}
              <div>
                <div className="bg-white rounded-xl p-6 mb-6">
                  <h2 className="text-2xl font-bold mb-6 text-center">
                    {stage.isMindRecovery ? 'Fixed Duration' : 'Select Duration'}
                  </h2>
                  <div className="flex items-center justify-center gap-4">
                    <div className={`text-6xl font-bold text-center px-8 py-4 rounded-lg ${
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
                          className="bg-gray-200 hover:bg-gray-300 p-2 rounded"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => setSessionSettings(prev => ({ 
                            ...prev, 
                            duration: Math.max(prev.duration - 1, stage.minTime) 
                          }))}
                          className="bg-gray-200 hover:bg-gray-300 p-2 rounded"
                        >
                          ▼
                        </button>
                      </div>
                    )}
                  </div>
                  {stage.isMindRecovery && (
                    <p className="text-gray-600 text-center mt-4 text-sm">
                      Duration is pre-set for this mind recovery session
                    </p>
                  )}
                </div>

                <div className="bg-white rounded-xl p-6">
                  <h2 className="text-2xl font-bold mb-6">Audio Settings</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Authentic Meditation Bells</span>
                      <button
                        onClick={() => setSessionSettings(prev => ({ ...prev, bells: !prev.bells }))}
                        className={`w-14 h-8 rounded-full transition-colors ${
                          sessionSettings.bells ? 'bg-purple-600' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                          sessionSettings.bells ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Voice Commands</span>
                      <button
                        onClick={() => setSessionSettings(prev => ({ ...prev, voiceCommands: !prev.voiceCommands }))}
                        className={`w-14 h-8 rounded-full transition-colors ${
                          sessionSettings.voiceCommands ? 'bg-purple-600' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                          sessionSettings.voiceCommands ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={handleBack}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleStart}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold"
                  >
                    Start PAHM Session
                  </button>
                </div>
              </div>
            </div>

            {/* Stage Info */}
            <div className="mt-6 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-black text-center">
                <h3 className="text-xl font-bold mb-2">
                  {stage.isMindRecovery ? stage.name : `Stage ${stage.id}: ${stage.name}`}
                </h3>
                <p className="text-sm">
                  {stage.isMindRecovery 
                    ? `Fixed duration: ${stage.minTime} minutes`
                    : `Duration: ${stage.minTime}-${stage.maxTime} minutes (min ${stage.minTime} required for completion)`
                  }
                </p>
                <p className="text-xs mt-1 opacity-90">
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