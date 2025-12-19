'use client'

import React from 'react'
import { Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Navigation from './Navigation'
import { MindRecoveryData, Session } from '@/lib/data/mind-recovery-data'

interface MindRecoveryClientProps {
  initialData: MindRecoveryData
}

export default function MindRecoveryClient({ initialData }: MindRecoveryClientProps) {
  const router = useRouter()
  const { sessions, recommendedSessionId } = initialData

  const getButtonColor = (sessionId: string) => {
    if (sessionId === recommendedSessionId) {
      return 'bg-gradient-to-r from-yellow-400 to-blue-600'
    }
    return 'bg-gradient-to-r from-[#6465e0] to-[#7c7de8] hover:from-[#5658d1] hover:to-[#6465e0]'
  }

  const getCardBackground = (imageName: string) => {
    // Use actual background images instead of gradients
    return `bg-cover bg-center bg-no-repeat`
  }
  
  const getCardBackgroundImage = (imageName: string) => {
    return {
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/png_images/${imageName}')`
    }
  }

  const handleStartExercise = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      // Set fixed session settings for mind recovery
      const mindRecoverySettings = {
        stage: 'mind-recovery',
        sessionType: sessionId,
        duration: session.duration,
        posture: 'comfortable-seated',
        isFixedDuration: true,
        title: session.title
      }
      
      // Store settings and navigate to PAHM setup page
      sessionStorage.setItem('sessionSettings', JSON.stringify(mindRecoverySettings))
      router.push(`/pahm-session-setup?type=mind-recovery&session=${sessionId}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#b9d4ee] to-[#fffafa]">
      {/* Navigation */}
      <Navigation currentPage="mind-recovery" />
      
      <div className="p-8 pt-24">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 text-[#03478f]">Take a Moment to Reset !</h1>
            <p className="text-xl text-black">Choose a PAHM practice to reset and recover your mind</p>
          </div>
        </div>

        {/* Training Cards Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-[#e5f3ff] rounded-3xl overflow-hidden shadow-2xl transform transition-all hover:scale-105"
            >
              {/* Card Image Header */}
              <div 
                className={`${getCardBackground(session.imageName)} h-48 relative flex items-center justify-center`}
                style={getCardBackgroundImage(session.imageName)}
              >
                {session.id === recommendedSessionId && (
                  <div className="absolute top-4 left-4 bg-yellow-400 text-black px-4 py-2 rounded-full flex items-center gap-2 font-semibold shadow-lg">
                    <Star className="w-5 h-5 fill-current" />
                    Recommended
                  </div>
                )}
                <h2 className="text-white text-2xl font-bold text-center px-4 drop-shadow-lg">
                  {session.title}
                </h2>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <p className="text-gray-800 text-center text-base mb-4">
                  {session.description}
                </p>
                
                <div className="bg-gray-100 rounded-full px-6 py-2 text-center mb-4 inline-block w-full">
                  <span className="text-gray-700 font-semibold">{session.duration} minutes</span>
                </div>

                <button
                  onClick={() => handleStartExercise(session.id)}
                  className={`w-full ${getButtonColor(session.id)} text-white font-bold py-3 px-6 rounded-xl text-base transition-all hover:shadow-lg`}
                >
                  Start Exercise
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
