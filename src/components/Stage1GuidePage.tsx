'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Navigation from './Navigation'
import { useThemeColors } from '@/hooks/useThemeColors'

export default function Stage1GuidePage() {
  const { bgGradientTop, bgGradientBottom, topicColor, buttonColor, containerColor, textColor1, textColor2 } = useThemeColors()
  const router = useRouter()

  const handleBack = () => {
    router.push('/learn')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b" style={{ backgroundImage: `linear-gradient(to bottom, ${bgGradientTop}, ${bgGradientBottom})` }}>
      {/* Navigation */}
      <Navigation currentPage="learn" />
      
      <div className="p-8 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Header Card */}
          <div className="rounded-lg p-6 mb-6 shadow-2xl" style={{ backgroundColor: containerColor }}>
            <h1 className="text-3xl font-bold mb-2" style={{ color: topicColor }}>Stage 1: Physical Foundation</h1>
            <p className="text-black">Learn about developing physical readiness for meditation!</p>
          </div>

          {/* Welcome Card */}
          <div className="rounded-lg p-8 mb-6 shadow-2xl" style={{ backgroundColor: containerColor }}>
            <div className="text-center mb-6">
              <span className="text-5xl">🌱</span>
            </div>
            <h2 className="text-2xl font-bold text-center mb-4" style={{ color: topicColor }}>Welcome to Stage One</h2>
            <p className="text-black text-center leading-relaxed">
              As a Seeker, you're beginning the journey of developing physical readiness for meditation 
              practice. This stage focuses on building the capacity to remain physically still for extended 
              periods. You're starting an incredible journey of transformation!
            </p>
          </div>

          {/* Physical Foundation Card */}
          <div className="rounded-lg p-8 mb-6 shadow-2xl" style={{ backgroundColor: containerColor }}>
            <div className="text-center mb-6">
              <span className="text-5xl">📝</span>
            </div>
            <h2 className="text-2xl font-bold text-center mb-4" style={{ color: topicColor }}>The Physical Foundation</h2>
            <p className="text-black text-center leading-relaxed">
              Physical stillness creates the container for all mental work that follows. By training your body to 
              remain still, you develop the first essential skill for deeper practice. This is where your meditation 
              journey truly begins.
            </p>
          </div>

          {/* T1-T5 Progression Card */}
          <div className="rounded-lg p-8 mb-6 shadow-2xl" style={{ backgroundColor: containerColor }}>
            <div className="text-center mb-6">
              <span className="text-5xl">📊</span>
            </div>
            <h2 className="text-2xl font-bold text-center mb-4" style={{ color: topicColor }}>T1-T5 Progression</h2>
            <p className="text-black text-center leading-relaxed">
              Stage One is divided into 5 progressive levels (T1-T5), gradually building from 10 minutes to 30+ 
              minutes of stillness. Each level builds upon the previous one, creating a systematic approach to 
              developing physical mastery.
            </p>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <button 
              onClick={handleBack}
              className="text-white px-8 py-3 rounded-lg font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: buttonColor }}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}