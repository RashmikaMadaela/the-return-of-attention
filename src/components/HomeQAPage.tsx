'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from './Navigation'
import Image from 'next/image'

export default function HomeQAPage() {
  const router = useRouter()
  
  const [assessmentStatus, setAssessmentStatus] = useState({
    questionnaire: false,
    selfAssessment: false
  })

  // Check assessment completion status on component mount
  useEffect(() => {
    const questionnaireCompleted = localStorage.getItem('questionnaireCompleted') === 'true'
    const selfAssessmentCompleted = localStorage.getItem('selfAssessmentCompleted') === 'true'
    
    setAssessmentStatus({
      questionnaire: questionnaireCompleted,
      selfAssessment: selfAssessmentCompleted
    })
  }, [])
  
  // Get stage progress from localStorage
  const getStageProgress = () => {
    if (typeof window === 'undefined') return { completedStages: 0, currentStage: 1, unlockedStages: [1] }
    
    const completedStages = parseInt(localStorage.getItem('completedStages') || '0')
    const currentStage = parseInt(localStorage.getItem('currentStage') || '1')
    const stage1Started = localStorage.getItem('stage1Started') === 'true'
    const adminUnlockedStages = JSON.parse(localStorage.getItem('unlockedStages') || '[]')
    
    // Natural progression: completed stages + next stage
    const naturallyUnlocked = []
    for (let i = 1; i <= completedStages + 1; i++) {
      naturallyUnlocked.push(i)
    }
    
    // Combine naturally unlocked stages with admin unlocked stages
    const allUnlockedStages = [...new Set([...naturallyUnlocked, ...adminUnlockedStages])]
    
    return { completedStages, currentStage, stage1Started, unlockedStages: allUnlockedStages }
  }

  const stageProgress = getStageProgress()

  const getStageButtonText = (stageId: number) => {
    const isCompleted = stageProgress.completedStages >= stageId
    const isUnlocked = stageProgress.unlockedStages.includes(stageId)
    
    if (isCompleted) return 'Completed'
    if (!isUnlocked) return 'Locked'
    if (stageId === 1 && stageProgress.stage1Started) return 'Continue'
    if (stageId === stageProgress.currentStage) return 'Continue'
    return 'Start'
  }

  const stages = [
    {
      id: 1,
      title: 'Seeker',
      subtitle: 'Physical Stillness (T1-T5)',
      progress: 'T-levels: 15/15 sessions',
      buttonText: getStageButtonText(1),
      buttonColor: stageProgress.unlockedStages.includes(1) ? 'bg-pink-500 hover:bg-pink-600' : 'bg-orange-300',
      image: '/png_images/Flux_Dev_A_realistic_image_of_a_thoughtful_person_sitting_at_t_0.jpg',
      locked: !stageProgress.unlockedStages.includes(1)
    },
    {
      id: 2,
      title: 'PAHM Trainee',
      subtitle: 'Basic attention training',
      progress: 'Hours: 0.0/15',
      buttonText: getStageButtonText(2),
      buttonColor: stageProgress.unlockedStages.includes(2) ? 'bg-blue-500 hover:bg-blue-600' : 'bg-orange-300',
      image: '/png_images/Flux_Dev_A_realistic_image_of_a_person_sitting_crosslegged_ind_1.jpg',
      locked: !stageProgress.unlockedStages.includes(2)
    },
    {
      id: 3,
      title: 'PAHM Beginner',
      subtitle: 'Structured practice',
      progress: 'Hours: 0.0/15',
      buttonText: getStageButtonText(3),
      buttonColor: stageProgress.unlockedStages.includes(3) ? 'bg-blue-500 hover:bg-blue-600' : 'bg-orange-300',
      image: '/png_images/Flux_Dev_A_realistic_image_of_a_beginner_meditator_sitting_cal_0.jpg',
      locked: !stageProgress.unlockedStages.includes(3)
    },
    {
      id: 4,
      title: 'PAHM Practitioner',
      subtitle: 'Advanced techniques',
      progress: 'Hours: 0.0/15',
      buttonText: getStageButtonText(4),
      buttonColor: stageProgress.unlockedStages.includes(4) ? 'bg-blue-500 hover:bg-blue-600' : 'bg-orange-300',
      image: '/png_images/Flux_Dev_A_realistic_image_of_a_dedicated_practitioner_sitting_0.jpg',
      locked: !stageProgress.unlockedStages.includes(4)
    },
    {
      id: 5,
      title: 'PAHM Master',
      subtitle: 'Refined awareness',
      progress: 'Hours: 0.0/15',
      buttonText: getStageButtonText(5),
      buttonColor: stageProgress.unlockedStages.includes(5) ? 'bg-blue-500 hover:bg-blue-600' : 'bg-orange-300',
      image: '/png_images/Image_fx (5).jpg',
      locked: !stageProgress.unlockedStages.includes(5)
    },
    {
      id: 6,
      title: 'PAHM Illuminator',
      subtitle: 'Complete mastery',
      progress: 'Hours: 0.0/15',
      buttonText: getStageButtonText(6),
      buttonColor: stageProgress.unlockedStages.includes(6) ? 'bg-blue-500 hover:bg-blue-600' : 'bg-orange-300',
      image: '/png_images/Image_fx (3).jpg',
      locked: !stageProgress.unlockedStages.includes(6)
    }
  ]

  const handleStageClick = (stage: any) => {
    if (stage.locked) return
    
    // Store previous page for navigation
    sessionStorage.setItem('previousPage', '/home-qa')
    
    if (stage.id === 1) {
      // Check if this is first time clicking Stage 1
      const hasSeenIntro = localStorage.getItem('stage1IntroSeen') === 'true'
      if (!hasSeenIntro) {
        // First time - show intro
        router.push('/stage-1-intro')
      } else {
        // Returning user - go directly to stage
        router.push('/stage-1')
      }
    } else {
      // Other stages - implement later
      router.push(`/stage-${stage.id}`)
    }
  }

  const handleQuestionnaireClick = () => {
    router.push('/questionnaire')
  }

  const handleSelfAssessmentClick = () => {
    sessionStorage.setItem('previousPage', '/home-qa')
    if (assessmentStatus.selfAssessment) {
      router.push('/self-assessment/stats')
    } else {
      router.push('/self-assessment')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-300">
      {/* Navigation */}
      <Navigation currentPage="home" />

      {/* Hero Section with Background */}
      <div 
        className="bg-cover bg-center bg-no-repeat pt-24" 
        style={{ backgroundImage: "url('/png_images/dcds.png')" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-center space-x-8">
            <div className="bg-purple-400 p-8 rounded-2xl">
              <div className="grid grid-cols-3 gap-3">
                <div className="w-12 h-12 bg-orange-300 rounded-xl animate-pulse"></div>
                <div className="w-12 h-12 bg-teal-300 rounded-xl animate-pulse delay-100"></div>
                <div className="w-12 h-12 bg-purple-300 rounded-xl animate-pulse delay-200"></div>
                <div className="w-12 h-12 bg-yellow-300 rounded-xl animate-pulse delay-300"></div>
                <div className="w-12 h-12 bg-gray-100 rounded-xl animate-pulse delay-400"></div>
                <div className="w-12 h-12 bg-blue-200 rounded-xl animate-pulse delay-500"></div>
                <div className="w-12 h-12 bg-orange-200 rounded-xl animate-pulse delay-700"></div>
                <div className="w-12 h-12 bg-pink-200 rounded-xl animate-pulse delay-800"></div>
                <div className="w-12 h-12 bg-purple-200 rounded-xl animate-pulse delay-1000"></div>
              </div>
            </div>
            
            <div className="text-white">
              <h1 className="text-5xl font-bold mb-2">The Return</h1>
              <h1 className="text-5xl font-bold mb-4">Of Attention</h1>
              <p className="text-xl">Practices for the Happiness that Stays</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Card */}
        <div className="bg-cyan-300 rounded-3xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">Welcome Back</h2>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4">User Name</h3>
            <p className="text-sm sm:text-base lg:text-lg font-semibold">Your Journey to Happiness that Stays</p>
          </div>
          
          <div className="hidden sm:block h-full w-1 bg-blue-500 mx-4 lg:mx-8"></div>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-blue-500 text-white px-6 sm:px-8 lg:px-12 py-3 sm:py-4 rounded-xl flex items-center justify-between min-w-[250px] sm:min-w-[280px] lg:min-w-[300px]">
              <span className="font-semibold text-sm sm:text-base lg:text-lg">Current Stage</span>
              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold">02</span>
            </div>
            <div className="bg-blue-500 text-white px-6 sm:px-8 lg:px-12 py-3 sm:py-4 rounded-xl flex items-center justify-between min-w-[250px] sm:min-w-[280px] lg:min-w-[300px]">
              <span className="font-semibold text-sm sm:text-base lg:text-lg">Happiness Points</span>
              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold">20</span>
            </div>
          </div>
        </div>

        {/* Assessment Cards - Hide when both are completed */}
        {!(assessmentStatus.questionnaire && assessmentStatus.selfAssessment) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {!assessmentStatus.questionnaire && (
              <div className="bg-cyan-300 rounded-3xl p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-center sm:text-left">Questionnaire</h3>
                <button 
                  onClick={handleQuestionnaireClick}
                  className="w-full py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 min-h-[44px]"
                >
                  Complete
                </button>
              </div>
            )}
            
            {!assessmentStatus.selfAssessment && (
              <div className="bg-cyan-300 rounded-3xl p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-center sm:text-left">Self Assessment</h3>
                <button 
                  onClick={handleSelfAssessmentClick}
                  className="w-full py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 min-h-[44px]"
                >
                  Complete
                </button>
              </div>
            )}
          </div>
        )}

        {/* Practice Stages */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center sm:text-left">Practice Stages</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {stages.map((stage) => (
              <div key={stage.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-40 sm:h-48">
                  <Image 
                    src={stage.image} 
                    alt={stage.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-black bg-opacity-70 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
                    {stage.id}
                  </div>
                  <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 text-white font-bold text-lg sm:text-2xl drop-shadow-lg">
                    {stage.title}
                  </div>
                </div>
                
                <div className="p-4 sm:p-6">
                  <p className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">{stage.subtitle}</p>
                  <p className="text-gray-600 mb-4 text-xs sm:text-sm">{stage.progress}</p>
                  <button 
                    onClick={() => handleStageClick(stage)}
                    className={`w-full py-3 sm:py-4 rounded-lg font-bold text-white transition text-sm sm:text-base min-h-[44px] ${stage.buttonColor} ${stage.locked ? 'cursor-not-allowed opacity-60' : 'hover:opacity-90 active:opacity-95'}`}
                    disabled={stage.locked}
                  >
                    {stage.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
