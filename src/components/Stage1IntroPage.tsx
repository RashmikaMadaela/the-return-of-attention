'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Navigation from './Navigation'

export default function Stage1IntroPage() {
  const router = useRouter()

  const handleStart = () => {
    // Mark intro as seen
    localStorage.setItem('stage1IntroSeen', 'true')
    localStorage.setItem('stage1Started', 'true')
    
    // Navigate to Stage 1
    router.push('/stage-1')
  }

  const handleBack = () => {
    const previousPage = sessionStorage.getItem('previousPage')
    if (previousPage) {
      router.push(previousPage)
    } else {
      router.push('/home-qa')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600">
      {/* Navigation */}
      <Navigation currentPage="stage-1" />
      
      <div className="p-8 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Header Card */}
          <div className="bg-blue-400 bg-opacity-30 backdrop-blur-sm rounded-lg p-6 mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Stage 1: Physical Foundation</h1>
            <p className="text-white text-opacity-90">You're beginning the journey of developing physical readiness for meditation!</p>
          </div>

          {/* Welcome Card */}
          <div className="bg-purple-800 bg-opacity-40 backdrop-blur-sm rounded-lg p-8 mb-6">
            <div className="text-center mb-6">
              <span className="text-5xl">🌱</span>
            </div>
            <h2 className="text-2xl font-bold text-white text-center mb-4">Welcome to Stage One</h2>
            <p className="text-white text-center leading-relaxed">
              As a Seeker, you're beginning the journey of developing physical readiness for meditation 
              practice. This stage focuses on building the capacity to remain physically still for extended 
              periods. You're starting an incredible journey of transformation!
            </p>
          </div>

          {/* Physical Foundation Card */}
          <div className="bg-purple-800 bg-opacity-40 backdrop-blur-sm rounded-lg p-8 mb-6">
            <div className="text-center mb-6">
              <span className="text-5xl">📝</span>
            </div>
            <h2 className="text-2xl font-bold text-white text-center mb-4">The Physical Foundation</h2>
            <p className="text-white text-center leading-relaxed">
              Physical stillness creates the container for all mental work that follows. By training your body to 
              remain still, you develop the first essential skill for deeper practice. This is where your meditation 
              journey truly begins.
            </p>
          </div>

          {/* T1-T5 Progression Card */}
          <div className="bg-purple-800 bg-opacity-40 backdrop-blur-sm rounded-lg p-8 mb-6">
            <div className="text-center mb-6">
              <span className="text-5xl">📊</span>
            </div>
            <h2 className="text-2xl font-bold text-white text-center mb-4">T1-T5 Progression</h2>
            <p className="text-white text-center leading-relaxed">
              Stage One is divided into 5 progressive levels (T1-T5), gradually building from 10 minutes to 30+ 
              minutes of stillness. Each level builds upon the previous one, creating a systematic approach to 
              developing physical mastery.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button 
              onClick={handleBack}
              className="bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
            >
              Back
            </button>
            <button 
              onClick={handleStart}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Start
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}