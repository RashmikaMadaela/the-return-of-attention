'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'
import Navigation from './Navigation'

interface StageInfo {
  id: number
  name: string
  title: string
  description: string
  sessionsRequired: number
  minTimePerSession: number
  totalTimeRequired: number
  sessions: number
  totalTime: number
  completed: boolean
  unlocked: boolean
  color: string
}

export default function AllStagesPage() {
  const router = useRouter()
  
  const [stages, setStages] = useState<StageInfo[]>([
    {
      id: 1,
      name: 'Seeker',
      title: 'Foundation Building',
      description: 'Master physical stillness before attention tracking',
      sessionsRequired: 5, // T1-T5 sub-stages
      minTimePerSession: 10, // varies per sub-stage
      totalTimeRequired: 100, // T1(10) + T2(15) + T3(20) + T4(25) + T5(30)
      sessions: 0,
      totalTime: 0,
      completed: false,
      unlocked: true,
      color: 'from-blue-500 to-blue-700'
    },
    {
      id: 2,
      name: 'PAHM Trainee',
      title: 'Matrix Introduction',
      description: 'Learn to use the PAHM Matrix system',
      sessionsRequired: 30,
      minTimePerSession: 30,
      totalTimeRequired: 900,
      sessions: 0,
      totalTime: 0,
      completed: false,
      unlocked: false,
      color: 'from-purple-500 to-purple-700'
    },
    {
      id: 3,
      name: 'PAHM Beginner',
      title: 'Pattern Recognition',
      description: 'Deepen understanding of attention habits',
      sessionsRequired: 30,
      minTimePerSession: 30,
      totalTimeRequired: 900,
      sessions: 0,
      totalTime: 0,
      completed: false,
      unlocked: false,
      color: 'from-green-500 to-green-700'
    },
    {
      id: 4,
      name: 'PAHM Practitioner',
      title: 'Advanced Awareness',
      description: 'Refine attention awareness skills',
      sessionsRequired: 40,
      minTimePerSession: 30,
      totalTimeRequired: 1200,
      sessions: 0,
      totalTime: 0,
      completed: false,
      unlocked: false,
      color: 'from-orange-500 to-orange-700'
    },
    {
      id: 5,
      name: 'PAHM Master',
      title: 'Integration',
      description: 'Integrate practice into daily life awareness',
      sessionsRequired: 50,
      minTimePerSession: 30,
      totalTimeRequired: 1500,
      sessions: 0,
      totalTime: 0,
      completed: false,
      unlocked: false,
      color: 'from-pink-500 to-pink-700'
    },
    {
      id: 6,
      name: 'PAHM Illuminator',
      title: 'Transformation',
      description: 'Achieve lasting happiness through complete acceptance',
      sessionsRequired: 60,
      minTimePerSession: 30,
      totalTimeRequired: 1800,
      sessions: 0,
      totalTime: 0,
      completed: false,
      unlocked: false,
      color: 'from-yellow-500 to-yellow-700'
    }
  ])

  useEffect(() => {
    loadStageProgress()
  }, [])

  const loadStageProgress = () => {
    const updatedStages = stages.map(stage => {
      if (stage.id === 1) {
        // Stage 1: Check T1-T5 completion
        const stage1Progress = JSON.parse(localStorage.getItem('stage1Progress') || '[]')
        const completedSubStages = stage1Progress.filter((s: any) => s.completed).length
        const totalSessions = stage1Progress.reduce((sum: number, s: any) => sum + (s.sessions || 0), 0)
        const totalTime = stage1Progress.reduce((sum: number, s: any) => sum + (s.totalTime || 0), 0)
        
        return {
          ...stage,
          sessions: completedSubStages,
          totalTime: totalTime,
          completed: completedSubStages >= 5,
          unlocked: true
        }
      } else {
        // Stages 2-6: PAHM stages
        const stageProgress = JSON.parse(localStorage.getItem(`stage${stage.id}Progress`) || '{"sessions": 0, "totalTime": 0}')
        const completedStages = JSON.parse(localStorage.getItem('completedStages') || '[]')
        const unlockedStages = JSON.parse(localStorage.getItem('unlockedStages') || '[1]')
        
        return {
          ...stage,
          sessions: stageProgress.sessions || 0,
          totalTime: stageProgress.totalTime || 0,
          completed: completedStages.includes(stage.id),
          unlocked: unlockedStages.includes(stage.id)
        }
      }
    })
    
    setStages(updatedStages)
  }

  const getStageButton = (stage: StageInfo) => {
    if (!stage.unlocked) {
      return { text: 'Locked', color: 'bg-gray-400', disabled: true, icon: <Lock size={20} /> }
    }
    if (stage.completed) {
      return { text: 'Completed', color: 'bg-green-600', disabled: false, icon: null }
    }
    if (stage.sessions > 0) {
      return { text: 'Continue', color: 'bg-blue-600', disabled: false, icon: null }
    }
    return { text: 'Start', color: 'bg-blue-600', disabled: false, icon: null }
  }

  const handleStageClick = (stage: StageInfo) => {
    const buttonConfig = getStageButton(stage)
    if (buttonConfig.disabled && !stage.completed) return

    sessionStorage.setItem('selectedStage', stage.id.toString())
    sessionStorage.setItem('previousPage', '/all-stages')

    if (stage.id === 1) {
      // Stage 1: Go to Stage1Page (T1-T5 selection)
      router.push('/stage-1')
    } else {
      // Stages 2-6: Go to PAHM Matrix Intro then session setup
      router.push('/pahm-matrix-intro')
    }
  }

  const getProgressPercentage = (stage: StageInfo) => {
    if (stage.id === 1) {
      return Math.round((stage.sessions / stage.sessionsRequired) * 100)
    } else {
      const sessionProgress = (stage.sessions / stage.sessionsRequired) * 50
      const timeProgress = (stage.totalTime / stage.totalTimeRequired) * 50
      return Math.min(Math.round(sessionProgress + timeProgress), 100)
    }
  }

  const getProgressText = (stage: StageInfo) => {
    if (stage.id === 1) {
      return `${stage.sessions}/${stage.sessionsRequired} sub-stages completed`
    } else {
      return `${stage.sessions}/${stage.sessionsRequired} sessions • ${stage.totalTime}/${stage.totalTimeRequired} minutes`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#b9d4ee] to-[#fffafa]">
      {/* Navigation */}
      <Navigation currentPage="all-stages" />
      
      <div className="p-8 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#03478f] mb-4">Your Meditation Journey</h1>
            <p className="text-black text-xl">
              Progress through 6 stages to achieve lasting happiness through attention awareness
            </p>
          </div>

          {/* Stages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stages.map(stage => {
              const buttonConfig = getStageButton(stage)
              const progressPercentage = getProgressPercentage(stage)
              
              return (
                <div 
                  key={stage.id} 
                  className={`bg-gradient-to-br ${stage.color} rounded-xl p-6 shadow-lg border-2 ${
                    stage.unlocked ? 'border-white border-opacity-20' : 'border-gray-400 border-opacity-30'
                  }`}
                >
                  <div className="bg-white bg-opacity-90 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-800">Stage {stage.id}</h3>
                      {stage.completed && (
                        <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <span className="emoji">✓</span> COMPLETE
                        </div>
                      )}
                    </div>
                    
                    <h4 className="text-lg font-semibold text-blue-600 mb-2">{stage.name}</h4>
                    <h5 className="text-md font-medium text-gray-700 mb-2">{stage.title}</h5>
                    <p className="text-sm text-gray-600 mb-4">{stage.description}</p>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`bg-gradient-to-r ${stage.color} h-3 rounded-full transition-all duration-300`}
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{getProgressText(stage)}</p>
                    </div>

                    {/* Stage Requirements */}
                    <div className="text-xs text-gray-600 mb-4 space-y-1">
                      {stage.id === 1 ? (
                        <div>
                          <p>• 5 sub-stages: T1(10min) → T2(15min) → T3(20min) → T4(25min) → T5(30min)</p>
                          <p>• Master physical stillness foundation</p>
                        </div>
                      ) : (
                        <div>
                          <p>• {stage.sessionsRequired} sessions × {stage.minTimePerSession}+ minutes</p>
                          <p>• Minimum {stage.totalTimeRequired} total minutes required</p>
                          <p>• Interactive PAHM Matrix practice</p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleStageClick(stage)}
                      disabled={buttonConfig.disabled && !stage.completed}
                      className={`w-full ${buttonConfig.color} text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                        buttonConfig.disabled && !stage.completed ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'
                      }`}
                    >
                      {buttonConfig.icon}
                      {buttonConfig.text}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Overall Progress Summary */}
          <div className="mt-8 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Journey Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-3xl font-bold text-white">
                  {stages.filter(s => s.completed).length}
                </div>
                <div className="text-sm text-gray-200">Stages Completed</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-3xl font-bold text-white">
                  {stages.reduce((total, stage) => total + stage.sessions, 0)}
                </div>
                <div className="text-sm text-gray-200">Total Sessions</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-3xl font-bold text-white">
                  {Math.round(stages.reduce((total, stage) => total + stage.totalTime, 0) / 60)}h
                </div>
                <div className="text-sm text-gray-200">Total Time</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-3xl font-bold text-white">
                  {Math.round((stages.filter(s => s.completed).length / 6) * 100)}%
                </div>
                <div className="text-sm text-gray-200">Journey Complete</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}