'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from './Navigation'
import { useToast } from '@/hooks/useToast'

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
  const { showSuccess, showError, ToastContainer } = useToast()
  
  const [mobileAdminMenuOpen, setMobileAdminMenuOpen] = useState(false)
  
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

  const handleStageAction = async (stageId: number, action: string) => {
    console.log(`${action} action for stage ${stageId}`)
    
    // Show loading state
    const actionText = action === 'reset' ? 'Resetting' : 'Completing'
    const loadingMessage = `${actionText} stage ${stageId}...`
    
    try {
      // Call the API
      const response = await fetch('/api/admin/stage-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          stageNumber: stageId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to perform action')
      }

      // Show success message
      showSuccess(data.message)
      
      // Reload the page to reflect changes (with slight delay to show toast)
      if (action === 'complete') {
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    } catch (error) {
      console.error('Stage action error:', error)
      showError(`Failed to ${action} stage ${stageId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="min-h-screen pb-10 bg-gradient-to-br from-blue-600 to-blue-800">
      <ToastContainer />
      {/* Navigation */}
      <Navigation currentPage="admin" />

      {/* Desktop Secondary Navigation */}
      <div className="hidden py-5 pt-24 mb-10 shadow-lg lg:block bg-white/95">
        <div className="flex justify-center gap-8 px-10 mx-auto max-w-7xl">
          <button 
            onClick={() => handleNavigation('user-progress')}
            className="px-8 py-3 text-base font-semibold text-blue-600 transition-all duration-300 bg-transparent border-2 border-blue-600 rounded-lg cursor-pointer hover:bg-blue-600 hover:text-white hover:-translate-y-1 hover:shadow-lg"
          >
            User Progress
          </button>
          <button 
            onClick={() => handleNavigation('user-management')}
            className="px-8 py-3 text-base font-semibold text-blue-600 transition-all duration-300 bg-transparent border-2 border-blue-600 rounded-lg cursor-pointer hover:bg-blue-600 hover:text-white hover:-translate-y-1 hover:shadow-lg"
          >
            User Management
          </button>
          <button 
            onClick={() => handleNavigation('stage-testing')}
            className="px-8 py-3 text-base font-semibold text-white transition-all duration-300 bg-blue-600 border-2 border-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg"
          >
            Stage Testing
          </button>
        </div>
      </div>

      {/* Mobile Admin Navigation */}
      <div className="pt-20 mb-6 shadow-lg lg:hidden bg-white/95">
        <div className="px-4 py-3">
          <button 
            onClick={() => setMobileAdminMenuOpen(!mobileAdminMenuOpen)}
            className="flex items-center justify-between w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg"
          >
            <span>Admin Menu</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileAdminMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              )}
            </svg>
          </button>
          
          {mobileAdminMenuOpen && (
            <div className="mt-2 space-y-2">
              <button 
                onClick={() => handleNavigation('user-progress')}
                className="w-full px-4 py-3 font-semibold text-left text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50"
              >
                User Progress
              </button>
              <button 
                onClick={() => handleNavigation('user-management')}
                className="w-full px-4 py-3 font-semibold text-left text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50"
              >
                User Management
              </button>
              <button 
                onClick={() => handleNavigation('stage-testing')}
                className="w-full px-4 py-3 font-semibold text-left text-white bg-blue-600 rounded-lg"
              >
                Stage Testing
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-10">
        <h1 className="px-4 mb-3 text-2xl font-bold text-center text-white sm:text-3xl lg:text-4xl sm:mb-4 drop-shadow-lg">
          Stage-by-Stage Testing Suite
        </h1>
        <p className="px-4 mb-8 text-sm text-center text-white/90 sm:text-base sm:mb-12 drop-shadow">
          Manage and test all journey stages with advanced controls
        </p>

        {/* Stages Grid */}
        <div className="grid max-w-6xl grid-cols-1 gap-4 px-4 mx-auto mb-8 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 lg:gap-8 sm:mb-12">
          {stages.map((stage) => (
            <div 
              key={stage.id}
              className="overflow-hidden transition-all duration-300 bg-white shadow-2xl rounded-3xl hover:-translate-y-2 hover:shadow-3xl"
            >
              <div className={`relative h-40 sm:h-48 bg-gradient-to-br ${stage.gradient} overflow-hidden`}>
                <div className="absolute z-10 flex items-center justify-center w-10 h-10 text-lg font-bold text-white rounded-full top-3 sm:top-4 left-3 sm:left-4 sm:w-12 sm:h-12 bg-black/70 sm:text-xl">
                  {stage.number}
                </div>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="mb-2 text-xs font-semibold tracking-wider text-gray-600 uppercase">
                  {stage.label}
                </div>
                <div className="mb-2 text-lg font-bold text-blue-600 sm:text-xl">
                  {stage.title}
                </div>
                <div className="mb-4 text-xs leading-relaxed text-gray-600 sm:text-sm sm:mb-5">
                  {stage.description}
                </div>
                
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => handleStageAction(stage.id, 'complete')}
                    className="w-full p-3 border-none rounded-lg cursor-pointer text-xs sm:text-sm font-semibold transition-all duration-300 bg-blue-500 text-white hover:bg-blue-600 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30 min-h-[40px] active:bg-blue-700"
                  >
                    Complete
                  </button>
                  <button 
                    onClick={() => handleStageAction(stage.id, 'reset')}
                    className="w-full p-3 border-none rounded-lg cursor-pointer text-xs sm:text-sm font-semibold transition-all duration-300 bg-orange-500 text-white hover:bg-orange-600 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/30 min-h-[40px] active:bg-orange-700"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Panel - Moved to Bottom */}
        <div className="max-w-6xl p-4 mx-auto bg-white shadow-2xl rounded-2xl sm:rounded-3xl sm:p-6 lg:p-8">
          <div className="pb-2 mb-3 text-base font-bold text-gray-800 border-b-2 border-gray-100 sm:text-lg lg:text-xl sm:mb-4 lg:mb-5 sm:pb-3 lg:pb-4">
            Stage Control Definitions
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            
            <div className="flex flex-col items-start gap-2 p-3 transition-all duration-300 rounded-lg sm:flex-row sm:gap-4 sm:p-4 bg-gray-50 sm:rounded-xl hover:bg-blue-50">
              <span className="text-sm font-bold text-blue-600 sm:text-base min-w-fit sm:min-w-24">Complete:</span>
              <span className="text-xs leading-relaxed text-gray-700 sm:text-sm lg:text-base">
                Mark the stage as fully completed in the database. This sets all required sessions/hours to the minimum requirement and unlocks the next stage.
              </span>
            </div>
            
            <div className="flex flex-col items-start gap-2 p-3 transition-all duration-300 rounded-lg sm:flex-row sm:gap-4 sm:p-4 bg-gray-50 sm:rounded-xl hover:bg-blue-50">
              <span className="text-sm font-bold text-blue-600 sm:text-base min-w-fit sm:min-w-24">Reset:</span>
              <span className="text-xs leading-relaxed text-gray-700 sm:text-sm lg:text-base">
                Reset the stage to its initial state in the database. All progress, saved data, and completions for this stage will be cleared.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}