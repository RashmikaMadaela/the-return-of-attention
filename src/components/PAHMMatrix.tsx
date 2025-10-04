'use client'

import { useState } from 'react'

interface PAHMMatrixProps {
  isInteractive?: boolean
  onCellClick?: (position: string, label: string) => void
  activeCell?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const PAHM_CELLS = [
  // Top row - Future
  { position: 'future-aversion', label: 'Worry', color: 'var(--pahm-worry)', bgColor: 'rgba(185, 28, 28, 0.1)' },
  { position: 'future-neutral', label: 'Future', color: 'var(--pahm-future)', bgColor: 'rgba(107, 114, 128, 0.1)' },
  { position: 'future-pleasant', label: 'Anticipation', color: 'var(--pahm-anticipation)', bgColor: 'rgba(59, 130, 246, 0.1)' },
  
  // Middle row - Present
  { position: 'present-aversion', label: 'Dislikes', color: 'var(--pahm-dislikes)', bgColor: 'rgba(220, 38, 38, 0.1)' },
  { position: 'present-center', label: 'Present', color: 'var(--pahm-present)', bgColor: 'rgba(16, 185, 129, 0.1)' },
  { position: 'present-pleasant', label: 'Likes', color: 'var(--pahm-likes)', bgColor: 'rgba(245, 158, 11, 0.1)' },
  
  // Bottom row - Past
  { position: 'past-aversion', label: 'Regret', color: 'var(--pahm-regret)', bgColor: 'rgba(239, 68, 68, 0.1)' },
  { position: 'past-neutral', label: 'Past', color: 'var(--pahm-past)', bgColor: 'rgba(107, 114, 128, 0.1)' },
  { position: 'past-pleasant', label: 'Nostalgia', color: 'var(--pahm-nostalgia)', bgColor: 'rgba(139, 92, 246, 0.1)' },
]

export default function PAHMMatrix({ 
  isInteractive = false, 
  onCellClick, 
  activeCell, 
  className = '',
  size = 'md'
}: PAHMMatrixProps) {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null)

  const handleCellClick = (position: string, label: string) => {
    if (isInteractive && onCellClick) {
      onCellClick(position, label)
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-xs gap-1 p-4'
      case 'lg':
        return 'max-w-lg gap-3 p-8'
      default:
        return 'max-w-md gap-2 p-6'
    }
  }

  const getCellSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs min-h-12 min-w-12'
      case 'lg':
        return 'text-base min-h-20 min-w-20'
      default:
        return 'text-sm min-h-16 min-w-16'
    }
  }

  return (
    <div className={`pahm-matrix ${getSizeClasses()} ${className}`}>
      {PAHM_CELLS.map((cell) => {
        const isActive = activeCell === cell.position
        const isHovered = hoveredCell === cell.position
        const isCenter = cell.position === 'present-center'
        
        return (
          <div
            key={cell.position}
            className={`
              pahm-cell 
              ${getCellSizeClasses()}
              ${isCenter ? 'center' : ''}
              ${isActive ? 'active' : ''}
              ${isInteractive ? 'cursor-pointer' : 'cursor-default'}
            `}
            style={{
              borderColor: isActive || isHovered ? cell.color : isCenter ? cell.color : 'var(--gray-200)',
              backgroundColor: isActive || isHovered ? cell.bgColor : isCenter ? cell.bgColor : 'white',
              color: isActive || isHovered ? cell.color : isCenter ? cell.color : 'var(--gray-600)',
              boxShadow: isActive ? `0 4px 14px 0 ${cell.color}25` : undefined
            }}
            onClick={() => handleCellClick(cell.position, cell.label)}
            onMouseEnter={() => isInteractive && setHoveredCell(cell.position)}
            onMouseLeave={() => isInteractive && setHoveredCell(null)}
            role={isInteractive ? 'button' : 'presentation'}
            tabIndex={isInteractive ? 0 : -1}
            aria-label={isInteractive ? `${cell.label} cell` : undefined}
            onKeyDown={(e) => {
              if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault()
                handleCellClick(cell.position, cell.label)
              }
            }}
          >
            <span className="font-medium">{cell.label}</span>
          </div>
        )
      })}
    </div>
  )
}

// Helper function to get PAHM cell data
export const getPAHMCellData = (position: string) => {
  return PAHM_CELLS.find(cell => cell.position === position)
}

// Export the cell data for use in other components
export { PAHM_CELLS }