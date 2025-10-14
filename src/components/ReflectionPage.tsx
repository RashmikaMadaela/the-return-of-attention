'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navigation from './Navigation'

export default function ReflectionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const stageId = searchParams.get('stage')

  const [reflection, setReflection] = useState({
    notes: '',
    challenges: [] as string[],
    qualityRating: 5,
    shouldCountAsSession: false
  })

  const [stage, setStage] = useState<any>(null)
  const [sessionSettings, setSessionSettings] = useState<any>(null)

  const challenges = [
    'Mind Wandering',
    'Physical Discomfort', 
    'Sleepiness',
    'Restlessness',
    'Strong Emotions',
    'External Distractions'
  ]

  useEffect(() => {
    // Load stage info
    const stages = JSON.parse(localStorage.getItem('stage1Progress') || '[]')
    const currentStage = stages.find((s: any) => s.id === parseInt(stageId || '1'))
    setStage(currentStage || { id: 1, name: 'T1', minTime: 10 })

    // Load session settings
    const settings = sessionStorage.getItem('sessionSettings')
    let actualDuration = 0
    
    if (settings) {
      const parsedSettings = JSON.parse(settings)
      setSessionSettings(parsedSettings)
      
      // Try to get actual session duration from sessionStorage
      const actualTime = sessionStorage.getItem('actualSessionDuration')
      if (actualTime) {
        actualDuration = parseInt(actualTime)
      } else {
        // Fallback to planned duration if actual time not available
        actualDuration = parsedSettings.duration
      }
      
      // Determine if session should count based on actual time spent
      const shouldCount = actualDuration >= (currentStage?.minTime || 10)
      setReflection(prev => ({ ...prev, shouldCountAsSession: shouldCount }))
    }
  }, [stageId])

  const saveReflection = () => {
    if (reflection.shouldCountAsSession) {
      // Update stage progress
      const stages = JSON.parse(localStorage.getItem('stage1Progress') || '[]')
      const updatedStages = stages.map((stage: any) => {
        if (stage.id === parseInt(stageId || '1')) {
          const newSessions = Math.min((stage.sessions || 0) + 1, 3)
          const isCompleted = newSessions === 3
          
          return {
            ...stage,
            sessions: newSessions,
            completed: isCompleted,
            lastCompleted: new Date().toISOString()
          }
        }
        return stage
      })

      // Unlock next stage if current stage is completed
      const currentStageIndex = updatedStages.findIndex((s: any) => s.id === parseInt(stageId || '1'))
      if (currentStageIndex >= 0 && currentStageIndex < updatedStages.length - 1) {
        const currentStage = updatedStages[currentStageIndex]
        if (currentStage.completed) {
          updatedStages[currentStageIndex + 1].unlocked = true
        }
      }

      localStorage.setItem('stage1Progress', JSON.stringify(updatedStages))
    }

    // Save reflection data
    const reflectionData = {
      ...reflection,
      stageId: parseInt(stageId || '1'),
      completedAt: new Date().toISOString(),
      duration: sessionSettings?.duration || 10
    }

    const reflections = JSON.parse(localStorage.getItem('sessionReflections') || '[]')
    reflections.push(reflectionData)
    localStorage.setItem('sessionReflections', JSON.stringify(reflections))

    // Navigate back to stage selection
    router.push('/stage-1')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700">
      {/* Navigation */}
      <Navigation currentPage="stage-1" />
      
      <div className="p-8 pt-24">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-8">Practice Reflection</h1>
          
          {!reflection.shouldCountAsSession && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
              <p className="font-semibold">Note: This session will not count towards your progress.</p>
              <p className="text-sm">You need to complete at least {stage?.minTime || 0} minutes for it to count as a completed session.</p>
            </div>
          )}
          
          {reflection.shouldCountAsSession && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
              <p className="font-semibold">Great job! This session will count towards your progress.</p>
            </div>
          )}
          
          <div className="bg-white rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-4">What did you notice during practice</h2>
            <textarea
              value={reflection.notes}
              onChange={(e) => setReflection(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Enter your reflections and insights here"
              className="w-full h-32 p-4 border-2 border-gray-200 rounded-lg mb-8 resize-none focus:outline-none focus:border-blue-500"
            />

            {/* Quality Rating Slider */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-2">Session Quality Rating</h2>
              <p className="text-gray-600 text-sm mb-4">How would you rate the overall quality of this practice session?</p>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 min-w-[80px]">Poor (1)</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={reflection.qualityRating}
                  onChange={(e) => setReflection(prev => ({ ...prev, qualityRating: parseInt(e.target.value) }))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-sm font-medium text-gray-700 min-w-[100px]">Excellent (10)</span>
              </div>
              <div className="text-center mt-2">
                <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-bold text-lg">
                  {reflection.qualityRating} / 10
                </span>
              </div>
            </div>

            <h2 className="text-xl font-bold mb-4">Challenges</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {challenges.map(challenge => (
                <button
                  key={challenge}
                  onClick={() => {
                    setReflection(prev => ({
                      ...prev,
                      challenges: prev.challenges.includes(challenge)
                        ? prev.challenges.filter((c: string) => c !== challenge)
                        : [...prev.challenges, challenge]
                    }))
                  }}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    reflection.challenges.includes(challenge)
                      ? 'bg-blue-100 border-blue-500'
                      : 'bg-white border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={reflection.challenges.includes(challenge)}
                    readOnly
                    className="mr-3"
                  />
                  {challenge}
                </button>
              ))}
            </div>

            {/* Session Summary */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-bold text-blue-800 mb-2">Session Summary</h3>
              <div className="text-blue-700 space-y-1">
                <p>• Stage: {stage?.name} - Physical Stillness</p>
                <p>• Duration: {sessionSettings?.duration || 10} minutes</p>
                <p>• Posture: {sessionSettings?.posture?.replace('-', ' ') || 'Not specified'}</p>
                <p>• Completed: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <button
              onClick={saveReflection}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Save Reflection
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}