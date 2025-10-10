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

  // Get stage info - Only handles Stage 1 T1-T5
  const getStageInfo = () => {
    const stageNum = parseInt(stageId || '1')
    
    // Stage 1 T1-T5 with fixed durations
    const stageDurations = {
      1: { name: 'T1', minTime: 10, maxTime: 30 },
      2: { name: 'T2', minTime: 15, maxTime: 30 },
      3: { name: 'T3', minTime: 20, maxTime: 30 },
      4: { name: 'T4', minTime: 25, maxTime: 30 },
      5: { name: 'T5', minTime: 30, maxTime: 30 }
    }
    
    const stageInfo = stageDurations[stageNum as keyof typeof stageDurations] || stageDurations[1]
    return {
      id: stageNum,
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

  const handleStart = () => {
    // Store session settings and stage info
    const settingsToStore = {
      ...sessionSettings,
      stage: stageId || '1',
      title: `${stage.name}: Physical Stillness Training`
    }
    
    sessionStorage.setItem('sessionSettings', JSON.stringify(settingsToStore))
    sessionStorage.setItem('currentStage', stageId || '1')
    sessionStorage.setItem('previousPage', `/stage-1/session-setup?stage=${stageId}`)
    
    // Stage 1 T1-T5 use regular timer page
    router.push(`/timer?stage=${stageId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
      {/* Navigation */}
      <Navigation currentPage="stage-1" />
      
      <div className="p-8 pt-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-8">Training Session</h1>
          
          <div className="bg-blue-900 rounded-2xl p-8">
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
                          ? 'bg-cyan-400 border-cyan-600' 
                          : 'bg-cyan-300 border-cyan-400 hover:bg-cyan-400'
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
                    Select Duration
                  </h2>
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-6xl font-bold text-center px-8 py-4 rounded-lg bg-gray-100">
                      {String(sessionSettings.duration).padStart(2, '0')}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setSessionSettings(prev => ({ 
                          ...prev, 
                          duration: Math.min(prev.duration + 1, stage.maxTime) 
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
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6">
                  <h2 className="text-2xl font-bold mb-6">Audio Settings</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Authentic Meditation Bells</span>
                      <button
                        onClick={() => setSessionSettings(prev => ({ ...prev, bells: !prev.bells }))}
                        className={`w-14 h-8 rounded-full transition-colors ${
                          sessionSettings.bells ? 'bg-blue-600' : 'bg-gray-300'
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
                          sessionSettings.voiceCommands ? 'bg-blue-600' : 'bg-gray-300'
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
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
                  >
                    Start
                  </button>
                </div>
              </div>
            </div>

            {/* Stage Info */}
            <div className="mt-6 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-black text-center">
                <h3 className="text-xl font-bold mb-2">
                  {stage.name}: Physical Stillness
                </h3>
                <p className="text-sm">
                  Duration: {stage.minTime}-{stage.maxTime} minutes (minimum {stage.minTime} required)
                </p>
                <p className="text-xs mt-1 opacity-90">
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