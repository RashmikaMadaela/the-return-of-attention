'use client'

import { useRef, useEffect } from 'react'

interface AudioPlayerProps {
  src: string
  autoPlay?: boolean
  onEnded?: () => void
}

export const AudioPlayer = ({ src, autoPlay = false, onEnded }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (autoPlay) {
      audio.play().catch(console.error)
    }

    if (onEnded) {
      audio.addEventListener('ended', onEnded)
      return () => audio.removeEventListener('ended', onEnded)
    }
  }, [autoPlay, onEnded])

  return <audio ref={audioRef} src={src} preload="auto" />
}

// Hook for playing audio files
export const useAudio = () => {
  const playBell = () => {
    const audio = new Audio('/audio/bell.mp3')
    audio.play().catch(console.error)
  }

  const play5MinReminder = () => {
    const audio = new Audio('/audio/5min-reminder.mp3')
    audio.play().catch(console.error)
  }

  const playSessionComplete = () => {
    const audio = new Audio('/audio/session-complete.mp3')
    audio.play().catch(console.error)
  }

  return {
    playBell,
    play5MinReminder,
    playSessionComplete
  }
}

export default AudioPlayer