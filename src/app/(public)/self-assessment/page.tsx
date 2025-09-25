'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface SelfAssessmentData {
  type: 'initial' | 'mid' | 'final';
  foodTaste: 'none' | 'some' | 'strong';
  scentsAromas: 'none' | 'some' | 'strong';
  soundsMusic: 'none' | 'some' | 'strong';
  visualBeauty: 'none' | 'some' | 'strong';
  touchTextures: 'none' | 'some' | 'strong';
  thoughtsImages: 'none' | 'some' | 'strong';
}

interface AssessmentQuestion {
  id: keyof Omit<SelfAssessmentData, 'type'>;
  category: string;
  question: string;
  description: string;
}

const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'foodTaste',
    category: 'Food & Taste',
    question: 'How would you describe your relationship with food and flavors?',
    description: 'Consider your preferences for different tastes, cuisines, and eating experiences.'
  },
  {
    id: 'scentsAromas',
    category: 'Scents & Aromas',
    question: 'How do you feel about different scents and fragrances?',
    description: 'Think about your reactions to perfumes, natural scents, and various aromas.'
  },
  {
    id: 'soundsMusic',
    category: 'Sounds & Music',
    question: "What's your relationship with sounds, music, and audio?",
    description: 'Consider your preferences for music genres, environmental sounds, and audio experiences.'
  },
  {
    id: 'visualBeauty',
    category: 'Visual & Beauty',
    question: 'How do you respond to visual beauty, colors, and sights?',
    description: 'Think about your reactions to art, nature, colors, and visual aesthetics.'
  },
  {
    id: 'touchTextures',
    category: 'Touch & Textures',
    question: 'How do you feel about different textures and physical sensations?',
    description: 'Consider your preferences for fabrics, materials, and physical touch.'
  },
  {
    id: 'thoughtsImages',
    category: 'Thoughts & Mental Images',
    question: "What's your relationship with thoughts and mental images?",
    description: 'Think about how you relate to your inner mental world and imagination.'
  }
];

const CHOICE_OPTIONS = [
  {
    value: 'none' as const,
    label: "I don't have particular preferences for this",
    description: "I'm generally content with whatever comes my way in this area",
    score: '+12 points',
    color: 'text-green-600 bg-green-50'
  },
  {
    value: 'some' as const,
    label: "I have some preferences, but I'm flexible",
    description: "I enjoy certain things more than others, but I adapt easily",
    score: '-7 points',
    color: 'text-yellow-600 bg-yellow-50'
  },
  {
    value: 'strong' as const,
    label: "I have strong preferences and specific likes/dislikes",
    description: "There are clear things I love or avoid in this area",
    score: '-15 points',
    color: 'text-red-600 bg-red-50'
  }
];

export default function SelfAssessmentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [assessmentType, setAssessmentType] = useState<'initial' | 'mid' | 'final'>('initial');
  const [answers, setAnswers] = useState<Partial<SelfAssessmentData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTypeSelection, setShowTypeSelection] = useState(true);

  const currentQuestion = ASSESSMENT_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === ASSESSMENT_QUESTIONS.length - 1;
  const progress = ((currentQuestionIndex + 1) / ASSESSMENT_QUESTIONS.length) * 100;

  // Load saved answers from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`self_assessment_${assessmentType}_answers`);
    if (saved) {
      try {
        setAnswers(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved answers:', error);
      }
    }
  }, [assessmentType]);

  // Save answers to localStorage whenever they change
  useEffect(() => {
    if (!showTypeSelection) {
      localStorage.setItem(`self_assessment_${assessmentType}_answers`, JSON.stringify(answers));
    }
  }, [answers, assessmentType, showTypeSelection]);

  const handleTypeSelection = (type: 'initial' | 'mid' | 'final') => {
    setAssessmentType(type);
    setAnswers({ type });
    setShowTypeSelection(false);
  };

  const handleAnswer = (value: 'none' | 'some' | 'strong') => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    const scoreMap = { none: 12, some: -7, strong: -15 };
    let totalScore = 0;
    
    ASSESSMENT_QUESTIONS.forEach(question => {
      const answer = answers[question.id];
      if (answer) {
        totalScore += scoreMap[answer];
      }
    });
    
    return totalScore;
  };

  const getScoreInterpretation = (score: number) => {
    if (score > 0) return 'Low Attachment (Good spiritual progress)';
    if (score > -50) return 'Moderate Attachment (Normal range)';
    return 'High Attachment (Room for growth)';
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const completeAnswers = {
        ...answers,
        type: assessmentType
      };

      const response = await fetch('/api/assessment/self-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completeAnswers),
      });

      const result = await response.json();

      if (result.success) {
        // Clear saved answers
        localStorage.removeItem(`self_assessment_${assessmentType}_answers`);
        
        const score = calculateScore();
        const interpretation = getScoreInterpretation(score);
        
        alert(`Self-assessment submitted successfully!\n\nYour Score: ${score}\nInterpretation: ${interpretation}`);
        
        router.push('/assessment-results');
      } else {
        setError(result.error || 'Failed to submit self-assessment');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isAnswered = () => {
    const answer = answers[currentQuestion.id];
    return answer !== undefined && answer !== null;
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Self Assessment</h1>
          <p className="text-gray-600">Please sign in to take the self-assessment</p>
        </div>
      </div>
    );
  }

  // Assessment Type Selection Screen
  if (showTypeSelection) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">PAHM Self Assessment</h1>
            <p className="text-gray-600">Choose your assessment type based on your journey stage</p>
          </div>

          <div className="space-y-4">
            <div 
              onClick={() => handleTypeSelection('initial')}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-500"
            >
              <h3 className="text-xl font-semibold text-blue-600 mb-2">Initial Assessment</h3>
              <p className="text-gray-600 mb-2">
                <strong>When:</strong> Immediately after account creation (after questionnaire)
              </p>
              <p className="text-gray-600">
                <strong>Purpose:</strong> Baseline attachment measurement for personalized guidance
              </p>
            </div>

            <div 
              onClick={() => handleTypeSelection('mid')}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-green-500"
            >
              <h3 className="text-xl font-semibold text-green-600 mb-2">Mid Assessment</h3>
              <p className="text-gray-600 mb-2">
                <strong>When:</strong> After completing first 3 stages (Seeker, PAHM Trainee, PAHM Beginner)
              </p>
              <p className="text-gray-600">
                <strong>Purpose:</strong> Track spiritual progress and attachment reduction
              </p>
            </div>

            <div 
              onClick={() => handleTypeSelection('final')}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-purple-500"
            >
              <h3 className="text-xl font-semibold text-purple-600 mb-2">Final Assessment</h3>
              <p className="text-gray-600 mb-2">
                <strong>When:</strong> After completing all 6 stages (full PAHM program)
              </p>
              <p className="text-gray-600">
                <strong>Purpose:</strong> Measure transformation and spiritual growth achieved
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {assessmentType.charAt(0).toUpperCase() + assessmentType.slice(1)} Self Assessment
          </h1>
          <p className="text-gray-600">Attachment evaluation across 6 sensory categories</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Category {currentQuestionIndex + 1} of {ASSESSMENT_QUESTIONS.length}</span>
            <span>{currentQuestion.category}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentQuestion.category}
            </h2>
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              {currentQuestion.question}
            </h3>
            <p className="text-gray-600 text-sm">
              {currentQuestion.description}
            </p>
          </div>
          
          <div className="space-y-4">
            {CHOICE_OPTIONS.map((option) => (
              <label 
                key={option.value}
                className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  answers[currentQuestion.id] === option.value 
                    ? `border-blue-500 ${option.color}` 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={option.value}
                    checked={answers[currentQuestion.id] === option.value}
                    onChange={(e) => handleAnswer(e.target.value as 'none' | 'some' | 'strong')}
                    className="w-4 h-4 text-blue-600 mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-gray-900">{option.label}</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${option.color}`}>
                        {option.score}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 italic">{option.description}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Scoring Info */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-900 mb-2">Scoring System:</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Range:</strong> -90 to +72 points</p>
            <p><strong>Interpretation:</strong> Higher scores indicate less attachment (more spiritual progress)</p>
            <p><strong>Current Preview:</strong> {calculateScore()} points - {getScoreInterpretation(calculateScore())}</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="text-sm text-gray-500">
            {Math.round(progress)}% Complete
          </div>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={!isAnswered() || loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Assessment'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isAnswered()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}