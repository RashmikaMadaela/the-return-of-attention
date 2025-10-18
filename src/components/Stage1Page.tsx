'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'
import Navigation from './Navigation'
import { useStage1Progress } from '@/hooks/useStage1Progress'
import { Stage1PageSkeleton } from './LoadingSkeletons'

export default function Stage1Page() {
  const router = useRouter()
  const { data, error, isLoading, isValidating } = useStage1Progress()

  // Redirect on auth error
  React.useEffect(() => {
    if (error?.message === 'UNAUTHORIZED') {
      router.push('/signin')
    }
  }, [error, router])

  if (isLoading) {
    return <Stage1PageSkeleton />
  }

  if (error && error.message !== 'UNAUTHORIZED') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-blue-700">
        <div className="max-w-md p-8 text-center bg-white shadow-2xl rounded-3xl">
          <div className="mb-4 text-6xl">⚠️</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">Failed to Load Progress</h2>
          <p className="mb-6 text-gray-600">We encountered an error loading your stage progress. Please try again.</p>
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

  // Build stages list from server data
  const serverSubStages = data?.subStages || []
  const pahmIntro = data?.pahmIntro || { isCompleted: false, isUnlocked: false, sessionsCompleted: 0 }

  const stages = serverSubStages.map((s: any) => ({
    id: s.id,
    name: s.name,
    duration: s.duration || 10,
    sessions: s.sessionsCompleted || 0,
    completed: s.isCompleted || false,
    unlocked: s.isUnlocked || false,
    minSessions: s.minSessions || 3,
    isPAHM: false
  }))

  // Add PAHM intro as last stage
  stages.push({
    id: 'PAHM',
    name: 'PAHM Intro',
    duration: 0,
    sessions: (pahmIntro as any).sessionsCompleted || 0,
    completed: (pahmIntro as any).isCompleted || false,
    unlocked: (pahmIntro as any).isUnlocked || false,
    minSessions: 1,
    isPAHM: true
  } as any)

  const getStageButton = (stage: any) => {
    if (!stage.unlocked) return { text: 'Locked', color: 'bg-orange-400', disabled: true }
    if (stage.isPAHM) return { text: 'Start', color: 'bg-blue-600', disabled: false }
    if (stage.completed) return { text: 'Completed', color: 'bg-pink-600', disabled: true }
    if (stage.sessions > 0) return { text: 'Continue', color: 'bg-blue-600', disabled: false }
    return { text: 'Start', color: 'bg-blue-600', disabled: false }
  }

  const handleStageClick = (stage: any) => {
    const buttonConfig = getStageButton(stage)
    if (buttonConfig.disabled) return

    sessionStorage.setItem('selectedStage', String(stage.id))
    sessionStorage.setItem('previousPage', '/stage-1')

    if (stage.isPAHM) {
      router.push('/pahm-matrix-intro')
    } else {
      router.push(`/stage-1/session-setup?stage=${stage.id}`)
    }
  }

  const handleBack = () => {
    const previousPage = sessionStorage.getItem('previousPage')
    if (previousPage) router.push(previousPage)
    else router.push('/home-qa')
  }

  const summary = data?.summary || { completedLevels: 0, totalSessions: 0, completionPercent: 0 }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700">
      {/* Background refresh indicator */}
      {isValidating && (
        <div className="fixed z-50 px-4 py-2 text-white bg-blue-500 rounded-lg shadow-lg top-20 right-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
            <span className="text-sm font-medium">Refreshing...</span>
          </div>
        </div>
      )}

      <Navigation currentPage="stage-1" />

      <div className="p-8 pt-24">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold text-white">Stage 1: Physical Stillness</h1>
            <p className="text-xl text-white">Develop physical foundation through progressive stillness training from 10 to 30 minutes.</p>
          </div>

          {/* Stages Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {stages.map((stage: any) => {
              const buttonConfig = getStageButton(stage)
              
              // Get full title for each sub-stage
              const getStageTitle = (stageName: string) => {
                const titles: { [key: string]: string } = {
                  'T1': 'T1: Initial Introduction',
                  'T2': 'T2: Building Consistency',
                  'T3': 'T3: Deepening Practice',
                  'T4': 'T4: Advanced Preparation',
                  'T5': 'T5: PAHM Readiness'
                }
                return titles[stageName] || stageName
              }
              
              return (
                <div key={stage.id} className="p-6 bg-white shadow-lg rounded-xl">
                  <h3 className="mb-4 text-2xl font-bold">
                    {stage.isPAHM ? 'PAHM Matrix Intro' : getStageTitle(stage.name)}
                  </h3>
                  {!stage.isPAHM && (
                    <>
                      <p className="mb-2 text-gray-700">Duration: {stage.duration} minutes</p>
                      <p className="mb-4 text-gray-700">Sessions: {stage.sessions}/{stage.minSessions}</p>
                      <div className="mb-4">
                        <div className="w-full h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 transition-all duration-300 bg-blue-600 rounded-full"
                            style={{ width: `${(stage.sessions / Math.max(1, stage.minSessions)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </>
                  )}
                  {stage.isPAHM && (
                    <>
                      <p className="mb-2 text-gray-700">Introduction to PAHM Matrix</p>
                      <p className="mb-4 text-gray-700">Sessions: {stage.sessions}/1</p>
                      <div className="mb-4">
                        <div className="w-full h-2 bg-gray-200 rounded-full">
                          <div className="h-2 transition-all duration-300 bg-blue-600 rounded-full" style={{ width: `${(stage.sessions / 1) * 100}%` }}></div>
                        </div>
                      </div>
                    </>
                  )}
                  <button
                    onClick={() => handleStageClick(stage)}
                    disabled={buttonConfig.disabled}
                    className={`w-full ${buttonConfig.color} text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                      buttonConfig.disabled ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'
                    }`}
                  >
                    {!stage.unlocked && <Lock size={20} />}
                    {buttonConfig.text}
                  </button>
                </div>
              )
            })}
          </div>

          {/* Progress Summary */}
          <div className="p-6 mt-8 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl">
            <h2 className="mb-4 text-2xl font-bold text-black">Your Progress</h2>
            <div className="grid grid-cols-1 gap-4 text-black md:grid-cols-3">
              <div className="text-center">
                <div className="text-3xl font-bold">{summary.completedLevels}</div>
                <div className="text-sm">Completed Levels</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{summary.totalSessions}</div>
                <div className="text-sm">Total Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{summary.completionPercent}%</div>
                <div className="text-sm">Stage Completion</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
