'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Navigation from './Navigation'

export default function HomePage() {
  const router = useRouter()
  const [currentStage, setCurrentStage] = useState(1)
  const [happinessPoints, setHappinessPoints] = useState(20)
  const [userName, setUserName] = useState('User')
  const [showMidAssessment, setShowMidAssessment] = useState(false)
  const [showFinalAssessment, setShowFinalAssessment] = useState(false)

  // Check if assessments are completed
  useEffect(() => {
    const questionnaireCompleted = localStorage.getItem('questionnaire_completed') === 'true'
    const selfAssessmentCompleted = localStorage.getItem('self_assessment_completed') === 'true'
    const qaCompleted = localStorage.getItem('qa_completed') === 'true'

    // If assessments not completed, redirect to Q&A page
    if (!questionnaireCompleted || !selfAssessmentCompleted || !qaCompleted) {
      router.push('/home-qa')
      return
    }

    // Load user progress
    const savedStage = localStorage.getItem('current_stage')
    const savedPoints = localStorage.getItem('happiness_points')
    const savedName = localStorage.getItem('user_name')

    if (savedStage) setCurrentStage(parseInt(savedStage))
    if (savedPoints) setHappinessPoints(parseInt(savedPoints))
    if (savedName) setUserName(savedName)

    // Check for assessment requirements
    const completedStages = parseInt(localStorage.getItem('completedStages') || '0')
    const midAssessmentCompleted = localStorage.getItem('mid_assessment_completed') === 'true'
    const finalAssessmentCompleted = localStorage.getItem('final_assessment_completed') === 'true'

    // Show mid assessment after completing stage 3
    if (completedStages >= 3 && !midAssessmentCompleted) {
      setShowMidAssessment(true)
    }

    // Show final assessment after completing stage 6
    if (completedStages >= 6 && !finalAssessmentCompleted) {
      setShowFinalAssessment(true)
    }
  }, [router])

  // Get stage progress from localStorage
  const getStageProgress = () => {
    if (typeof window === 'undefined') return { completedStages: 0, currentStage: 1, unlockedStages: [1], adminUnlockedStages: [] }
    
    const completedStages = parseInt(localStorage.getItem('completedStages') || '0')
    const stage1Started = localStorage.getItem('stage1Started') === 'true'
    const adminUnlockedStages = JSON.parse(localStorage.getItem('unlockedStages') || '[]')
    
    // Natural progression: completed stages + next stage
    const naturallyUnlocked = []
    for (let i = 1; i <= completedStages + 1; i++) {
      naturallyUnlocked.push(i)
    }
    
    // Combine naturally unlocked stages with admin unlocked stages
    const allUnlockedStages = [...new Set([...naturallyUnlocked, ...adminUnlockedStages])]
    
    return { 
      completedStages, 
      currentStage, 
      stage1Started, 
      unlockedStages: allUnlockedStages,
      adminUnlockedStages 
    }
  }

  const stageProgress = getStageProgress()

  const getStageButtonText = (stageId: number) => {
    const isCompleted = stageProgress.completedStages >= stageId
    const isUnlocked = stageProgress.unlockedStages.includes(stageId)
    
    if (isCompleted) return 'Completed'
    if (!isUnlocked) return 'Locked'
    if (stageId === currentStage) return 'Continue'
    // All unlocked stages show Start
    return 'Start'
  }

  const stages = [
    {
      id: 1,
      name: 'Seeker',
      description: 'Physical Stillness (T1-T5)',
      progress: '15/15 sessions',
      image: '/png_images/Flux_Dev_A_realistic_image_of_a_thoughtful_person_sitting_at_t_0.jpg',
      unlocked: stageProgress.unlockedStages.includes(1),
      completed: stageProgress.completedStages >= 1,
      buttonText: getStageButtonText(1)
    },
    {
      id: 2,
      name: 'PAHM Trainee',
      description: 'Basic attention training',
      progress: '0.0/15 hours',
      image: '/png_images/Flux_Dev_A_realistic_image_of_a_person_sitting_crosslegged_ind_1.jpg',
      unlocked: stageProgress.unlockedStages.includes(2),
      completed: stageProgress.completedStages >= 2,
      buttonText: getStageButtonText(2)
    },
    {
      id: 3,
      name: 'PAHM Beginner',
      description: 'Structured practice',
      progress: '0.0/15 hours',
      image: '/png_images/Flux_Dev_A_realistic_image_of_a_beginner_meditator_sitting_cal_0.jpg',
      unlocked: stageProgress.unlockedStages.includes(3),
      completed: stageProgress.completedStages >= 3,
      buttonText: getStageButtonText(3)
    },
    {
      id: 4,
      name: 'PAHM Practitioner',
      description: 'Advanced techniques',
      progress: '0.0/15 hours',
      image: '/png_images/Flux_Dev_A_realistic_image_of_a_dedicated_practitioner_sitting_0.jpg',
      unlocked: stageProgress.unlockedStages.includes(4),
      completed: stageProgress.completedStages >= 4,
      buttonText: getStageButtonText(4)
    },
    {
      id: 5,
      name: 'PAHM Master',
      description: 'Refined awareness',
      progress: '0.0/15 hours',
      image: '/png_images/Image_fx (5).jpg',
      unlocked: stageProgress.unlockedStages.includes(5),
      completed: stageProgress.completedStages >= 5,
      buttonText: getStageButtonText(5)
    },
    {
      id: 6,
      name: 'PAHM Illuminator',
      description: 'Complete mastery',
      progress: '0.0/15 hours',
      image: '/png_images/Image_fx (3).jpg',
      unlocked: stageProgress.unlockedStages.includes(6),
      completed: stageProgress.completedStages >= 6,
      buttonText: getStageButtonText(6)
    }
  ]

  const handleStageClick = (stage: any) => {
    // Prevent any action if stage is locked
    if (!stage.unlocked) {
      console.log(`Stage ${stage.id} is locked`)
      return
    }
    
    // Store previous page for navigation
    sessionStorage.setItem('previousPage', '/home')
    
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
      // Other stages - go to their respective pages
      router.push(`/stage-${stage.id}`)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #B1FAFF 0%, #5EFFFA 100%)' }}>
      {/* Navigation */}
      <Navigation currentPage="home" />

      <div className="container mx-auto px-4 py-8">
        {/* Header with background image and title */}
        <div className="relative mb-4 sm:mb-8 rounded-[25px] overflow-hidden h-64 sm:h-80 lg:h-96 mt-20 sm:mt-24">
          <Image
            src="/png_images/dcds.png"
            alt="The Return of Attention"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="text-center text-white">
              <div className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6 space-y-4 sm:space-y-0">
                {/* 3x3 Matrix */}
                <div className="grid grid-cols-3 gap-1 sm:gap-2 w-20 h-20 sm:w-32 sm:h-32 sm:mr-8">
                  <div className="bg-orange-300 rounded-lg animate-pulse"></div>
                  <div className="bg-teal-300 rounded-lg animate-pulse delay-100"></div>
                  <div className="bg-purple-300 rounded-lg animate-pulse delay-200"></div>
                  <div className="bg-yellow-400 rounded-lg animate-pulse delay-300"></div>
                  <div className="bg-gray-200 rounded-lg animate-pulse delay-400"></div>
                  <div className="bg-blue-300 rounded-lg animate-pulse delay-500"></div>
                  <div className="bg-pink-300 rounded-lg animate-pulse delay-700"></div>
                  <div className="bg-purple-200 rounded-lg animate-pulse delay-800"></div>
                  <div className="bg-orange-200 rounded-lg animate-pulse delay-1000"></div>
                </div>
                <div className="hidden sm:block w-2 h-20 bg-white mx-4 sm:mx-8"></div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-lexend mb-1 sm:mb-2">The Return</h1>
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-lexend mb-2 sm:mb-4">Of Attention</h1>
                  <p className="text-sm sm:text-lg lg:text-xl font-lexend">Practices for the Happiness that Stays</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Back Section */}
        <div className="bg-gradient-to-r from-cyan-300 to-cyan-400 rounded-[25px] p-4 sm:p-6 lg:p-8 mb-4 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center shadow-lg space-y-4 sm:space-y-0">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black font-lexend mb-1 sm:mb-2">Welcome Back</h2>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-black font-lexend mb-1 sm:mb-2">{userName}</h3>
            <p className="text-black font-lexend text-sm sm:text-base lg:text-lg">Your Journey to Happiness that Stays</p>
          </div>
          <div className="hidden sm:block w-1 h-20 bg-blue-600 mx-4"></div>
          <div className="flex flex-row sm:flex-col gap-4 justify-center">
            <div className="bg-blue-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-[15px] font-lexend text-center min-w-[100px] sm:min-w-[120px]">
              <div className="text-xs sm:text-sm">Current Stage</div>
              <div className="text-xl sm:text-2xl font-bold">{currentStage.toString().padStart(2, '0')}</div>
            </div>
            <div className="bg-blue-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-[15px] font-lexend text-center min-w-[100px] sm:min-w-[120px]">
              <div className="text-xs sm:text-sm">Happiness Points</div>
              <div className="text-xl sm:text-2xl font-bold">{happinessPoints}</div>
            </div>
          </div>
        </div>

        {/* Mid Assessment Container - Shows after Stage 3 completion */}
        {showMidAssessment && (
          <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-[25px] p-4 sm:p-6 lg:p-8 mb-4 sm:mb-8 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="text-white text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-lexend mb-2">🎯 Mid-Journey Assessment</h2>
                <p className="text-sm sm:text-base lg:text-lg font-lexend mb-2 sm:mb-4">
                  You've completed Stage 3! Time to evaluate your progress and understanding.
                </p>
                <p className="text-xs sm:text-sm font-lexend opacity-90">
                  This assessment helps track your development and provides personalized insights.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:gap-4 min-w-[200px]">
                <button
                  onClick={() => {
                    router.push('/assessment-stats?type=mid')
                  }}
                  className="bg-white text-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-[15px] font-bold font-lexend hover:bg-purple-50 transition-colors text-sm sm:text-base"
                >
                  Take Assessment
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem('mid_assessment_completed', 'true')
                    setShowMidAssessment(false)
                  }}
                  className="bg-purple-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-[15px] font-lexend hover:bg-purple-900 transition-colors text-xs sm:text-sm"
                >
                  Skip for Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Final Assessment Container - Shows after Stage 6 completion */}
        {showFinalAssessment && (
          <div className="bg-gradient-to-r from-gold-400 to-gold-600 rounded-[25px] p-4 sm:p-6 lg:p-8 mb-4 sm:mb-8 shadow-lg" style={{background: 'linear-gradient(to right, #fbbf24, #d97706)'}}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="text-white text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-lexend mb-2">🏆 Final Assessment</h2>
                <p className="text-sm sm:text-base lg:text-lg font-lexend mb-2 sm:mb-4">
                  Congratulations! You've completed all 6 stages. Complete your final evaluation.
                </p>
                <p className="text-xs sm:text-sm font-lexend opacity-90">
                  This comprehensive assessment measures your overall journey and transformation.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:gap-4 min-w-[200px]">
                <button
                  onClick={() => {
                    router.push('/assessment-stats?type=final')
                  }}
                  className="bg-white text-orange-600 px-6 sm:px-8 py-3 sm:py-4 rounded-[15px] font-bold font-lexend hover:bg-orange-50 transition-colors text-sm sm:text-base"
                >
                  Take Final Assessment
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem('final_assessment_completed', 'true')
                    setShowFinalAssessment(false)
                  }}
                  className="bg-orange-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-[15px] font-lexend hover:bg-orange-900 transition-colors text-xs sm:text-sm"
                >
                  Skip for Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Practice Stages */}
        <div className="mb-4 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-black font-lexend mb-4 sm:mb-8 text-center sm:text-left">Practice Stages</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className={`bg-white rounded-[25px] shadow-xl overflow-hidden transition-all duration-300 ${
                  !stage.unlocked 
                    ? 'opacity-50 cursor-not-allowed filter grayscale' 
                    : 'cursor-pointer hover:scale-105 hover:shadow-2xl active:scale-95'
                }`}
                onClick={() => stage.unlocked && handleStageClick(stage)}
              >
                <div className="relative h-48 sm:h-56 lg:h-64">
                  <Image
                    src={stage.image}
                    alt={stage.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-bold text-sm sm:text-lg">
                    {stage.id}
                  </div>
                  <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 text-white font-bold text-lg sm:text-xl bg-black bg-opacity-50 px-3 sm:px-4 py-1 sm:py-2 rounded-[15px]">
                    {stage.name}
                  </div>
                  {stage.completed && (
                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-green-500 text-white rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-sm">
                      ✓
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-6">
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 font-lexend">{stage.description}</p>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4 font-lexend">{stage.progress}</p>
                  <button
                    className={`w-full py-3 sm:py-4 rounded-[15px] font-bold font-lexend transition-colors text-sm sm:text-base min-h-[44px] ${
                      !stage.unlocked
                        ? 'bg-orange-400 text-white cursor-not-allowed'
                        : stage.completed
                        ? 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
                        : stage.id === currentStage
                        ? 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800'
                        : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                    }`}
                    disabled={!stage.unlocked}
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
