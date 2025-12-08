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
import { useThemeColors } from '@/hooks/useThemeColors'
import { 
  HomePageSkeleton, 
  WelcomeCardSkeleton, 
  StageCardSkeleton,
  AssessmentNoticeSkeleton
} from './LoadingSkeletons'

export default function HomePageOptimized() {
  const router = useRouter()
  const { data: overview, error, isLoading, isValidating } = useProgressOverview()
  const { bgGradientTop, bgGradientBottom, topicColor, buttonColor, containerColor, textColor1, textColor2 } = useThemeColors()
  const [activeCellIndex, setActiveCellIndex] = React.useState(0)

  // Handle authentication error
  React.useEffect(() => {
    if (error?.message === 'UNAUTHORIZED') {
      router.push('/signin')
    }
  }, [error, router])

  // Matrix animation effect - randomly select one cell to pulse at a time
  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveCellIndex(Math.floor(Math.random() * 9))
    }, 2000) // Change every 2 seconds

    return () => clearInterval(interval)
  }, [])

  // Show full skeleton on first load
  if (isLoading) {
    return <HomePageSkeleton />
  }

  // Handle errors
  if (error && error.message !== 'UNAUTHORIZED') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-400 to-blue-300">
        <div className="max-w-md p-8 text-center bg-white shadow-2xl rounded-3xl">
          <div className="mb-4 text-6xl">⚠️</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">Failed to Load Data</h2>
          <p className="mb-6 text-gray-600">
            We encountered an error loading your dashboard. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 font-bold text-white transition-colors bg-blue-600 hover:bg-blue-700 rounded-xl"
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
  // Find stage config from overview.stages (should include minSessions/minHours from DB)
  const stageConfig = overview?.stages?.find((s: any) => s.stageNumber === stageNum) as { minSessions?: number; minHours?: number } | undefined
    const serverStage = serverStageProgress.find(s => s.stageNumber === stageNum)
    if (serverStage && stageConfig) {
      if (stageNum === 1) {
        return `${serverStage.sessionsCompleted || 0}/${stageConfig.minSessions ?? 0} sessions`
      } else {
        return `${(serverStage.hoursCompleted || 0).toFixed(1)}/${stageConfig.minHours ?? 0} hours`
      }
    }
    // Fallback to 0/min for locked stages
    if (stageNum === 1) {
      return `0/${stageConfig?.minSessions ?? 0} sessions`
    } else {
      return `0.0/${stageConfig?.minHours ?? 0} hours`
    }
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
    <div className="min-h-screen" style={{ backgroundColor: bgGradientBottom }}>
      {/* Background refresh indicator */}
      {isValidating && (
        <div className="fixed z-50 px-4 py-2 text-white bg-blue-500 rounded-lg shadow-lg top-20 right-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
            <span className="text-sm font-medium">Refreshing...</span>
          </div>
        </div>
      )}

      <Navigation currentPage="home" />

      {/* Hero Section */}
      <div 
        className="pt-20 sm:pt-24"
        style={{ background: `linear-gradient(to bottom, ${bgGradientTop}, ${bgGradientBottom})` }}
      >
        <div className="px-4 py-8 mx-auto max-w-7xl sm:py-12 md:py-16">
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row sm:gap-6 md:gap-8">
            <div className="p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className={`w-8 h-8 bg-orange-500 shadow-5xl rounded-lg sm:w-10 sm:h-10 md:w-12 md:h-12 sm:rounded-xl transition-transform ${activeCellIndex === 0 ? 'matrix-pulse' : ''}`}></div>
                <div className={`w-8 h-8 bg-teal-500 shadow-5xl rounded-lg sm:w-10 sm:h-10 md:w-12 md:h-12 sm:rounded-xl transition-transform ${activeCellIndex === 1 ? 'matrix-pulse' : ''}`}></div>
                <div className={`w-8 h-8 bg-purple-500 shadow-5xl rounded-lg sm:w-10 sm:h-10 md:w-12 md:h-12 sm:rounded-xl transition-transform ${activeCellIndex === 2 ? 'matrix-pulse' : ''}`}></div>
                <div className={`w-8 h-8 bg-yellow-500 shadow-5xl rounded-lg sm:w-10 sm:h-10 md:w-12 md:h-12 sm:rounded-xl transition-transform ${activeCellIndex === 3 ? 'matrix-pulse' : ''}`}></div>
                <div className={`w-8 h-8 bg-gray-400 rounded-lg shadow-5xl sm:w-10 sm:h-10 md:w-12 md:h-12 sm:rounded-xl transition-transform ${activeCellIndex === 4 ? 'matrix-pulse' : ''}`}></div>
                <div className={`w-8 h-8 bg-blue-400 shadow-5xl rounded-lg sm:w-10 sm:h-10 md:w-12 md:h-12 sm:rounded-xl transition-transform ${activeCellIndex === 5 ? 'matrix-pulse' : ''}`}></div>
                <div className={`w-8 h-8 bg-orange-400 shadow-5xl rounded-lg sm:w-10 sm:h-10 md:w-12 md:h-12 sm:rounded-xl transition-transform ${activeCellIndex === 6 ? 'matrix-pulse' : ''}`}></div>
                <div className={`w-8 h-8 bg-pink-400 shadow-5xl rounded-lg sm:w-10 sm:h-10 md:w-12 md:h-12 sm:rounded-xl transition-transform ${activeCellIndex === 7 ? 'matrix-pulse' : ''}`}></div>
                <div className={`w-8 h-8 bg-purple-400 shadow-5xl rounded-lg sm:w-10 sm:h-10 md:w-12 md:h-12 sm:rounded-xl transition-transform ${activeCellIndex === 8 ? 'matrix-pulse' : ''}`}></div>
              </div>
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="mb-1 text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl sm:mb-2" style={{ color: topicColor }}>The Return</h1>
              <h1 className="mb-2 text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl sm:mb-3 md:mb-4" style={{ color: topicColor }}>Of Attention</h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl" style={{ color: textColor1 }}>Practices for the Happiness that Stays</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 mx-auto max-w-7xl" style={{ backgroundColor: bgGradientBottom }}>
        {/* Welcome Card */}
        <div className="flex flex-col p-4 mb-6 space-y-4 rounded-3xl sm:p-6 lg:p-8 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 shadow-lg" style={{ backgroundColor: containerColor }}>
          <div className="text-center sm:text-left">
            <h2 className="mb-1 text-2xl font-bold sm:text-3xl lg:text-4xl sm:mb-2" style={{ color: topicColor }}>Welcome Back</h2>
            <h3 className="mb-2 text-2xl font-bold sm:text-3xl lg:text-4xl sm:mb-4" style={{ color: topicColor }}>{userName}</h3>
            <p className="text-sm font-semibold sm:text-base lg:text-lg">
              {assessmentsCompleted && hasHappinessScore 
                ? "Your Journey to Happiness that Stays" 
                : "Complete your assessments to begin your journey"}
            </p>
          </div>
          
          {assessmentsCompleted && hasHappinessScore && (
            <>
              <div className="hidden w-1 h-full mx-4 bg-blue-500 sm:block lg:mx-8"></div>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="px-6 sm:px-8 lg:px-12 py-3 sm:py-4 rounded-xl flex items-center justify-between min-w-[250px] sm:min-w-[280px] lg:min-w-[300px]" style={{ backgroundColor: buttonColor, color: textColor2 }}>
                  <span className="text-sm font-semibold sm:text-base lg:text-lg">Current Stage</span>
                  <span className="text-2xl font-bold sm:text-3xl lg:text-4xl">{String(currentStage).padStart(2, '0')}</span>
                </div>
                <div className="px-6 sm:px-8 lg:px-12 py-3 sm:py-4 rounded-xl flex items-center justify-between min-w-[250px] sm:min-w-[280px] lg:min-w-[300px]" style={{ backgroundColor: buttonColor, color: textColor2 }}>
                  <span className="text-sm font-semibold sm:text-base lg:text-lg">Happiness Points</span>
                  <span className="text-2xl font-bold sm:text-3xl lg:text-4xl">{happinessPoints}</span>
                </div>
              </div>
            </>
          )}
          
          {!assessmentsCompleted && (
            <div className="bg-white border-2 border-blue-300 rounded-[25px] p-4 sm:p-6 text-center sm:text-left max-w-md shadow-lg">
              <p className="mb-3 text-sm font-semibold text-blue-900 font-lexend sm:text-base">
                ⚠️ Assessment Progress
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${questionnaireCompleted ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    {questionnaireCompleted ? '✓' : '1'}
                  </div>
                  <p className={`font-lexend text-xs sm:text-sm ${questionnaireCompleted ? 'text-green-700 font-semibold' : 'text-gray-700'}`}>
                    Questionnaire {questionnaireCompleted ? '(Completed ✓)' : '(Pending)'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${selfAssessmentCompleted ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    {selfAssessmentCompleted ? '✓' : '2'}
                  </div>
                  <p className={`font-lexend text-xs sm:text-sm ${selfAssessmentCompleted ? 'text-green-700 font-semibold' : 'text-gray-700'}`}>
                    Self-Assessment {selfAssessmentCompleted ? '(Completed ✓)' : '(Pending)'}
                  </p>
                </div>
              </div>
              {!questionnaireCompleted || !selfAssessmentCompleted ? (
                <p className="pt-3 mt-3 text-xs text-blue-800 border-t border-blue-200 font-lexend sm:text-sm">
                  Complete both assessments to unlock your journey!
                </p>
              ) : null}
            </div>
          )}
        </div>

        {/* CTA for incomplete assessments */}
        {!assessmentsCompleted && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-[25px] p-6 sm:p-8 lg:p-10 mb-6 sm:mb-10 shadow-xl">
            <div className="flex flex-col items-center space-y-4 text-center text-white sm:space-y-6">
              <div className="text-4xl sm:text-5xl lg:text-6xl">🎯</div>
              <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl font-lexend">
                Start Your Journey to Lasting Happiness
              </h2>
              <p className="max-w-2xl text-base sm:text-lg lg:text-xl font-lexend">
                Complete the questionnaire and self-assessment to unlock your personalized journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto sm:min-w-[400px]">
                <button
                  onClick={() => router.push('/questionnaire')}
                  className={`px-8 py-4 rounded-[15px] font-bold font-lexend transition-colors text-lg shadow-lg flex-1 sm:flex-none ${
                    questionnaireCompleted 
                      ? 'cursor-default' 
                      : 'hover:opacity-90'
                  }`}
                  style={{
                    backgroundColor: questionnaireCompleted ? '#10b981' : textColor2,
                    color: questionnaireCompleted ? textColor2 : buttonColor
                  }}
                  disabled={questionnaireCompleted}
                >
                  {questionnaireCompleted ? '✓ Questionnaire Complete' : '📋 Start Questionnaire'}
                </button>
                <button
                  onClick={() => router.push('/self-assessment')}
                  className={`px-8 py-4 rounded-[15px] font-bold font-lexend transition-colors text-lg shadow-lg flex-1 sm:flex-none ${
                    selfAssessmentCompleted 
                      ? 'cursor-default' 
                      : 'hover:opacity-90'
                  }`}
                  style={{
                    backgroundColor: selfAssessmentCompleted ? '#10b981' : buttonColor,
                    color: textColor2
                  }}
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
          <h2 className="mb-4 text-2xl font-bold text-center sm:text-3xl font-lexend sm:mb-8 sm:text-left" style={{ color: textColor1 }}>
            Practice Stages
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 lg:gap-8">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className={`rounded-[25px] shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.25)] overflow-hidden transition-all duration-300 ${
                  !stage.unlocked 
                    ? 'opacity-50 cursor-not-allowed filter grayscale' 
                    : 'cursor-pointer hover:scale-105 active:scale-95'
                }`}
                style={{ backgroundColor: containerColor }}
                onClick={() => stage.unlocked && handleStageClick(stage)}
              >
                <div className="relative h-48 sm:h-56 lg:h-64">
                  <Image
                    src={stage.image}
                    alt={stage.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-black bg-opacity-50 rounded-full top-3 sm:top-4 left-3 sm:left-4 sm:w-10 sm:h-10 sm:text-lg">
                    {stage.id}
                  </div>
                  <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 text-white font-bold text-lg sm:text-xl bg-black bg-opacity-50 px-3 sm:px-4 py-1 sm:py-2 rounded-[15px]">
                    {stage.name}
                  </div>
                  {stage.completed && (
                    <div className="absolute flex items-center justify-center text-sm text-white bg-green-500 rounded-full top-3 sm:top-4 right-3 sm:right-4 w-7 h-7 sm:w-8 sm:h-8">
                      ✓
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-6">
                  <p className="mb-2 text-xs text-gray-600 sm:text-sm font-lexend">{stage.description}</p>
                  <p className="mb-4 text-xs text-gray-600 sm:text-sm font-lexend">{stage.progress}</p>
                  <button
                    className={`w-full py-3 sm:py-4 rounded-[15px] font-bold font-lexend transition-all text-sm sm:text-base min-h-[44px] ${
                      !stage.unlocked
                        ? 'cursor-not-allowed'
                        : stage.completed
                        ? 'hover:opacity-90'
                        : 'hover:opacity-90'
                    }`}
                    style={{
                      background: !stage.unlocked
                        ? '#fb923c'
                        : stage.completed
                        ? 'linear-gradient(to right, #059669, #10b981)'
                        : `linear-gradient(to right, ${buttonColor}, ${buttonColor}dd)`,
                      color: textColor2
                    }}
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
