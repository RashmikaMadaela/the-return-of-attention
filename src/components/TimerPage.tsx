'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navigation from './Navigation'
import SessionTimeControls from './SessionTimeControls'
import ConfirmDialog from './ui/ConfirmDialog'

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

  const [timeMultiplier, setTimeMultiplier] = useState(1)
  const [fastForwardActive, setFastForwardActive] = useState(false)

  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [sessionSettings, setSessionSettings] = useState<any>(null)
  const [stage, setStage] = useState<any>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Confirmation dialog state
  const [showSkipConfirm, setShowSkipConfirm] = useState(false)

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
        
        const newTotal = prev.totalSeconds - timeMultiplier
        return {
          ...prev,
          totalSeconds: Math.max(0, newTotal),
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
        
        const newTotal = prev.totalSeconds - timeMultiplier
        return {
          ...prev,
          totalSeconds: Math.max(0, newTotal),
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

  const handleTimeSkip = () => {
    setShowSkipConfirm(true)
  }

  const executeTimeSkip = async () => {
    setShowSkipConfirm(false)
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    // Set timer to 0
    setTimer(prev => ({
      ...prev,
      totalSeconds: 0,
      minutes: 0,
      seconds: 0,
      isRunning: false
    }))

    // If we have a sessionId, complete the session immediately via API
    if (sessionId) {
      try {
        // Dynamically import the session functions
        const { updateSession, completeSession } = await import('@/lib/api/sessions')
        
        const actualDurationMinutes = sessionSettings?.duration || 10
        
        // First, update the session with the full planned duration
        // This ensures time-skipped sessions count toward hour requirements
        await updateSession(sessionId, {
          duration: actualDurationMinutes
        })
        
        // Then complete the session with minimal data
        await completeSession({
          sessionId,
          qualityRating: 5, // Default rating for time-skipped sessions
          insights: 'Session completed via Time Skip'
        })

        // Clear session storage
        sessionStorage.removeItem('activeSession')
        sessionStorage.removeItem('actualSessionDuration')
        
        // Redirect to home or stage page
        setTimeout(() => {
          router.push('/stage-1')
        }, 1000)
      } catch (error) {
        console.error('Error completing skipped session:', error)
        // Fall back to regular completion flow
        handleTimerComplete()
      }
    } else {
      // No sessionId, use regular flow
      handleTimerComplete()
    }
  }

  const handleFastForward = () => {
    setFastForwardActive(!fastForwardActive)
    setTimeMultiplier(fastForwardActive ? 1 : 10)
  }

  const progress = sessionSettings ? 
    ((sessionSettings.duration * 60 - timer.totalSeconds) / (sessionSettings.duration * 60)) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#b9d4ee] to-[#fffafa] flex flex-col">
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showSkipConfirm}
        title="Skip Session?"
        message="Skip to the end of this session? This will mark the session as completed."
        variant="warning"
        confirmText="Yes, Skip"
        cancelText="Cancel"
        onConfirm={executeTimeSkip}
        onCancel={() => setShowSkipConfirm(false)}
      />
      
      {/* Navigation */}
      <Navigation currentPage="stage-1" />
      
      <div className="flex-1 flex items-center justify-center p-8 pt-24">
        <div className="max-w-4xl mx-auto w-full">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            {stage?.name}: Physical Stillness Training
          </h1>
          
          <div className="bg-[#e5f3ff] rounded-2xl p-8 shadow-2xl">
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
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 px-4">
              {!timer.isRunning ? (
                timer.startedAt ? (
                  <button
                    onClick={resumeTimer}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl text-base sm:text-lg md:text-xl font-semibold flex items-center justify-center gap-2"
                  >
                    <span>▶️</span>
                    <span>Resume</span>
                  </button>
                ) : (
                  <button
                    onClick={startTimer}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl text-base sm:text-lg md:text-xl font-semibold flex items-center justify-center gap-2"
                  >
                    <span>▶️</span>
                    <span className="hidden sm:inline">Start Meditation</span>
                    <span className="sm:hidden">Start</span>
                  </button>
                )
              ) : (
                <button
                  onClick={pauseTimer}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl text-base sm:text-lg md:text-xl font-semibold flex items-center justify-center gap-2"
                >
                  <span>⏸️</span>
                  <span>Pause</span>
                </button>
              )}
              
              {timer.startedAt && (
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
                  className="bg-pink-600 hover:bg-pink-700 text-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl text-base sm:text-lg md:text-xl font-semibold flex items-center justify-center gap-2"
                >
                  <span>✓</span>
                  <span>Complete</span>
                </button>
              )}
            </div>

            {/* Session Time Controls - Available for all users */}
            <SessionTimeControls
              onTimeSkip={handleTimeSkip}
              onFastForward={handleFastForward}
              fastForwardActive={fastForwardActive}
              isActive={timer.isRunning}
              isAdminMode={isAdminMode}
            />

            {/* Admin Controls - Only show in admin mode */}
            {isAdminMode && (
              <div className="bg-red-900/50 rounded-xl p-6 mb-8 border-2 border-red-500">
                <h3 className="text-red-300 font-bold text-lg mb-4 text-center">🔧 Admin Testing Controls</h3>
                <div className="flex justify-center gap-4">
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