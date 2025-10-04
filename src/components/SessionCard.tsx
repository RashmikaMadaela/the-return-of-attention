'use client'

import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { 
  ClockIcon, 
  CalendarDaysIcon, 
  CheckCircleIcon,
  PlayIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import { formatRelativeTime, formatDate } from '@/lib/utils'

export interface SessionData {
  id: string
  title: string
  description?: string
  duration: number // in minutes
  type: 'meditation' | 'breathing' | 'body-scan' | 'loving-kindness' | 'walking'
  stage: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  completedAt?: Date
  lastPracticed?: Date
  completionCount: number
  averageRating?: number
  tags?: string[]
}

interface SessionCardProps {
  session: SessionData
  onStart?: (sessionId: string) => void
  onViewDetails?: (sessionId: string) => void
  variant?: 'default' | 'compact' | 'detailed'
  showProgress?: boolean
  className?: string
}

const typeIcons = {
  meditation: '🧘',
  breathing: '💨',
  'body-scan': '🫸',
  'loving-kindness': '💝',
  walking: '🚶'
}

const typeColors = {
  meditation: 'var(--blue-500)',
  breathing: 'var(--teal-500)',
  'body-scan': 'var(--purple-500)',
  'loving-kindness': 'var(--pink-500)',
  walking: 'var(--green-500)'
}

const difficultyColors = {
  beginner: 'var(--green-100)',
  intermediate: 'var(--yellow-100)', 
  advanced: 'var(--red-100)'
}

export default function SessionCard({
  session,
  onStart,
  onViewDetails,
  variant = 'default',
  showProgress = true,
  className
}: SessionCardProps) {
  const isCompleted = !!session.completedAt
  const hasBeenPracticed = session.completionCount > 0

  if (variant === 'compact') {
    return (
      <Card className={`hover:shadow-md transition-shadow ${className}`} padding="sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
              style={{ backgroundColor: typeColors[session.type] + '20' }}
            >
              {typeIcons[session.type]}
            </div>
            <div>
              <h4 className="font-medium text-sm">{session.title}</h4>
              <div className="flex items-center gap-2 text-xs text-muted">
                <ClockIcon className="h-3 w-3" />
                <span>{session.duration}min</span>
                {hasBeenPracticed && (
                  <span className="text-green-600">• {session.completionCount}x</span>
                )}
              </div>
            </div>
          </div>
          
          {onStart && (
            <Button 
              size="sm" 
              variant={isCompleted ? 'secondary' : 'primary'}
              onClick={() => onStart(session.id)}
            >
              <PlayIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    )
  }

  if (variant === 'detailed') {
    return (
      <Card className={`hover:shadow-lg transition-all duration-200 ${className}`} padding="lg">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: typeColors[session.type] + '20' }}
              >
                {typeIcons[session.type]}
              </div>
              <div>
                <h3 className="text-h4 mb-1">{session.title}</h3>
                <div className="flex items-center gap-3 text-sm text-muted">
                  <span className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    {session.duration} minutes
                  </span>
                  <span 
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: difficultyColors[session.difficulty] }}
                  >
                    {session.difficulty}
                  </span>
                  <span className="text-xs">Stage {session.stage}</span>
                </div>
              </div>
            </div>
            
            {isCompleted && (
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
            )}
          </div>

          {/* Description */}
          {session.description && (
            <p className="text-body text-muted">{session.description}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-gray-100">
            <div className="text-center">
              <div className="text-h4 font-bold" style={{ color: typeColors[session.type] }}>
                {session.completionCount}
              </div>
              <div className="text-xs text-muted">Completed</div>
            </div>
            
            {session.averageRating && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <HeartIcon className="h-4 w-4 text-red-500" />
                  <span className="text-h4 font-bold">{session.averageRating.toFixed(1)}</span>
                </div>
                <div className="text-xs text-muted">Rating</div>
              </div>
            )}
            
            {session.lastPracticed && (
              <div className="text-center">
                <div className="text-sm font-medium">
                  {formatRelativeTime(session.lastPracticed)}
                </div>
                <div className="text-xs text-muted">Last Practice</div>
              </div>
            )}
            
            <div className="text-center">
              <div className="text-sm font-medium capitalize">{session.type}</div>
              <div className="text-xs text-muted">Type</div>
            </div>
          </div>

          {/* Tags */}
          {session.tags && session.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {session.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-xs rounded-full text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {onStart && (
              <Button 
                onClick={() => onStart(session.id)}
                leftIcon={<PlayIcon className="h-4 w-4" />}
                className="flex-1"
              >
                {isCompleted ? 'Practice Again' : 'Start Session'}
              </Button>
            )}
            {onViewDetails && (
              <Button 
                variant="secondary"
                onClick={() => onViewDetails(session.id)}
              >
                Details
              </Button>
            )}
          </div>
        </div>
      </Card>
    )
  }

  // Default variant
  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`} padding="md" hover>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
              style={{ backgroundColor: typeColors[session.type] + '20' }}
            >
              {typeIcons[session.type]}
            </div>
            <div>
              <h4 className="font-semibold">{session.title}</h4>
              <div className="flex items-center gap-2 text-sm text-muted">
                <ClockIcon className="h-4 w-4" />
                <span>{session.duration}min</span>
                <span>•</span>
                <span>Stage {session.stage}</span>
              </div>
            </div>
          </div>
          
          {isCompleted && (
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          )}
        </div>

        {/* Progress */}
        {showProgress && hasBeenPracticed && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted">
              <span>Completed {session.completionCount} times</span>
              {session.lastPracticed && (
                <span>{formatRelativeTime(session.lastPracticed)}</span>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {session.description && (
          <p className="text-sm text-muted line-clamp-2">{session.description}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {onStart && (
            <Button 
              size="sm"
              onClick={() => onStart(session.id)}
              leftIcon={<PlayIcon className="h-4 w-4" />}
              className="flex-1"
            >
              {isCompleted ? 'Practice Again' : 'Start'}
            </Button>
          )}
          {onViewDetails && (
            <Button 
              size="sm"
              variant="ghost"
              onClick={() => onViewDetails(session.id)}
            >
              Details
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}