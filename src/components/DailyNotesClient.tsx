/**
 * DAILY NOTES CLIENT COMPONENT
 * Handles interactivity for emotional check-ins
 */
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from './Navigation'
import { useToast } from '@/hooks/useToast'
import type { DailyNotesData } from '@/lib/data/daily-notes-data'

interface DailyNotesClientProps {
  initialData: DailyNotesData | null
}

export function DailyNotesClient({ initialData }: DailyNotesClientProps) {
  const router = useRouter()
  const { showWarning, showError, showSuccess, ToastContainer } = useToast()
  
  // Apply Lexend font
  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    document.body.style.fontFamily = "'Lexend', sans-serif"
    return () => {
      document.body.style.fontFamily = ''
    }
  }, [])

  const [viewMode, setViewMode] = useState('quick') // 'quick' or 'detailed'
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Detailed form state
  const [detailedForm, setDetailedForm] = useState({
    description: '',
    emotion: '',
    intensity: 5,
    trigger: ''
  })

  const emotions = [
    { name: 'Happy', emoji: '😊', color: 'bg-cyan-400' },
    { name: 'Excited', emoji: '🤩', color: 'bg-cyan-400' },
    { name: 'Calm', emoji: '😌', color: 'bg-cyan-400' },
    { name: 'Confident', emoji: '💪', color: 'bg-cyan-400' },
    { name: 'Peaceful', emoji: '🕊️', color: 'bg-cyan-400' },
    { name: 'Energetic', emoji: '⚡', color: 'bg-cyan-400' },
    { name: 'Neutral', emoji: '😐', color: 'bg-cyan-400' },
    { name: 'Tired', emoji: '😴', color: 'bg-cyan-400' },
    { name: 'Bored', emoji: '😑', color: 'bg-cyan-400' },
    { name: 'Sad', emoji: '😢', color: 'bg-cyan-400' },
    { name: 'Anxious', emoji: '😰', color: 'bg-cyan-400' },
    { name: 'Frustrated', emoji: '😤', color: 'bg-cyan-400' }
  ]

  const triggers = [
    'work/career',
    'relationships',
    'health',
    'family',
    'finances',
    'social situation',
    'weather',
    'news/media',
    'personal achievement',
    'daily routine',
    'unexpected event',
    'physical state',
    'quick log'
  ]

  if (!initialData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#b9d4ee] to-[#fffafa]">
        <div className="max-w-md p-8 text-center bg-white shadow-2xl rounded-3xl">
          <div className="mb-4 text-6xl">⚠️</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">Not Authenticated</h2>
          <p className="mb-6 text-gray-600">
            Please sign in to access daily notes.
          </p>
          <button
            onClick={() => router.push('/signin')}
            className="px-8 py-3 font-bold text-white transition-colors bg-blue-600 hover:bg-blue-700 rounded-xl"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  const emotionalJourney = initialData.emotionalJourney

  const handleQuickLog = async (emotionName: string) => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/notes/detailed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emotion: emotionName,
          intensity: 5,
          context: "Quick Log",
          trigger: "quick log"
        })
      })

      const result = await response.json()

      if (result.success) {
        // Refresh server data
        router.refresh()
        // Signal other pages to refresh when navigated to
        sessionStorage.setItem('needsDataRefresh', 'true')
        setError('')
        showSuccess('Quick emotion logged!')
      } else {
        setError(result.error || 'Failed to save quick log')
        showError(result.error || 'Failed to save quick log')
      }
    } catch (err) {
      console.error('Error saving quick log:', err)
      setError('Failed to save quick log')
      showError('Failed to save quick log')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDetailedLog = async () => {
    if (!detailedForm.emotion) {
      showWarning('Please select an emotion!')
      return
    }

    try {
      setIsLoading(true)
      
      const response = await fetch('/api/notes/detailed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emotion: detailedForm.emotion,
          intensity: detailedForm.intensity,
          context: detailedForm.description || null,
          trigger: detailedForm.trigger || null
        })
      })

      const result = await response.json()

      if (result.success) {
        // Refresh server data
        router.refresh()
        // Signal other pages to refresh when navigated to
        sessionStorage.setItem('needsDataRefresh', 'true')
        setError('')
        showSuccess('Emotional note saved successfully!')
        
        // Reset form
        setDetailedForm({
          description: '',
          emotion: '',
          intensity: 5,
          trigger: ''
        })
      } else {
        setError(result.error || 'Failed to save detailed log')
        showError(result.error || 'Failed to save detailed log')
      }
    } catch (err) {
      console.error('Error saving detailed log:', err)
      setError('Failed to save detailed log')
      showError('Failed to save detailed log')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#b9d4ee] to-[#fffafa]">
      <ToastContainer />
      {/* Navigation */}
      <Navigation currentPage="daily-notes" />

      <div className="p-4 pt-24">
        <div className="max-w-6xl mx-auto">
          {/* Title Section */}
          <div className="mb-8 text-center">
            <h1 className="text-[#03478f] text-5xl font-bold mb-3">Emotional Check-ins</h1>
            <p className="mb-2 text-xl text-black">Notice an emotion arising? Log it here whenever you can.</p>
            <p className="text-sm text-slate-800">Tracking these moments gives us the insight needed to guide you deeper on your journey.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-4 py-3 mb-6 text-center text-red-700 bg-red-100 border border-red-400 rounded-lg">
              {error}
            </div>
          )}

          {/* View Mode Toggle */}
          <div className="flex justify-center gap-3 mb-8">
            <button
              onClick={() => setViewMode('quick')}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                viewMode === 'quick'
                  ? 'bg-[#e5f3ff] text-[#6465e0]'
                  : 'bg-gradient-to-r from-[#6465e0] to-[#7c7de8] text-white hover:from-[#5658d1] hover:to-[#6465e0]'
              }`}
            >
              Quick Log
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                viewMode === 'detailed'
                  ? 'bg-[#e5f3ff] text-[#6465e0]'
                  : 'bg-gradient-to-r from-[#6465e0] to-[#7c7de8] text-white hover:from-[#5658d1] hover:to-[#6465e0]'
              }`}
            >
              Detailed
            </button>
          </div>

          {/* Quick Log View */}
          {viewMode === 'quick' && (
            <div className="bg-[#e5f3ff] rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 shadow-2xl">
              <h2 className="mb-4 text-lg font-bold text-gray-800 sm:text-xl sm:mb-6">How are you feeling right now?</h2>
              
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 sm:gap-3 md:gap-4">
                {emotions.map((emotion) => (
                  <button
                    key={emotion.name}
                    onClick={() => handleQuickLog(emotion.name)}
                    disabled={isLoading}
                    className={`${emotion.color} hover:opacity-80 p-3 sm:p-4 rounded-xl flex flex-col items-center justify-center transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span className="mb-1 text-3xl sm:text-4xl sm:mb-2">{emotion.emoji}</span>
                    <span className="text-xs font-semibold text-white sm:text-sm">{emotion.name}</span>
                  </button>
                ))}
              </div>
              
              {isLoading && (
                <div className="mt-4 text-center">
                  <div className="text-gray-600">Saving your emotion...</div>
                </div>
              )}
            </div>
          )}

          {/* Detailed View */}
          {viewMode === 'detailed' && (
            <div className="bg-[#e5f3ff] rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 shadow-2xl">
              {/* What's happening */}
              <div className="mb-4 sm:mb-6">
                <h3 className="mb-2 text-base font-bold text-gray-800 sm:text-lg sm:mb-3">
                  What's happening now?
                </h3>
                <textarea
                  value={detailedForm.description}
                  onChange={(e) => setDetailedForm({ ...detailedForm, description: e.target.value })}
                  placeholder="Describe what trigger's this emotion or what's on your mind"
                  className="w-full h-24 p-3 text-sm text-gray-600 border-2 border-gray-200 resize-none sm:h-32 sm:p-4 bg-gray-50 rounded-xl focus:border-blue-500 focus:outline-none sm:text-base"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2 sm:gap-6 sm:mb-6">
                {/* Emotion Selection */}
                <div>
                  <h3 className="mb-2 text-base font-bold text-gray-800 sm:text-lg sm:mb-3">
                    How are you feeling?
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {emotions.map((emotion) => (
                      <button
                        key={emotion.name}
                        onClick={() => setDetailedForm({ ...detailedForm, emotion: emotion.name })}
                        className={`p-2 rounded-lg flex flex-col items-center transition-all ${
                          detailedForm.emotion === emotion.name
                            ? 'bg-blue-500 text-white scale-105'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <span className="mb-1 text-2xl">{emotion.emoji}</span>
                        <span className="text-xs font-semibold">{emotion.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Intensity Slider */}
                <div>
                  <h3 className="mb-2 text-base font-bold text-gray-800 sm:text-lg sm:mb-3">
                    Intensity Level: {detailedForm.intensity}/10
                  </h3>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={detailedForm.intensity}
                    onChange={(e) => setDetailedForm({ ...detailedForm, intensity: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between mt-1 text-xs text-gray-600">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                </div>
              </div>

              {/* Trigger Dropdown */}
              <div className="mb-4 sm:mb-6">
                <h3 className="mb-2 text-base font-bold text-gray-800 sm:text-lg sm:mb-3">
                  What triggered this? 
                </h3>
                <select
                  value={detailedForm.trigger}
                  onChange={(e) => setDetailedForm({ ...detailedForm, trigger: e.target.value })}
                  className="w-full p-3 text-gray-600 border-2 border-gray-200 bg-gray-50 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select a trigger</option>
                  {triggers.map((trigger) => (
                    <option key={trigger} value={trigger}>{trigger}</option>
                  ))}
                </select>
              </div>

              {/* Log Button */}
              <button
                onClick={handleDetailedLog}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#6465e0] to-[#7c7de8] hover:from-[#5658d1] hover:to-[#6465e0] text-white font-bold py-4 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Log Emotion'}
              </button>
            </div>
          )}

          {/* Today's Emotional Journey */}
          <div className="bg-[#e5f3ff] rounded-3xl p-8 shadow-2xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">Today's Emotional Journey</h2>
            
            {emotionalJourney.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-lg text-gray-600">No emotions logged yet today.</p>
                <p className="mt-2 text-gray-500">Start tracking your emotional journey above!</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {emotionalJourney.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 transition-shadow bg-white shadow-md rounded-xl hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">
                            {emotions.find(e => e.name === entry.emotion)?.emoji || '😊'}
                          </span>
                          <div>
                            <h3 className="font-bold text-gray-800">{entry.emotion}</h3>
                            <p className="text-xs text-gray-500">{entry.timestamp}</p>
                          </div>
                        </div>
                        <p className="mb-2 text-sm text-gray-600">{entry.description}</p>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>Intensity: {entry.intensity}/10</span>
                          <span>Trigger: {entry.trigger}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
