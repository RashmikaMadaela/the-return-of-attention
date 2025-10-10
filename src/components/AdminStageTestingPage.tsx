'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from './Navigation'

interface Stage {
  id: number
  number: number
  label: string
  title: string
  description: string
  gradient: string
}

export default function AdminStageTestingPage() {
  const router = useRouter()
  
  const [stages] = useState<Stage[]>([
    {
      id: 1,
      number: 1,
      label: 'Seeker',
      title: 'Physical Readiness',
      description: 'Building the foundation through physical stillness',
      gradient: 'from-purple-600 to-purple-800'
    },
    {
      id: 2,
      number: 2,
      label: 'Observer',
      title: 'Understanding Thought Patterns',
      description: 'Learning to observe without attachment',
      gradient: 'from-pink-600 to-red-600'
    },
    {
      id: 3,
      number: 3,
      label: 'Trainee',
      title: 'Dot Tracking Practice',
      description: 'Developing sustained attention',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 4,
      number: 4,
      label: 'Practitioner',
      title: 'Tool-Free Practice',
      description: 'Practicing without external supports',
      gradient: 'from-green-500 to-teal-600'
    },
    {
      id: 5,
      number: 5,
      label: 'Master',
      title: 'Sustained Presence',
      description: 'Maintaining presence throughout daily activities',
      gradient: 'from-pink-500 to-yellow-500'
    },
    {
      id: 6,
      number: 6,
      label: 'Illuminator',
      title: 'Integration & Teaching',
      description: 'Fully integrating the practice into your life',
      gradient: 'from-cyan-500 to-purple-800'
    }
  ])

  const handleNavigation = (page: string) => {
    switch(page) {
      case 'user-progress':
        router.push('/admin/user-progress')
        break
      case 'user-management':
        router.push('/admin/user-management')
        break
      case 'stage-testing':
        // Already on this page
        break
    }
  }

  const handleStageAction = (stageId: number, action: string) => {
    console.log(`${action} action for stage ${stageId}`)
    
    switch(action) {
      case 'unlock':
        // Unlock stage for users by setting it as available
        const unlockedStages = JSON.parse(localStorage.getItem('unlockedStages') || '[]')
        if (!unlockedStages.includes(stageId)) {
          unlockedStages.push(stageId)
          localStorage.setItem('unlockedStages', JSON.stringify(unlockedStages))
          
          // Special handling for Stage 1 - unlock all sub-stages
          if (stageId === 1) {
            localStorage.setItem('stage1AdminUnlocked', 'true')
            // Unlock all T1-T5 sessions with proper durations
            const stage1Progress = []
            const stageDurations = [10, 15, 20, 25, 30] // T1=10min, T2=15min, etc.
            
            for (let i = 1; i <= 5; i++) {
              stage1Progress.push({
                id: i,
                name: `T${i}`,
                duration: stageDurations[i-1],
                minTime: stageDurations[i-1],
                maxTime: 30,
                completed: false,
                unlocked: true,
                adminUnlocked: true
              })
            }
            localStorage.setItem('stage1Progress', JSON.stringify(stage1Progress))
          }
          
          alert(`Stage ${stageId} has been unlocked for users!`)
        } else {
          alert(`Stage ${stageId} is already unlocked`)
        }
        break
      case 'reset':
        // Reset specific stage progress
        if (stageId === 1) {
          // Reset Stage 1 specific data
          localStorage.removeItem('stage1Progress')
          localStorage.removeItem('stage1Started')
          localStorage.removeItem('stage1IntroSeen')
          localStorage.removeItem('completedSessions')
          
          // Remove stage 1 from completed stages
          const completedStages = parseInt(localStorage.getItem('completedStages') || '0')
          if (completedStages >= 1) {
            localStorage.setItem('completedStages', '0')
          }
        } else {
          // Reset PAHM stages (2-6)
          const pahmProgress = JSON.parse(localStorage.getItem('pahmProgress') || '[]')
          const filteredProgress = pahmProgress.filter((item: any) => item.stage !== stageId)
          localStorage.setItem('pahmProgress', JSON.stringify(filteredProgress))
          
          // Reset completed PAHM sessions for this stage
          const completedPAHMSessions = JSON.parse(localStorage.getItem('completedPAHMSessions') || '[]')
          const filteredSessions = completedPAHMSessions.filter((item: any) => item.stage !== stageId)
          localStorage.setItem('completedPAHMSessions', JSON.stringify(filteredSessions))
          
          // Update completed stages if this stage was completed
          const completedStages = parseInt(localStorage.getItem('completedStages') || '0')
          if (completedStages >= stageId) {
            localStorage.setItem('completedStages', (stageId - 1).toString())
          }
        }
        
        // Clear session storage
        sessionStorage.removeItem('sessionSettings')
        sessionStorage.removeItem('currentSession')
        sessionStorage.removeItem('pahmData')
        
        alert(`Stage ${stageId} progress has been reset!`)
        break
      case 'timeskip':
        // Navigate to stage with admin mode for fast controls
        if (stageId === 1) {
          // Stage 1 uses regular timer page, but we need to set up a session first
          // Set up default session settings for Stage 1
          const defaultSettings = {
            posture: 'sitting',
            duration: 10,
            bells: true,
            voiceCommands: true,
            stage: '1',
            title: 'T1: Physical Stillness Training'
          }
          sessionStorage.setItem('sessionSettings', JSON.stringify(defaultSettings))
          router.push(`/timer?stage=1&admin=true`)
        } else if (stageId >= 2 && stageId <= 6) {
          router.push(`/pahm-timer?stage=${stageId}&admin=true`)
        }
        break
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 pb-10">
      {/* Navigation */}
      <Navigation currentPage="admin" />

      {/* Secondary Navigation */}
      <div className="bg-white/95 py-5 shadow-lg mb-10 pt-24">
        <div className="max-w-7xl mx-auto px-10 flex gap-8 justify-center">
          <button 
            onClick={() => handleNavigation('user-progress')}
            className="px-8 py-3 bg-transparent text-blue-600 border-2 border-blue-600 rounded-lg cursor-pointer text-base font-semibold transition-all duration-300 hover:bg-blue-600 hover:text-white hover:-translate-y-1 hover:shadow-lg"
          >
            User Progress
          </button>
          <button 
            onClick={() => handleNavigation('user-management')}
            className="px-8 py-3 bg-transparent text-blue-600 border-2 border-blue-600 rounded-lg cursor-pointer text-base font-semibold transition-all duration-300 hover:bg-blue-600 hover:text-white hover:-translate-y-1 hover:shadow-lg"
          >
            User Management
          </button>
          <button 
            onClick={() => handleNavigation('stage-testing')}
            className="px-8 py-3 bg-blue-600 text-white border-2 border-blue-600 rounded-lg cursor-pointer text-base font-semibold transition-all duration-300 hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg"
          >
            Stage Testing
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-10">
        <h1 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-center drop-shadow-lg px-4">
          Stage-by-Stage Testing Suite
        </h1>
        <p className="text-white/90 text-sm sm:text-base text-center mb-8 sm:mb-12 drop-shadow px-4">
          Manage and test all journey stages with advanced controls
        </p>

        {/* Info Panel */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-10 max-w-6xl mx-auto shadow-2xl">
          <div className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-5 pb-3 sm:pb-4 border-b-2 border-gray-100">
            Stage Control Definitions
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl transition-all duration-300 hover:bg-blue-50">
              <span className="font-bold text-blue-600 min-w-20">Unlock:</span>
              <span className="text-gray-700 leading-relaxed">
                Enable access to the stage for users. This allows users to begin or continue their progress through this specific stage of their journey.
              </span>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl transition-all duration-300 hover:bg-blue-50">
              <span className="font-bold text-blue-600 min-w-20">Reset:</span>
              <span className="text-gray-700 leading-relaxed">
                Reset the stage to its initial state. All progress, saved data, and completions for this stage will be cleared, returning it to the beginning.
              </span>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl transition-all duration-300 hover:bg-blue-50">
              <span className="font-bold text-blue-600 min-w-20">Time Skip:</span>
              <span className="text-gray-700 leading-relaxed">
                Fast forward through time-dependent elements in the stage. This allows you to bypass waiting periods, session timers, or scheduled content for testing purposes.
              </span>
            </div>
          </div>
        </div>

        {/* Stages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto px-4">
          {stages.map((stage) => (
            <div 
              key={stage.id}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-3xl"
            >
              <div className={`relative h-40 sm:h-48 bg-gradient-to-br ${stage.gradient} overflow-hidden`}>
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 w-10 h-10 sm:w-12 sm:h-12 bg-black/70 text-white rounded-full flex items-center justify-center text-lg sm:text-xl font-bold z-10">
                  {stage.number}
                </div>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  {stage.label}
                </div>
                <div className="text-lg sm:text-xl font-bold text-blue-600 mb-2">
                  {stage.title}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-5 leading-relaxed">
                  {stage.description}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button 
                    onClick={() => handleStageAction(stage.id, 'unlock')}
                    className="flex-1 p-3 border-none rounded-lg cursor-pointer text-xs sm:text-sm font-semibold transition-all duration-300 bg-green-500 text-white hover:bg-green-600 hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/30 min-h-[40px] active:bg-green-700"
                  >
                    Unlock
                  </button>
                  <button 
                    onClick={() => handleStageAction(stage.id, 'reset')}
                    className="flex-1 p-3 border-none rounded-lg cursor-pointer text-xs sm:text-sm font-semibold transition-all duration-300 bg-orange-500 text-white hover:bg-orange-600 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/30 min-h-[40px] active:bg-orange-700"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={() => handleStageAction(stage.id, 'timeskip')}
                    className="flex-1 p-3 border-none rounded-lg cursor-pointer text-xs sm:text-sm font-semibold transition-all duration-300 bg-blue-500 text-white hover:bg-blue-600 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30 min-h-[40px] active:bg-blue-700"
                  >
                    Time Skip
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}