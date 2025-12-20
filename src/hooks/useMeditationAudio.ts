import { useEffect, useRef, useCallback } from 'react'
import * as Tone from 'tone'

interface MeditationAudioConfig {
  bellsEnabled: boolean
  voiceEnabled: boolean
  isRunning: boolean
  totalSeconds: number
  initialDuration: number // in minutes
}

interface VoiceCommand {
  timeRemaining: number // in seconds
  message: string
  suppressBell?: boolean // If true, suppress bell when this voice command plays
}

/**
 * Custom hook for managing meditation bells and voice commands
 * 
 * Features:
 * - Plays meditation bells every 60 seconds when enabled
 * - Plays voice commands at specific intervals when enabled
 * - Prevents bells and voice from clashing (voice takes priority)
 * - Automatically cleans up audio resources
 * 
 * @param config Configuration object for audio behavior
 * @returns Object with playBell and playVoice functions for manual triggers
 */
export function useMeditationAudio(config: MeditationAudioConfig) {
  const {
    bellsEnabled,
    voiceEnabled,
    isRunning,
    totalSeconds,
    initialDuration
  } = config

  // Track last actions to prevent duplicates
  const lastBellTimeRef = useRef<number>(-1)
  const lastVoiceTimeRef = useRef<number>(-1)
  const voiceInProgressRef = useRef<boolean>(false)
  
  // Audio element for bells
  const bellAudioRef = useRef<HTMLAudioElement | null>(null)
  
  // Speech synthesis
  const speechSynthRef = useRef<SpeechSynthesis | null>(null)

  // Define voice command intervals (in seconds remaining)
  const voiceCommands: VoiceCommand[] = [
    { timeRemaining: initialDuration * 60, message: 'Session started', suppressBell: true },
    { timeRemaining: 900, message: '15 minutes remaining' }, // 15 min
    { timeRemaining: 600, message: '10 minutes remaining' }, // 10 min
    { timeRemaining: 300, message: '5 minutes remaining' },  // 5 min
    { timeRemaining: 0, message: 'Session completed' }
  ]

  // Initialize audio resources
  useEffect(() => {
    // Initialize audio element for bells
    if (bellsEnabled && !bellAudioRef.current && typeof window !== 'undefined') {
      bellAudioRef.current = new Audio('/audio/bell.mp3')
      bellAudioRef.current.volume = 0.7 // Comfortable listening level
      bellAudioRef.current.preload = 'auto'
    }

    // Initialize speech synthesis
    if (voiceEnabled && typeof window !== 'undefined') {
      speechSynthRef.current = window.speechSynthesis
    }

    // Cleanup on unmount
    return () => {
      if (bellAudioRef.current) {
        bellAudioRef.current.pause()
        bellAudioRef.current = null
      }
    }
  }, [bellsEnabled, voiceEnabled])

  /**
   * Play a meditation bell sound from audio file
   */
  const playBell = useCallback(async () => {
    if (!bellsEnabled || !bellAudioRef.current) return
    
    try {
      // Clone the audio to allow overlapping plays
      const bellClone = bellAudioRef.current.cloneNode() as HTMLAudioElement
      bellClone.volume = bellAudioRef.current.volume
      await bellClone.play()
    } catch (error) {
      console.log('Bell audio not available:', error)
    }
  }, [bellsEnabled])

  /**
   * Play a voice command using Web Speech API
   */
  const playVoice = useCallback((message: string) => {
    if (!voiceEnabled || !speechSynthRef.current) return
    
    try {
      // Cancel any ongoing speech
      speechSynthRef.current.cancel()
      
      // Create utterance
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.rate = 0.9 // Slightly slower for clarity
      utterance.pitch = 1.0
      utterance.volume = 0.8
      
      // Track voice progress
      voiceInProgressRef.current = true
      utterance.onend = () => {
        voiceInProgressRef.current = false
      }
      utterance.onerror = () => {
        voiceInProgressRef.current = false
      }
      
      // Speak
      speechSynthRef.current.speak(utterance)
    } catch (error) {
      console.log('Voice command not available:', error)
      voiceInProgressRef.current = false
    }
  }, [voiceEnabled])

  /**
   * Check if it's time to play a bell (every 60 seconds)
   */
  const checkBellTiming = useCallback(() => {
    if (!bellsEnabled || !isRunning) return

    const elapsedSeconds = (initialDuration * 60) - totalSeconds
    const currentMinute = Math.floor(elapsedSeconds / 60)

    // Play bell at the start of each minute (except the very first second)
    // Only if voice is not in progress and we haven't played for this minute yet
    if (elapsedSeconds > 0 && 
        elapsedSeconds % 60 === 0 && 
        currentMinute !== lastBellTimeRef.current &&
        !voiceInProgressRef.current) {
      lastBellTimeRef.current = currentMinute
      playBell()
    }
  }, [bellsEnabled, isRunning, totalSeconds, initialDuration, playBell])

  /**
   * Check if it's time to play a voice command
   */
  const checkVoiceTiming = useCallback(() => {
    if (!voiceEnabled || !isRunning) return

    // Check each voice command
    for (const command of voiceCommands) {
      // Check if we've reached this command's time (with 1-second tolerance)
      if (Math.abs(totalSeconds - command.timeRemaining) <= 1 &&
          lastVoiceTimeRef.current !== command.timeRemaining) {
        lastVoiceTimeRef.current = command.timeRemaining
        playVoice(command.message)
        
        // If this command suppresses the bell, mark it to prevent bell for this minute
        if (command.suppressBell) {
          const currentMinute = Math.floor(((initialDuration * 60) - totalSeconds) / 60)
          lastBellTimeRef.current = currentMinute
        }
        
        break // Only play one command at a time
      }
    }
  }, [voiceEnabled, isRunning, totalSeconds, initialDuration, voiceCommands, playVoice])

  /**
   * Main effect to handle timing checks
   */
  useEffect(() => {
    if (!isRunning) return

    // Voice commands take priority - check first
    checkVoiceTiming()
    
    // Then check bells (will be skipped if voice is in progress)
    checkBellTiming()
  }, [isRunning, totalSeconds, checkVoiceTiming, checkBellTiming])

  /**
   * Reset refs when timer is stopped or restarted
   */
  useEffect(() => {
    if (!isRunning) {
      lastBellTimeRef.current = -1
      lastVoiceTimeRef.current = -1
      voiceInProgressRef.current = false
    }
  }, [isRunning])

  return {
    playBell,
    playVoice
  }
}
