'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface QuestionnaireData {
  // Phase 1: Demographics & Background
  experienceLevel: number;
  mainGoals: string[];
  ageRange: string;
  location: string;
  occupation: string;
  educationLevel: string;
  meditationBackground: string;
  
  // Phase 2: Lifestyle Patterns  
  sleepPattern: number;
  physicalActivity: string;
  stressTrigers: string[];
  dailyRoutine: string;
  dietPattern: string;
  screenTime: string;
  socialConnections: string;
  workLifeBalance: string;
  
  // Phase 3: Thinking Patterns
  emotionalAwareness: number;
  stressResponse: string;
  decisionMaking: string;
  selfReflection: string;
  thoughtPatterns: string;
  mindfulnessInDailyLife: string;
  
  // Phase 4: Mindfulness Specific
  mindfulnessExperience: number;
  meditationBackgroundDetail: string;
  practiceGoals: string;
  preferredDuration: string;
  biggestChallenges: string;
  motivation: string;
}

interface Question {
  id: keyof QuestionnaireData;
  phase: number;
  question: string;
  type: 'slider' | 'mcq' | 'multi-select';
  choices?: string[];
  min?: number;
  max?: number;
  scale?: string;
}

const QUESTIONS: Question[] = [
  // Phase 1: Demographics & Background
  {
    id: 'experienceLevel',
    phase: 1,
    question: 'How would you rate your meditation/mindfulness experience level?',
    type: 'slider',
    min: 1,
    max: 10,
    scale: 'Beginner (1) to Expert (10)'
  },
  {
    id: 'mainGoals',
    phase: 1,
    question: 'What are your main goals? (Select all that apply)',
    type: 'multi-select',
    choices: ['Stress Reduction', 'Better Sleep', 'Emotional Balance', 'Spiritual Growth', 'Inner Peace', 'Liberation']
  },
  {
    id: 'ageRange',
    phase: 1,
    question: 'What is your age range?',
    type: 'mcq',
    choices: ['18-24 years', '25-34 years', '35-44 years', '45-54 years', '55-64 years', '65+ years']
  },
  {
    id: 'location',
    phase: 1,
    question: 'Where do you live?',
    type: 'mcq',
    choices: ['Urban area', 'Suburban area', 'Rural area', 'Quiet suburb', 'Busy city center']
  },
  {
    id: 'occupation',
    phase: 1,
    question: 'What is your occupation?',
    type: 'mcq',
    choices: ['Software Developer', 'Teacher', 'Sales Associate', 'Healthcare Worker', 'Student', 'Yoga Instructor / Spiritual Counselor', 'Business Professional', 'Creative Professional', 'Service Industry', 'Retired', 'Other']
  },
  {
    id: 'educationLevel',
    phase: 1,
    question: 'What is your highest education level?',
    type: 'mcq',
    choices: ['High school', "Bachelor's degree", "Master's degree", 'PhD/Doctorate', 'Other']
  },
  {
    id: 'meditationBackground',
    phase: 1,
    question: 'Describe your meditation background.',
    type: 'mcq',
    choices: ['Never tried meditation', 'Some guided meditation experience', 'Regular practice with apps', '1-3 years of practice', '3-10 years of practice', '10+ years of daily practice', 'Advanced Vipassana and Zen practice']
  },

  // Phase 2: Lifestyle Patterns
  {
    id: 'sleepPattern',
    phase: 2,
    question: 'How would you rate your sleep quality?',
    type: 'slider',
    min: 1,
    max: 10,
    scale: 'Very Poor (1) to Excellent (10)'
  },
  {
    id: 'physicalActivity',
    phase: 2,
    question: 'How would you describe your physical activity level?',
    type: 'mcq',
    choices: ['Sedentary (minimal exercise)', 'Light (occasional walks)', 'Moderate (regular exercise)', 'Active (frequent exercise)', 'Very Active (yoga, meditation)']
  },
  {
    id: 'stressTrigers',
    phase: 2,
    question: 'What are your main stress triggers? (Select all that apply)',
    type: 'multi-select',
    choices: ['Work Pressure', 'Traffic', 'Social Media', 'Finances', 'Relationships', 'Loud Noises']
  },
  {
    id: 'dailyRoutine',
    phase: 2,
    question: 'How would you describe your daily routine?',
    type: 'mcq',
    choices: ['Very structured and disciplined', 'Disciplined practice schedule', 'Structured but flexible', 'Somewhat organized', 'Varies by day', 'Chaotic and unpredictable']
  },
  {
    id: 'dietPattern',
    phase: 2,
    question: 'How would you describe your eating habits?',
    type: 'mcq',
    choices: ['Very healthy and disciplined', 'Mindful eating, mostly vegetarian', 'Balanced with occasional treats', 'Mostly healthy with some flexibility', 'Fast food and convenience meals', 'Irregular eating patterns']
  },
  {
    id: 'screenTime',
    phase: 2,
    question: 'How much time do you spend on screens daily?',
    type: 'mcq',
    choices: ['1-2 hours daily', '3-4 hours daily', '5-6 hours daily', '6-8 hours daily', '10+ hours daily', '12+ hours daily']
  },
  {
    id: 'socialConnections',
    phase: 2,
    question: 'How would you describe your social relationships?',
    type: 'mcq',
    choices: ['Deep, meaningful relationships', 'Strong support network', 'Good friends and family relationships', 'Few but close relationships', 'Superficial social media connections', 'Mostly isolated']
  },
  {
    id: 'workLifeBalance',
    phase: 2,
    question: 'How would you describe your work-life balance?',
    type: 'mcq',
    choices: ['Perfect integration of work and practice', 'Excellent balance', 'Good boundaries', 'Sometimes struggle but generally good', 'Struggling to find balance', 'Work dominates everything']
  },

  // Phase 3: Thinking Patterns
  {
    id: 'emotionalAwareness',
    phase: 3,
    question: 'How aware are you of your emotions throughout the day?',
    type: 'slider',
    min: 3,
    max: 9,
    scale: 'Low Awareness (3) to Very High Awareness (9)'
  },
  {
    id: 'stressResponse',
    phase: 3,
    question: 'How do you typically respond to stress?',
    type: 'mcq',
    choices: ['Observe and let go', 'Take deep breaths and calm down', 'Usually manage well', 'Talk to someone', 'React emotionally', 'Get overwhelmed easily']
  },
  {
    id: 'decisionMaking',
    phase: 3,
    question: 'How do you typically make decisions?',
    type: 'mcq',
    choices: ['Intuitive with mindful consideration', 'Careful analysis', 'Balanced approach', 'Ask for advice', 'Overthink everything', 'Impulsive decisions']
  },
  {
    id: 'selfReflection',
    phase: 3,
    question: 'How often do you engage in self-reflection?',
    type: 'mcq',
    choices: ['Daily meditation and contemplation', 'Regular journaling', 'Weekly reflection time', 'Occasional deep thinking', 'Rarely think deeply', 'Avoid self-reflection']
  },
  {
    id: 'thoughtPatterns',
    phase: 3,
    question: 'How would you describe your typical thought patterns?',
    type: 'mcq',
    choices: ['Peaceful and accepting', 'Optimistic and hopeful', 'Generally positive with some worry', 'Mixed emotions', 'Anxious and scattered', 'Negative and pessimistic']
  },
  {
    id: 'mindfulnessInDailyLife',
    phase: 3,
    question: 'How mindful are you during daily activities?',
    type: 'mcq',
    choices: ['Constant awareness and presence', 'Regular mindful moments', 'Occasionally remember to be present', 'Try to be mindful but forget', 'Always distracted and multitasking', 'Live on autopilot']
  },

  // Phase 4: Mindfulness Specific
  {
    id: 'mindfulnessExperience',
    phase: 4,
    question: 'How would you rate your mindfulness experience level?',
    type: 'slider',
    min: 1,
    max: 8,
    scale: 'No Experience (1) to Advanced (8)'
  },
  {
    id: 'meditationBackgroundDetail',
    phase: 4,
    question: 'Describe your meditation experience in detail.',
    type: 'mcq',
    choices: ['None', 'Guided meditations, apps', 'Some formal training', 'Regular retreat experience', 'Teacher training', 'Advanced Vipassana and Zen practice']
  },
  {
    id: 'practiceGoals',
    phase: 4,
    question: 'What are your meditation practice goals?',
    type: 'mcq',
    choices: ['Liberation from suffering', 'Spiritual awakening', 'Daily 15-20 minutes', 'Better sleep', 'Improve focus', 'Quick stress relief']
  },
  {
    id: 'preferredDuration',
    phase: 4,
    question: 'How long would you like to meditate (in minutes)?',
    type: 'mcq',
    choices: ['5 minutes', '10 minutes', '20 minutes', '30 minutes', '60 minutes']
  },
  {
    id: 'biggestChallenges',
    phase: 4,
    question: 'What do you think will be your biggest challenges?',
    type: 'mcq',
    choices: ['None, practice is integrated', 'Finding time and staying consistent', 'Remembering to practice', 'Getting distracted', "Can't sit still, mind too busy", 'Physical discomfort']
  },
  {
    id: 'motivation',
    phase: 4,
    question: 'What motivates you to start this mindfulness journey?',
    type: 'mcq',
    choices: ['Service to others and spiritual awakening', 'Personal growth', 'Stress reduction and emotional balance', 'Better relationships', 'Improve focus and productivity', 'Doctor recommended for anxiety']
  }
];

export default function QuestionnairePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuestionnaireData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1;
  const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;

  // Load saved answers from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('questionnaire_answers');
    if (saved) {
      try {
        setAnswers(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved answers:', error);
      }
    }
  }, []);

  // Save answers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('questionnaire_answers', JSON.stringify(answers));
  }, [answers]);

  const handleAnswer = (value: any) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/assessment/questionnaire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answers),
      });

      const result = await response.json();

      if (result.success) {
        // Clear saved answers
        localStorage.removeItem('questionnaire_answers');
        alert('Questionnaire submitted successfully!');
        router.push('/self-assessment');
      } else {
        setError(result.error || 'Failed to submit questionnaire');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderQuestion = () => {
    const currentAnswer = answers[currentQuestion.id];

    switch (currentQuestion.type) {
      case 'slider':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-2xl font-bold text-blue-600">
                {currentAnswer || currentQuestion.min}
              </span>
            </div>
            <input
              type="range"
              min={currentQuestion.min}
              max={currentQuestion.max}
              value={currentAnswer || currentQuestion.min}
              onChange={(e) => handleAnswer(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-center text-sm text-gray-600">
              {currentQuestion.scale}
            </div>
          </div>
        );

      case 'mcq':
        return (
          <div className="space-y-3">
            {currentQuestion.choices?.map((choice, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={choice}
                  checked={currentAnswer === choice}
                  onChange={(e) => handleAnswer(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">{choice}</span>
              </label>
            ))}
          </div>
        );

      case 'multi-select':
        return (
          <div className="space-y-3">
            {currentQuestion.choices?.map((choice, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  value={choice}
                  checked={Array.isArray(currentAnswer) && currentAnswer.includes(choice)}
                  onChange={(e) => {
                    const current = Array.isArray(currentAnswer) ? currentAnswer : [];
                    if (e.target.checked) {
                      handleAnswer([...current, choice]);
                    } else {
                      handleAnswer(current.filter(item => item !== choice));
                    }
                  }}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">{choice}</span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const isAnswered = () => {
    const answer = answers[currentQuestion.id];
    if (currentQuestion.type === 'multi-select') {
      return Array.isArray(answer) && answer.length > 0;
    }
    return answer !== undefined && answer !== null && answer !== '';
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Questionnaire</h1>
          <p className="text-gray-600">Please sign in to take the questionnaire</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PAHM Questionnaire</h1>
          <p className="text-gray-600">Complete assessment to personalize your meditation journey</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestionIndex + 1} of {QUESTIONS.length}</span>
            <span>Phase {currentQuestion.phase}</span>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {currentQuestion.question}
          </h2>
          
          {renderQuestion()}
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
              {loading ? 'Submitting...' : 'Submit Questionnaire'}
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