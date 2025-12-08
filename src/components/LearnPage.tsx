'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Navigation from './Navigation'
import { useThemeColors } from '@/hooks/useThemeColors'

interface Guide {
  id: string
  title: string
  description: string
  action: () => void
}

export default function LearnPage() {
  const { bgGradientTop, bgGradientBottom, topicColor, buttonColor, containerColor, textColor1, textColor2 } = useThemeColors()
  const router = useRouter()

  const handleNavigation = (path: string) => {
    console.log('Navigating to:', path)
    router.push(path)
  }

  const guides: Guide[] = [
    {
      id: 'stage1',
      title: 'Stage 1 Guide',
      description: 'About Stage 1 practice sessions',
      action: () => handleNavigation('/learn/stage1-guide')
    },
    {
      id: 'pahm',
      title: 'PAHM Matrix',
      description: 'What is PAHM Matrix? Explained',
      action: () => handleNavigation('/learn/pahm-guide')
    },
    {
      id: 'posture',
      title: 'Posture Guide',
      description: 'How to Sit in Correct Posture',
      action: () => handleNavigation('/learn/posture-guide')
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b" style={{ backgroundImage: `linear-gradient(to bottom, ${bgGradientTop}, ${bgGradientBottom})` }}>
      {/* Navigation */}
      <Navigation currentPage="learn" />
      
      <div className="p-8 pt-24">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16 px-4">
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold drop-shadow-lg" style={{ color: topicColor }}>Learn About Return Of Attention</h1>
          </div>
        </div>

        {/* Guide Cards */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4">
          {guides.map((guide) => (
            <div
              key={guide.id}
              className="rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl flex flex-col h-72 sm:h-80 hover:scale-105 transition-transform duration-300"
              style={{ backgroundColor: containerColor }}
            >
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 text-center sm:text-left">{guide.title}</h2>
              <p className="text-gray-700 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 flex-grow text-center sm:text-left">{guide.description}</p>
              
              <button
                onClick={guide.action}
                className="w-full text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-2xl text-base sm:text-lg lg:text-xl transition-all hover:shadow-lg active:scale-95 mt-auto min-h-[44px] hover:opacity-90"
                style={{ backgroundColor: buttonColor }}
              >
                More
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
