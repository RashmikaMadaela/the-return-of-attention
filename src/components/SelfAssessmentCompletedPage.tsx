'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Navigation from './Navigation'

export default function SelfAssessmentCompletedPage() {
  const router = useRouter()
  
  const stages = [
    {
      number: 1,
      label: 'Seeker',
      title: 'Physical Readiness',
      description: 'Building the foundation through physical stillness',
      image: '/png_images/Flux_Dev_A_realistic_image_of_a_thoughtful_person_sitting_at_t_0.jpg'
    },
    {
      number: 2,
      label: 'Observer',
      title: 'Understanding Thought Patterns',
      description: 'Learning to observe without attachment',
      image: '/png_images/Flux_Dev_A_realistic_image_of_a_person_sitting_crosslegged_ind_1.jpg'
    },
    {
      number: 3,
      label: 'Trainee',
      title: 'Dot Tracking Practice',
      description: 'Developing sustained attention',
      image: '/png_images/Flux_Dev_A_realistic_image_of_a_beginner_meditator_sitting_cal_0.jpg'
    },
    {
      number: 4,
      label: 'Practitioner',
      title: 'Tool-Free Practice',
      description: 'Practicing without external supports',
      image: '/png_images/Flux_Dev_A_realistic_image_of_a_dedicated_practitioner_sitting_0.jpg'
    },
    {
      number: 5,
      label: 'Master',
      title: 'Sustained Presence',
      description: 'Maintaining presence throughout daily activities',
      image: '/png_images/Image_fx (5).jpg'
    },
    {
      number: 6,
      label: 'Illuminator',
      title: 'Integration & Teaching',
      description: 'Fully integrating the practice into your life',
      image: '/png_images/Image_fx (3).jpg'
    }
  ]

  const handleStartJourney = () => {
    router.push('/home')
  }

  const handleBackToAssessment = () => {
    router.push('/self-assessment')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#b9d4ee] to-[#fffafa]">
      {/* Navigation */}
      <Navigation currentPage="self-assessment" />
      
      <div className="p-4 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Celebration Section */}
          <div className="text-center mb-12">
            <div className="text-7xl mb-4">🎉</div>
            <h1 className="text-[#03478f] text-5xl font-bold mb-4">Great Job!</h1>
            <p className="text-[#123a63] text-lg max-w-2xl mx-auto">
              You have completed the self-assessment and taken the first step on your journey
              to greater presence and attention.
            </p>
          </div>

          {/* Journey Ahead Section */}
          <div className="bg-[#e5f3ff] border border-[#d6e8f8] rounded-3xl p-8 mb-8">
            <h2 className="text-[#03478f] text-3xl font-bold text-center mb-4">Your Journey Ahead</h2>
            <p className="text-[#123a63] text-center mb-8">
              The Return of Attention practice consists of six progressive stages:
            </p>

            {/* Stages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {stages.map((stage) => (
                <div key={stage.number} className="bg-white rounded-2xl overflow-hidden shadow-lg">
                  <div className="relative h-48">
                    <img 
                      src={stage.image} 
                      alt={stage.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-black bg-opacity-60 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                      {stage.number}
                    </div>
                    <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg font-bold text-sm">
                      {stage.label}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-[#6465e0] font-bold text-xl mb-2">{stage.title}</h3>
                    <p className="text-gray-600 text-sm">{stage.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ready to Begin Section */}
          <div className="bg-[#e5f3ff] border border-[#d6e8f8] rounded-3xl p-8 mb-8">
            <h2 className="text-[#03478f] text-3xl font-bold text-center mb-4">Ready to Begin?</h2>
            <p className="text-[#123a63] text-center mb-8 max-w-3xl mx-auto">
              Click Start Your Journey to access your personalized dashboard and begin Stage
              One. Each stage builds upon the previous one, creating a comprehensive path to
              mastery.
            </p>

            <div className="flex justify-center gap-4">
              <button 
                onClick={handleStartJourney}
                className="bg-gradient-to-r from-[#6465e0] to-[#7c7de8] hover:from-[#5658d1] hover:to-[#6465e0] text-white font-bold px-10 py-4 rounded-xl transition-colors shadow-lg"
              >
                Start Your Journey
              </button>
              <button 
                onClick={handleBackToAssessment}
                className="bg-white hover:bg-[#f7fbff] border border-[#6465e0] text-[#6465e0] font-bold px-10 py-4 rounded-xl transition-colors"
              >
                Back to Self-Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}