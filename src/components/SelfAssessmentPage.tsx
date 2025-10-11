'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from './Navigation'

interface SelfAssessmentPageProps {
  onComplete?: (answers: any) => void
}

export default function SelfAssessmentPage({ onComplete }: SelfAssessmentPageProps) {
  const router = useRouter()
  
  const [answers, setAnswers] = useState<Record<string, string | null>>({
    foodTaste: null,
    scentsAromas: null,
    soundsMusic: null,
    visualBeauty: null,
    touchTextures: null,
    thoughtsImages: null
  })

  const questions = [
    {
      id: 'foodTaste',
      emoji: '🍎',
      title: 'Food & Taste',
      subtitle: 'How would you describe your relationship with food and flavors?',
      description: 'Think about your eating habits, favorite foods, and how much you enjoy taste experiences'
    },
    {
      id: 'scentsAromas',
      emoji: '🌸',
      title: 'Scents & Aromas',
      subtitle: 'How do you feel about different scents and fragrances?',
      description: 'Consider perfumes, cooking smells, nature scents, and other olfactory experiences'
    },
    {
      id: 'soundsMusic',
      emoji: '🎵',
      title: 'Sounds & Music',
      subtitle: 'What is your relationship with sounds, music, and audio?',
      description: 'Think about music preferences, environmental sounds, and audio experiences'
    },
    {
      id: 'visualBeauty',
      emoji: '👁️',
      title: 'Visual & Beauty',
      subtitle: 'How do you respond to visual beauty, colors, and sights?',
      description: 'Consider art, nature scenes, design, and other visual stimuli'
    },
    {
      id: 'touchTextures',
      emoji: '✋',
      title: 'Touch & Textures',
      subtitle: 'How do you feel about different textures and physical sensations?',
      description: 'Think about fabrics, temperatures, physical comfort, and tactile experiences'
    },
    {
      id: 'thoughtsImages',
      emoji: '🧠',
      title: 'Thoughts & Mental Images',
      subtitle: 'What is your relationship with thoughts, ideas, and mental imagery?',
      description: 'Consider your thinking patterns, imagination, and mental processes'
    }
  ]

  const options = [
    { value: 'none', label: "I don't have particular preferences for this", description: 'I am generally content with whatever comes my way in this sense area' },
    { value: 'some', label: "I have some preferences, but I'm flexible", description: 'I enjoy certain things more than others, but I adapt easily' },
    { value: 'strong', label: 'I have strong preferences and specific likes/dislikes', description: 'There are things I love or dislike very much in this area' }
  ]

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const isAllAnswered = () => {
    return Object.values(answers).every(answer => answer !== null)
  }

  const handleSubmit = async () => {
    if (!isAllAnswered()) {
      alert('Please answer all questions before submitting!')
      return
    }

    try {
      // Determine assessment type (initial/mid/final)
      const forcedType = (sessionStorage.getItem('assessment_type') as string) || null
      const type = forcedType || localStorage.getItem('expected_assessment_type') || 'initial'

      const payload = {
        type,
        foodTaste: answers.foodTaste as string,
        scentsAromas: answers.scentsAromas as string,
        soundsMusic: answers.soundsMusic as string,
        visualBeauty: answers.visualBeauty as string,
        touchTextures: answers.touchTextures as string,
        thoughtsImages: answers.thoughtsImages as string
      }

      const res = await fetch('/api/assessment/self-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        localStorage.setItem('selfAssessmentCompleted', 'true')
        localStorage.setItem('selfAssessmentAnswers', JSON.stringify(answers))
        router.push('/self-assessment/completed')
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err?.message || 'Failed to submit self assessment')
      }
      
    } catch (error) {
      console.error('Error submitting self assessment:', error)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600">
      {/* Navigation */}
      <Navigation currentPage="self-assessment" />
      
      <div className="p-4 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Questions */}
          <div className="space-y-6">
            {questions.map((question) => (
              <div key={question.id} className="bg-blue-400 bg-opacity-40 backdrop-blur-sm rounded-3xl p-8">
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">{question.emoji}</div>
                  <h2 className="text-white text-2xl font-bold mb-2">{question.title}</h2>
                  <p className="text-white text-sm mb-1">{question.subtitle}</p>
                  <p className="text-white text-xs opacity-80">{question.description}</p>
                </div>

                <div className="space-y-3">
                  {options.map((option, optIndex) => (
                    <div
                      key={option.value}
                      onClick={() => handleAnswerChange(question.id, option.value)}
                      className={`w-full rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg ${
                        answers[question.id] === option.value 
                          ? 'bg-green-500 ring-4 ring-green-600 shadow-lg' 
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-1 ${
                          answers[question.id] === option.value 
                            ? 'bg-white' 
                            : 'bg-blue-100'
                        }`}>
                          <span className={`font-bold ${
                            answers[question.id] === option.value 
                              ? 'text-green-600' 
                              : 'text-blue-600'
                          }`}>{optIndex + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className={`font-semibold mb-1 ${
                            answers[question.id] === option.value 
                              ? 'text-white' 
                              : 'text-gray-800'
                          }`}>{option.label}</div>
                          <div className={`text-xs ${
                            answers[question.id] === option.value 
                              ? 'text-green-100' 
                              : 'text-gray-600'
                          }`}>{option.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Buttons */}
          <div className="mt-8 flex justify-between items-center pb-8">
            <button
              onClick={handleBack}
              className="bg-blue-400 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isAllAnswered()}
              className={`font-bold px-12 py-4 rounded-xl transition-colors ${
                isAllAnswered()
                  ? 'bg-green-500 hover:bg-green-600 text-white cursor-pointer'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              Finish
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}