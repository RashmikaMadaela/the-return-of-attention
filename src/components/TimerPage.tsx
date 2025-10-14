'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navigation from './Navigation'

interface TimerState {
  minutes: number
  seconds: number
  isRunning: boolean
  totalSeconds: number
  startedAt: Date | null
}

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

export default function TimerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const stageId = searchParams.get('stage')
  const sessionId = searchParams.get('sessionId') // Get sessionId from URL
  const isAdminMode = searchParams.get('admin') === 'true'
  const audioContextRef = useRef<AudioContext | null>(null)

  const [timer, setTimer] = useState<TimerState>({
    minutes: 10,
    seconds: 0,
    isRunning: false,
    totalSeconds: 600,
    startedAt: null
  })

  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [sessionSettings, setSessionSettings] = useState<any>(null)
  const [stage, setStage] = useState<any>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Load session data from sessionStorage (set by SessionSetupPage)
    const activeSession = sessionStorage.getItem('activeSession')
    if (activeSession) {
      const parsedSession: SessionData = JSON.parse(activeSession)
      setSessionData(parsedSession)
      setSessionSettings(parsedSession.settings)
      
      // Set timer duration from session data
      const duration = parsedSession.duration
      setTimer(prev => ({
        ...prev,
        minutes: duration,
        totalSeconds: duration * 60
      }))

      // Set stage info
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
    } else {
      // Fallback: Try old sessionSettings format for backward compatibility
      const settings = sessionStorage.getItem('sessionSettings')
      if (settings) {
        const parsedSettings = JSON.parse(settings)
        setSessionSettings(parsedSettings)
        const duration = parsedSettings.duration || 10
        setTimer(prev => ({
          ...prev,
          minutes: duration,
          totalSeconds: duration * 60
        }))
      } else {
        console.warn('No session data found, redirecting to setup...')
        router.push(`/stage-1/session-setup?stage=${stageId}`)
      }
    }

    // Verify sessionId is present
    if (!sessionId && !isAdminMode) {
      console.warn('No sessionId found in URL, redirecting to setup...')
      router.push(`/stage-1/session-setup?stage=${stageId}`)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [stageId, sessionId, isAdminMode, router])

  const playBell = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      
      const audioContext = audioContextRef.current
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2)
      
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 2)
    } catch (error) {
      console.log('Audio not available')
    }
  }

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const startTimer = async () => {
    if (sessionSettings?.bells) {
      await playBell()
    }
    
    setTimer(prev => ({
      ...prev,
      isRunning: true,
      startedAt: new Date()
    }))

    intervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev.totalSeconds <= 1) {
          // Timer finished
          clearInterval(intervalRef.current!)
          handleTimerComplete()
          return {
            ...prev,
            totalSeconds: 0,
            minutes: 0,
            seconds: 0,
            isRunning: false
          }
        }
        
        const newTotal = prev.totalSeconds - 1
        return {
          ...prev,
          totalSeconds: newTotal,
          minutes: Math.floor(newTotal / 60),
          seconds: newTotal % 60
        }
      })
    }, 1000)
  }

  const pauseTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    setTimer(prev => ({
      ...prev,
      isRunning: false
    }))
  }

  const resumeTimer = () => {
    setTimer(prev => ({
      ...prev,
      isRunning: true
    }))

    intervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev.totalSeconds <= 1) {
          clearInterval(intervalRef.current!)
          handleTimerComplete()
          return {
            ...prev,
            totalSeconds: 0,
            minutes: 0,
            seconds: 0,
            isRunning: false
          }
        }
        
        const newTotal = prev.totalSeconds - 1
        return {
          ...prev,
          totalSeconds: newTotal,
          minutes: Math.floor(newTotal / 60),
          seconds: newTotal % 60
        }
      })
    }, 1000)
  }

  const handleTimerComplete = async () => {
    if (sessionSettings?.bells) {
      await playBell()
      setTimeout(() => playBell(), 1000)
      setTimeout(() => playBell(), 2000)
    }
    
    // Calculate actual session duration (in minutes)
    const actualDurationMinutes = sessionSettings?.duration || 10
    sessionStorage.setItem('actualSessionDuration', actualDurationMinutes.toString())
    
    // Navigate to reflection page with sessionId after a brief pause
    setTimeout(() => {
      if (sessionId) {
        router.push(`/stage-1/reflection?sessionId=${sessionId}&stage=${stageId}`)
      } else {
        // Fallback for backward compatibility
        router.push(`/stage-1/reflection?stage=${stageId}`)
      }
    }, 3000)
  }

  const handleStop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    // Navigate to reflection page
    router.push(`/stage-1/reflection?stage=${stageId}`)
  }

  const progress = sessionSettings ? 
    ((sessionSettings.duration * 60 - timer.totalSeconds) / (sessionSettings.duration * 60)) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col">
      {/* Navigation */}
      <Navigation currentPage="stage-1" />
      
      <div className="flex-1 flex items-center justify-center p-8 pt-24">
        <div className="max-w-4xl mx-auto w-full">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            {stage?.name}: Physical Stillness Training
          </h1>
          
          <div className="bg-blue-900 rounded-2xl p-8">
            {/* Timer Display */}
            <div className="text-center mb-8">
              <div className="text-8xl font-mono font-bold text-white mb-4">
                {formatTime(timer.totalSeconds)}
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-blue-800 rounded-full h-4 mb-6">
                <div 
                  className="bg-cyan-400 h-4 rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <p className="text-white text-lg mb-2">
                Posture: {sessionSettings?.posture?.replace('-', ' ') || 'Not set'}
              </p>
              <p className="text-cyan-200">
                Focus on maintaining complete physical stillness
              </p>
            </div>

            {/* Timer Controls */}
            <div className="flex justify-center gap-4 mb-8">
              {!timer.isRunning ? (
                timer.startedAt ? (
                  <button
                    onClick={resumeTimer}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-xl font-semibold flex items-center gap-2"
                  >
                    ▶️ Resume
                  </button>
                ) : (
                  <button
                    onClick={startTimer}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-xl font-semibold flex items-center gap-2"
                  >
                    ▶️ Start Meditation
                  </button>
                )
              ) : (
                <button
                  onClick={pauseTimer}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-4 rounded-xl text-xl font-semibold flex items-center gap-2"
                >
                  ⏸️ Pause
                </button>
              )}
              
              <button
                onClick={() => {
                  // Calculate actual session duration
                  const actualDuration = Math.floor(((sessionSettings?.duration || 10) * 60 - timer.totalSeconds) / 60)
                  sessionStorage.setItem('actualSessionDuration', actualDuration.toString())
                  
                  // Navigate to reflection with sessionId
                  if (sessionId) {
                    router.push(`/stage-1/reflection?sessionId=${sessionId}&stage=${stageId}`)
                  } else {
                    router.push(`/stage-1/reflection?stage=${stageId}`)
                  }
                }}
                className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 rounded-xl text-xl font-semibold flex items-center gap-2"
              >
                ✓ Complete
              </button>
            </div>

            {/* Admin Controls - Only show in admin mode */}
            {isAdminMode && (
              <div className="bg-red-900/50 rounded-xl p-6 mb-8 border-2 border-red-500">
                <h3 className="text-red-300 font-bold text-lg mb-4 text-center">🔧 Admin Testing Controls</h3>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => {
                      // Fast forward by 5 minutes
                      setTimer(prev => ({
                        ...prev,
                        totalSeconds: Math.max(0, prev.totalSeconds - 300)
                      }))
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
                  >
                    ⏩ Fast Forward 5min
                  </button>
                  
                  <button
                    onClick={() => {
                      // Skip to end of session
                      setTimer(prev => ({
                        ...prev,
                        totalSeconds: 0
                      }))
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
                  >
                    ⏭️ Skip Session
                  </button>
                  
                  <button
                    onClick={() => {
                      // Go back to admin page
                      router.push('/admin/stage-testing')
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
                  >
                    🔙 Back to Admin
                  </button>
                </div>
              </div>
            )}

            

            {timer.totalSeconds === 0 && (
              <div className="mt-6 bg-green-600 rounded-xl p-6 text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Session Complete! 🎉</h3>
                <p className="text-green-100">Redirecting to reflection...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}