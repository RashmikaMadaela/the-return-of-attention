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
  const [emotionalJourney, setEmotionalJourney] = useState([
    {
      id: 1,
      emotion: 'Happy',
      type: 'quick',
      description: 'Quick emotional check-in: Happy',
      trigger: 'quick check-in',
      intensity: 5,
      timestamp: '4 hours ago'
    },
    {
      id: 2,
      emotion: 'Sad',
      type: 'quick',
      description: 'Quick emotional check-in: Happy',
      trigger: 'daily routine',
      intensity: 5,
      timestamp: '7 hours ago'
    }
  ])

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
    'quick check-in'
  ]

  const handleQuickLog = (emotionName: string) => {
    const newEntry = {
      id: Date.now(),
      emotion: emotionName,
      type: 'quick',
      description: `Quick emotional check-in: ${emotionName}`,
      trigger: 'quick check-in',
      intensity: 5,
      timestamp: 'Just now'
    }
    setEmotionalJourney([newEntry, ...emotionalJourney])

    // Save to localStorage for database integration later
    if (typeof window !== 'undefined') {
      const existingSessions = JSON.parse(localStorage.getItem('dailyNotesSessions') || '[]')
      existingSessions.push(newEntry)
      localStorage.setItem('dailyNotesSessions', JSON.stringify(existingSessions))
    }
  }

  const handleDetailedLog = () => {
    if (!detailedForm.emotion) {
      alert('Please select an emotion!')
      return
    }

    const newEntry = {
      id: Date.now(),
      emotion: detailedForm.emotion,
      type: 'detailed',
      description: detailedForm.description || `Detailed note: ${detailedForm.emotion}`,
      trigger: detailedForm.trigger || 'Not specified',
      intensity: detailedForm.intensity,
      timestamp: 'Just now'
    }

    setEmotionalJourney([newEntry, ...emotionalJourney])
    
    // Save to localStorage for database integration later
    if (typeof window !== 'undefined') {
      const existingSessions = JSON.parse(localStorage.getItem('dailyNotesSessions') || '[]')
      existingSessions.push(newEntry)
      localStorage.setItem('dailyNotesSessions', JSON.stringify(existingSessions))
    }

    // Reset form
    setDetailedForm({
      description: '',
      emotion: '',
      intensity: 5,
      trigger: ''
    })
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
                    className="bg-cyan-200 hover:bg-cyan-300 rounded-2xl p-6 flex flex-col items-center justify-center transition-all transform hover:scale-105 shadow-lg"
                  >
                    <div className="text-5xl mb-3">{emotion.emoji}</div>
                    <div className="text-gray-800 font-semibold text-sm">{emotion.name}</div>
                  </button>
                ))}
              </div>
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors shadow-lg"
              >
                Log Emotion
              </button>
            </div>
          )}

          {/* Today's Emotional Journey */}
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <h2 className="text-gray-800 font-bold text-2xl mb-6">Today's Emotional Journey</h2>
            
            <div className="space-y-4">
              {emotionalJourney.map((entry) => (
                <div key={entry.id} className="bg-cyan-100 rounded-2xl p-6 shadow-md">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {emotions.find(e => e.name === entry.emotion)?.emoji}
                      </span>
                      <span className="text-gray-800 font-bold text-lg">{entry.emotion}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-700 font-semibold text-sm">
                        Intensity: {entry.intensity}/10
                      </div>
                      <div className="text-gray-600 text-sm">{entry.timestamp}</div>
                    </div>
                  </div>
                  <div className="text-gray-800 mb-2">{entry.description}</div>
                  <div className="text-gray-600 text-sm">
                    Triggered by: {entry.trigger}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}