'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from './Navigation'

interface PreferenceData {
  id: number
  category: string
  beginner: string
  mid: string
  final: string
}

export default function AssessmentStatsPage() {
  const router = useRouter()
  const [preferences, setPreferences] = useState<PreferenceData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPreferencesFromDatabase()
  }, [])

  const fetchPreferencesFromDatabase = async () => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Get saved assessment answers from localStorage
      const savedAnswers = localStorage.getItem('selfAssessmentAnswers')
      let beginnerData: Record<string, string> = {}
      
      if (savedAnswers) {
        const answers = JSON.parse(savedAnswers)
        
        // Convert answers to preference strings
        Object.keys(answers).forEach(key => {
          const value = answers[key]
          let preference = 'No preference'
          
          if (value === 'no_preference') {
            preference = 'No preference'
          } else if (value === 'flexible') {
            preference = 'Some preference'
          } else if (value === 'strong_preference') {
            preference = 'Strong preference'
          }
          
          beginnerData[key] = preference
        })
      }
      
      // Create the preferences data structure
      const data: PreferenceData[] = [
        {
          id: 1,
          category: 'Food & Taste',
          beginner: beginnerData.foodTaste || 'No preference',
          mid: 'No preference',
          final: 'No preference'
        },
        {
          id: 2,
          category: 'Scents & Aromas',
          beginner: beginnerData.scentsAromas || 'No preference',
          mid: 'No preference',
          final: 'No preference'
        },
        {
          id: 3,
          category: 'Sound & Music',
          beginner: beginnerData.soundMusic || 'No preference',
          mid: 'No preference',
          final: 'No preference'
        },
        {
          id: 4,
          category: 'Visual & Beauty',
          beginner: beginnerData.visualBeauty || 'No preference',
          mid: 'No preference',
          final: 'No preference'
        },
        {
          id: 5,
          category: 'Touch & Texture',
          beginner: beginnerData.touchTextures || 'No preference',
          mid: 'No preference',
          final: 'No preference'
        },
        {
          id: 6,
          category: 'Thoughts',
          beginner: beginnerData.thoughtsMentalImages || 'No preference',
          mid: 'No preference',
          final: 'No preference'
        }
      ]
      
      setPreferences(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching preferences:', error)
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
      <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-300 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-300">
      {/* Navigation */}
      <Navigation currentPage="assessment-stats" />
      
      <div className="p-8 pt-24">
        <div className="max-w-7xl mx-auto bg-gradient-to-b from-blue-700 to-blue-600 rounded-3xl shadow-2xl p-8">
          {/* Header with Back Button */}
          <div className="flex justify-end mb-8">
            <button 
              onClick={handleBack}
              className="bg-white hover:bg-gray-100 text-blue-600 font-bold px-8 py-3 rounded-xl transition-colors shadow-lg"
            >
              ← Back
            </button>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Table Grid */}
            <div className="grid grid-cols-4 gap-0">
              {/* Header Row */}
              <div className="bg-gray-200"></div>
              <div className="bg-red-600 p-6 text-center">
                <h2 className="text-white font-bold text-xl">Beginner</h2>
                <h2 className="text-white font-bold text-xl">Assessment</h2>
              </div>
              <div className="bg-blue-600 p-6 text-center">
                <h2 className="text-white font-bold text-xl">Mid</h2>
                <h2 className="text-white font-bold text-xl">Assessment</h2>
              </div>
              <div className="bg-green-500 p-6 text-center">
                <h2 className="text-white font-bold text-xl">Final</h2>
                <h2 className="text-white font-bold text-xl">Assessment</h2>
              </div>

              {/* Data Rows */}
              {preferences.map((pref) => (
                <React.Fragment key={pref.id}>
                  {/* Category Name */}
                  <div className="bg-yellow-400 p-6 flex items-center justify-center border-b-2 border-white">
                    <span className="text-white font-bold text-lg text-center">
                      {pref.category}
                    </span>
                  </div>

                  {/* Beginner Assessment */}
                  <div className="bg-red-200 p-6 flex items-center justify-center border-b-2 border-white">
                    <span className="text-gray-800 font-semibold text-lg">
                      {pref.beginner}
                    </span>
                  </div>

                  {/* Mid Assessment */}
                  <div className="bg-blue-200 p-6 flex items-center justify-center border-b-2 border-white">
                    <span className="text-gray-800 font-semibold text-lg">
                      {pref.mid}
                    </span>
                  </div>

                  {/* Final Assessment */}
                  <div className="bg-green-200 p-6 flex items-center justify-center border-b-2 border-white">
                    <span className="text-gray-800 font-semibold text-lg">
                      {pref.final}
                    </span>
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