'use client'

import { CheckCircleIcon, LockClosedIcon, PlayIcon } from '@heroicons/react/24/outline'

interface StageProgressionProps {
  stages: StageData[]
  currentStage: number
  completedStages: number[]
  onStageClick?: (stageId: number) => void
  className?: string
  layout?: 'vertical' | 'horizontal'
}

interface StageData {
  id: number
  title: string
  description: string
  duration?: string
  isUnlocked: boolean
  isCompleted: boolean
  isCurrent?: boolean
}

const DEFAULT_STAGES: StageData[] = [
  {
    id: 1,
    title: 'Physical Stillness',
    description: 'Master the art of sitting still and finding physical calm',
    duration: '1-2 weeks',
    isUnlocked: true,
    isCompleted: false,
    isCurrent: true
  },
  {
    id: 2,
    title: 'Thought Patterns',
    description: 'Observe and understand your mental patterns',
    duration: '2-3 weeks',
    isUnlocked: false,
    isCompleted: false
  },
  {
    id: 3,
    title: 'Dot Tracking',
    description: 'Develop focused attention through visual tracking',
    duration: '2-3 weeks',
    isUnlocked: false,
    isCompleted: false
  },
  {
    id: 4,
    title: 'Tool-Free Practice',
    description: 'Practice mindfulness without external aids',
    duration: '3-4 weeks',
    isUnlocked: false,
    isCompleted: false
  },
  {
    id: 5,
    title: 'Sustained Presence',
    description: 'Maintain awareness for extended periods',
    duration: '4-6 weeks',
    isUnlocked: false,
    isCompleted: false
  },
  {
    id: 6,
    title: 'Integration & Teaching',
    description: 'Apply mindfulness in daily life and share with others',
    duration: 'Ongoing',
    isUnlocked: false,
    isCompleted: false
  }
]

export default function StageProgression({
  stages = DEFAULT_STAGES,
  currentStage = 1,
  completedStages = [],
  onStageClick,
  className = '',
  layout = 'vertical'
}: StageProgressionProps) {

  const getStageStatus = (stage: StageData) => {
    if (completedStages.includes(stage.id)) return 'completed'
    if (stage.id === currentStage) return 'current'
    if (stage.isUnlocked || stage.id <= currentStage) return 'unlocked'
    return 'locked'
  }

  const getStageIcon = (stage: StageData, status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-6 h-6 text-white" />
      case 'current':
        return <PlayIcon className="w-6 h-6 text-white" />
      case 'unlocked':
        return <span className="text-white font-bold">{stage.id}</span>
      case 'locked':
        return <LockClosedIcon className="w-6 h-6 text-gray-400" />
      default:
        return <span className="text-gray-400 font-bold">{stage.id}</span>
    }
  }

  const getStageColors = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'var(--success-500)',
          border: 'var(--success-500)',
          text: 'var(--gray-900)',
          description: 'var(--gray-600)'
        }
      case 'current':
        return {
          bg: 'var(--blue-500)',
          border: 'var(--blue-500)',
          text: 'var(--gray-900)',
          description: 'var(--gray-600)'
        }
      case 'unlocked':
        return {
          bg: 'var(--teal-500)',
          border: 'var(--teal-500)',
          text: 'var(--gray-900)',
          description: 'var(--gray-600)'
        }
      case 'locked':
        return {
          bg: 'var(--gray-200)',
          border: 'var(--gray-300)',
          text: 'var(--gray-400)',
          description: 'var(--gray-400)'
        }
      default:
        return {
          bg: 'var(--gray-200)',
          border: 'var(--gray-300)',
          text: 'var(--gray-400)',
          description: 'var(--gray-400)'
        }
    }
  }

  const layoutClasses = layout === 'horizontal' 
    ? 'flex flex-wrap gap-4 justify-center'
    : 'space-y-4'

  const stageCardClasses = layout === 'horizontal'
    ? 'flex-1 min-w-64 max-w-80'
    : 'w-full'

  return (
    <div className={`stage-progression ${layoutClasses} ${className}`}>
      {stages.map((stage, index) => {
        const status = getStageStatus(stage)
        const colors = getStageColors(status)
        const isClickable = onStageClick && (status === 'unlocked' || status === 'current' || status === 'completed')

        return (
          <div key={stage.id} className="relative">
            {/* Connection Line (vertical layout only) */}
            {layout === 'vertical' && index < stages.length - 1 && (
              <div 
                className="absolute left-6 top-12 w-0.5 h-8 z-0"
                style={{
                  backgroundColor: completedStages.includes(stage.id) ? 'var(--success-500)' : 'var(--gray-300)'
                }}
              />
            )}

            {/* Stage Card */}
            <div
              className={`
                stage-card 
                card 
                relative 
                z-10
                ${stageCardClasses}
                ${isClickable ? 'card-interactive cursor-pointer' : 'cursor-default'}
              `}
              style={{
                borderColor: colors.border,
                opacity: status === 'locked' ? 0.6 : 1
              }}
              onClick={() => isClickable && onStageClick?.(stage.id)}
              role={isClickable ? 'button' : 'presentation'}
              tabIndex={isClickable ? 0 : -1}
              aria-label={isClickable ? `Go to ${stage.title}` : undefined}
              onKeyDown={(e) => {
                if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  onStageClick?.(stage.id)
                }
              }}
            >
              {/* Stage Number/Icon */}
              <div 
                className="stage-number"
                style={{
                  backgroundColor: colors.bg,
                  borderColor: colors.border
                }}
              >
                {getStageIcon(stage, status)}
              </div>

              {/* Stage Content */}
              <div className="pt-2">
                <h3 
                  className="text-h4 mb-2"
                  style={{ color: colors.text }}
                >
                  {stage.title}
                </h3>
                
                <p 
                  className="text-body-sm mb-3"
                  style={{ color: colors.description }}
                >
                  {stage.description}
                </p>

                {stage.duration && (
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-xs font-medium px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: status === 'locked' ? 'var(--gray-100)' : 'var(--blue-50)',
                        color: status === 'locked' ? 'var(--gray-400)' : 'var(--blue-600)'
                      }}
                    >
                      {stage.duration}
                    </span>
                  </div>
                )}

                {/* Status Indicator */}
                <div className="mt-3 flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: colors.bg }}
                  />
                  <span 
                    className="text-xs font-medium capitalize"
                    style={{ color: colors.text }}
                  >
                    {status === 'current' ? 'In Progress' : status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Progress Summary Component
interface ProgressSummaryProps {
  totalStages: number
  completedStages: number
  currentStage: number
  className?: string
}

export function ProgressSummary({ 
  totalStages, 
  completedStages, 
  currentStage, 
  className = '' 
}: ProgressSummaryProps) {
  const progressPercentage = (completedStages / totalStages) * 100
  const currentProgressPercentage = ((completedStages + 0.5) / totalStages) * 100

  return (
    <div className={`progress-summary ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-label">Overall Progress</span>
        <span className="text-sm font-medium text-gray-600">
          {completedStages} of {totalStages} stages completed
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        {/* Completed Progress */}
        <div
          className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
        
        {/* Current Stage Progress */}
        {currentStage <= totalStages && completedStages < totalStages && (
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${Math.min(currentProgressPercentage - progressPercentage, 100 - progressPercentage)}%` }}
          />
        )}
      </div>
      
      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>Stage {Math.min(currentStage, totalStages)} of {totalStages}</span>
        <span>{Math.round(currentProgressPercentage)}% complete</span>
      </div>
    </div>
  )
}

export type { StageData }