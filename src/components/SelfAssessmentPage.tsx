'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from './Navigation'
import { useToast } from '@/hooks/useToast'

interface SelfAssessmentPageProps {
  onComplete?: (answers: any) => void
}

export default function SelfAssessmentPage({ onComplete }: SelfAssessmentPageProps) {
  const router = useRouter()
  const { showWarning, showError, showSuccess, ToastContainer } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
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
      showWarning('Please answer all questions before submitting!')
      return
    }

    try {
      setIsSubmitting(true)
      
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
        showSuccess('Self assessment completed successfully!')
        setTimeout(() => router.push('/self-assessment/completed'), 1500)
      } else {
        const err = await res.json().catch(() => ({}))
        showError(err?.message || 'Failed to submit self assessment')
        setIsSubmitting(false)
      }
      
    } catch (error) {
      console.error('Error submitting self assessment:', error)
      showError('Failed to submit self assessment')
      setIsSubmitting(false)
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
    <div className="min-h-screen bg-gradient-to-b from-[#b9d4ee] to-[#fffafa]">
      <ToastContainer />
      {/* Navigation */}
      <Navigation currentPage="self-assessment" />
      
      <div className="p-3 pt-20 sm:p-4 sm:pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Questions */}
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            {questions.map((question) => (
              <div key={question.id} className="bg-[#e5f3ff] backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-lg">
                <div className="text-center mb-4 sm:mb-5 md:mb-6">
                  <div className="text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-3">{question.emoji}</div>
                  <h2 className="text-[#03478f] text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">{question.title}</h2>
                  <p className="text-black text-xs sm:text-sm mb-1">{question.subtitle}</p>
                  <p className="text-gray-700 text-[10px] sm:text-xs opacity-80">{question.description}</p>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {options.map((option, optIndex) => (
                    <div
                      key={option.value}
                      onClick={() => handleAnswerChange(question.id, option.value)}
                      className={`w-full rounded-lg sm:rounded-xl p-3 sm:p-3.5 md:p-4 cursor-pointer transition-all hover:shadow-lg ${
                        answers[question.id] === option.value 
                          ? 'bg-green-500 ring-2 sm:ring-4 ring-green-600 shadow-lg' 
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center mr-2 sm:mr-3 mt-1 ${
                          answers[question.id] === option.value 
                            ? 'bg-white' 
                            : 'bg-blue-100'
                        }`}>
                          <span className={`font-bold text-xs sm:text-sm ${
                            answers[question.id] === option.value 
                              ? 'text-green-600' 
                              : 'text-blue-600'
                          }`}>{optIndex + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className={`font-semibold mb-0.5 sm:mb-1 text-xs sm:text-sm md:text-base ${
                            answers[question.id] === option.value 
                              ? 'text-white' 
                              : 'text-gray-800'
                          }`}>{option.label}</div>
                          <div className={`text-[10px] sm:text-xs ${
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
          <div className="mt-6 sm:mt-7 md:mt-8 flex justify-between items-center pb-6 sm:pb-8">
            <button
              onClick={handleBack}
              className="bg-gradient-to-r from-[#6465e0] to-[#7c7de8] hover:from-[#5658d1] hover:to-[#6465e0] text-white font-bold px-5 py-3 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-lg sm:rounded-xl transition-colors text-sm sm:text-base"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isAllAnswered() || isSubmitting}
              className={`font-bold px-6 py-3 sm:px-8 sm:py-3 md:px-12 md:py-4 rounded-lg sm:rounded-xl transition-all text-sm sm:text-base flex items-center justify-center gap-2 ${
                isSubmitting
                  ? 'bg-green-400 text-white cursor-not-allowed'
                  : isAllAnswered()
                  ? 'bg-green-500 hover:bg-green-600 text-white cursor-pointer'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                'Finish'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}