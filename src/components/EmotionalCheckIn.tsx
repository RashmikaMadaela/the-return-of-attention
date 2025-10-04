'use client'

import { useState } from 'react'

interface EmotionalCheckInProps {
  onEmotionSelect?: (emotions: EmotionState[]) => void
  selectedEmotions?: string[]
  multiSelect?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

interface EmotionState {
  id: string
  emoji: string
  label: string
  color: string
  bgColor: string
}

const EMOTIONS: EmotionState[] = [
  { id: 'happy', emoji: '😊', label: 'Happy', color: 'var(--happy)', bgColor: 'rgba(253, 224, 71, 0.2)' },
  { id: 'excited', emoji: '🤩', label: 'Excited', color: 'var(--excited)', bgColor: 'rgba(249, 115, 22, 0.2)' },
  { id: 'calm', emoji: '😌', label: 'Calm', color: 'var(--calm)', bgColor: 'rgba(167, 139, 250, 0.2)' },
  { id: 'confident', emoji: '💪', label: 'Confident', color: 'var(--confident)', bgColor: 'rgba(251, 113, 133, 0.2)' },
  { id: 'peaceful', emoji: '🕊️', label: 'Peaceful', color: 'var(--peaceful)', bgColor: 'rgba(110, 231, 183, 0.2)' },
  { id: 'energetic', emoji: '⚡', label: 'Energetic', color: 'var(--energetic)', bgColor: 'rgba(251, 191, 36, 0.2)' },
  { id: 'neutral', emoji: '😐', label: 'Neutral', color: 'var(--neutral)', bgColor: 'rgba(156, 163, 175, 0.2)' },
  { id: 'tired', emoji: '😴', label: 'Tired', color: 'var(--tired)', bgColor: 'rgba(139, 92, 246, 0.2)' },
  { id: 'bored', emoji: '😑', label: 'Bored', color: 'var(--bored)', bgColor: 'rgba(100, 116, 139, 0.2)' },
  { id: 'sad', emoji: '😢', label: 'Sad', color: 'var(--sad)', bgColor: 'rgba(59, 130, 246, 0.2)' },
  { id: 'anxious', emoji: '😰', label: 'Anxious', color: 'var(--anxious)', bgColor: 'rgba(245, 158, 11, 0.2)' },
  { id: 'frustrated', emoji: '😤', label: 'Frustrated', color: 'var(--frustrated)', bgColor: 'rgba(239, 68, 68, 0.2)' },
]

export default function EmotionalCheckIn({
  onEmotionSelect,
  selectedEmotions = [],
  multiSelect = true,
  className = '',
  size = 'md'
}: EmotionalCheckInProps) {
  const [internalSelection, setInternalSelection] = useState<string[]>(selectedEmotions)

  const handleEmotionClick = (emotionId: string) => {
    let newSelection: string[]

    if (multiSelect) {
      if (internalSelection.includes(emotionId)) {
        newSelection = internalSelection.filter(id => id !== emotionId)
      } else {
        newSelection = [...internalSelection, emotionId]
      }
    } else {
      newSelection = internalSelection.includes(emotionId) ? [] : [emotionId]
    }

    setInternalSelection(newSelection)
    
    if (onEmotionSelect) {
      const selectedEmotionObjects = EMOTIONS.filter(emotion => 
        newSelection.includes(emotion.id)
      )
      onEmotionSelect(selectedEmotionObjects)
    }
  }

  const getGridClasses = () => {
    switch (size) {
      case 'sm':
        return 'grid-cols-2 gap-2 p-4'
      case 'lg':
        return 'grid-cols-4 gap-6 p-8'
      default:
        return 'grid-cols-3 gap-4 p-6'
    }
  }

  const getCardClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-3 min-h-20'
      case 'lg':
        return 'p-6 min-h-32'
      default:
        return 'p-4 min-h-24'
    }
  }

  const getEmojiSize = () => {
    switch (size) {
      case 'sm':
        return 'text-2xl'
      case 'lg':
        return 'text-5xl'
      default:
        return 'text-3xl'
    }
  }

  return (
    <div className={`emotion-grid grid ${getGridClasses()} ${className}`}>
      {EMOTIONS.map((emotion) => {
        const isSelected = internalSelection.includes(emotion.id)
        
        return (
          <div
            key={emotion.id}
            className={`
              emotion-card 
              card-interactive
              ${getCardClasses()}
              ${isSelected ? 'selected' : ''}
            `}
            style={{
              backgroundColor: isSelected ? emotion.bgColor : 'white',
              borderColor: isSelected ? emotion.color : 'var(--gray-200)',
              color: isSelected ? emotion.color : 'var(--gray-600)'
            }}
            onClick={() => handleEmotionClick(emotion.id)}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            aria-label={`Select ${emotion.label} emotion`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleEmotionClick(emotion.id)
              }
            }}
          >
            <div className={`emotion-emoji ${getEmojiSize()}`}>
              {emotion.emoji}
            </div>
            <div className="emotion-label font-medium">
              {emotion.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Helper function to get emotion data
export const getEmotionData = (emotionId: string) => {
  return EMOTIONS.find(emotion => emotion.id === emotionId)
}

// Export emotions for use in other components
export { EMOTIONS }

// Emotion summary component for displaying selected emotions
interface EmotionSummaryProps {
  selectedEmotions: string[]
  className?: string
}

export function EmotionSummary({ selectedEmotions, className = '' }: EmotionSummaryProps) {
  const emotions = EMOTIONS.filter(emotion => selectedEmotions.includes(emotion.id))

  if (emotions.length === 0) {
    return (
      <div className={`text-gray-400 text-center py-4 ${className}`}>
        No emotions selected
      </div>
    )
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {emotions.map((emotion) => (
        <div
          key={emotion.id}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border"
          style={{
            backgroundColor: emotion.bgColor,
            borderColor: emotion.color,
            color: emotion.color
          }}
        >
          <span className="text-base">{emotion.emoji}</span>
          <span className="font-medium">{emotion.label}</span>
        </div>
      ))}
    </div>
  )
}