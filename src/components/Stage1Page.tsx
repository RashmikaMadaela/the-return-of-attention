'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'
import Navigation from './Navigation'

interface Stage {
  id: number
  name: string
  duration: number
  sessions: number
  completed: boolean
  unlocked: boolean
  minTime: number
  isPAHM?: boolean
}

export default function Stage1Page() {
  const router = useRouter()
  
  const [stages, setStages] = useState<Stage[]>([
    { id: 1, name: 'T1', duration: 10, sessions: 0, completed: false, unlocked: true, minTime: 10 },
    { id: 2, name: 'T2', duration: 15, sessions: 0, completed: false, unlocked: false, minTime: 15 },
    { id: 3, name: 'T3', duration: 20, sessions: 0, completed: false, unlocked: false, minTime: 20 },
    { id: 4, name: 'T4', duration: 25, sessions: 0, completed: false, unlocked: false, minTime: 25 },
    { id: 5, name: 'T5', duration: 30, sessions: 0, completed: false, unlocked: false, minTime: 30 },
    { id: 6, name: 'PAHM', duration: 0, sessions: 0, completed: false, unlocked: false, minTime: 0, isPAHM: true }
  ])

  // Load stage progress from localStorage
  useEffect(() => {
    const savedStages = localStorage.getItem('stage1Progress')
    if (savedStages) {
      const parsed = JSON.parse(savedStages)
      // Merge saved progress with default stages to ensure all stages are present
      const updatedStages = stages.map(defaultStage => {
        const savedStage = parsed.find((s: any) => s.id === defaultStage.id)
        return savedStage ? { ...defaultStage, ...savedStage } : defaultStage
      })
      setStages(updatedStages)
    } else {
      // Initialize default stages in localStorage
      localStorage.setItem('stage1Progress', JSON.stringify(stages))
    }
  }, [])

  // Save stage progress to localStorage
  const saveProgress = (updatedStages: Stage[]) => {
    localStorage.setItem('stage1Progress', JSON.stringify(updatedStages))
    setStages(updatedStages)
  }

  const getStageButton = (stage: Stage) => {
    if (!stage.unlocked) {
      return { text: 'Locked', color: 'bg-orange-400', disabled: true }
    }
    if (stage.isPAHM) {
      return { text: 'Start', color: 'bg-blue-600', disabled: false }
    }
    if (stage.completed) {
      return { text: 'Completed', color: 'bg-pink-600', disabled: true }
    }
    if (stage.sessions > 0) {
      return { text: 'Continue', color: 'bg-blue-600', disabled: false }
    }
    return { text: 'Start', color: 'bg-blue-600', disabled: false }
  }

  const handleStageClick = (stage: Stage) => {
    const buttonConfig = getStageButton(stage)
    if (buttonConfig.disabled) return

    // Store selected stage and previous page
    sessionStorage.setItem('selectedStage', stage.id.toString())
    sessionStorage.setItem('previousPage', '/stage-1')

    if (stage.isPAHM) {
      router.push('/pahm-matrix-intro')
    } else {
      // Navigate to session setup (to be implemented)
      router.push(`/stage-1/session-setup?stage=${stage.id}`)
    }
  }

  const handleBack = () => {
    const previousPage = sessionStorage.getItem('previousPage')
    if (previousPage) {
      router.push(previousPage)
    } else {
      router.push('/home-qa')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700">
      {/* Navigation */}
      <Navigation currentPage="stage-1" />
      
      <div className="p-8 pt-24">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Stage 1: Physical Stillness</h1>
            <p className="text-white text-xl">Develop physical foundation through progressive stillness training from 10 to 30 minutes.</p>
          </div>
          


          {/* Stages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stages.map(stage => {
              const buttonConfig = getStageButton(stage)
              return (
                <div key={stage.id} className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-2xl font-bold mb-4">
                    {stage.isPAHM ? 'PAHM Matrix Intro' : `T${stage.id}: Physical Stillness`}
                  </h3>
                  {!stage.isPAHM && (
                    <>
                      <p className="mb-2 text-gray-700">Duration: {stage.duration} minutes</p>
                      <p className="mb-4 text-gray-700">Sessions: {stage.sessions}/3</p>
                      <div className="mb-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(stage.sessions / 3) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </>
                  )}
                  {stage.isPAHM && (
                    <>
                      <p className="mb-2 text-gray-700">Introduction to PAHM Matrix</p>
                      <p className="mb-4 text-gray-700">Sessions: 0/1</p>
                      <div className="mb-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: '0%' }}></div>
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
          <div className="mt-8 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6">
            <h2 className="text-2xl font-bold text-black mb-4">Your Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-black">
              <div className="text-center">
                <div className="text-3xl font-bold">{stages.filter(s => s.completed && !s.isPAHM).length}</div>
                <div className="text-sm">Completed Levels</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {stages.reduce((total, stage) => total + (stage.isPAHM ? 0 : stage.sessions), 0)}
                </div>
                <div className="text-sm">Total Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {Math.round((stages.filter(s => s.completed && !s.isPAHM).length / 5) * 100)}%
                </div>
                <div className="text-sm">Stage Completion</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}