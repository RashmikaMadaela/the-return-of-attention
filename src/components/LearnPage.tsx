'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Navigation from './Navigation'

interface Guide {
  id: string
  title: string
  description: string
  buttonColor: string
  action: () => void
}

export default function LearnPage() {
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
      buttonColor: 'bg-pink-600 hover:bg-pink-700',
      action: () => handleNavigation('/learn/stage1-guide')
    },
    {
      id: 'pahm',
      title: 'PAHM Matrix',
      description: 'What is PAHM Matrix? Explained',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      action: () => handleNavigation('/learn/pahm-guide')
    },
    {
      id: 'posture',
      title: 'Posture Guide',
      description: 'How to Sit in Correct Posture',
      buttonColor: 'bg-orange-400 hover:bg-orange-500',
      action: () => handleNavigation('/learn/posture-guide')
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#b9d4ee] to-[#fffafa]">
      {/* Navigation */}
      <Navigation currentPage="learn" />
      
      <div className="p-8 pt-24">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16 px-4">
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold drop-shadow-lg text-[#03478f]">Learn About Return Of Attention</h1>
          </div>
        </div>

        {/* Guide Cards */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4">
          {guides.map((guide) => (
            <div
              key={guide.id}
              className="bg-[#e5f3ff] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl flex flex-col h-72 sm:h-80 hover:scale-105 transition-transform duration-300"
            >
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 text-center sm:text-left">{guide.title}</h2>
              <p className="text-gray-700 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 flex-grow text-center sm:text-left">{guide.description}</p>
              
              <button
                onClick={guide.action}
                className="w-full bg-gradient-to-r from-[#6465e0] to-[#7c7de8] hover:from-[#5658d1] hover:to-[#6465e0] text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-2xl text-base sm:text-lg lg:text-xl transition-all hover:shadow-lg active:scale-95 mt-auto min-h-[44px]"
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
