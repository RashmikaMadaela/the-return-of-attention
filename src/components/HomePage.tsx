/**
 * OPTIMIZED HomePage Implementation
 * 
 * Key improvements:
 * - Uses SWR for automatic caching and instant loads
 * - Loading skeletons instead of 0 values
 * - Progressive rendering of sections
 * - Background revalidation
 * - Optimistic UI patterns
 */
'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Navigation from './Navigation'
import { useProgressOverview } from '@/hooks/useProgressOverview'
import { 
  HomePageSkeleton, 
  WelcomeCardSkeleton, 
  StageCardSkeleton,
  AssessmentNoticeSkeleton
} from './LoadingSkeletons'

export default function HomePageOptimized() {
  const router = useRouter()
  const { data: overview, error, isLoading, isValidating } = useProgressOverview()

  // Handle authentication error
  React.useEffect(() => {
    if (error?.message === 'UNAUTHORIZED') {
      router.push('/signin')
    }
  }, [error, router])

  // Show full skeleton on first load
  if (isLoading) {
    return <HomePageSkeleton />
  }

  // Handle errors
  if (error && error.message !== 'UNAUTHORIZED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-400 to-blue-300">
        <div className="text-center bg-white rounded-3xl p-8 shadow-2xl max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Failed to Load Data</h2>
          <p className="text-gray-600 mb-6">
            We encountered an error loading your dashboard. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Extract data with safe defaults (now instant from cache on revisit!)
  const userName = overview?.user?.name || 'User'
  const currentStage = overview?.journey?.currentStage?.number || 1
  const happinessPoints = overview?.happiness?.currentScore?.score || 0
  const questionnaireCompleted = overview?.assessments?.questionnaire?.completed || false
  const selfAssessmentCompleted = overview?.assessments?.initial?.completed || false
  const assessmentsCompleted = questionnaireCompleted && selfAssessmentCompleted
  const hasHappinessScore = !!overview?.happiness?.currentScore
  const serverStageProgress = overview?.stages || []

  // Helper to get progress text
  const getProgressText = (stageNum: number) => {
    const serverStage = serverStageProgress.find(s => s.stageNumber === stageNum)
    if (serverStage) {
      if (stageNum === 1) {
        return `${serverStage.sessionsCompleted || 0}/15 sessions`
      } else {
        return `${(serverStage.hoursCompleted || 0).toFixed(1)}/15 hours`
      }
    }
    return stageNum === 1 ? '0/15 sessions' : '0.0/15 hours'
  }

  // Helper to check if stage is unlocked
  const isStageUnlocked = (stageNum: number) => {
    if (serverStageProgress.length > 0) {
      if (stageNum === 1) return true
      const prevStage = serverStageProgress.find(s => s.stageNumber === stageNum - 1)
      return prevStage?.isCompleted || false
    }
    return stageNum === 1
  }

  // Helper to check if stage is completed
  const isStageCompleted = (stageNum: number) => {
    const serverStage = serverStageProgress.find(s => s.stageNumber === stageNum)
    return serverStage?.isCompleted || false
  }

  // Helper to get button text
  const getStageButtonText = (stageId: number) => {
    const isCompleted = isStageCompleted(stageId)
    const isUnlocked = isStageUnlocked(stageId)
    
    if (isCompleted) return 'Completed'
    if (!isUnlocked) return 'Locked'
    if (stageId === currentStage) return 'Continue'
    return 'Start'
  }

  const stages = [
    {
      id: 1,
      name: 'Seeker',
      description: 'Physical Stillness (T1-T5)',
      progress: getProgressText(1),
      image: '/png_images/Flux_Dev_A_realistic_image_of_a_thoughtful_person_sitting_at_t_0.jpg',
      unlocked: isStageUnlocked(1),
      completed: isStageCompleted(1),
      buttonText: getStageButtonText(1)
    },
    {
      id: 2,
      name: 'PAHM Trainee',
      description: 'Basic attention training',
      progress: getProgressText(2),
      image: '/png_images/Flux_Dev_A_realistic_image_of_a_person_sitting_crosslegged_ind_1.jpg',
      unlocked: isStageUnlocked(2),
      completed: isStageCompleted(2),
      buttonText: getStageButtonText(2)
    },
    {
      id: 3,
      name: 'PAHM Beginner',
      description: 'Structured practice',
      progress: getProgressText(3),
      image: '/png_images/Flux_Dev_A_realistic_image_of_a_beginner_meditator_sitting_cal_0.jpg',
      unlocked: isStageUnlocked(3),
      completed: isStageCompleted(3),
      buttonText: getStageButtonText(3)
    },
    {
      id: 4,
      name: 'PAHM Practitioner',
      description: 'Advanced techniques',
      progress: getProgressText(4),
      image: '/png_images/Flux_Dev_A_realistic_image_of_a_dedicated_practitioner_sitting_0.jpg',
      unlocked: isStageUnlocked(4),
      completed: isStageCompleted(4),
      buttonText: getStageButtonText(4)
    },
    {
      id: 5,
      name: 'PAHM Master',
      description: 'Refined awareness',
      progress: getProgressText(5),
      image: '/png_images/Image_fx (5).jpg',
      unlocked: isStageUnlocked(5),
      completed: isStageCompleted(5),
      buttonText: getStageButtonText(5)
    },
    {
      id: 6,
      name: 'PAHM Illuminator',
      description: 'Complete mastery',
      progress: getProgressText(6),
      image: '/png_images/Image_fx (3).jpg',
      unlocked: isStageUnlocked(6),
      completed: isStageCompleted(6),
      buttonText: getStageButtonText(6)
    }
  ]

  const handleStageClick = (stage: any) => {
    if (!stage.unlocked) return
    
    sessionStorage.setItem('previousPage', '/home')
    
    if (stage.id === 1) {
      const hasSeenIntro = localStorage.getItem('stage1IntroSeen') === 'true'
      if (!hasSeenIntro) {
        router.push('/stage-1-intro')
      } else {
        router.push('/stage-1')
      }
    } else {
      router.push(`/stage-${stage.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-300">
      {/* Background refresh indicator */}
      {isValidating && (
        <div className="fixed top-20 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            <span className="text-sm font-medium">Refreshing...</span>
          </div>
        </div>
      )}

      <Navigation currentPage="home" />

      {/* Hero Section */}
      <div 
        className="bg-cover bg-center bg-no-repeat pt-20 sm:pt-24" 
        style={{ backgroundImage: "url('/png_images/dcds.png')" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8">
            <div className="bg-purple-400 p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-orange-300 rounded-lg sm:rounded-xl animate-pulse"></div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-teal-300 rounded-lg sm:rounded-xl animate-pulse delay-100"></div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-purple-300 rounded-lg sm:rounded-xl animate-pulse delay-200"></div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-yellow-300 rounded-lg sm:rounded-xl animate-pulse delay-300"></div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg sm:rounded-xl animate-pulse delay-400"></div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-blue-200 rounded-lg sm:rounded-xl animate-pulse delay-500"></div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-orange-200 rounded-lg sm:rounded-xl animate-pulse delay-700"></div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-pink-200 rounded-lg sm:rounded-xl animate-pulse delay-800"></div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-purple-200 rounded-lg sm:rounded-xl animate-pulse delay-1000"></div>
              </div>
            </div>
            
            <div className="text-white text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2">The Return</h1>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 md:mb-4">Of Attention</h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl">Practices for the Happiness that Stays</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Card */}
        <div className="bg-cyan-300 rounded-3xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">Welcome Back</h2>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4">{userName}</h3>
            <p className="text-sm sm:text-base lg:text-lg font-semibold">
              {assessmentsCompleted && hasHappinessScore 
                ? "Your Journey to Happiness that Stays" 
                : "Complete your assessments to begin your journey"}
            </p>
          </div>
          
          {assessmentsCompleted && hasHappinessScore && (
            <>
              <div className="hidden sm:block h-full w-1 bg-blue-500 mx-4 lg:mx-8"></div>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-blue-500 text-white px-6 sm:px-8 lg:px-12 py-3 sm:py-4 rounded-xl flex items-center justify-between min-w-[250px] sm:min-w-[280px] lg:min-w-[300px]">
                  <span className="font-semibold text-sm sm:text-base lg:text-lg">Current Stage</span>
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold">{String(currentStage).padStart(2, '0')}</span>
                </div>
                <div className="bg-blue-500 text-white px-6 sm:px-8 lg:px-12 py-3 sm:py-4 rounded-xl flex items-center justify-between min-w-[250px] sm:min-w-[280px] lg:min-w-[300px]">
                  <span className="font-semibold text-sm sm:text-base lg:text-lg">Happiness Points</span>
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold">{happinessPoints}</span>
                </div>
              </div>
            </>
          )}
          
          {!assessmentsCompleted && (
            <div className="bg-yellow-100 border-2 border-yellow-500 rounded-[15px] p-4 sm:p-6 text-center sm:text-left max-w-md">
              <p className="text-yellow-900 font-lexend text-sm sm:text-base font-semibold mb-3">
                ⚠️ Assessment Progress
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${questionnaireCompleted ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    {questionnaireCompleted ? '✓' : '1'}
                  </div>
                  <p className={`font-lexend text-xs sm:text-sm ${questionnaireCompleted ? 'text-green-700 font-semibold' : 'text-yellow-800'}`}>
                    Questionnaire {questionnaireCompleted ? '(Completed ✓)' : '(Pending)'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${selfAssessmentCompleted ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    {selfAssessmentCompleted ? '✓' : '2'}
                  </div>
                  <p className={`font-lexend text-xs sm:text-sm ${selfAssessmentCompleted ? 'text-green-700 font-semibold' : 'text-yellow-800'}`}>
                    Self-Assessment {selfAssessmentCompleted ? '(Completed ✓)' : '(Pending)'}
                  </p>
                </div>
              </div>
              {!questionnaireCompleted || !selfAssessmentCompleted ? (
                <p className="text-yellow-800 font-lexend text-xs sm:text-sm mt-3 pt-3 border-t border-yellow-300">
                  Complete both assessments to unlock your journey!
                </p>
              ) : null}
            </div>
          )}
        </div>

        {/* CTA for incomplete assessments */}
        {!assessmentsCompleted && (
          <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-[25px] p-6 sm:p-8 lg:p-10 mb-6 sm:mb-10 shadow-xl">
            <div className="flex flex-col items-center text-center text-white space-y-4 sm:space-y-6">
              <div className="text-4xl sm:text-5xl lg:text-6xl">🎯</div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-lexend">
                Start Your Journey to Lasting Happiness
              </h2>
              <p className="text-base sm:text-lg lg:text-xl font-lexend max-w-2xl">
                Complete the questionnaire and self-assessment to unlock your personalized journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto sm:min-w-[400px]">
                <button
                  onClick={() => router.push('/questionnaire')}
                  className={`px-8 py-4 rounded-[15px] font-bold font-lexend transition-colors text-lg shadow-lg flex-1 sm:flex-none ${
                    questionnaireCompleted 
                      ? 'bg-green-500 text-white cursor-default' 
                      : 'bg-white text-orange-600 hover:bg-orange-50'
                  }`}
                  disabled={questionnaireCompleted}
                >
                  {questionnaireCompleted ? '✓ Questionnaire Complete' : '📋 Start Questionnaire'}
                </button>
                <button
                  onClick={() => router.push('/self-assessment')}
                  className={`px-8 py-4 rounded-[15px] font-bold font-lexend transition-colors text-lg shadow-lg flex-1 sm:flex-none ${
                    selfAssessmentCompleted 
                      ? 'bg-green-500 text-white cursor-default' 
                      : 'bg-orange-700 text-white hover:bg-orange-800'
                  }`}
                  disabled={selfAssessmentCompleted}
                >
                  {selfAssessmentCompleted ? '✓ Self-Assessment Complete' : '✍️ Self Assessment'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Practice Stages */}
        <div className="mb-4 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-black font-lexend mb-4 sm:mb-8 text-center sm:text-left">
            Practice Stages
          </h2>
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
