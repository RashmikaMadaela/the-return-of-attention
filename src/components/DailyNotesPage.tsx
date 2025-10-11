'use client'

import React, { useState, useEffect } from 'react'
import Navigation from './Navigation'

export default function DailyNotesPage() {
  // Add Lexend font
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
  const [emotionalJourney, setEmotionalJourney] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Load today's emotional journey from database
  useEffect(() => {
    loadTodaysEmotionalJourney()
  }, [])

  const loadTodaysEmotionalJourney = async () => {
    try {
      setIsLoading(true)
      const today = new Date().toISOString().split('T')[0]
      
      // Get detailed notes for today (quick logs are now saved as detailed entries)
      const detailedResponse = await fetch(`/api/notes/detailed?startDate=${today}T00:00:00Z&endDate=${today}T23:59:59Z`)
      const detailedData = await detailedResponse.json()

      if (detailedData.success) {
        // Transform database entries to match UI format
        const transformedEntries = detailedData.data.notes.map((note: any) => ({
          id: note.id,
          emotion: note.emotion,
          type: note.context === "Quick Log" ? 'quick' : 'detailed',
          description: note.context === "Quick Log" 
            ? `Quick emotional check-in: ${note.emotion}`
            : note.context || `Detailed note: ${note.emotion}`,
          trigger: note.trigger || 'Not specified',
          intensity: note.intensity || 5,
          timestamp: formatTimestamp(note.createdAt),
          createdAt: note.createdAt
        }))

        // Sort by creation time (newest first)
        transformedEntries.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        
        setEmotionalJourney(transformedEntries)
      } else {
        setError('Failed to load emotional journey')
      }
    } catch (err) {
      console.error('Error loading emotional journey:', err)
      setError('Failed to load emotional journey')
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const now = new Date()
    const noteTime = new Date(timestamp)
    const diffMs = now.getTime() - noteTime.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return noteTime.toLocaleDateString()
  }

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
        // Reload the emotional journey to show the new entry
        await loadTodaysEmotionalJourney()
        setError('')
      } else {
        setError(result.error || 'Failed to save quick log')
      }
    } catch (err) {
      console.error('Error saving quick log:', err)
      setError('Failed to save quick log')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDetailedLog = async () => {
    if (!detailedForm.emotion) {
      alert('Please select an emotion!')
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
        // Reload the emotional journey to show the new entry
        await loadTodaysEmotionalJourney()
        setError('')
        
        // Reset form
        setDetailedForm({
          description: '',
          emotion: '',
          intensity: 5,
          trigger: ''
        })
      } else {
        setError(result.error || 'Failed to save detailed log')
      }
    } catch (err) {
      console.error('Error saving detailed log:', err)
      setError('Failed to save detailed log')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-400 to-blue-300">
      {/* Navigation */}
      <Navigation currentPage="daily-notes" />

      <div className="p-4 pt-24">
        <div className="max-w-6xl mx-auto">
          {/* Title Section */}
          <div className="text-center mb-8">
            <h1 className="text-white text-5xl font-bold mb-3">Emotional Check-ins</h1>
            <p className="text-white text-xl">Capture how you're feeling Today</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}

          {/* View Mode Toggle */}
          <div className="flex justify-center gap-3 mb-8">
            <button
              onClick={() => setViewMode('quick')}
              className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                viewMode === 'quick'
                  ? 'bg-white text-pink-600'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Quick Log
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                viewMode === 'detailed'
                  ? 'bg-white text-pink-600'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Detailed
            </button>
          </div>

          {/* Quick Log View */}
          {viewMode === 'quick' && (
            <div className="bg-white rounded-3xl p-8 mb-8 shadow-xl">
              <h2 className="text-gray-800 font-bold text-xl mb-6">How are you feeling right now?</h2>
              
              <div className="grid grid-cols-5 gap-4">
                {emotions.map((emotion) => (
                  <button
                    key={emotion.name}
                    onClick={() => handleQuickLog(emotion.name)}
                    disabled={isLoading}
                    className="bg-cyan-200 hover:bg-cyan-300 rounded-2xl p-6 flex flex-col items-center justify-center transition-all transform hover:scale-110 hover:shadow-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="text-5xl mb-3 transition-transform group-hover:scale-110">
                      {emotion.emoji}
                    </div>
                    <div className="text-gray-800 font-semibold text-sm transition-colors group-hover:text-blue-600">
                      {emotion.name}
                    </div>
                  </button>
                ))}
              </div>
              
              {isLoading && (
                <div className="text-center mt-4">
                  <div className="text-gray-600">Saving your emotion...</div>
                </div>
              )}
            </div>
          )}

          {/* Detailed View */}
          {viewMode === 'detailed' && (
            <div className="bg-white rounded-3xl p-8 mb-8 shadow-xl">
              {/* What's happening */}
              <div className="mb-6">
                <h3 className="text-gray-800 font-bold text-lg mb-3">
                  What's happening Today (optional)
                </h3>
                <textarea
                  value={detailedForm.description}
                  onChange={(e) => setDetailedForm({ ...detailedForm, description: e.target.value })}
                  placeholder="Describe what trigger's this emotion or what's on your mind"
                  className="w-full h-32 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl resize-none focus:border-blue-500 focus:outline-none text-gray-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Emotion Dropdown */}
                <div>
                  <h3 className="text-gray-800 font-bold text-lg mb-3">Emotion</h3>
                  <select
                    value={detailedForm.emotion}
                    onChange={(e) => setDetailedForm({ ...detailedForm, emotion: e.target.value })}
                    className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-600"
                  >
                    <option value="">How are you feeling?</option>
                    {emotions.map((emotion) => (
                      <option key={emotion.name} value={emotion.name}>
                        {emotion.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Intensity Slider */}
                <div>
                  <h3 className="text-gray-800 font-bold text-lg mb-3">
                    Intensity: {detailedForm.intensity}/10
                  </h3>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={detailedForm.intensity}
                    onChange={(e) => setDetailedForm({ ...detailedForm, intensity: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>Mild</span>
                    <span>Intense</span>
                  </div>
                </div>
              </div>

              {/* Trigger Dropdown */}
              <div className="mb-6">
                <h3 className="text-gray-800 font-bold text-lg mb-3">
                  What triggered this? (Optional)
                </h3>
                <select
                  value={detailedForm.trigger}
                  onChange={(e) => setDetailedForm({ ...detailedForm, trigger: e.target.value })}
                  className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-600"
                >
                  <option value="">Select a trigger</option>
                  {triggers.map((trigger) => (
                    <option key={trigger} value={trigger}>
                      {trigger}
                    </option>
                  ))}
                </select>
              </div>

              {/* Log Button */}
              <button
                onClick={handleDetailedLog}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Log Emotion'}
              </button>
            </div>
          )}

          {/* Today's Emotional Journey */}
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <h2 className="text-gray-800 font-bold text-2xl mb-6">Today's Emotional Journey</h2>
            
            {isLoading && emotionalJourney.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <div className="text-gray-600">Loading your emotional journey...</div>
              </div>
            ) : emotionalJourney.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🌱</div>
                <h3 className="text-gray-800 font-semibold text-lg mb-2">Start Your Emotional Journey</h3>
                <p className="text-gray-600">No entries yet today. Log your first emotion to begin tracking your daily emotional patterns.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {emotionalJourney.map((entry) => (
                  <div key={entry.id} className="bg-cyan-100 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {emotions.find(e => e.name === entry.emotion)?.emoji || '😐'}
                        </span>
                        <span className="text-gray-800 font-bold text-lg">{entry.emotion}</span>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">
                          {entry.type === 'emoji' ? 'Quick' : 'Detailed'}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-700 font-semibold text-sm">
                          Intensity: {entry.intensity}/10
                        </div>
                        <div className="text-gray-600 text-sm">{entry.timestamp}</div>
                      </div>
                    </div>
                    {entry.description && (
                      <div className="text-gray-800 mb-2">{entry.description}</div>
                    )}
                    <div className="text-gray-600 text-sm">
                      Triggered by: {entry.trigger}
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