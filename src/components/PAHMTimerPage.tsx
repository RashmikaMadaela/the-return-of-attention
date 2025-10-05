'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navigation } from './Navigation'

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

export default function PAHMTimerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const stageId = searchParams.get('stage') || '2'
  const mindRecoverySession = searchParams.get('session')
  const isAdminMode = searchParams.get('admin') === 'true'
  const audioContextRef = useRef<AudioContext | null>(null)
  
  const isMindRecovery = stageId === 'mind-recovery'

  const [timer, setTimer] = useState<TimerState>({
    minutes: 30,
    seconds: 0,
    isRunning: false,
    totalSeconds: 1800,
    startedAt: null
  })

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

  const [sessionSettings, setSessionSettings] = useState<any>(null)
  const [stage, setStage] = useState<any>(null)
  const [clickedButton, setClickedButton] = useState<string | null>(null)
  const [pulsingButtons, setPulsingButtons] = useState<string[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const pulseIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Load session settings and stage info
    const settings = sessionStorage.getItem('sessionSettings')
    if (settings) {
      const parsedSettings = JSON.parse(settings)
      setSessionSettings(parsedSettings)
      const duration = parsedSettings.duration
      setTimer(prev => ({
        ...prev,
        minutes: duration,
        totalSeconds: duration * 60
      }))
    }

    // Load stage info
    const currentStage = getStageInfo(parseInt(stageId))
    setStage(currentStage)

    // Start pulsing animation
    startPulseAnimation()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (pulseIntervalRef.current) {
        clearInterval(pulseIntervalRef.current)
      }
    }
  }, [stageId])

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
      isRunning: !prev.isRunning
    }))
  }

  const handleTimerComplete = async () => {
    if (sessionSettings?.bells) {
      await playBell()
      setTimeout(() => playBell(), 1000)
      setTimeout(() => playBell(), 2000)
    }
    
    // Save session completion
    const sessionData = {
      stageId: parseInt(stageId),
      duration: sessionSettings?.duration || 30,
      completedAt: new Date().toISOString(),
      posture: sessionSettings?.posture || 'sitting',
      pahmTracking: pahmTracking
    }
    
    const sessions = JSON.parse(localStorage.getItem('completedPAHMSessions') || '[]')
    sessions.push(sessionData)
    localStorage.setItem('completedPAHMSessions', JSON.stringify(sessions))
    
    // Store PAHM data for reflection page
    sessionStorage.setItem('pahmData', JSON.stringify(pahmTracking))
    sessionStorage.setItem('sessionDuration', (sessionSettings?.duration || 30).toString())
    
    // Store full session duration and navigate to reflection page after a brief pause
    sessionStorage.setItem('actualSessionDuration', (sessionSettings?.duration || 30).toString())
    setTimeout(() => {
      if (isMindRecovery) {
        // Mind recovery sessions go to reflection page with mind-recovery stage
        router.push(`/pahm-reflection?stage=mind-recovery&session=${mindRecoverySession}`)
      } else {
        // Regular PAHM sessions go to reflection page
        router.push(`/pahm-reflection?stage=${stageId}`)
      }
    }, 3000)
  }

  const handlePahmClick = (position: keyof PAHMTracking) => {
    if (timer.isRunning) {
      setPahmTracking(prev => ({
        ...prev,
        [position]: prev[position] + 1
      }))
      setClickedButton(position)
      setTimeout(() => setClickedButton(null), 300)
    }
  }

  const progress = sessionSettings ? 
    ((sessionSettings.duration * 60 - timer.totalSeconds) / (sessionSettings.duration * 60)) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col">
      <style jsx>{`
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
      
      {/* Navigation */}
      <Navigation />
      
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 pt-20 sm:pt-24">
        <div className="bg-blue-900 rounded-2xl p-4 sm:p-6 lg:p-12 max-w-3xl w-full">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 px-2">
              Stage {stageId}: {stage?.name}
            </h1>
            
            <div className="bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg inline-block mb-4 sm:mb-6 text-xs sm:text-sm mx-2 text-center">
              Notice where your attention goes, tap when you recognize thoughts
            </div>

            <div className="flex justify-center items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <div className="bg-white text-gray-900 text-4xl sm:text-5xl lg:text-6xl font-bold px-3 sm:px-4 lg:px-5 py-4 sm:py-5 lg:py-6 rounded-xl">
                {formatTime(timer.totalSeconds).split(':')[0]}
              </div>
              <div className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold">:</div>
              <div className="bg-white text-gray-900 text-4xl sm:text-5xl lg:text-6xl font-bold px-3 sm:px-4 lg:px-5 py-4 sm:py-5 lg:py-6 rounded-xl">
                {formatTime(timer.totalSeconds).split(':')[1]}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-blue-800 rounded-full h-4 mb-8">
              <div 
                className="bg-cyan-400 h-4 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* PAHM Matrix */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8 max-w-xs sm:max-w-md lg:max-w-lg mx-auto px-2">
              <button
                onClick={() => handlePahmClick('nostalgia')}
                disabled={!timer.isRunning}
                className={`btn-nostalgia bg-orange-300 text-black font-semibold aspect-square rounded-2xl transition-all disabled:opacity-50 text-xs sm:text-sm lg:text-base min-h-[60px] sm:min-h-[80px] lg:min-h-[100px] flex items-center justify-center p-1 sm:p-2 ${
                  clickedButton === 'nostalgia' ? 'click-animation' : ''
                } ${pulsingButtons.includes('nostalgia') ? 'pulse-animation' : ''}`}
              >
                Nostalgia
              </button>
              <button
                onClick={() => handlePahmClick('likes')}
                disabled={!timer.isRunning}
                className={`btn-likes bg-teal-300 text-black font-semibold aspect-square rounded-2xl transition-all disabled:opacity-50 text-xs sm:text-sm lg:text-base min-h-[60px] sm:min-h-[80px] lg:min-h-[100px] flex items-center justify-center p-1 sm:p-2 ${
                  clickedButton === 'likes' ? 'click-animation' : ''
                } ${pulsingButtons.includes('likes') ? 'pulse-animation' : ''}`}
              >
                Likes
              </button>
              <button
                onClick={() => handlePahmClick('anticipation')}
                disabled={!timer.isRunning}
                className={`btn-anticipation bg-purple-300 text-black font-semibold aspect-square rounded-2xl transition-all disabled:opacity-50 text-xs sm:text-sm lg:text-base min-h-[60px] sm:min-h-[80px] lg:min-h-[100px] flex items-center justify-center p-1 sm:p-2 ${
                  clickedButton === 'anticipation' ? 'click-animation' : ''
                } ${pulsingButtons.includes('anticipation') ? 'pulse-animation' : ''}`}
              >
                Anticipation
              </button>

              <button
                onClick={() => handlePahmClick('past')}
                disabled={!timer.isRunning}
                className={`btn-past bg-yellow-400 text-black font-semibold aspect-square rounded-2xl transition-all disabled:opacity-50 text-xs sm:text-sm lg:text-base min-h-[60px] sm:min-h-[80px] lg:min-h-[100px] flex items-center justify-center p-1 sm:p-2 ${
                  clickedButton === 'past' ? 'click-animation' : ''
                } ${pulsingButtons.includes('past') ? 'pulse-animation' : ''}`}
              >
                Past
              </button>
              <button
                onClick={() => handlePahmClick('present')}
                disabled={!timer.isRunning}
                className={`btn-present bg-gray-200 text-black font-semibold aspect-square rounded-2xl transition-all disabled:opacity-50 text-xs sm:text-sm lg:text-base min-h-[60px] sm:min-h-[80px] lg:min-h-[100px] flex items-center justify-center p-1 sm:p-2 leading-tight ${
                  clickedButton === 'present' ? 'click-animation' : ''
                } ${pulsingButtons.includes('present') ? 'pulse-animation' : ''}`}
              >
                Present<br/>or Neutral
              </button>
              <button
                onClick={() => handlePahmClick('future')}
                disabled={!timer.isRunning}
                className={`btn-future bg-blue-300 text-black font-semibold aspect-square rounded-2xl transition-all disabled:opacity-50 text-xs sm:text-sm lg:text-base min-h-[60px] sm:min-h-[80px] lg:min-h-[100px] flex items-center justify-center p-1 sm:p-2 ${
                  clickedButton === 'future' ? 'click-animation' : ''
                } ${pulsingButtons.includes('future') ? 'pulse-animation' : ''}`}
              >
                Future
              </button>

              <button
                onClick={() => handlePahmClick('regret')}
                disabled={!timer.isRunning}
                className={`btn-regret bg-orange-400 text-black font-semibold aspect-square rounded-2xl transition-all disabled:opacity-50 text-xs sm:text-sm lg:text-base min-h-[60px] sm:min-h-[80px] lg:min-h-[100px] flex items-center justify-center p-1 sm:p-2 ${
                  clickedButton === 'regret' ? 'click-animation' : ''
                } ${pulsingButtons.includes('regret') ? 'pulse-animation' : ''}`}
              >
                Regret
              </button>
              <button
                onClick={() => handlePahmClick('dislikes')}
                disabled={!timer.isRunning}
                className={`btn-dislikes bg-pink-300 text-black font-semibold aspect-square rounded-2xl transition-all disabled:opacity-50 text-xs sm:text-sm lg:text-base min-h-[60px] sm:min-h-[80px] lg:min-h-[100px] flex items-center justify-center p-1 sm:p-2 ${
                  clickedButton === 'dislikes' ? 'click-animation' : ''
                } ${pulsingButtons.includes('dislikes') ? 'pulse-animation' : ''}`}
              >
                Dislikes
              </button>
              <button
                onClick={() => handlePahmClick('worry')}
                disabled={!timer.isRunning}
                className={`btn-worry bg-purple-200 text-black font-semibold aspect-square rounded-2xl transition-all disabled:opacity-50 text-xs sm:text-sm lg:text-base min-h-[60px] sm:min-h-[80px] lg:min-h-[100px] flex items-center justify-center p-1 sm:p-2 ${
                  clickedButton === 'worry' ? 'click-animation' : ''
                } ${pulsingButtons.includes('worry') ? 'pulse-animation' : ''}`}
              >
                Worry
              </button>
            </div>

            {/* Control Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 px-4">
              {!timer.isRunning ? (
                <button
                  onClick={startTimer}
                  className="flex-1 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg lg:text-xl font-semibold min-h-[48px] transition-colors"
                >
                  ▶️ Start Meditation
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg lg:text-xl font-semibold min-h-[48px] transition-colors"
                >
                  ⏸️ Pause
                </button>
              )}
              
              <button
                onClick={() => {
                  // Calculate actual session duration
                  const actualDuration = Math.floor(((sessionSettings?.duration || 30) * 60 - timer.totalSeconds) / 60)
                  // Save current PAHM data and navigate appropriately
                  sessionStorage.setItem('pahmData', JSON.stringify(pahmTracking))
                  sessionStorage.setItem('sessionDuration', actualDuration.toString())
                  sessionStorage.setItem('actualSessionDuration', actualDuration.toString())
                  
                  if (isMindRecovery) {
                    // Mind recovery sessions go to reflection page with mind-recovery stage
                    router.push(`/pahm-reflection?stage=mind-recovery&session=${mindRecoverySession}`)
                  } else {
                    // Regular PAHM sessions go to reflection page
                    router.push(`/pahm-reflection?stage=${stageId}`)
                  }
                }}
                className="w-full sm:w-auto bg-pink-600 hover:bg-pink-700 active:bg-pink-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg lg:text-xl font-semibold min-h-[48px] transition-colors"
              >
                ✓ Complete
              </button>
            </div>

            {/* Admin Controls - Only show in admin mode */}
            {isAdminMode && (
              <div className="bg-red-900/50 rounded-xl p-6 mb-6 border-2 border-red-500">
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

            {/* Current Tracking Display */}
            <div className="text-white text-sm">
              <p className="font-semibold mb-2">Current Tracking:</p>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(pahmTracking).map(([key, value]) => (
                  <div key={key} className="bg-blue-800 p-2 rounded">
                    {key}: {value}
                  </div>
                ))}
              </div>
            </div>

            {timer.totalSeconds === 0 && (
              <div className="mt-6 bg-green-600 rounded-xl p-6">
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