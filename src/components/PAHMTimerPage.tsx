'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navigation from './Navigation'
import SessionTimeControls from './SessionTimeControls'
import { type PAHMClick, type PAHMPosition } from '@/lib/api/sessions'
import ConfirmDialog from './ui/ConfirmDialog'
import { useMeditationAudio } from '@/hooks/useMeditationAudio'
import { useWakeLock } from '@/hooks/useWakeLock'

interface TimerState {
  minutes: number
  seconds: number
  isRunning: boolean
  totalSeconds: number
  startedAt: Date | null
}

interface PAHMTracking {
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

export default function PAHMTimerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const stageId = searchParams.get('stage') || '2'
  const sessionId = searchParams.get('sessionId') // Get sessionId from URL
  const mindRecoverySession = searchParams.get('session')
  const isAdminMode = searchParams.get('admin') === 'true'
  
  const isMindRecovery = stageId === 'mind-recovery'

  const [timer, setTimer] = useState<TimerState>({
    minutes: 30,
    seconds: 0,
    isRunning: false,
    totalSeconds: 1800,
    startedAt: null
  })

  const [timeMultiplier, setTimeMultiplier] = useState(1)
  const [fastForwardActive, setFastForwardActive] = useState(false)

  const [pahmTracking, setPahmTracking] = useState<PAHMTracking>({
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

  // Track PAHM clicks with full data (timestamp, coordinates)
  const [pahmClicks, setPahmClicks] = useState<PAHMClick[]>([])
  const sessionStartTimeRef = useRef<number>(Date.now())

  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [sessionSettings, setSessionSettings] = useState<any>(null)
  const [stage, setStage] = useState<any>(null)
  const [clickedButton, setClickedButton] = useState<string | null>(null)
  
  // Confirmation dialog state
  const [showSkipConfirm, setShowSkipConfirm] = useState(false)
  const [pulsingButtons, setPulsingButtons] = useState<string[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const pulseIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const clickAudioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize meditation audio hook
  const { playBell, playVoice } = useMeditationAudio({
    bellsEnabled: sessionSettings?.bells ?? false,
    voiceEnabled: sessionSettings?.voiceCommands ?? false,
    isRunning: timer.isRunning,
    totalSeconds: timer.totalSeconds,
    initialDuration: sessionSettings?.duration || 30
  })

  // Initialize wake lock to prevent screen timeout
  const { isSupported: wakeLockSupported, isLocked: screenLocked } = useWakeLock({
    isActive: timer.isRunning
  })

  useEffect(() => {
    // Set session start time
    sessionStartTimeRef.current = Date.now()

    // Initialize click audio
    if (typeof window !== 'undefined' && !clickAudioRef.current) {
      clickAudioRef.current = new Audio('/audio/click.mp3')
      clickAudioRef.current.volume = 0.4 // Lower volume for subtle feedback
      clickAudioRef.current.preload = 'auto'
    }

    // Load session data from sessionStorage (set by PAHMSessionSetupPage)
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

      // Load stage info
      const currentStage = getStageInfo(parseInt(stageId))
      setStage(currentStage)
    } else {
      // Fallback: Try old sessionSettings format for backward compatibility
      const settings = sessionStorage.getItem('sessionSettings')
      if (settings) {
        const parsedSettings = JSON.parse(settings)
        setSessionSettings(parsedSettings)
        const duration = parsedSettings.duration || 30
        setTimer(prev => ({
          ...prev,
          minutes: duration,
          totalSeconds: duration * 60
        }))
        
        const currentStage = getStageInfo(parseInt(stageId))
        setStage(currentStage)
      } else {
        console.warn('No session data found, redirecting to setup...')
        router.push(`/pahm-session-setup?stage=${stageId}`)
      }
    }

    // Verify sessionId is present
    if (!sessionId && !isAdminMode) {
      console.warn('No sessionId found in URL, redirecting to setup...')
      if (isMindRecovery) {
        router.push(`/pahm-session-setup?type=mind-recovery&session=${mindRecoverySession}`)
      } else {
        router.push(`/pahm-session-setup?stage=${stageId}`)
      }
    }

    // Auto-pulse animation removed per user request
    // startPulseAnimation()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (pulseIntervalRef.current) {
        clearInterval(pulseIntervalRef.current)
      }
      if (clickAudioRef.current) {
        clickAudioRef.current.pause()
        clickAudioRef.current = null
      }
    }
  }, [stageId, sessionId, isAdminMode, isMindRecovery, mindRecoverySession, router])

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
      name: stageNames[stageNum as keyof typeof stageNames] || 'PAHM Trainee',
      minTime: 30
    }
  }

  const startPulseAnimation = () => {
    const buttons = ['nostalgia', 'likes', 'anticipation', 'past', 'present', 'future', 'regret', 'dislikes', 'worry']
    
    const randomPulse = () => {
      const numButtons = Math.floor(Math.random() * 2) + 2 // 2 or 3 buttons
      const selectedButtons: string[] = []
      const availableButtons = [...buttons]
      
      for (let i = 0; i < numButtons; i++) {
        const randomIndex = Math.floor(Math.random() * availableButtons.length)
        selectedButtons.push(availableButtons[randomIndex])
        availableButtons.splice(randomIndex, 1)
      }
      
      setPulsingButtons(selectedButtons)
      setTimeout(() => setPulsingButtons([]), 800)
    }

    pulseIntervalRef.current = setInterval(randomPulse, 1500)
  }

  // playBell and playVoice are now provided by useMeditationAudio hook

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const startTimer = async () => {
    if (sessionSettings?.bells) {
      playBell()
    }
    
    setTimer(prev => ({
      ...prev,
      isRunning: true,
      startedAt: new Date()
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

  const pauseTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    setTimer(prev => ({
      ...prev,
      isRunning: !prev.isRunning
    }))
  }

  const handleTimerComplete = async () => {
    if (sessionSettings?.bells) {
      playBell()
      setTimeout(() => playBell(), 1000)
      setTimeout(() => playBell(), 2000)
    }
    
    // Store PAHM click data for reflection page (full data for API)
    sessionStorage.setItem('pahmClickData', JSON.stringify(pahmClicks))
    sessionStorage.setItem('pahmTracking', JSON.stringify(pahmTracking)) // Simple counts for display
    sessionStorage.setItem('sessionDuration', (sessionSettings?.duration || 30).toString())
    sessionStorage.setItem('actualSessionDuration', (sessionSettings?.duration || 30).toString())
    
    // Navigate to reflection page with sessionId after a brief pause
    setTimeout(() => {
      if (isMindRecovery) {
        // Mind recovery sessions go to reflection page with sessionId
        if (sessionId) {
          router.push(`/pahm-reflection?sessionId=${sessionId}&stage=mind-recovery&session=${mindRecoverySession}`)
        } else {
          router.push(`/pahm-reflection?stage=mind-recovery&session=${mindRecoverySession}`)
        }
      } else {
        // Regular PAHM sessions go to reflection page with sessionId
        if (sessionId) {
          router.push(`/pahm-reflection?sessionId=${sessionId}&stage=${stageId}`)
        } else {
          router.push(`/pahm-reflection?stage=${stageId}`)
        }
      }
    }, 3000)
  }



  const handlePahmClick = (position: keyof PAHMTracking, event?: React.MouseEvent) => {
    if (timer.isRunning) {
      // Play click sound
      if (clickAudioRef.current) {
        try {
          const clickClone = clickAudioRef.current.cloneNode() as HTMLAudioElement
          clickClone.volume = clickAudioRef.current.volume
          clickClone.play().catch(err => console.log('Click sound not available:', err))
        } catch (error) {
          console.log('Click sound error:', error)
        }
      }

      // Update simple tracking (for display)
      setPahmTracking(prev => ({
        ...prev,
        [position]: prev[position] + 1
      }))
      
      // Track full click data with timestamp and coordinates for API
      const now = Date.now()
      const timeFromStart = Math.floor((now - sessionStartTimeRef.current) / 1000) // seconds
      
      let coordinates = { x: 0, y: 0 }
      if (event) {
        const rect = event.currentTarget.getBoundingClientRect()
        coordinates = {
          x: Math.floor(event.clientX - rect.left),
          y: Math.floor(event.clientY - rect.top)
        }
      }

      const click: PAHMClick = {
        position: position as PAHMPosition,
        timestamp: new Date(now).toISOString(), // Convert to ISO string
        timeFromStart: timeFromStart,
        coordinates: coordinates
      }

      setPahmClicks(prev => [...prev, click])
      
      // Visual feedback
      setClickedButton(position)
      setTimeout(() => setClickedButton(null), 300)
    }
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
        
        const actualDurationMinutes = sessionSettings?.duration || 30
        
        // First, update the session with the full planned duration
        // This ensures time-skipped sessions count toward hour requirements
        await updateSession(sessionId, {
          duration: actualDurationMinutes
        })
        
        // Then complete the session with current PAHM data
        await completeSession({
          sessionId,
          qualityRating: 5, // Default rating for time-skipped sessions
          insights: 'Session completed via Time Skip',
          pahmData: {
            totalClicks: pahmTracking.nostalgia + pahmTracking.likes + pahmTracking.anticipation +
                        pahmTracking.past + pahmTracking.present + pahmTracking.future +
                        pahmTracking.regret + pahmTracking.dislikes + pahmTracking.worry,
            clickData: pahmClicks,
            patternNotes: 'Time Skip completion'
          }
        })

        // Clear session storage
        sessionStorage.removeItem('activeSession')
        sessionStorage.removeItem('pahmClickData')
        sessionStorage.removeItem('pahmTracking')
        sessionStorage.removeItem('sessionDuration')
        sessionStorage.removeItem('actualSessionDuration')
        
        // Redirect based on session type
        setTimeout(() => {
          if (isMindRecovery) {
            router.push('/mind-recovery')
          } else {
            router.push('/home')
          }
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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#b9d4ee] to-[#fffafa]">
      {/* Navigation */}
      <Navigation currentPage="pahm-timer" />
      
      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showSkipConfirm}
        title="Skip Session?"
        message="Skip to the end of this session? This will mark the session as completed with current PAHM data."
        variant="warning"
        confirmText="Yes, Skip"
        cancelText="Cancel"
        onConfirm={executeTimeSkip}
        onCancel={() => setShowSkipConfirm(false)}
      />
      
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 rgba(255, 255, 255, 0); }
          50% { box-shadow: 0 0 30px rgba(255, 255, 255, 0.8), 0 0 60px rgba(255, 255, 255, 0.4); }
        }
        .pulse-animation {
          animation: pulse-glow 0.8s ease-in-out;
        }
        .click-animation {
          animation: click-scale 0.3s ease-out;
        }
        @keyframes click-scale {
          0% { transform: scale(1); }
          50% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        button:not(:disabled):hover {
          transform: scale(1.05);
        }
        .btn-nostalgia:hover:not(:disabled) { background-color: #fb923c; }
        .btn-likes:hover:not(:disabled) { background-color: #2dd4bf; }
        .btn-anticipation:hover:not(:disabled) { background-color: #c084fc; }
        .btn-past:hover:not(:disabled) { background-color: #facc15; }
        .btn-present:hover:not(:disabled) { background-color: #d1d5db; }
        .btn-future:hover:not(:disabled) { background-color: #60a5fa; }
        .btn-regret:hover:not(:disabled) { background-color: #fb923c; }
        .btn-dislikes:hover:not(:disabled) { background-color: #f9a8d4; }
        .btn-worry:hover:not(:disabled) { background-color: #e9d5ff; }
      `}</style>
      
      <div className="flex items-center justify-center flex-1 p-4 pt-20 sm:p-6 sm:pt-24 lg:p-8">
        <div className="w-full max-w-3xl p-5 bg-[#e5f3ff] rounded-xl sm:p-6 lg:p-12 shadow-2xl">
          <div className="text-center">
            <h1 className="px-2 mb-4 text-xl font-bold text-[#03478f] sm:text-2xl lg:text-3xl sm:mb-6">
              {isMindRecovery ? stage?.name : `Stage ${stageId}: ${stage?.name}`}
            </h1>
            
            <div className="inline-block px-4 py-2 mx-2 mb-4 text-xs text-center text-white bg-gradient-to-r from-[#6465e0] to-[#7c7de8] rounded-lg sm:px-6 sm:py-3 sm:mb-6 sm:text-sm shadow-md">
              Notice where your attention goes, tap when you recognize thoughts
            </div>

            <div className="flex items-center justify-center gap-2 mb-6 sm:gap-3 sm:mb-8">
              <div className="px-4 py-4 text-5xl font-bold text-gray-900 bg-white sm:text-6xl lg:text-7xl sm:px-5 lg:px-6 sm:py-5 lg:py-6 rounded-xl">
                {formatTime(timer.totalSeconds).split(':')[0]}
              </div>
              <div className="text-5xl font-bold text-[#03478f] sm:text-6xl lg:text-7xl">:</div>
              <div className="px-4 py-4 text-5xl font-bold text-gray-900 bg-white sm:text-6xl lg:text-7xl sm:px-5 lg:px-6 sm:py-5 lg:py-6 rounded-xl">
                {formatTime(timer.totalSeconds).split(':')[1]}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 mb-6 bg-gray-200 rounded-full sm:h-4 sm:mb-8">
              <div 
                className="h-3 sm:h-4 transition-all duration-1000 rounded-full bg-gradient-to-r from-[#6465e0] to-[#7c7de8]"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* PAHM Matrix */}
            <div className="grid max-w-xs grid-cols-3 gap-2 px-2 mx-auto mb-6 sm:gap-3 lg:gap-4 sm:mb-8 sm:max-w-md lg:max-w-lg">
              <button
                onClick={(e) => handlePahmClick('nostalgia', e)}
                disabled={!timer.isRunning}
                className={`btn-nostalgia bg-orange-300 text-black font-semibold aspect-square rounded-xl sm:rounded-2xl transition-all disabled:opacity-50 text-xs sm:text-sm lg:text-base min-h-[70px] sm:min-h-[85px] lg:min-h-[100px] flex items-center justify-center p-2 ${
                  clickedButton === 'nostalgia' ? 'click-animation' : ''
                } ${pulsingButtons.includes('nostalgia') ? 'pulse-animation' : ''}`}
              >
                Nostalgia
              </button>
              <button
                onClick={(e) => handlePahmClick('likes', e)}
                disabled={!timer.isRunning}
                className={`btn-likes bg-teal-300 text-black font-semibold aspect-square rounded-xl sm:rounded-2xl transition-all disabled:opacity-50 text-xs sm:text-sm lg:text-base min-h-[70px] sm:min-h-[85px] lg:min-h-[100px] flex items-center justify-center p-2 ${
                  clickedButton === 'likes' ? 'click-animation' : ''
                } ${pulsingButtons.includes('likes') ? 'pulse-animation' : ''}`}
              >
                Likes
              </button>
              <button
                onClick={(e) => handlePahmClick('anticipation', e)}
                disabled={!timer.isRunning}
                className={`btn-anticipation bg-purple-300 text-black font-semibold aspect-square rounded-xl sm:rounded-2xl transition-all disabled:opacity-50 text-xs sm:text-sm lg:text-base min-h-[70px] sm:min-h-[85px] lg:min-h-[100px] flex items-center justify-center p-2 ${
                  clickedButton === 'anticipation' ? 'click-animation' : ''
                } ${pulsingButtons.includes('anticipation') ? 'pulse-animation' : ''}`}
              >
                Anticipation
              </button>

              <button
                onClick={(e) => handlePahmClick('past', e)}
                disabled={!timer.isRunning}
                className={`btn-past bg-yellow-400 text-black font-semibold aspect-square rounded-xl sm:rounded-2xl transition-all disabled:opacity-50 text-xs sm:text-sm lg:text-base min-h-[70px] sm:min-h-[85px] lg:min-h-[100px] flex items-center justify-center p-2 ${
                  clickedButton === 'past' ? 'click-animation' : ''
                } ${pulsingButtons.includes('past') ? 'pulse-animation' : ''}`}
              >
                Past
              </button>
              <button
                onClick={(e) => handlePahmClick('present', e)}
                disabled={!timer.isRunning}
                className={`btn-present bg-gray-200 text-black font-semibold aspect-square rounded-xl sm:rounded-2xl transition-all disabled:opacity-50 text-xs sm:text-sm lg:text-base min-h-[70px] sm:min-h-[85px] lg:min-h-[100px] flex items-center justify-center p-2 leading-tight ${
                  clickedButton === 'present' ? 'click-animation' : ''
                } ${pulsingButtons.includes('present') ? 'pulse-animation' : ''}`}
              >
                Present<br/>or Neutral
              </button>
              <button
                onClick={(e) => handlePahmClick('future', e)}
                disabled={!timer.isRunning}
                className={`btn-future bg-blue-300 text-black font-semibold aspect-square rounded-xl sm:rounded-2xl transition-all disabled:opacity-50 text-xs sm:text-sm lg:text-base min-h-[70px] sm:min-h-[85px] lg:min-h-[100px] flex items-center justify-center p-2 ${
                  clickedButton === 'future' ? 'click-animation' : ''
                } ${pulsingButtons.includes('future') ? 'pulse-animation' : ''}`}
              >
                Future
              </button>

              <button
                onClick={(e) => handlePahmClick('regret', e)}
                disabled={!timer.isRunning}
                className={`btn-regret bg-orange-400 text-black font-semibold aspect-square rounded-xl sm:rounded-2xl transition-all disabled:opacity-50 text-xs sm:text-sm lg:text-base min-h-[70px] sm:min-h-[85px] lg:min-h-[100px] flex items-center justify-center p-2 ${
                  clickedButton === 'regret' ? 'click-animation' : ''
                } ${pulsingButtons.includes('regret') ? 'pulse-animation' : ''}`}
              >
                Regret
              </button>
              <button
                onClick={(e) => handlePahmClick('dislikes', e)}
                disabled={!timer.isRunning}
                className={`btn-dislikes bg-pink-300 text-black font-semibold aspect-square rounded-xl sm:rounded-2xl transition-all disabled:opacity-50 text-xs sm:text-sm lg:text-base min-h-[70px] sm:min-h-[85px] lg:min-h-[100px] flex items-center justify-center p-2 ${
                  clickedButton === 'dislikes' ? 'click-animation' : ''
                } ${pulsingButtons.includes('dislikes') ? 'pulse-animation' : ''}`}
              >
                Dislikes
              </button>
              <button
                onClick={(e) => handlePahmClick('worry', e)}
                disabled={!timer.isRunning}
                className={`btn-worry bg-purple-200 text-black font-semibold aspect-square rounded-xl sm:rounded-2xl transition-all disabled:opacity-50 text-xs sm:text-sm lg:text-base min-h-[70px] sm:min-h-[85px] lg:min-h-[100px] flex items-center justify-center p-2 ${
                  clickedButton === 'worry' ? 'click-animation' : ''
                } ${pulsingButtons.includes('worry') ? 'pulse-animation' : ''}`}
              >
                Worry
              </button>
            </div>

            {/* Control Buttons */}
            <div className="flex flex-col gap-3 px-2 mb-6 sm:flex-row sm:gap-4">
              {!timer.isRunning ? (
                <button
                  onClick={startTimer}
                  className="flex-1 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-6 sm:px-8 py-4 sm:py-4 rounded-xl text-base sm:text-lg lg:text-xl font-semibold min-h-[56px] transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <span className="emoji" role="img" aria-label="play">▶️</span>
                  <span>Start</span>
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-6 sm:px-8 py-4 sm:py-4 rounded-xl text-base sm:text-lg lg:text-xl font-semibold min-h-[56px] transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <span className="emoji" role="img" aria-label="pause">⏸️</span>
                  <span>Pause</span>
                </button>
              )}
              
              {timer.startedAt && (
                <button
                  onClick={() => {
                    // Calculate actual session duration
                    const actualDuration = Math.floor(((sessionSettings?.duration || 30) * 60 - timer.totalSeconds) / 60)
                    // Save PAHM click data for reflection page (both full data and simple counts)
                    sessionStorage.setItem('pahmClickData', JSON.stringify(pahmClicks))
                    sessionStorage.setItem('pahmTracking', JSON.stringify(pahmTracking))
                    sessionStorage.setItem('pahmData', JSON.stringify(pahmTracking))
                    sessionStorage.setItem('sessionDuration', actualDuration.toString())
                    sessionStorage.setItem('actualSessionDuration', actualDuration.toString())
                    
                    if (isMindRecovery) {
                      // Mind recovery sessions go to reflection page with sessionId
                      if (sessionId) {
                        router.push(`/pahm-reflection?sessionId=${sessionId}&stage=mind-recovery&session=${mindRecoverySession}`)
                      } else {
                        router.push(`/pahm-reflection?stage=mind-recovery&session=${mindRecoverySession}`)
                      }
                    } else {
                      // Regular PAHM sessions go to reflection page with sessionId
                      if (sessionId) {
                        router.push(`/pahm-reflection?sessionId=${sessionId}&stage=${stageId}`)
                      } else {
                        router.push(`/pahm-reflection?stage=${stageId}`)
                      }
                    }
                  }}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#6465e0] to-[#7c7de8] hover:from-[#5658d1] hover:to-[#6465e0] text-white px-6 sm:px-8 py-4 sm:py-4 rounded-xl text-base sm:text-lg lg:text-xl font-semibold min-h-[56px] transition-all shadow-md"
                >
                  ✓ Complete
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
              className="mb-6"
            />

            {/* Admin Controls - Only show in admin mode */}
            {isAdminMode && (
              <div className="p-6 mb-6 border-2 border-red-500 bg-red-900/50 rounded-xl">
                <h3 className="mb-4 text-lg font-bold text-center text-red-300">🔧 Admin Testing Controls</h3>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => {
                      // Go back to admin page
                      router.push('/admin/stage-testing')
                    }}
                    className="flex items-center gap-2 px-6 py-3 font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700"
                  >
                    🔙 Back to Admin
                  </button>
                </div>
              </div>
            )}
          
            {/* Current Tracking Display 
            <div className="text-sm text-white">
              <p className="mb-2 font-semibold">Current Tracking:</p>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(pahmTracking).map(([key, value]) => (
                  <div key={key} className="p-2 bg-blue-800 rounded">
                    {key}: {value}
                  </div>
                ))}
              </div>
            </div>
            */}
            
            {timer.totalSeconds === 0 && (
              <div className="p-6 mt-6 bg-green-600 rounded-xl">
                <h3 className="mb-2 text-2xl font-bold text-white">Session Complete! 🎉</h3>
                <p className="text-green-100">Redirecting to reflection...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}