'use client'

import React from 'react'

interface SessionTimeControlsProps {
  onTimeSkip: () => void
  onFastForward: () => void
  fastForwardActive: boolean
  isActive: boolean
  className?: string
}

export default function SessionTimeControls({
  onTimeSkip,
  onFastForward,
  fastForwardActive,
  isActive,
  className = ''
}: SessionTimeControlsProps) {
  if (!isActive) return null

  return (
    <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6 ${className}`}>
      <button
        onClick={onTimeSkip}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold transition-all duration-300 hover:bg-blue-600 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 min-h-[48px]"
        title="Skip to the end of this session"
      >
        <span className="text-xl">⏭️</span>
        <span>Time Skip</span>
      </button>
      
      <button
        onClick={onFastForward}
        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-2 min-h-[48px] ${
          fastForwardActive 
            ? 'bg-orange-500 hover:bg-orange-600 hover:shadow-orange-500/30 text-white' 
            : 'bg-green-500 hover:bg-green-600 hover:shadow-green-500/30 text-white'
        }`}
        title={fastForwardActive ? 'Return to normal speed' : 'Speed up 10x'}
      >
        <span className="text-xl">⏩</span>
        <span className="text-sm sm:text-base">
          {fastForwardActive ? 'Normal Speed' : 'Fast Forward (10x)'}
        </span>
      </button>
    </div>
  )
}
