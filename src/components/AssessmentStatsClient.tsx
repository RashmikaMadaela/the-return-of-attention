'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Navigation from './Navigation'
import { AssessmentStatsData, PreferenceData } from '@/lib/data/assessment-stats-data'

interface AssessmentStatsClientProps {
  initialData: AssessmentStatsData
}

export default function AssessmentStatsClient({ initialData }: AssessmentStatsClientProps) {
  const router = useRouter()
  const { preferences } = initialData

  const handleBack = () => {
    const previousPage = sessionStorage.getItem('previousPage')
    if (previousPage) {
      router.push(previousPage)
    } else {
      router.push('/user-profile')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#b9d4ee] to-[#fffafa]">
      {/* Navigation */}
      <Navigation currentPage="assessment-stats" />
      
      <div className="p-3 pt-20 sm:p-6 sm:pt-24 md:p-8 md:pt-28">
        <div className="p-4 mx-auto shadow-2xl max-w-7xl bg-[#e5f3ff] rounded-2xl sm:rounded-3xl sm:p-6 md:p-8">
          {/* Header */}
          <div className="mb-6 text-center sm:mb-8">
            <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl text-[#03478f] mb-2">Assessment Progress</h1>
            <p className="text-sm text-gray-700 sm:text-base">Track your preference changes throughout your journey</p>
          </div>

          {/* Back Button */}
          <div className="flex justify-end mb-4 sm:mb-6 md:mb-8">
            <button 
              onClick={handleBack}
              className="bg-gradient-to-r from-[#6465e0] to-[#7c7de8] hover:from-[#5658d1] hover:to-[#6465e0] text-white font-bold px-4 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 rounded-lg sm:rounded-xl transition-colors shadow-lg text-sm sm:text-base"
            >
              ← Back
            </button>
          </div>

          {/* Mobile View: Card Layout */}
          <div className="block space-y-4 md:hidden">
            {preferences.map((pref) => (
              <div key={pref.id} className="overflow-hidden bg-white shadow-lg rounded-xl">
                {/* Category Header */}
                <div className="p-3 text-center bg-gradient-to-r from-[#6465e0] to-[#7c7de8]">
                  <h3 className="text-base font-bold text-white">{pref.category}</h3>
                </div>
                
                {/* Assessment Cards */}
                <div className="p-4 space-y-3">
                  {/* Beginner */}
                  <div className="p-3 border-l-4 border-red-500 rounded-lg bg-red-50">
                    <div className="mb-1 text-xs font-bold text-red-700 uppercase">Beginner Assessment</div>
                    <div className="text-sm font-semibold text-gray-800">{pref.beginner || 'Not completed'}</div>
                  </div>
                  
                  {/* Mid */}
                  <div className="p-3 border-l-4 border-blue-500 rounded-lg bg-blue-50">
                    <div className="mb-1 text-xs font-bold text-blue-700 uppercase">Mid Assessment</div>
                    <div className="text-sm font-semibold text-gray-800">
                      {pref.mid || <span className="italic text-blue-600">Unlocks after Stage 3</span>}
                    </div>
                  </div>
                  
                  {/* Final */}
                  <div className="p-3 border-l-4 border-green-500 rounded-lg bg-green-50">
                    <div className="mb-1 text-xs font-bold text-green-700 uppercase">Final Assessment</div>
                    <div className="text-sm font-semibold text-gray-800">
                      {pref.final || <span className="italic text-green-600">Unlocks after Stage 6</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View: Table Layout */}
          <div className="hidden overflow-hidden bg-white shadow-2xl md:block rounded-2xl sm:rounded-3xl">
            <div className="grid grid-cols-4 gap-0">
              {/* Header Row */}
              <div className="bg-gray-100"></div>
              <div className="p-4 text-center bg-gradient-to-br from-red-500 to-red-600 md:p-6">
                <h2 className="text-sm font-bold text-white md:text-base lg:text-xl">Beginner</h2>
                <h2 className="text-sm font-bold text-white md:text-base lg:text-xl">Assessment</h2>
              </div>
              <div className="p-4 text-center bg-gradient-to-br from-blue-500 to-blue-600 md:p-6">
                <h2 className="text-sm font-bold text-white md:text-base lg:text-xl">Mid</h2>
                <h2 className="text-sm font-bold text-white md:text-base lg:text-xl">Assessment</h2>
              </div>
              <div className="p-4 text-center bg-gradient-to-br from-green-500 to-green-600 md:p-6">
                <h2 className="text-sm font-bold text-white md:text-base lg:text-xl">Final</h2>
                <h2 className="text-sm font-bold text-white md:text-base lg:text-xl">Assessment</h2>
              </div>

              {/* Data Rows */}
              {preferences.map((pref) => (
                <React.Fragment key={pref.id}>
                  {/* Category Name */}
                  <div className="flex items-center justify-center p-3 border-b-2 border-white bg-gradient-to-r from-[#6465e0] to-[#7c7de8] md:p-4 lg:p-6">
                    <span className="text-sm font-bold text-center text-white leading-tight md:text-base lg:text-lg xl:text-xl">
                      {pref.category}
                    </span>
                  </div>

                  {/* Beginner Assessment */}
                  <div className="flex items-center justify-center p-3 bg-red-100 border-b-2 border-white md:p-4 lg:p-6">
                    <span className="text-sm font-semibold text-center text-gray-800 leading-tight md:text-base lg:text-lg xl:text-xl">
                      {pref.beginner || 'Not completed'}
                    </span>
                  </div>

                  {/* Mid Assessment */}
                  <div className="flex items-center justify-center p-3 bg-blue-100 border-b-2 border-white md:p-4 lg:p-6">
                      {pref.mid ? (
                        <span className="text-sm font-semibold text-center text-gray-800 leading-tight md:text-base lg:text-lg xl:text-xl">
                          {pref.mid}
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-center text-blue-700 leading-tight md:text-base lg:text-lg">
                          Unlocks after Stage 3
                        </span>
                      )}
                  </div>

                  {/* Final Assessment */}
                  <div className="flex items-center justify-center p-3 bg-green-100 border-b-2 border-white md:p-4 lg:p-6">
                      {pref.final ? (
                        <span className="text-sm font-semibold text-center text-gray-800 leading-tight md:text-base lg:text-lg xl:text-xl">
                          {pref.final}
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-center text-green-700 leading-tight md:text-base lg:text-lg">
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
