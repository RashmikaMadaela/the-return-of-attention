'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Navigation } from '@/components/Navigation'

interface AssessmentStatus {
  questionnaire: {
    completed: boolean
    completedAt?: string
  }
  selfAssessments: {
    initial: {
      completed: boolean
      data?: any
    }
    mid: {
      completed: boolean
      data?: any
    }
    final: {
      completed: boolean
      data?: any
    }
  }
  overallStatus: {
    hasCompletedOnboarding: boolean
    canAccessStages: boolean
  }
}

interface StageProgress {
  id: string
  stageNumber: number
  name: string
  description: string
  isUnlocked: boolean
  isCompleted: boolean
  completedAt?: string
  progress: {
    overallProgress: number
    sessionsCompleted: number
    hoursCompleted: number
    canStart: boolean
  }
  sessions: {
    total: number
    averageQuality?: number
  }
}

const STAGE_NAMES = [
  'Seeker',
  'PAHM Trainee', 
  'PAHM Beginner',
  'PAHM Practitioner',
  'PAHM Master',
  'PAHM Illuminator'
]

export default function HomePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [currentStage, setCurrentStage] = useState(1)
  const [happinessPoints, setHappinessPoints] = useState(20)
  const [userName, setUserName] = useState('User')
  const [showMidAssessment, setShowMidAssessment] = useState(false)
  const [showFinalAssessment, setShowFinalAssessment] = useState(false)
  const [assessmentStatus, setAssessmentStatus] = useState<AssessmentStatus | null>(null)
  const [stageProgress, setStageProgress] = useState<StageProgress[]>([])

  // Check assessment status and user progress
  useEffect(() => {
    if (session?.user?.id) {
      fetchAssessmentStatus()
      fetchStageProgress()
    }
  }, [session])

  const fetchAssessmentStatus = async () => {
    try {
      const response = await fetch('/api/assessment/status')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAssessmentStatus(data.data)
          
          // Check if user needs to complete onboarding
          if (!data.data.overallStatus.hasCompletedOnboarding) {
            router.push('/questionnaire')
            return
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch assessment status:', error)
    }
  }

  const fetchStageProgress = async () => {
    try {
      const response = await fetch('/api/progress/stages')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.stages) {
          setStageProgress(data.data.stages)
          
          // Set current stage based on progress
          const currentStageData = data.data.stages.find((stage: StageProgress) => 
            !stage.isCompleted && stage.isUnlocked
          )
          if (currentStageData) {
            setCurrentStage(currentStageData.stageNumber)
          }
          
          // Check for assessment requirements
          const completedStages = data.data.stages.filter((stage: StageProgress) => stage.isCompleted).length
          if (completedStages >= 3 && assessmentStatus && !assessmentStatus.selfAssessments.mid.completed) {
            setShowMidAssessment(true)
          }
          if (completedStages >= 6 && assessmentStatus && !assessmentStatus.selfAssessments.final.completed) {
            setShowFinalAssessment(true)
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch stage progress:', error)
    }
  }

  // Set user name from session
  useEffect(() => {
    if (session?.user?.name) {
      setUserName(session.user.name)
    }
  }, [session])

  const stages = stageProgress.map((stage, index) => ({
    id: stage.stageNumber,
    name: STAGE_NAMES[index] || `Stage ${stage.stageNumber}`,
    description: stage.description,
    progress: `${stage.progress.sessionsCompleted}/${stage.sessions.total} sessions`,
    image: `/images/stage-${stage.stageNumber}.jpg`,
    unlocked: stage.isUnlocked,
    completed: stage.isCompleted,
    buttonText: stage.isCompleted ? 'Completed' : 
                !stage.isUnlocked ? 'Locked' : 
                stage.stageNumber === currentStage ? 'Continue' : 'Start'
  }))

  const handleStageClick = (stage: any) => {
    if (!stage.unlocked) {
      console.log(`Stage ${stage.id} is locked`)
      return
    }
    
    // Store previous page for navigation
    sessionStorage.setItem('previousPage', '/dashboard')
    
    if (stage.id === 1) {
      router.push('/stages/1')
    } else {
      router.push(`/stages/${stage.id}`)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #B1FAFF 0%, #5EFFFA 100%)' }}>
      {/* Navigation */}
      <Navigation stageProgress={{
        hasCompletedStage1: stageProgress.length > 0 ? stageProgress[0]?.isCompleted || false : false,
        hasCompletedOnboarding: assessmentStatus?.overallStatus?.hasCompletedOnboarding || false
      }} />

      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header with background image and title */}
        <div className="relative mb-4 sm:mb-8 rounded-[25px] overflow-hidden h-64 sm:h-80 lg:h-96">
          <Image
            src="/images/pahm-matrix-bg.jpg"
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
                    router.push('/self-assessment?type=mid')
                  }}
                  className="bg-white text-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-[15px] font-bold font-lexend hover:bg-purple-50 transition-colors text-sm sm:text-base"
                >
                  Take Assessment
                </button>
                <button
                  onClick={() => {
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
                    router.push('/self-assessment?type=final')
                  }}
                  className="bg-white text-orange-600 px-6 sm:px-8 py-3 sm:py-4 rounded-[15px] font-bold font-lexend hover:bg-orange-50 transition-colors text-sm sm:text-base"
                >
                  Take Final Assessment
                </button>
                <button
                  onClick={() => {
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