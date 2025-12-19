/**
 * Server-side data fetcher for Assessment Stats page
 * Retrieves user's self-assessment history for progress tracking
 */

import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export interface PreferenceData {
  id: number
  key: string
  category: string
  beginner: string | null
  mid: string | null
  final: string | null
}

export interface AssessmentStatsData {
  preferences: PreferenceData[]
  userId: string
}

/**
 * Map assessment response values to display strings
 */
function mapValue(val: string | null | undefined): string {
  if (!val) return 'No preference'
  if (val === 'no_preference') return 'No preference'
  if (val === 'flexible') return 'Some preference'
  if (val === 'strong_preference') return 'Strong preference'
  return String(val)
}

/**
 * Map assessment object to preference record
 */
function mapAssessmentToPreferences(assessment: any): Record<string, string> {
  return {
    foodTaste: mapValue(assessment.foodTaste),
    scentsAromas: mapValue(assessment.scentsAromas),
    soundsMusic: mapValue(assessment.soundsMusic),
    visualBeauty: mapValue(assessment.visualBeauty),
    touchTextures: mapValue(assessment.touchTextures),
    thoughtsImages: mapValue(assessment.thoughtsImages)
  }
}

/**
 * Fetch assessment stats with React cache() for SSR optimization
 */
export const getAssessmentStats = cache(async (): Promise<AssessmentStatsData | null> => {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return null
    }

    const userId = session.user.id

    // Fetch all self assessments for user (ordered by newest first)
    const assessments = await prisma.selfAssessment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        foodTaste: true,
        scentsAromas: true,
        soundsMusic: true,
        visualBeauty: true,
        touchTextures: true,
        thoughtsImages: true,
        createdAt: true
      }
    })

    // Find latest of each type
    const initial = assessments.find(a => a.type === 'initial') || null
    const mid = assessments.find(a => a.type === 'mid') || null
    const final = assessments.find(a => a.type === 'final') || null

    // Map to preference format
    const initialMap = initial ? mapAssessmentToPreferences(initial) : null
    const midMap = mid ? mapAssessmentToPreferences(mid) : null
    const finalMap = final ? mapAssessmentToPreferences(final) : null

    // Build preference data array
    const preferences: PreferenceData[] = [
      {
        id: 1,
        key: 'foodTaste',
        category: 'Food & Taste',
        beginner: initialMap?.foodTaste ?? null,
        mid: midMap?.foodTaste ?? null,
        final: finalMap?.foodTaste ?? null
      },
      {
        id: 2,
        key: 'scentsAromas',
        category: 'Scents & Aromas',
        beginner: initialMap?.scentsAromas ?? null,
        mid: midMap?.scentsAromas ?? null,
        final: finalMap?.scentsAromas ?? null
      },
      {
        id: 3,
        key: 'soundsMusic',
        category: 'Sound & Music',
        beginner: initialMap?.soundsMusic ?? null,
        mid: midMap?.soundsMusic ?? null,
        final: finalMap?.soundsMusic ?? null
      },
      {
        id: 4,
        key: 'visualBeauty',
        category: 'Visual & Beauty',
        beginner: initialMap?.visualBeauty ?? null,
        mid: midMap?.visualBeauty ?? null,
        final: finalMap?.visualBeauty ?? null
      },
      {
        id: 5,
        key: 'touchTextures',
        category: 'Touch & Texture',
        beginner: initialMap?.touchTextures ?? null,
        mid: midMap?.touchTextures ?? null,
        final: finalMap?.touchTextures ?? null
      },
      {
        id: 6,
        key: 'thoughtsImages',
        category: 'Thoughts',
        beginner: initialMap?.thoughtsImages ?? null,
        mid: midMap?.thoughtsImages ?? null,
        final: finalMap?.thoughtsImages ?? null
      }
    ]

    return {
      preferences,
      userId
    }

  } catch (error) {
    console.error('Error fetching assessment stats:', error)
    return null
  }
})
