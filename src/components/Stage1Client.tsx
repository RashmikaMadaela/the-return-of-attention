'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock } from 'lucide-react'
import Navigation from './Navigation'
import { Stage1Data } from '@/lib/data/stage1-data'

interface Stage1ClientProps {
  initialData: Stage1Data
}

export default function Stage1Client({ initialData }: Stage1ClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  // Auto-refresh data when redirected from reflection page
  React.useEffect(() => {
    const shouldRefresh = searchParams.get('refresh')
    if (shouldRefresh === 'true') {
      setIsRefreshing(true)
      
      // Trigger server re-fetch by calling router.refresh()
      router.refresh()
      
      // Remove the refresh parameter from URL without refreshing the page
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
      
      // Reset refreshing state after a short delay
      setTimeout(() => setIsRefreshing(false), 500)
    }
  }, [searchParams, router])

  // Build stages list from server data
  const serverSubStages = initialData.subStages
  const pahmIntro = initialData.pahmIntro

  const stages = serverSubStages.map((s) => ({
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
    sessions: pahmIntro.sessionsCompleted || 0,
    completed: pahmIntro.isCompleted || false,
    unlocked: pahmIntro.isUnlocked || false,
    minSessions: 1,
    progressPercent: 0,
    meetsSessionRequirement: false,
    isPAHM: true
  })

  const getStageButton = (stage: any) => {
    if (!stage.unlocked) return { text: 'Locked', color: 'bg-[#9eaac0]', disabled: true }
    if (stage.isPAHM) {
      if (stage.completed) return { text: 'Completed', color: 'bg-green-600', disabled: false }
      return { text: 'Complete', color: 'bg-[#6465e0]', disabled: false }
    }
    // Allow practice even after meeting the session requirement - show "Practice" or "Continue"
    if (stage.meetsSessionRequirement) return { text: 'Practice', color: 'bg-[#6465e0]', disabled: false }
    if (stage.sessions > 0) return { text: 'Continue', color: 'bg-[#6465e0]', disabled: false }
    return { text: 'Start', color: 'bg-[#6465e0]', disabled: false }
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

  const summary = initialData.summary

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#b9d4ee] to-[#fffafa]">
      {/* Background refresh indicator */}
      {isRefreshing && (
        <div className="fixed z-50 px-4 py-2 text-white bg-[#6465e0] rounded-lg shadow-lg top-20 right-4">
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
            <h1 className="mb-4 text-4xl font-bold text-[#03478f]">Stage 1: Physical Stillness</h1>
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
                <div key={stage.id} className="p-6 bg-[#e5f3ff] shadow-2xl rounded-xl">
                  <h3 className="mb-4 text-2xl font-bold text-[#03478f]">
                    {stage.isPAHM ? 'PAHM Matrix Intro' : getStageTitle(stage.name)}
                  </h3>
                  {!stage.isPAHM && (
                    <>
                      <p className="mb-2 text-[#123a63]">Duration: {stage.duration} minutes</p>
                      <p className="mb-4 text-[#123a63]">Sessions: {stage.sessions}/{stage.minSessions}</p>
                      <div className="mb-4">
                        <div className="w-full h-2 bg-[#d6e8f8] rounded-full">
                          <div
                            className="h-2 transition-all duration-300 bg-gradient-to-r from-[#6465e0] to-[#7c7de8] rounded-full"
                            style={{ width: `${Math.min(100, stage.progressPercent || 0)}%` }}
                          ></div>
                        </div>
                      </div>
                    </>
                  )}
                  {stage.isPAHM && (
                    <>
                      <p className="mb-2 text-[#123a63]">Introduction to PAHM Matrix</p>
                      <p className="mb-4 text-[#123a63]">Sessions: {stage.sessions}/1</p>
                      <div className="mb-4">
                        <div className="w-full h-2 bg-[#d6e8f8] rounded-full">
                          <div className="h-2 transition-all duration-300 bg-gradient-to-r from-[#6465e0] to-[#7c7de8] rounded-full" style={{ width: `${(stage.sessions / 1) * 100}%` }}></div>
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
          <div className="p-6 mt-8 bg-[#e5f3ff] shadow-2xl rounded-xl">
            <h2 className="mb-4 text-2xl font-bold text-[#03478f]">Your Progress</h2>
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
