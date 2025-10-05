'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
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

interface JourneyStats {
  totalStages: number
  completedStages: number
  unlockedStages: number
  totalSessions: number
  totalHours: number
  averageProgress: number
  currentStage?: StageProgress
  nextMilestone: string
}

const STAGE_NAMES = [
  'Seeker',
  'PAHM Trainee', 
  'PAHM Beginner',
  'PAHM Practitioner',
  'PAHM Master',
  'PAHM Illuminator'
]

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [assessmentStatus, setAssessmentStatus] = useState<AssessmentStatus | null>(null)
  const [stageProgress, setStageProgress] = useState<{
    stages: StageProgress[]
    journey: JourneyStats
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin')
      return
    }

    if (status === 'authenticated') {
      fetchDashboardData()
    }
  }, [session, status, router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch assessment status
      const assessmentResponse = await fetch('/api/assessment/status')
      if (!assessmentResponse.ok) throw new Error('Failed to fetch assessment status')
      const assessmentData = await assessmentResponse.json()
      
      if (assessmentData.success) {
        setAssessmentStatus(assessmentData.data)
      }

      // Fetch stage progress
      const stageResponse = await fetch('/api/progress/stages')
      if (!stageResponse.ok) throw new Error('Failed to fetch stage progress')
      const stageData = await stageResponse.json()
      
      if (stageData.success) {
        setStageProgress({
          stages: stageData.stages,
          journey: stageData.journey
        })
      }

    } catch (err) {
      console.error('Dashboard error:', err)
      setError('Unable to load dashboard. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="text-center p-8 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg max-w-md">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={fetchDashboardData}
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!session || !assessmentStatus) {
    return null
  }

  const needsOnboarding = !assessmentStatus.overallStatus.hasCompletedOnboarding
  const currentStage = stageProgress?.journey.currentStage
  const hasCompletedStage1 = stageProgress?.stages.find(s => s.stageNumber === 1)?.isCompleted || false

  return (
    <>
      <Navigation stageProgress={{ 
        hasCompletedStage1, 
        hasCompletedOnboarding: !needsOnboarding 
      }} />
      
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-20">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          
          {/* Hero Header with PAHM Matrix */}
          <div className="relative mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
            <div className="relative px-8 py-12">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-white mb-2">
                    The Return of Attention
                  </h1>
                  <p className="text-xl text-indigo-100 mb-6">
                    Progressive Attention & Happiness Meditation
                  </p>
                </div>
                
                {/* PAHM 3x3 Matrix Visualization */}
                <div className="hidden lg:block">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <h3 className="text-white font-semibold mb-4 text-center">PAHM Matrix</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {Array.from({ length: 9 }, (_, i) => (
                        <div 
                          key={i}
                          className={`w-8 h-8 rounded-lg border-2 transition-all ${
                            i < (stageProgress?.journey.averageProgress || 0) / 11
                              ? 'bg-emerald-400 border-emerald-300 shadow-lg'
                              : 'bg-white/20 border-white/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Welcome Section with User Stats */}
          <div className="mb-8 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {session.user?.name || 'Seeker'}!
                </h2>
                <p className="text-lg text-gray-600 mb-4">
                  Continue your mindful journey through attention awareness
                </p>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-indigo-600">
                        {currentStage?.stageNumber?.toString().padStart(2, '0') || '01'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Current Stage</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {currentStage?.name || STAGE_NAMES[0]}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Journey Progress</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {stageProgress?.journey.averageProgress || 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Assessment Completion Notice */}
          {needsOnboarding && (
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Questionnaire Card */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      assessmentStatus.questionnaire.completed 
                        ? 'bg-emerald-100' 
                        : 'bg-orange-100'
                    }`}>
                      {assessmentStatus.questionnaire.completed ? (
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Initial Questionnaire</h3>
                      <p className="text-sm text-gray-600">
                        {assessmentStatus.questionnaire.completed 
                          ? 'Completed ✓'
                          : 'Tell us about your meditation experience'
                        }
                      </p>
                    </div>
                  </div>
                </div>
                {!assessmentStatus.questionnaire.completed && (
                  <Link
                    href="/questionnaire"
                    className="w-full flex justify-center px-4 py-3 text-sm font-semibold text-white bg-orange-600 rounded-xl hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                  >
                    Complete
                  </Link>
                )}
              </div>

              {/* Self-Assessment Card */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      assessmentStatus.selfAssessments.initial.completed 
                        ? 'bg-emerald-100' 
                        : assessmentStatus.questionnaire.completed 
                        ? 'bg-orange-100'
                        : 'bg-gray-100'
                    }`}>
                      {assessmentStatus.selfAssessments.initial.completed ? (
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className={`w-5 h-5 ${
                          assessmentStatus.questionnaire.completed ? 'text-orange-600' : 'text-gray-400'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Self-Assessment</h3>
                      <p className="text-sm text-gray-600">
                        {assessmentStatus.selfAssessments.initial.completed 
                          ? 'Completed ✓'
                          : 'Assess your attachment patterns'
                        }
                      </p>
                    </div>
                  </div>
                </div>
                {!assessmentStatus.selfAssessments.initial.completed && (
                  <Link
                    href="/self-assessment"
                    className={`w-full flex justify-center px-4 py-3 text-sm font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      assessmentStatus.questionnaire.completed
                        ? 'text-white bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
                        : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                    }`}
                    {...(!assessmentStatus.questionnaire.completed && { 
                      onClick: (e) => e.preventDefault(),
                      'aria-disabled': true 
                    })}
                  >
                    Complete
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Practice Stages Grid */}
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Practice Stages</h2>
              <p className="text-gray-600">Progress through the six stages of attention mastery</p>
            </div>
            
            {needsOnboarding ? (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-8">
                <div className="text-center py-8">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-gray-600 mb-2">Complete your assessments to unlock stages</p>
                  <p className="text-sm text-gray-500">Your meditation journey begins after setup</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {STAGE_NAMES.map((stageName, index) => {
                  const stageNumber = index + 1
                  const stageData = stageProgress?.stages.find(s => s.stageNumber === stageNumber)
                  const isCompleted = stageData?.isCompleted || false
                  const isCurrent = currentStage?.stageNumber === stageNumber
                  const isUnlocked = stageData?.isUnlocked || false
                  const sessionsCompleted = stageData?.progress.sessionsCompleted || 0
                  const progress = stageData?.progress.overallProgress || 0

                  return (
                    <div 
                      key={stageNumber}
                      className={`bg-white/70 backdrop-blur-sm rounded-2xl border shadow-lg p-6 transition-all duration-200 ${
                        isCompleted 
                          ? 'border-emerald-200 hover:shadow-xl' 
                          : isCurrent 
                          ? 'border-indigo-200 hover:shadow-xl ring-2 ring-indigo-100'
                          : isUnlocked
                          ? 'border-white/20 hover:shadow-xl'
                          : 'border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                            isCompleted 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : isCurrent 
                              ? 'bg-indigo-100 text-indigo-700'
                              : isUnlocked
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-gray-50 text-gray-400'
                          }`}>
                            {stageNumber.toString().padStart(2, '0')}
                          </div>
                          <div>
                            <h3 className={`font-semibold ${
                              isCompleted ? 'text-emerald-900' : 
                              isCurrent ? 'text-indigo-900' : 
                              isUnlocked ? 'text-gray-900' : 'text-gray-500'
                            }`}>
                              {stageName}
                            </h3>
                            <p className={`text-sm ${
                              isCompleted ? 'text-emerald-600' : 
                              isCurrent ? 'text-indigo-600' : 
                              isUnlocked ? 'text-gray-600' : 'text-gray-400'
                            }`}>
                              Stage {stageNumber}
                            </p>
                          </div>
                        </div>
                        
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isCompleted 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : isCurrent 
                            ? 'bg-indigo-100 text-indigo-700'
                            : isUnlocked
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-gray-50 text-gray-400'
                        }`}>
                          {isCompleted ? 'Complete' : isCurrent ? 'Active' : isUnlocked ? 'Available' : 'Locked'}
                        </div>
                      </div>
                      
                      {/* Progress Information */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className={isUnlocked ? 'text-gray-600' : 'text-gray-400'}>
                            {sessionsCompleted} sessions
                          </span>
                          {isUnlocked && !isCompleted && (
                            <span className="text-gray-600">{progress}%</span>
                          )}
                        </div>
                        
                        {isUnlocked && !isCompleted && (
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                isCurrent ? 'bg-indigo-500' : 'bg-gray-400'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Action Button */}
                      <div className="mt-4">
                        {isCompleted ? (
                          <Link
                            href={`/stages/${stageNumber}`}
                            className="w-full flex justify-center px-4 py-3 text-sm font-semibold text-emerald-700 bg-emerald-100 rounded-xl hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                          >
                            Review
                          </Link>
                        ) : isCurrent ? (
                          <Link
                            href={`/stages/${stageNumber}`}
                            className="w-full flex justify-center px-4 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                          >
                            Continue
                          </Link>
                        ) : isUnlocked ? (
                          <Link
                            href={`/stages/${stageNumber}`}
                            className="w-full flex justify-center px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                          >
                            Begin
                          </Link>
                        ) : (
                          <div className="w-full flex justify-center px-4 py-3 text-sm font-medium text-gray-400 bg-gray-50 rounded-xl cursor-not-allowed">
                            Locked
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <footer className="bg-white/50 backdrop-blur-sm border-t border-white/20 mt-12">
          <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                "The mind is everything. What you think you become." - Buddha
              </p>
              <p className="text-xs text-gray-500">
                © 2024 The Return of Attention. Based on the PAHM methodology by A.C. Amarasighe.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}