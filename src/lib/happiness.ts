import { HappinessComponents, HappinessScore } from '@/types'

/**
 * PAHM Happiness Calculation Algorithm
 * Based on 8 core components of wellbeing and life satisfaction
 */

// Weight distribution for happiness components (must sum to 1.0)
const COMPONENT_WEIGHTS = {
  physicalHealth: 0.15,      // 15% - Body health and vitality
  mentalClarity: 0.15,       // 15% - Cognitive function and focus
  emotionalBalance: 0.15,    // 15% - Emotional regulation and stability
  socialConnections: 0.12,   // 12% - Relationships and social support
  personalGrowth: 0.13,      // 13% - Learning and self-development
  lifeBalance: 0.12,         // 12% - Work-life harmony
  mindfulness: 0.10,         // 10% - Present moment awareness
  overallSatisfaction: 0.08  // 8% - General life contentment
} as const

// Score ranges
const MIN_SCORE = 0
const MAX_SCORE = 100
const EXCELLENT_THRESHOLD = 85
const GOOD_THRESHOLD = 70
const FAIR_THRESHOLD = 50

/**
 * Calculate overall happiness score from component ratings
 */
export function calculateHappinessScore(components: HappinessComponents): HappinessScore {
  // Validate component values (should be 0-100)
  const validatedComponents = validateComponents(components)
  
  // Calculate weighted total
  let totalScore = 0
  
  totalScore += validatedComponents.physicalHealth * COMPONENT_WEIGHTS.physicalHealth
  totalScore += validatedComponents.mentalClarity * COMPONENT_WEIGHTS.mentalClarity
  totalScore += validatedComponents.emotionalBalance * COMPONENT_WEIGHTS.emotionalBalance
  totalScore += validatedComponents.socialConnections * COMPONENT_WEIGHTS.socialConnections
  totalScore += validatedComponents.personalGrowth * COMPONENT_WEIGHTS.personalGrowth
  totalScore += validatedComponents.lifeBalance * COMPONENT_WEIGHTS.lifeBalance
  totalScore += validatedComponents.mindfulness * COMPONENT_WEIGHTS.mindfulness
  totalScore += validatedComponents.overallSatisfaction * COMPONENT_WEIGHTS.overallSatisfaction
  
  // Round to 2 decimal places
  totalScore = Math.round(totalScore * 100) / 100
  
  return {
    totalScore,
    components: validatedComponents,
    calculatedAt: new Date()
  }
}

/**
 * Validate and clamp component values to valid range
 */
function validateComponents(components: HappinessComponents): HappinessComponents {
  return {
    physicalHealth: clampScore(components.physicalHealth),
    mentalClarity: clampScore(components.mentalClarity),
    emotionalBalance: clampScore(components.emotionalBalance),
    socialConnections: clampScore(components.socialConnections),
    personalGrowth: clampScore(components.personalGrowth),
    lifeBalance: clampScore(components.lifeBalance),
    mindfulness: clampScore(components.mindfulness),
    overallSatisfaction: clampScore(components.overallSatisfaction)
  }
}

/**
 * Clamp score to valid range
 */
function clampScore(score: number): number {
  return Math.max(MIN_SCORE, Math.min(MAX_SCORE, score || 0))
}

/**
 * Get happiness level description
 */
export function getHappinessLevel(score: number): string {
  if (score >= EXCELLENT_THRESHOLD) return 'Excellent'
  if (score >= GOOD_THRESHOLD) return 'Good'
  if (score >= FAIR_THRESHOLD) return 'Fair'
  return 'Needs Attention'
}

/**
 * Get happiness level color for UI
 */
export function getHappinessColor(score: number): string {
  if (score >= EXCELLENT_THRESHOLD) return 'text-green-600'
  if (score >= GOOD_THRESHOLD) return 'text-blue-600'
  if (score >= FAIR_THRESHOLD) return 'text-yellow-600'
  return 'text-red-600'
}

/**
 * Get component insights and recommendations
 */
export function getComponentInsights(components: HappinessComponents): Array<{
  component: string
  score: number
  status: string
  recommendation: string
}> {
  const insights = [
    {
      component: 'Physical Health',
      score: components.physicalHealth,
      status: getComponentStatus(components.physicalHealth),
      recommendation: getPhysicalHealthRecommendation(components.physicalHealth)
    },
    {
      component: 'Mental Clarity',
      score: components.mentalClarity,
      status: getComponentStatus(components.mentalClarity),
      recommendation: getMentalClarityRecommendation(components.mentalClarity)
    },
    {
      component: 'Emotional Balance',
      score: components.emotionalBalance,
      status: getComponentStatus(components.emotionalBalance),
      recommendation: getEmotionalBalanceRecommendation(components.emotionalBalance)
    },
    {
      component: 'Social Connections',
      score: components.socialConnections,
      status: getComponentStatus(components.socialConnections),
      recommendation: getSocialConnectionsRecommendation(components.socialConnections)
    },
    {
      component: 'Personal Growth',
      score: components.personalGrowth,
      status: getComponentStatus(components.personalGrowth),
      recommendation: getPersonalGrowthRecommendation(components.personalGrowth)
    },
    {
      component: 'Life Balance',
      score: components.lifeBalance,
      status: getComponentStatus(components.lifeBalance),
      recommendation: getLifeBalanceRecommendation(components.lifeBalance)
    },
    {
      component: 'Mindfulness',
      score: components.mindfulness,
      status: getComponentStatus(components.mindfulness),
      recommendation: getMindfulnessRecommendation(components.mindfulness)
    },
    {
      component: 'Overall Satisfaction',
      score: components.overallSatisfaction,
      status: getComponentStatus(components.overallSatisfaction),
      recommendation: getOverallSatisfactionRecommendation(components.overallSatisfaction)
    }
  ]
  
  // Sort by lowest scores first (areas needing most attention)
  return insights.sort((a, b) => a.score - b.score)
}

function getComponentStatus(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 65) return 'Good'
  if (score >= 45) return 'Fair'
  return 'Needs Focus'
}

// Component-specific recommendations
function getPhysicalHealthRecommendation(score: number): string {
  if (score >= 80) return 'Keep up your excellent physical health practices!'
  if (score >= 65) return 'Consider adding more physical activity or improving sleep quality.'
  if (score >= 45) return 'Focus on regular exercise, balanced nutrition, and consistent sleep.'
  return 'Prioritize basic health: daily movement, nutritious meals, and 7-8 hours sleep.'
}

function getMentalClarityRecommendation(score: number): string {
  if (score >= 80) return 'Your mental clarity is excellent. Maintain your current practices.'
  if (score >= 65) return 'Try meditation or brain training exercises to enhance focus.'
  if (score >= 45) return 'Practice daily mindfulness and limit mental distractions.'
  return 'Start with 5-10 minutes of daily meditation and reduce information overload.'
}

function getEmotionalBalanceRecommendation(score: number): string {
  if (score >= 80) return 'You have excellent emotional regulation skills.'
  if (score >= 65) return 'Practice emotional awareness and stress management techniques.'
  if (score >= 45) return 'Develop emotional coping strategies and seek support when needed.'
  return 'Consider emotional support resources and practice daily emotional check-ins.'
}

function getSocialConnectionsRecommendation(score: number): string {
  if (score >= 80) return 'Your social connections are strong and supportive.'
  if (score >= 65) return 'Nurture existing relationships and consider expanding your social circle.'
  if (score >= 45) return 'Actively invest time in meaningful relationships.'
  return 'Start with one meaningful social connection and gradually build your network.'
}

function getPersonalGrowthRecommendation(score: number): string {
  if (score >= 80) return 'You\'re actively growing and developing yourself.'
  if (score >= 65) return 'Set new learning goals or take on challenging projects.'
  if (score >= 45) return 'Engage in activities that promote learning and self-improvement.'
  return 'Start with small learning goals like reading or taking an online course.'
}

function getLifeBalanceRecommendation(score: number): string {
  if (score >= 80) return 'You have excellent work-life balance.'
  if (score >= 65) return 'Fine-tune your schedule to optimize balance between different life areas.'
  if (score >= 45) return 'Establish clear boundaries between work and personal time.'
  return 'Prioritize balance by setting work boundaries and scheduling personal time.'
}

function getMindfulnessRecommendation(score: number): string {
  if (score >= 80) return 'Your mindfulness practice is excellent.'
  if (score >= 65) return 'Deepen your mindfulness practice with longer sessions or retreats.'
  if (score >= 45) return 'Increase daily mindfulness practice and present-moment awareness.'
  return 'Start with 5 minutes of daily mindfulness or breathing exercises.'
}

function getOverallSatisfactionRecommendation(score: number): string {
  if (score >= 80) return 'You feel very satisfied with your life direction.'
  if (score >= 65) return 'Reflect on your values and ensure your actions align with them.'
  if (score >= 45) return 'Explore what brings you meaning and purpose in life.'
  return 'Consider working with a counselor or coach to explore life satisfaction.'
}