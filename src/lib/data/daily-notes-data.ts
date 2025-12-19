/**
 * SERVER-SIDE DAILY NOTES DATA FETCHER
 * Optimized for fast server component rendering
 */

import { cache } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export interface EmotionalJourneyEntry {
  id: string
  emotion: string
  type: 'quick' | 'detailed'
  description: string
  trigger: string
  intensity: number
  timestamp: string
  createdAt: Date
}

export interface DailyNotesData {
  emotionalJourney: EmotionalJourneyEntry[]
  userId: string
}

/**
 * Fetch today's emotional journey directly from database
 * Uses React cache() for deduplication during SSR
 */
export const getTodaysDailyNotes = cache(async (): Promise<DailyNotesData | null> => {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return null
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return null
    }

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Fetch today's detailed notes (quick logs are saved as detailed entries)
    const detailedNotes = await prisma.dailyNote.findMany({
      where: {
        userId: user.id,
        type: 'detailed',
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        emotion: true,
        intensity: true,
        context: true,
        trigger: true,
        createdAt: true
      }
    })

    // Transform database entries to match UI format
    const transformedEntries: EmotionalJourneyEntry[] = detailedNotes.map((note) => ({
      id: note.id,
      emotion: note.emotion || '',
      type: note.context === "Quick Log" ? 'quick' as const : 'detailed' as const,
      description: note.context === "Quick Log" 
        ? `Quick emotional check-in: ${note.emotion}`
        : note.context || `Detailed note: ${note.emotion}`,
      trigger: note.trigger || 'Not specified',
      intensity: note.intensity || 5,
      timestamp: formatTimestamp(note.createdAt),
      createdAt: note.createdAt
    }))

    return {
      emotionalJourney: transformedEntries,
      userId: user.id
    }
  } catch (error) {
    console.error('Error fetching daily notes data:', error)
    return null
  }
})

function formatTimestamp(timestamp: Date): string {
  const now = new Date()
  const noteTime = new Date(timestamp)
  const diffMs = now.getTime() - noteTime.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  return noteTime.toLocaleDateString()
}
