'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from './Navigation'

interface PreferenceData {
  id: number
  // key matches the DB field name for mapping
  key: string
  category: string
  beginner: string | null
  mid: string | null
  final: string | null
}

export default function AssessmentStatsPage() {
  const router = useRouter()
  const [preferences, setPreferences] = useState<PreferenceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPreferencesFromDatabase()
  }, [])

  const mapAssessmentToPreferences = (assessment: any): Record<string, string> => {
    // Map the DB selfAssessment fields to the PreferenceData structure
    const mapValue = (val: string | null | undefined) => {
      if (!val) return 'No preference'
      if (val === 'no_preference') return 'No preference'
      if (val === 'flexible') return 'Some preference'
      if (val === 'strong_preference') return 'Strong preference'
      return String(val)
    }
    return {
      foodTaste: mapValue(assessment.foodTaste),
      scentsAromas: mapValue(assessment.scentsAromas),
      soundsMusic: mapValue(assessment.soundsMusic),
      visualBeauty: mapValue(assessment.visualBeauty),
      touchTextures: mapValue(assessment.touchTextures),
      thoughtsImages: mapValue(assessment.thoughtsImages)
    }
  }

  const fetchPreferencesFromDatabase = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/assessment/self-assessment')
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || `Failed to fetch self assessments (${res.status})`)
      }

      const json = await res.json()
      const assessments = json.data?.assessments || json.assessments || []

      if (!Array.isArray(assessments) || assessments.length === 0) {
        setPreferences([])
        setLoading(false)
        return
      }

      // Find latest of each type (API returns desc by createdAt)
      const initial = assessments.find((a: any) => a.type === 'initial') || null
      const mid = assessments.find((a: any) => a.type === 'mid') || null
      const final = assessments.find((a: any) => a.type === 'final') || null

      const initialMap = initial ? mapAssessmentToPreferences(initial) : null
      const midMap = mid ? mapAssessmentToPreferences(mid) : null
      const finalMap = final ? mapAssessmentToPreferences(final) : null

      const data: PreferenceData[] = [
        { id: 1, key: 'foodTaste', category: 'Food & Taste', beginner: initialMap?.foodTaste ?? null, mid: midMap?.foodTaste ?? null, final: finalMap?.foodTaste ?? null },
        { id: 2, key: 'scentsAromas', category: 'Scents & Aromas', beginner: initialMap?.scentsAromas ?? null, mid: midMap?.scentsAromas ?? null, final: finalMap?.scentsAromas ?? null },
        { id: 3, key: 'soundsMusic', category: 'Sound & Music', beginner: initialMap?.soundsMusic ?? null, mid: midMap?.soundsMusic ?? null, final: finalMap?.soundsMusic ?? null },
        { id: 4, key: 'visualBeauty', category: 'Visual & Beauty', beginner: initialMap?.visualBeauty ?? null, mid: midMap?.visualBeauty ?? null, final: finalMap?.visualBeauty ?? null },
        { id: 5, key: 'touchTextures', category: 'Touch & Texture', beginner: initialMap?.touchTextures ?? null, mid: midMap?.touchTextures ?? null, final: finalMap?.touchTextures ?? null },
        { id: 6, key: 'thoughtsImages', category: 'Thoughts', beginner: initialMap?.thoughtsImages ?? null, mid: midMap?.thoughtsImages ?? null, final: finalMap?.thoughtsImages ?? null }
      ]

      setPreferences(data)
      setLoading(false)
    } catch (err: any) {
      console.error('Error fetching preferences:', err)
      setError(err.message || 'Failed to fetch preferences')
      setLoading(false)
    }
  }

  const handleBack = () => {
    const previousPage = sessionStorage.getItem('previousPage')
    if (previousPage) {
      router.push(previousPage)
    } else {
      router.push('/user-profile')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 to-blue-300">
        <div className="text-2xl font-bold text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-300">
      {/* Navigation */}
      <Navigation currentPage="assessment-stats" />
      
      <div className="p-3 pt-20 sm:p-6 sm:pt-24 md:p-8 md:pt-28">
        <div className="p-4 mx-auto shadow-2xl max-w-7xl bg-gradient-to-b from-blue-700 to-blue-600 rounded-2xl sm:rounded-3xl sm:p-6 md:p-8">
          {/* Header with Back Button */}
          <div className="flex justify-end mb-4 sm:mb-6 md:mb-8">
            <button 
              onClick={handleBack}
              className="bg-white hover:bg-gray-100 text-blue-600 font-bold px-4 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 rounded-lg sm:rounded-xl transition-colors shadow-lg text-sm sm:text-base"
            >
              ← Back
            </button>
          </div>

          {/* Main Content Card */}
          <div className="overflow-hidden bg-white shadow-2xl rounded-2xl sm:rounded-3xl">
            {/* Table Grid */}
            <div className="grid grid-cols-4 gap-0">
              {/* Header Row */}
              <div className="bg-gray-200"></div>
              <div className="p-2 text-center bg-red-600 sm:p-4 md:p-6">
                <h2 className="text-xs font-bold text-white sm:text-sm md:text-base lg:text-xl">Beginner</h2>
                <h2 className="text-xs font-bold text-white sm:text-sm md:text-base lg:text-xl">Assessment</h2>
              </div>
              <div className="p-2 text-center bg-blue-600 sm:p-4 md:p-6">
                <h2 className="text-xs font-bold text-white sm:text-sm md:text-base lg:text-xl">Mid</h2>
                <h2 className="text-xs font-bold text-white sm:text-sm md:text-base lg:text-xl">Assessment</h2>
              </div>
              <div className="p-2 text-center bg-green-500 sm:p-4 md:p-6">
                <h2 className="text-xs font-bold text-white sm:text-sm md:text-base lg:text-xl">Final</h2>
                <h2 className="text-xs font-bold text-white sm:text-sm md:text-base lg:text-xl">Assessment</h2>
              </div>

              {/* Data Rows */}
              {preferences.map((pref) => (
                <React.Fragment key={pref.id}>
                  {/* Category Name */}
                  <div className="flex items-center justify-center p-2 bg-yellow-400 border-b-2 border-white sm:p-3 md:p-4 lg:p-6">
                    <span className="text-white font-bold text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg text-center leading-tight">
                      {pref.category}
                    </span>
                  </div>

                  {/* Beginner Assessment */}
                  <div className="flex items-center justify-center p-2 bg-red-200 border-b-2 border-white sm:p-3 md:p-4 lg:p-6">
                    <span className="text-gray-800 font-semibold text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg text-center leading-tight">
                      {pref.beginner}
                    </span>
                  </div>

                  {/* Mid Assessment */}
                  <div className="flex items-center justify-center p-2 bg-blue-200 border-b-2 border-white sm:p-3 md:p-4 lg:p-6">
                      {pref.mid ? (
                        <span className="text-gray-800 font-semibold text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg text-center leading-tight">
                          {pref.mid}
                        </span>
                      ) : (
                        <span className="text-blue-700 font-semibold text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg text-center leading-tight">
                          Unlocks after Stage 3
                        </span>
                      )}
                  </div>

                  {/* Final Assessment */}
                  <div className="flex items-center justify-center p-2 bg-green-200 border-b-2 border-white sm:p-3 md:p-4 lg:p-6">
                      {pref.final ? (
                        <span className="text-gray-800 font-semibold text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg text-center leading-tight">
                          {pref.final}
                        </span>
                      ) : (
                        <span className="text-green-700 font-semibold text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg text-center leading-tight">
                          Unlocks after Stage 6
                        </span>
                      )}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}