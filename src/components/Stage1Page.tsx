'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock } from 'lucide-react'
import Navigation from './Navigation'
import { useStage1Progress } from '@/hooks/useStage1Progress'
import { Stage1PageSkeleton } from './LoadingSkeletons'
import { useThemeColors } from '@/hooks/useThemeColors'

export default function Stage1Page() {
  const { bgGradientTop, bgGradientBottom, topicColor, buttonColor, containerColor, textColor1, textColor2 } = useThemeColors()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data, error, isLoading, isValidating, mutate } = useStage1Progress()

  // Redirect on auth error
  React.useEffect(() => {
    if (error?.message === 'UNAUTHORIZED') {
      router.push('/signin')
    }
  }, [error, router])

  // Auto-refresh data when redirected from reflection page
  React.useEffect(() => {
    const shouldRefresh = searchParams.get('refresh')
    if (shouldRefresh === 'true') {
      // Trigger data revalidation
      mutate()
      
      // Remove the refresh parameter from URL without refreshing the page
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
    }
  }, [searchParams, mutate])

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
            className="px-8 py-3 font-bold text-white transition-colors rounded-xl hover:opacity-90"
            style={{ backgroundColor: buttonColor }}
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
    // new flag from server indicating session requirement met
    meetsSessionRequirement: s.meetsSessionRequirement || false,
    unlocked: s.isUnlocked || false,
    minSessions: s.minSessions || 3,
    progressPercent: s.progressPercent || 0,
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
    if (!stage.unlocked) return { text: 'Locked', color: 'bg-orange-400', disabled: true, useTheme: false }
    if (stage.isPAHM) {
      if (stage.completed) return { text: 'Completed', color: 'bg-green-600', disabled: false, useTheme: false }
      return { text: 'Complete', color: '', disabled: false, useTheme: true }
    }
    // Allow practice even after meeting the session requirement - show "Practice" or "Continue"
    if (stage.meetsSessionRequirement) return { text: 'Practice', color: '', disabled: false, useTheme: true }
    if (stage.sessions > 0) return { text: 'Continue', color: '', disabled: false, useTheme: true }
    return { text: 'Start', color: '', disabled: false, useTheme: true }
  }

  const handleStageClick = (stage: any) => {
    const buttonConfig = getStageButton(stage)
    if (buttonConfig.disabled) return

    sessionStorage.setItem('selectedStage', String(stage.id))
    sessionStorage.setItem('previousPage', '/stage-1')

    if (stage.isPAHM) {
      router.push('/pahm-intro')
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
    <div className="min-h-screen bg-gradient-to-b" style={{ backgroundImage: `linear-gradient(to bottom, ${bgGradientTop}, ${bgGradientBottom})` }}>
      {/* Background refresh indicator */}
      {isValidating && (
        <div className="fixed z-50 px-4 py-2 rounded-lg shadow-lg top-20 right-4" style={{ backgroundColor: buttonColor, color: textColor2 }}>
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
            <h1 className="mb-4 text-4xl font-bold" style={{ color: topicColor }}>Stage 1: Physical Stillness</h1>
            <p className="text-xl text-gray-700">Develop physical foundation through progressive stillness training from 10 to 30 minutes.</p>
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
                <div key={stage.id} className="p-6 shadow-2xl rounded-xl" style={{ backgroundColor: containerColor }}>
                  <h3 className="mb-4 text-2xl font-bold" style={{ color: topicColor }}>
                    {stage.isPAHM ? 'PAHM Matrix Intro' : getStageTitle(stage.name)}
                  </h3>
                  {!stage.isPAHM && (
                    <>
                      <p className="mb-2 text-gray-700">Duration: {stage.duration} minutes</p>
                      <p className="mb-4 text-gray-700">Sessions: {stage.sessions}/{stage.minSessions}</p>
                      <div className="mb-4">
                        <div className="w-full h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 transition-all duration-300 rounded-full"
                            style={{ width: `${Math.min(100, stage.progressPercent || 0)}%`, background: `linear-gradient(to right, ${buttonColor}, ${buttonColor}dd)` }}
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
                          <div className="h-2 transition-all duration-300 rounded-full" style={{ width: `${(stage.sessions / 1) * 100}%`, background: `linear-gradient(to right, ${buttonColor}, ${buttonColor}dd)` }}></div>
                        </div>
                      </div>
                    </>
                  )}
                  <button
                    onClick={() => handleStageClick(stage)}
                    disabled={buttonConfig.disabled}
                    className={`w-full ${buttonConfig.useTheme ? '' : buttonConfig.color} text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                      buttonConfig.disabled ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'
                    }`}
                    style={buttonConfig.useTheme ? { backgroundColor: buttonColor } : {}}
                  >
                    {!stage.unlocked && <Lock size={20} />}
                    {buttonConfig.text}
                  </button>
                </div>
              )
            })}
          </div>

          {/* Progress Summary */}
          <div className="p-6 mt-8 shadow-2xl rounded-xl" style={{ backgroundColor: containerColor }}>
            <h2 className="mb-4 text-2xl font-bold" style={{ color: topicColor }}>Your Progress</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3" style={{ color: textColor1 }}>
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
