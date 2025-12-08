'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Navigation from './Navigation'
import { useThemeColors } from '@/hooks/useThemeColors'

export default function PAHMMatrixIntroPage() {
  const { bgGradientTop, bgGradientBottom, topicColor, buttonColor, containerColor, textColor1, textColor2 } = useThemeColors()
  const router = useRouter()

  const handleBack = () => {
    const previousPage = sessionStorage.getItem('previousPage')
    if (previousPage) {
      router.push(previousPage)
    } else {
      router.push('/stage-1')
    }
  }

  const handleStartPractice = () => {
    // Store that we're starting stage 2 PAHM practice
    sessionStorage.setItem('selectedStage', '2')
    sessionStorage.setItem('previousPage', '/pahm-matrix-intro')
    
    // Navigate to PAHM session setup for stage 2 PAHM practice
    router.push('/pahm-session-setup?stage=2')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b" style={{ backgroundImage: `linear-gradient(to bottom, ${bgGradientTop}, ${bgGradientBottom})` }}>
      {/* Navigation */}
      <Navigation currentPage="pahm-matrix" />
      
      {/* Main Content */}
      <div className="p-4 sm:p-8 pt-20 sm:pt-24 pb-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 mt-4 sm:mt-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4" style={{ color: topicColor }}>
              The PAHM Matrix
            </h1>
            <p className="text-black text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
              Present Attention and Happiness Matrix - The ultimate tool for achieving happiness that stays. 
              Track your attention patterns and cultivate lasting wellbeing through awareness.
            </p>
          </div>

          {/* PAHM Matrix Visual */}
          <div className="rounded-xl p-4 sm:p-6 md:p-8 mb-6 shadow-2xl" style={{ backgroundColor: containerColor }}>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 text-center mb-4">
              The PAHM Matrix
            </h2>
            <p className="text-center mb-4 text-sm sm:text-base">
              A 3×3 grid that maps your attention across two dimensions:
            </p>
            
            <div className="mb-6 space-y-2 text-sm sm:text-base">
              <p className="font-semibold">Time Orientation: Past, Present, or Future</p>
              <p className="font-semibold">Emotional Charge: Likes (Attachment), Neutral, or Dislikes (Aversion)</p>
            </div>

            {/* 3x3 Grid with Squares */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 max-w-2xl mx-auto">
              <div className="aspect-square bg-yellow-200 rounded-lg flex items-center justify-center p-2">
                <p className="font-bold text-xs sm:text-sm md:text-base text-center">NOSTALGIA</p>
              </div>
              <div className="aspect-square bg-green-200 rounded-lg flex items-center justify-center p-2">
                <p className="font-bold text-xs sm:text-sm md:text-base text-center">LIKES</p>
              </div>
              <div className="aspect-square bg-blue-200 rounded-lg flex items-center justify-center p-2">
                <p className="font-bold text-xs sm:text-sm md:text-base text-center">ANTICIPATION</p>
              </div>
              
              <div className="aspect-square bg-yellow-100 rounded-lg flex items-center justify-center p-2">
                <p className="font-bold text-xs sm:text-sm md:text-base text-center">PAST</p>
              </div>
              <div className="aspect-square bg-white border-4 border-blue-600 rounded-lg flex items-center justify-center p-2">
                <p className="font-bold text-blue-600 text-xs sm:text-sm md:text-base text-center">PRESENT</p>
              </div>
              <div className="aspect-square bg-blue-100 rounded-lg flex items-center justify-center p-2">
                <p className="font-bold text-xs sm:text-sm md:text-base text-center">FUTURE</p>
              </div>
              
              <div className="aspect-square bg-pink-200 rounded-lg flex items-center justify-center p-2">
                <p className="font-bold text-xs sm:text-sm md:text-base text-center">REGRET</p>
              </div>
              <div className="aspect-square bg-pink-300 rounded-lg flex items-center justify-center p-2">
                <p className="font-bold text-xs sm:text-sm md:text-base text-center">DISLIKES</p>
              </div>
              <div className="aspect-square bg-purple-200 rounded-lg flex items-center justify-center p-2">
                <p className="font-bold text-xs sm:text-sm md:text-base text-center">WORRY</p>
              </div>
            </div>

            <p className="text-red-600 text-center font-semibold text-sm sm:text-base mb-4">
              Click on any position to explore where your attention naturally goes
            </p>

            <div className="flex justify-center">
              <button
                onClick={handleBack}
                className="text-white px-4 sm:px-6 py-2 rounded-lg font-semibold transition-all text-sm sm:text-base hover:opacity-90"
                style={{ backgroundColor: buttonColor }}
              >
                Back
              </button>
            </div>
          </div>

          {/* Understanding the Nine Positions */}
          <div className="rounded-xl p-4 sm:p-6 md:p-8 mb-6 shadow-2xl" style={{ backgroundColor: containerColor }}>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 mb-6">
              Understanding the Nine Positions
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'Present (Center)', color: 'blue-600', desc: 'Pure awareness in the here and now. This is the state of complete attention in which mindfulness exists in the present moment without judgment.' },
                { title: 'Nostalgia', color: 'yellow-600', desc: 'Attachment to pleasant memories or thoughts. This includes clinging to and reminiscing about past experiences and longing for what was.' },
                { title: 'Likes', color: 'green-600', desc: 'Desire, craving, or clinging to experiences. This includes wanting to hold onto pleasant states and seeking out of what feels good.' },
                { title: 'Anticipation', color: 'blue-400', desc: 'Attachment to future possibilities or events. This includes excitement, hope, and looking forward to things you expect might happen.' },
                { title: 'Past (Neutral)', color: 'yellow-400', desc: 'Neutral awareness of past events. This includes recognizing and trusting from experiences without emotional charge.' },
                { title: 'Future (Neutral)', color: 'gray-400', desc: 'Neutral awareness of what may come. This includes practical planning and preparation without anxiety or excessive hope.' },
                { title: 'Regret', color: 'pink-600', desc: 'Aversion to past experiences or decisions. This includes self-criticism, shame, and wishing things had been different.' },
                { title: 'Dislikes', color: 'pink-700', desc: 'Resistance, avoidance, or rejection of experiences. This includes wanting to push away unpleasant states and wanting the bad to end.' },
                { title: 'Worry', color: 'purple-600', desc: 'Aversion to future possibilities or events. This includes anxiety, fear, and catastrophizing about what might happen.' }
              ].map((item, index) => (
                <div key={index} className={`border-l-4 border-${item.color} pl-4`}>
                  <h3 className="font-bold mb-2 text-sm sm:text-base">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-700">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits of PAHM Practice */}
          <div className="rounded-xl p-4 sm:p-6 md:p-8 mb-6 shadow-2xl" style={{ backgroundColor: containerColor }}>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 mb-4">
              Benefits of PAHM Practice
            </h2>
            <ul className="space-y-3">
              {[
                'Happiness that stays - independent of changing circumstances',
                'Increased awareness of your attention patterns',
                'Greater ability to notice when your mind wanders',
                'Better understanding of your mental habits without judgment',
                'Enhanced emotional regulation',
                'Reduced reactivity to thoughts and feelings',
                'More stable attention and focus',
                'Deeper connection with your present experience'
              ].map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1 flex-shrink-0">✓</span>
                  <span className="text-sm sm:text-base">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* The Philosophy Behind PAHM */}
          <div className="rounded-xl p-4 sm:p-6 md:p-8 mb-6 shadow-2xl" style={{ backgroundColor: containerColor }}>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 mb-4">
              The Philosophy Behind PAHM
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-gray-700">
              <p>
                As described in "The Return of Attention," PAHM is based on the understanding that lasting happiness 
                comes not from controlling our experiences, but from developing awareness of our attention patterns.
              </p>
              <p>
                When we observe without judgment where our attention naturally goes, we gain freedom from the automatic 
                reactions that cause suffering.
              </p>
              <p>
                PAHM practice reveals that happiness is available in any moment through awareness itself, regardless of 
                circumstance. This is why PAHM is considered the ultimate tool for achieving lasting happiness - it works 
                with any experience, requires no special conditions, and develops a capacity for wellbeing that remains 
                stable through life's inevitable changes.
              </p>
            </div>
          </div>

          {/* Start Practice Button */}
          <div className="flex justify-center">
            <button
              onClick={handleStartPractice}
              className="text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-sm sm:text-base md:text-lg transition-all shadow-lg hover:opacity-90"
              style={{ backgroundColor: buttonColor }}
            >
              Start PAHM Practice
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}