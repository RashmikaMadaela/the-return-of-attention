'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Navigation from './Navigation'

export default function HomePage() {
  const router = useRouter()
  const [currentStage, setCurrentStage] = useState(1)
  const [happinessPoints, setHappinessPoints] = useState(0)
  const [userName, setUserName] = useState('User')
  const [showMidAssessment, setShowMidAssessment] = useState(false)
  const [showFinalAssessment, setShowFinalAssessment] = useState(false)
  const [loadingOverview, setLoadingOverview] = useState(true)
  const [serverStageProgress, setServerStageProgress] = useState<any[]>([])
  const [assessmentsCompleted, setAssessmentsCompleted] = useState(false)
  const [hasHappinessScore, setHasHappinessScore] = useState(false)
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false)
  const [selfAssessmentCompleted, setSelfAssessmentCompleted] = useState(false)

  // Check if assessments are completed
  useEffect(() => {
    // Fetch progress overview and assessment status from server
    let mounted = true
    async function loadOverview() {
      setLoadingOverview(true)
      try {
        const res = await fetch('/api/progress/overview')
        if (res.status === 401) {
          // Not authenticated - send to sign in
          router.push('/signin')
          return
        }
        const data = await res.json()
        if (!mounted) return

        const overview = data.overview || {}
        const assessments = overview.assessments || {}

        // Update UI state
        if (overview.user?.name) setUserName(overview.user.name)
        if (overview.happiness?.currentScore?.score) setHappinessPoints(overview.happiness.currentScore.score)
        if (overview.journey?.currentStage?.number) setCurrentStage(overview.journey.currentStage.number)

        // Store server stage progress for displaying real-time data
        if (overview.stages && Array.isArray(overview.stages)) {
          setServerStageProgress(overview.stages)
        }

        // Determine whether to show Home Q&A
        const questionnaireCompleted = assessments.questionnaire?.completed === true
        const initialCompleted = assessments.initial?.completed === true
        const assessmentsComplete = questionnaireCompleted && initialCompleted
        
        setQuestionnaireCompleted(questionnaireCompleted)
        setSelfAssessmentCompleted(initialCompleted)
        setAssessmentsCompleted(assessmentsComplete)
        setHasHappinessScore(overview.happiness?.currentScore?.score !== undefined && overview.happiness?.currentScore?.score !== null)

        // Show mid / final assessment prompts based on assessment flags
        const midRequired = assessments.mid?.completed === false && overview.journey?.completedStages >= 3
        const finalRequired = assessments.final?.completed === false && overview.journey?.completedStages >= 6
        setShowMidAssessment(!!midRequired)
        setShowFinalAssessment(!!finalRequired)

      } catch (err) {
        console.error('Failed to load overview', err)
      } finally {
        setLoadingOverview(false)
      }
    }

    loadOverview()
    return () => { mounted = false }
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

  // Helper to get progress text from server data or fallback to local
  const getProgressText = (stageNum: number) => {
    const serverStage = serverStageProgress.find(s => s.stageNumber === stageNum)
    if (serverStage) {
      if (stageNum === 1) {
        // Stage 1 shows sessions
        return `${serverStage.sessionsCompleted || 0}/15 sessions`
      } else {
        // Other stages show hours
        return `${(serverStage.hoursCompleted || 0).toFixed(1)}/15 hours`
      }
    }
    // Fallback for loading state
    return stageNum === 1 ? '0/15 sessions' : '0.0/15 hours'
  }

  // Helper to check if stage is unlocked from server or fallback to local
  const isStageUnlocked = (stageNum: number) => {
    if (serverStageProgress.length > 0) {
      // Use server data if available
      const serverStage = serverStageProgress.find(s => s.stageNumber === stageNum)
      return serverStage ? !serverStage.isCompleted || stageNum === 1 || serverStageProgress.find(s => s.stageNumber === stageNum - 1)?.isCompleted : false
    }
    // Fallback to localStorage
    return stageProgress.unlockedStages.includes(stageNum)
  }

  // Helper to check if stage is completed from server or fallback to local
  const isStageCompleted = (stageNum: number) => {
    if (serverStageProgress.length > 0) {
      const serverStage = serverStageProgress.find(s => s.stageNumber === stageNum)
      return serverStage?.isCompleted || false
    }
    return stageProgress.completedStages >= stageNum
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

  if (loadingOverview) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading...</div>
    )
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
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4">{userName}</h3>
            <p className="text-sm sm:text-base lg:text-lg font-semibold">
              {assessmentsCompleted && hasHappinessScore 
                ? "Your Journey to Happiness that Stays" 
                : "Complete your assessments to begin your journey"}
            </p>
          </div>
          
          {/* Only show stats boxes when assessments are completed */}
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
          
          {/* Show notice for new users who haven't completed assessments */}
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
                  Complete both assessments to unlock your journey and see your progress!
                </p>
              ) : null}
            </div>
          )}
        </div>

        {/* New User Call-to-Action - Show prominent CTA when assessments not completed */}
        {!assessmentsCompleted && (
          <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-[25px] p-6 sm:p-8 lg:p-10 mb-6 sm:mb-10 shadow-xl">
            <div className="flex flex-col items-center text-center text-white space-y-4 sm:space-y-6">
              <div className="text-4xl sm:text-5xl lg:text-6xl">🎯</div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-lexend">
                Start Your Journey to Lasting Happiness
              </h2>
              <p className="text-base sm:text-lg lg:text-xl font-lexend max-w-2xl">
                Complete the questionnaire and self-assessment to unlock your personalized journey. 
                These assessments help us understand your current state and create a tailored path for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto sm:min-w-[400px]">
                <button
                  onClick={() => router.push('/questionnaire')}
                  className={`px-8 py-4 rounded-[15px] font-bold font-lexend transition-colors text-lg shadow-lg flex-1 sm:flex-none relative ${
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
              <p className="text-sm sm:text-base font-lexend opacity-90">
                ⏱️ Takes approximately 10-15 minutes to complete both assessments
              </p>
            </div>
          </div>
        )}

        {/* Mid Assessment Container - Shows after Stage 3 completion */}
        {showMidAssessment && assessmentsCompleted && (
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
        {showFinalAssessment && assessmentsCompleted && (
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
