'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Navigation from './Navigation'

export default function PAHMMatrixGuidePage() {
  const router = useRouter()

  const handleBack = () => {
    const previousPage = sessionStorage.getItem('previousPage')
    if (previousPage) {
      sessionStorage.removeItem('previousPage')
      router.push(previousPage)
    } else {
      router.push('/learn')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600">
      {/* Navigation */}
      <Navigation currentPage="learn" />
      
      {/* Main Content */}
      <div className="p-4 sm:p-8 pt-20 sm:pt-24 pb-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 mt-4 sm:mt-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
              The PAHM Matrix
            </h1>
            <p className="text-white text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
              Present Attention and Happiness Matrix - The ultimate tool for achieving happiness that stays. 
              Track your attention patterns and cultivate lasting wellbeing through awareness.
            </p>
          </div>

          {/* PAHM Matrix Visual */}
          <div className="bg-white rounded-xl p-4 sm:p-6 md:p-8 mb-6">
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
              This matrix helps you track where your attention naturally goes during meditation
            </p>

            <div className="flex justify-center">
              <button
                onClick={handleBack}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold transition-colors text-sm sm:text-base"
              >
                Back
              </button>
            </div>
          </div>

          {/* Understanding the Nine Positions */}
          <div className="bg-white rounded-xl p-4 sm:p-6 md:p-8 mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 mb-6">
              Understanding the Nine Positions
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="font-bold mb-2 text-sm sm:text-base">Present (Center)</h3>
                <p className="text-xs sm:text-sm text-gray-700">Pure awareness in the here and now. This is the state of complete attention in which mindfulness exists in the present moment without judgment.</p>
              </div>
              
              <div className="border-l-4 border-yellow-600 pl-4">
                <h3 className="font-bold mb-2 text-sm sm:text-base">Past Positions</h3>
                <ul className="text-xs sm:text-sm space-y-1 text-gray-700">
                  <li><strong>Nostalgia:</strong> Pleasant memories and longing for the past</li>
                  <li><strong>Past:</strong> Neutral recollection of past events</li>
                  <li><strong>Regret:</strong> Painful memories, guilt, and self-criticism</li>
                </ul>
              </div>
              
              <div className="border-l-4 border-purple-600 pl-4">
                <h3 className="font-bold mb-2 text-sm sm:text-base">Future Positions</h3>
                <ul className="text-xs sm:text-sm space-y-1 text-gray-700">
                  <li><strong>Anticipation:</strong> Excitement and desire for future events</li>
                  <li><strong>Future:</strong> Neutral planning and future thinking</li>
                  <li><strong>Worry:</strong> Anxiety, fear, and concern about the future</li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border-l-4 border-green-600 pl-4">
                <h3 className="font-bold mb-2 text-sm sm:text-base">Present Moment Reactions</h3>
                <ul className="text-xs sm:text-sm space-y-1 text-gray-700">
                  <li><strong>Likes:</strong> Attachment to pleasant present experiences</li>
                  <li><strong>Dislikes:</strong> Aversion to unpleasant present experiences</li>
                </ul>
              </div>
              
              <div className="border-l-4 border-gray-600 pl-4">
                <h3 className="font-bold mb-2 text-sm sm:text-base">The Goal</h3>
                <p className="text-xs sm:text-sm text-gray-700">
                  Through practice, you'll spend more time in the Present center position, 
                  experiencing greater peace, clarity, and authentic happiness.
                </p>
              </div>
            </div>
          </div>

          {/* How PAHM Works */}
          <div className="bg-white rounded-xl p-4 sm:p-6 md:p-8 mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 mb-4">
              How PAHM Practice Works
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center font-bold text-xs sm:text-base flex-shrink-0">1</div>
                <div>
                  <h3 className="font-bold mb-1 text-sm sm:text-base">Start Your Session</h3>
                  <p className="text-xs sm:text-sm text-gray-700">Begin with your chosen meditation posture and set your timer.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center font-bold text-xs sm:text-base flex-shrink-0">2</div>
                <div>
                  <h3 className="font-bold mb-1 text-sm sm:text-base">Track Your Attention</h3>
                  <p className="text-xs sm:text-sm text-gray-700">Whenever you notice your mind wandering, click the appropriate position on the PAHM matrix.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center font-bold text-xs sm:text-base flex-shrink-0">3</div>
                <div>
                  <h3 className="font-bold mb-1 text-sm sm:text-base">Return to Present</h3>
                  <p className="text-xs sm:text-sm text-gray-700">After clicking, gently return your attention to the present moment.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center font-bold text-xs sm:text-base flex-shrink-0">4</div>
                <div>
                  <h3 className="font-bold mb-1 text-sm sm:text-base">Review Your Patterns</h3>
                  <p className="text-xs sm:text-sm text-gray-700">After your session, review your attention patterns and insights in the reflection page.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-blue-50 p-3 sm:p-4 rounded-lg">
              <p className="text-blue-800 text-xs sm:text-sm">
                <strong>Remember:</strong> PAHM practice is used in Stages 2-6 of the Return of Attention method. 
                Each click helps you understand your mind's natural patterns and gradually develop stronger present-moment awareness.
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-white rounded-xl p-4 sm:p-6 md:p-8 mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 mb-4">
              Benefits of PAHM Practice
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h3 className="font-bold mb-3 text-green-600 text-sm sm:text-base">Personal Insights</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                  <li>• Understand your mind's habitual patterns</li>
                  <li>• Identify sources of mental suffering</li>
                  <li>• Track progress over time</li>
                  <li>• Develop self-awareness</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold mb-3 text-purple-600 text-sm sm:text-base">Practical Benefits</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                  <li>• Increased present-moment awareness</li>
                  <li>• Reduced anxiety and worry</li>
                  <li>• Less attachment to outcomes</li>
                  <li>• Greater emotional balance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}