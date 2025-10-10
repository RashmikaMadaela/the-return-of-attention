'use client'

import React, { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Navigation from './Navigation'

interface Session {
  id: string
  title: string
  description: string
  duration: number // in minutes
  imageName: string
  timeRange: { start: number; end: number }
}

export default function MindRecoveryPage() {
  const router = useRouter()
  const [recommendedSession, setRecommendedSession] = useState('')

  const sessions: Session[] = [
    {
      id: 'morning',
      title: 'Morning Recharge',
      description: 'Start your day with clarity and focus',
      duration: 5,
      imageName: 'Flux_Dev_A_breathtaking_sunrise_desktop_wallpaper_in_ultrahigh_2.jpg',
      timeRange: { start: 5, end: 8 }
    },
    {
      id: 'midday',
      title: 'Mid Day Reset',
      description: 'Quick refresh to maintain focus',
      duration: 3,
      imageName: 'Flux_Dev_A_serene_midday_wallpaper_in_ultrahigh_resolution_wit_2.jpg',
      timeRange: { start: 11, end: 13 }
    },
    {
      id: 'emotional',
      title: 'Emotional Reset',
      description: 'Settle your emotions and find balance',
      duration: 5,
      imageName: 'Flux_Dev_A_realistic_image_of_a_beginner_meditator_sitting_cal_1.jpg',
      timeRange: { start: 14, end: 17 }
    },
    {
      id: 'transition',
      title: 'Work-Home Transition',
      description: 'Shift from work mode to personal time',
      duration: 5,
      imageName: 'freepik__the-style-is-candid-image-photography-with-natural__86908.png',
      timeRange: { start: 17, end: 19 }
    },
    {
      id: 'bedtime',
      title: 'Bedtime Wind Down',
      description: 'Gentle preparation for restful sleep',
      duration: 8,
      imageName: 'Flux_Dev_A_hyperrealistic_nighttime_desktop_wallpaper_with_a_v_2.jpg',
      timeRange: { start: 21, end: 26 } // 26 = 2am next day
    }
  ]

  useEffect(() => {
    const currentHour = new Date().getHours()
    
    for (const session of sessions) {
      if (session.timeRange.end > 24) {
        // Handle overnight sessions (like bedtime)
        if (currentHour >= session.timeRange.start || currentHour <= (session.timeRange.end - 24)) {
          setRecommendedSession(session.id)
          return
        }
      } else {
        if (currentHour >= session.timeRange.start && currentHour < session.timeRange.end) {
          setRecommendedSession(session.id)
          return
        }
      }
    }
    
    // Default to morning if no match
    setRecommendedSession('morning')
  }, [])

  const getButtonColor = (sessionId: string) => {
    if (sessionId === recommendedSession) {
      return 'bg-gradient-to-r from-yellow-400 to-blue-600'
    }
    return 'bg-blue-600 hover:bg-blue-700'
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700">
      {/* Navigation */}
      <Navigation currentPage="mind-recovery" />
      
      <div className="p-8 pt-24">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4 text-white">Take a Moment to Reset !</h1>
            <p className="text-xl opacity-90 text-white">Choose a PAHM practice to reset and recover your mind</p>
          </div>
        </div>

        {/* Training Cards Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl transform transition-all hover:scale-105"
            >
              {/* Card Image Header */}
              <div 
                className={`${getCardBackground(session.imageName)} h-56 relative flex items-center justify-center`}
                style={getCardBackgroundImage(session.imageName)}
              >
                {session.id === recommendedSession && (
                  <div className="absolute top-4 left-4 bg-yellow-400 text-black px-4 py-2 rounded-full flex items-center gap-2 font-semibold shadow-lg">
                    <Star className="w-5 h-5 fill-current" />
                    Recommended
                  </div>
                )}
                <h2 className="text-white text-3xl font-bold text-center px-4 drop-shadow-lg">
                  {session.title}
                </h2>
              </div>

              {/* Card Content */}
              <div className="p-8">
                <p className="text-gray-800 text-center text-lg mb-6">
                  {session.description}
                </p>
                
                <div className="bg-gray-100 rounded-full px-6 py-2 text-center mb-6 inline-block w-full">
                  <span className="text-gray-700 font-semibold">{session.duration} minutes</span>
                </div>

                <button
                  onClick={() => handleStartExercise(session.id)}
                  className={`w-full ${getButtonColor(session.id)} text-white font-bold py-4 px-6 rounded-xl text-lg transition-all hover:shadow-lg`}
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