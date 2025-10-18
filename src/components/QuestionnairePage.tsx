'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from './Navigation'
import { useToast } from '@/hooks/useToast'

interface QuestionnaireAnswers {
  [key: string]: any
}

export default function QuestionnairePage() {
  const router = useRouter()
  const { showWarning, showError, showSuccess, ToastContainer } = useToast()
  const [currentPage, setCurrentPage] = useState(1)
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({
    // Page 1 (Questions 1-9)
    experienceLevel: null,
    goals: [],
    ageRange: null,
    location: null,
    occupation: null,
    educationLevel: null,
    meditationBackground: null,
    sleepPattern: null,
    physicalActivity: null,
    
    // Page 2 (Questions 10-18)
    stressTriggers: [],
    dailyRoutine: null,
    dietPattern: null,
    screenTime: null,
    socialConnections: null,
    workLifeBalance: null,
    emotionalAwareness: null,
    stressResponse: null,
    decisionMaking: null,
    
    // Page 3 (Questions 19-27)
    selfReflection: null,
    thoughtPatterns: null,
    mindfulnessDaily: null,
    mindfulnessExperience: null,
    meditationBackgroundDetail: null,
    practiceGoals: null,
    preferredDuration: null,
    biggestChallenges: null,
    motivation: null
  })

  const handleAnswerChange = (field: string, value: any, isMultiple = false) => {
    if (isMultiple) {
      setAnswers(prev => ({
        ...prev,
        [field]: (prev[field] as string[]).includes(value)
          ? (prev[field] as string[]).filter(v => v !== value)
          : [...(prev[field] as string[]), value]
      }))
    } else {
      setAnswers(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleSliderChange = (field: string, value: number) => {
    setAnswers(prev => ({ ...prev, [field]: value }))
  }

  const isPage1Complete = () => {
    return answers.experienceLevel !== null &&
           answers.goals.length > 0 &&
           answers.ageRange !== null &&
           answers.location !== null &&
           answers.occupation !== null &&
           answers.educationLevel !== null &&
           answers.meditationBackground !== null &&
           answers.sleepPattern !== null &&
           answers.physicalActivity !== null
  }

  const isPage2Complete = () => {
    return answers.stressTriggers.length > 0 &&
           answers.dailyRoutine !== null &&
           answers.dietPattern !== null &&
           answers.screenTime !== null &&
           answers.socialConnections !== null &&
           answers.workLifeBalance !== null &&
           answers.emotionalAwareness !== null &&
           answers.stressResponse !== null &&
           answers.decisionMaking !== null
  }

  const isPage3Complete = () => {
    return answers.selfReflection !== null &&
           answers.thoughtPatterns !== null &&
           answers.mindfulnessDaily !== null &&
           answers.mindfulnessExperience !== null &&
           answers.meditationBackgroundDetail !== null &&
           answers.practiceGoals !== null &&
           answers.preferredDuration !== null &&
           answers.biggestChallenges !== null &&
           answers.motivation !== null
  }

  const handleNext = () => {
    if (currentPage === 1 && !isPage1Complete()) {
      showWarning('Please answer all questions before proceeding!')
      return
    }
    if (currentPage === 2 && !isPage2Complete()) {
      showWarning('Please answer all questions before proceeding!')
      return
    }
    if (currentPage < 3) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleBack = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    } else {
      // Navigate to previous page when on first page
      const previousPage = sessionStorage.getItem('previousPage')
      if (previousPage) {
        router.push(previousPage)
      } else {
        router.push('/home-qa') // fallback
      }
    }
  }

  const handleFinish = () => {
    if (!isPage3Complete()) {
      showWarning('Please answer all required questions before finishing!')
      return
    }
    
    // Save questionnaire completion status to localStorage
    ;(async () => {
      try {
        const payload = {
          experienceLevel: answers.experienceLevel,
          mainGoals: answers.goals,
          ageRange: answers.ageRange,
          location: answers.location,
          occupation: answers.occupation,
          educationLevel: answers.educationLevel,
          meditationBackground: answers.meditationBackground,
          sleepPattern: answers.sleepPattern,
          physicalActivity: answers.physicalActivity,

          // page2
          stressTrigers: answers.stressTriggers,
          dailyRoutine: answers.dailyRoutine,
          dietPattern: answers.dietPattern,
          screenTime: answers.screenTime,
          socialConnections: answers.socialConnections,
          workLifeBalance: answers.workLifeBalance,

          // page3
          emotionalAwareness: answers.emotionalAwareness,
          stressResponse: answers.stressResponse,
          decisionMaking: answers.decisionMaking,
          selfReflection: answers.selfReflection,
          thoughtPatterns: answers.thoughtPatterns,
          mindfulnessInDailyLife: answers.mindfulnessDaily,

          mindfulnessExperience: answers.mindfulnessExperience,
          meditationBackgroundDetail: answers.meditationBackgroundDetail,
          practiceGoals: answers.practiceGoals,
          preferredDuration: answers.preferredDuration,
          biggestChallenges: answers.biggestChallenges,
          motivation: answers.motivation
        }

        const res = await fetch('/api/assessment/questionnaire', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (res.ok) {
          // Mark completed and save answers locally
          localStorage.setItem('questionnaireCompleted', 'true')
          localStorage.setItem('questionnaireAnswers', JSON.stringify(answers))
          showSuccess('Questionnaire completed successfully!')
          setTimeout(() => router.push('/home'), 1500)
        } else {
          const body = await res.json().catch(() => ({}))
          console.error('Questionnaire submit failed', res.status, body)
          if (body?.errors && Array.isArray(body.errors) && body.errors.length > 0) {
            showError('Validation failed:\n' + body.errors.join('\n'))
          } else if (body?.message) {
            showError(body.message)
          } else {
            showError('Failed to submit questionnaire (see console for details)')
          }
        }

      } catch (err) {
        console.error('Failed to submit questionnaire', err)
        showError('Failed to submit questionnaire')
      }
    })()
  }

  const getProgress = () => {
    if (currentPage === 1) return 33
    if (currentPage === 2) return 66
    return 100
  }

  const getQuestionRange = () => {
    if (currentPage === 1) return '1-9 of 27'
    if (currentPage === 2) return '10-18 of 27'
    return '19-27 of 27'
  }

  const getPhaseTitle = () => {
    if (currentPage === 1) return 'Phase 1: Experience Level'
    if (currentPage === 2) return 'Phase 2: Patterns'
    return 'Phase 3: Mindfulness Specific'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-purple-600">
      <ToastContainer />
      {/* Navigation */}
      <Navigation currentPage="questionnaire" />
      
      <div className="p-4 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700 font-semibold">Question {getQuestionRange()}</span>
              <span className="text-blue-600 font-bold">{getProgress()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${getProgress()}%` }}
              ></div>
            </div>
            <div className="text-sm text-blue-600 font-semibold">{getPhaseTitle()}</div>
          </div>

          {/* Page 1 Content */}
          {currentPage === 1 && (
            <Page1 answers={answers} onAnswerChange={handleAnswerChange} onSliderChange={handleSliderChange} />
          )}

          {/* Page 2 Content */}
          {currentPage === 2 && (
            <Page2 answers={answers} onAnswerChange={handleAnswerChange} onSliderChange={handleSliderChange} />
          )}

          {/* Page 3 Content */}
          {currentPage === 3 && (
            <Page3 answers={answers} onAnswerChange={handleAnswerChange} onSliderChange={handleSliderChange} />
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6 pb-8">
            <button
              onClick={handleBack}
              className="bg-purple-400 hover:bg-purple-500 text-white font-bold px-10 py-4 rounded-xl transition-colors"
            >
              Back
            </button>
            
            {currentPage < 3 ? (
              <button
                onClick={handleNext}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-10 py-4 rounded-xl transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="bg-green-500 hover:bg-green-600 text-white font-bold px-10 py-4 rounded-xl transition-colors"
              >
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Page 1 Component
interface Page1Props {
  answers: QuestionnaireAnswers
  onAnswerChange: (field: string, value: any, isMultiple?: boolean) => void
  onSliderChange: (field: string, value: number) => void
}

function Page1({ answers, onAnswerChange, onSliderChange }: Page1Props) {
  return (
    <div className="space-y-6">
      {/* Experience Level */}
      <QuestionCard title="Experience Level" subtitle="How would you rate your meditation/mindfulness experience level?">
        <div className="space-y-4">
          <input
            type="range"
            min="1"
            max="10"
            value={answers.experienceLevel || 1}
            onChange={(e) => onSliderChange('experienceLevel', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>Complete Beginner (1)</span>
            <span className="text-blue-600 font-bold">Current: {answers.experienceLevel || 1}/10</span>
            <span>Advanced (8)</span>
            <span>Expert (10)</span>
          </div>
        </div>
      </QuestionCard>

      {/* Goals */}
      <QuestionCard title="Goals" subtitle="What are your main goals? (Select all that apply)">
        <div className="grid grid-cols-3 gap-3">
          {['Stress Reduction', 'Better Sleep', 'Emotional Balance', 'Spiritual Growth', 'Inner Peace', 'Liberation'].map(goal => (
            <CheckboxOption
              key={goal}
              label={goal}
              checked={answers.goals.includes(goal)}
              onChange={() => onAnswerChange('goals', goal, true)}
            />
          ))}
        </div>
      </QuestionCard>

      {/* Age Range */}
      <QuestionCard title="Age Range" subtitle="What is your age range?">
        <div className="grid grid-cols-3 gap-3">
          {['18-24 years', '25-34 years', '35-44 years', '45-54 years', '55-64 years', '65+ years'].map(age => (
            <RadioOption
              key={age}
              label={age}
              selected={answers.ageRange === age}
              onChange={() => onAnswerChange('ageRange', age)}
            />
          ))}
        </div>
      </QuestionCard>

      {/* Location */}
      <QuestionCard title="Location" subtitle="Where do you live?">
        <div className="grid grid-cols-3 gap-3">
          {['Urban area', 'Suburban area', 'Rural area', 'Quiet suburb', 'Busy city center'].map(loc => (
            <RadioOption
              key={loc}
              label={loc}
              selected={answers.location === loc}
              onChange={() => onAnswerChange('location', loc)}
            />
          ))}
        </div>
      </QuestionCard>

      {/* Occupation */}
      <QuestionCard title="Occupation" subtitle="What is your occupation?">
        <div className="grid grid-cols-3 gap-3">
          {['Software Developer', 'Teacher', 'Sales Associate', 'Healthcare Worker', 'Student', 'Yoga Instructor / Spiritual Counselor', 'Business Professional', 'Creative Professional', 'Service Industry', 'Retired', 'Other'].map(occ => (
            <RadioOption
              key={occ}
              label={occ}
              selected={answers.occupation === occ}
              onChange={() => onAnswerChange('occupation', occ)}
            />
          ))}
        </div>
      </QuestionCard>

      {/* Education Level */}
      <QuestionCard title="Education Level" subtitle="What is your highest education level?">
        <div className="grid grid-cols-3 gap-3">
          {['High school', "Bachelor's degree", "Master's degree", 'PhD/Doctorate', 'Other'].map(edu => (
            <RadioOption
              key={edu}
              label={edu}
              selected={answers.educationLevel === edu}
              onChange={() => onAnswerChange('educationLevel', edu)}
            />
          ))}
        </div>
      </QuestionCard>

      {/* Meditation Background */}
      <QuestionCard title="Meditation Background" subtitle="Describe your meditation background">
        <div className="grid grid-cols-3 gap-3">
          {['Never tried meditation', 'Some guided meditation experience', 'Regular practice with apps', '1-3 years of practice', '3-10 years of practice', '10+ years of daily practice', 'Advanced Vipassana and Zen practice'].map(bg => (
            <RadioOption
              key={bg}
              label={bg}
              selected={answers.meditationBackground === bg}
              onChange={() => onAnswerChange('meditationBackground', bg)}
            />
          ))}
        </div>
      </QuestionCard>

      {/* Sleep Pattern */}
      <QuestionCard title="Sleep Pattern" subtitle="How would you rate your sleep quality?">
        <div className="space-y-4">
          <input
            type="range"
            min="1"
            max="10"
            value={answers.sleepPattern || 5}
            onChange={(e) => onSliderChange('sleepPattern', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>Very Poor (1)</span>
            <span>Poor (4)</span>
            <span className="text-blue-600 font-bold">Current: {answers.sleepPattern || 5}/10</span>
            <span>Good (7)</span>
            <span>Excellent (10)</span>
          </div>
        </div>
      </QuestionCard>

      {/* Physical Activity */}
      <QuestionCard title="Physical Activity" subtitle="How would you describe your physical activity level?">
        <div className="grid grid-cols-2 gap-3">
          {['Sedentary (minimal exercise)', 'Light (occasional walks)', 'Moderate (regular exercise)', 'Active (frequent exercise)', 'Very Active (yoga, meditation)'].map(activity => (
            <RadioOption
              key={activity}
              label={activity}
              selected={answers.physicalActivity === activity}
              onChange={() => onAnswerChange('physicalActivity', activity)}
            />
          ))}
        </div>
      </QuestionCard>
    </div>
  )
}

// Page 2 Component
function Page2({ answers, onAnswerChange, onSliderChange }: Page1Props) {
  return (
    <div className="space-y-6">
      {/* Stress Triggers */}
      <QuestionCard title="Stress Triggers" subtitle="What are your main stress triggers? (Select all that apply)">
        <div className="grid grid-cols-3 gap-3">
          {['Work Pressure', 'Traffic', 'Social Media', 'Finances', 'Relationships', 'Loud Noises'].map(trigger => (
            <CheckboxOption
              key={trigger}
              label={trigger}
              checked={answers.stressTriggers.includes(trigger)}
              onChange={() => onAnswerChange('stressTriggers', trigger, true)}
            />
          ))}
        </div>
      </QuestionCard>

      {/* Daily Routine */}
      <QuestionCard title="Daily Routine" subtitle="How would you describe your daily routine?">
        <div className="grid grid-cols-3 gap-3">
          {['Structured but flexible', 'Very structured and disciplined', 'Disciplined practice schedule', 'Somewhat organized', 'Chaotic and unpredictable', 'Varies by day'].map(routine => (
            <RadioOption
              key={routine}
              label={routine}
              selected={answers.dailyRoutine === routine}
              onChange={() => onAnswerChange('dailyRoutine', routine)}
            />
          ))}
        </div>
      </QuestionCard>

      {/* Diet Pattern */}
      <QuestionCard title="Diet Pattern" subtitle="How would you describe your eating habits?">
        <div className="grid grid-cols-3 gap-3">
          {['Balanced with occasional treats', 'Mindful eating, mostly vegetarian', 'Very healthy and disciplined', 'Mostly healthy with some flexibility', 'Fast food and convenience meals', 'Irregular eating patterns'].map(diet => (
            <RadioOption
              key={diet}
              label={diet}
              selected={answers.dietPattern === diet}
              onChange={() => onAnswerChange('dietPattern', diet)}
            />
          ))}
        </div>
      </QuestionCard>

      {/* Screen Time */}
      <QuestionCard title="Screen Time" subtitle="How much time do you spend on screens daily?">
        <div className="grid grid-cols-3 gap-3">
          {['1-2 hours daily', '3-4 hours daily', '5-6 hours daily', '6-8 hours daily', '10+ hours daily', '12+ hours daily'].map(time => (
            <RadioOption
              key={time}
              label={time}
              selected={answers.screenTime === time}
              onChange={() => onAnswerChange('screenTime', time)}
            />
          ))}
        </div>
      </QuestionCard>

      {/* Social Connections */}
      <QuestionCard title="Social Connections" subtitle="How would you describe your social relationships?">
        <div className="grid grid-cols-3 gap-3">
          {['Good friends and family relationships', 'Deep, meaningful relationships', 'Strong support network', 'Few but close relationships', 'Superficial social media connections', 'Mostly isolated'].map(social => (
            <RadioOption
              key={social}
              label={social}
              selected={answers.socialConnections === social}
              onChange={() => onAnswerChange('socialConnections', social)}
            />
          ))}
        </div>
      </QuestionCard>

      {/* Work Life Balance */}
      <QuestionCard title="Work Life Balance" subtitle="How would you describe your work-life balance?">
        <div className="grid grid-cols-3 gap-3">
          {['Sometimes struggle but generally good', 'Perfect integration of work and practice', 'Excellent balance', 'Good boundaries', 'Work dominates everything', 'Struggling to find balance'].map(balance => (
            <RadioOption
              key={balance}
              label={balance}
              selected={answers.workLifeBalance === balance}
              onChange={() => onAnswerChange('workLifeBalance', balance)}
            />
          ))}
        </div>
      </QuestionCard>

      {/* Emotional Awareness */}
      <QuestionCard title="Emotional Awareness" subtitle="How aware are you of your emotions throughout the day?">
        <div className="space-y-4">
          <input
            type="range"
            min="3"
            max="9"
            value={answers.emotionalAwareness ?? 5}
            onChange={(e) => onSliderChange('emotionalAwareness', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>Low Awareness (1)</span>
            <span>Good Awareness (5)</span>
            <span className="text-blue-600 font-bold">Current: {answers.emotionalAwareness || 5}/10</span>
            <span>Very High Awareness (9)</span>
          </div>
        </div>
      </QuestionCard>

      {/* Stress Response */}
      <QuestionCard title="Stress Response" subtitle="How do you typically respond to stress?">
        <div className="grid grid-cols-3 gap-3">
          {['Usually manage well', 'Observe and let go', 'Take deep breaths and calm down', 'Talk to someone', 'Get overwhelmed easily', 'React emotionally'].map(response => (
            <RadioOption
              key={response}
              label={response}
              selected={answers.stressResponse === response}
              onChange={() => onAnswerChange('stressResponse', response)}
            />
          ))}
        </div>
      </QuestionCard>

      {/* Decision Making */}
      <QuestionCard title="Decision Making" subtitle="How do you typically make decisions?">
        <div className="grid grid-cols-3 gap-3">
          {['Balanced approach', 'Intuitive with mindful consideration', 'Careful analysis', 'Ask for advice', 'Impulsive decisions', 'Overthink everything'].map(decision => (
            <RadioOption
              key={decision}
              label={decision}
              selected={answers.decisionMaking === decision}
              onChange={() => onAnswerChange('decisionMaking', decision)}
            />
          ))}
        </div>
      </QuestionCard>
    </div>
  )
}

// Page 3 Component
function Page3({ answers, onAnswerChange, onSliderChange }: Page1Props) {
  return (
    <div className="space-y-6">
      {/* Self Reflection */}
      <QuestionCard title="Self Reflection" subtitle="How often do you engage in self-reflection?">
        <div className="grid grid-cols-3 gap-3">
          {['Regular journaling', 'Daily meditation and contemplation', 'Weekly reflection time', 'Occasional deep thinking', 'Rarely think deeply', 'Avoid self-reflection'].map(reflection => (
            <RadioOption
              key={reflection}
              label={reflection}
              selected={answers.selfReflection === reflection}
              onChange={() => onAnswerChange('selfReflection', reflection)}
            />
          ))}
        </div>
      </QuestionCard>

      {/* Thought Patterns */}
      <QuestionCard title="Thought Patterns" subtitle="How would you describe your typical thought patterns?">
        <div className="grid grid-cols-3 gap-3">
          {['Generally positive with some worry', 'Peaceful and accepting', 'Optimistic and hopeful', 'Mixed emotions', 'Anxious and scattered', 'Negative and pessimistic'].map(pattern => (
            <RadioOption
              key={pattern}
              label={pattern}
              selected={answers.thoughtPatterns === pattern}
              onChange={() => onAnswerChange('thoughtPatterns', pattern)}
            />
          ))}
        </div>
      </QuestionCard>

      {/* Mindfulness in Daily Life */}
      <QuestionCard title="Mindfulness in Daily Life" subtitle="How mindful are you during daily activities?">
        <div className="grid grid-cols-3 gap-3">
          {['Occasionally remember to be present', 'Constant awareness and presence', 'Regular mindful moments', 'Try to be mindful but forget', 'Always distracted and multitasking', 'Live on autopilot'].map(mindful => (
            <RadioOption
              key={mindful}
              label={mindful}
              selected={answers.mindfulnessDaily === mindful}
              onChange={() => onAnswerChange('mindfulnessDaily', mindful)}
            />
          ))}
        </div>
      </QuestionCard>

      {/* Mindfulness Experience */}
      <QuestionCard title="Mindfulness Experience" subtitle="How would you rate your mindfulness experience level?">
        <div className="space-y-4">
          <input
            type="range"
            min="1"
            max="8"
            value={answers.mindfulnessExperience ?? 1}
            onChange={(e) => onSliderChange('mindfulnessExperience', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>No Experience (1)</span>
            <span>Some Training (5)</span>
            <span className="text-blue-600 font-bold">Current: {answers.mindfulnessExperience || 1}/10</span>
            <span>Advanced (8)</span>
          </div>
        </div>
      </QuestionCard>

      {/* Meditation Background Detail */}
      <QuestionCard title="Meditation Background Detail" subtitle="Describe your meditation experience in detail">
        <div className="grid grid-cols-3 gap-3">
          {['None', 'Guided meditations, apps', 'Some formal training', 'Regular retreat experience', 'Teacher training', '1-3 years of practice', '3-10 years of practice', '10+ years of daily practice', 'Advanced Vipassana and Zen practice'].map(bg => (
            <RadioOption
              key={bg}
              label={bg}
              selected={answers.meditationBackgroundDetail === bg}
              onChange={() => onAnswerChange('meditationBackgroundDetail', bg)}
            />
          ))}
        </div>
      </QuestionCard>

      {/* Practice Goals */}
      <QuestionCard title="Practice Goals" subtitle="What are your meditation practice goals?">
        <div className="grid grid-cols-3 gap-3">
          {['Daily 15-20 minutes', 'Liberation from suffering', 'Quick stress relief', 'Improve focus', 'Better sleep', 'Spiritual awakening'].map(goal => (
            <RadioOption
              key={goal}
              label={goal}
              selected={answers.practiceGoals === goal}
              onChange={() => onAnswerChange('practiceGoals', goal)}
            />
          ))}
        </div>
      </QuestionCard>

      {/* Preferred Duration */}
      <QuestionCard title="Preferred Duration" subtitle="How long would you like to meditate (in minutes)?">
        <div className="grid grid-cols-3 gap-3">
          {['5 minutes', '10 minutes', '20 minutes', '30 minutes', '60 minutes'].map(duration => (
            <RadioOption
              key={duration}
              label={duration}
              selected={answers.preferredDuration === duration}
              onChange={() => onAnswerChange('preferredDuration', duration)}
            />
          ))}
        </div>
      </QuestionCard>

      {/* Biggest Challenges */}
      <QuestionCard title="Biggest Challenges" subtitle="What do you think will be your biggest challenges?">
        <div className="grid grid-cols-3 gap-3">
          {['Finding time and staying consistent', 'None, practice is integrated', "Can't sit still, mind too busy", 'Getting distracted', 'Physical discomfort', 'Remembering to practice'].map(challenge => (
            <RadioOption
              key={challenge}
              label={challenge}
              selected={answers.biggestChallenges === challenge}
              onChange={() => onAnswerChange('biggestChallenges', challenge)}
            />
          ))}
        </div>
      </QuestionCard>

      {/* Motivation */}
      <QuestionCard title="Motivation" subtitle="What motivates you to start this mindfulness journey?">
        <div className="grid grid-cols-3 gap-3">
          {['Service to others and spiritual awakening', 'Personal growth', 'Stress reduction and emotional balance', 'Better relationships', 'Improve focus and productivity', 'Doctor recommended for anxiety'].map(motivationOption => (
            <RadioOption
              key={motivationOption}
              label={motivationOption}
              selected={answers.motivation === motivationOption}
              onChange={() => onAnswerChange('motivation', motivationOption)}
            />
          ))}
        </div>
      </QuestionCard>
    </div>
  )
}

// Reusable Components
interface QuestionCardProps {
  title: string
  subtitle: string
  children: React.ReactNode
  optional?: boolean
}

function QuestionCard({ title, subtitle, children, optional = false }: QuestionCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-gray-800 font-bold text-lg mb-1">
        {title} {optional && <span className="text-gray-400 text-sm font-normal">(Optional)</span>}
      </h3>
      <p className="text-gray-600 text-sm mb-4">{subtitle}</p>
      {children}
    </div>
  )
}

interface RadioOptionProps {
  label: string
  selected: boolean
  onChange: () => void
}

function RadioOption({ label, selected, onChange }: RadioOptionProps) {
  return (
    <button
      onClick={onChange}
      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
        selected
          ? 'bg-blue-500 border-blue-600 text-white shadow-md'
          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  )
}

interface CheckboxOptionProps {
  label: string
  checked: boolean
  onChange: () => void
}

function CheckboxOption({ label, checked, onChange }: CheckboxOptionProps) {
  return (
    <button
      onClick={onChange}
      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
        checked
          ? 'bg-blue-500 border-blue-600 text-white shadow-md'
          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  )
}