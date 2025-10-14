/**
 * NORMALIZATION FUNCTIONS TEST SUITE
 * Verifies that UI strings are correctly converted to calculation format
 * 
 * Run with: npm test tests/normalization.test.ts
 */

import {
  normalizePhysicalActivity,
  normalizeWorkLifeBalance,
  normalizeStressResponse,
  normalizeDecisionMaking,
  normalizeThoughtPatterns,
  normalizeMindfulnessInDailyLife,
  normalizeSocialConnections,
  normalizeQuestionnaire,
  isValidNormalizedValue,
  getValidValues
} from '../src/lib/business-logic/questionnaire-normalization'

describe('Physical Activity Normalization', () => {
  test('should normalize "Sedentary (minimal exercise)" to "sedentary"', () => {
    expect(normalizePhysicalActivity('Sedentary (minimal exercise)')).toBe('sedentary')
  })

  test('should normalize "Light (occasional walks)" to "light"', () => {
    expect(normalizePhysicalActivity('Light (occasional walks)')).toBe('light')
  })

  test('should normalize "Moderate (regular exercise)" to "moderate"', () => {
    expect(normalizePhysicalActivity('Moderate (regular exercise)')).toBe('moderate')
  })

  test('should normalize "Active (frequent exercise)" to "active"', () => {
    expect(normalizePhysicalActivity('Active (frequent exercise)')).toBe('active')
  })

  test('should normalize "Very Active (yoga, meditation)" to "very_active"', () => {
    expect(normalizePhysicalActivity('Very Active (yoga, meditation)')).toBe('very_active')
  })

  test('should handle case insensitivity', () => {
    expect(normalizePhysicalActivity('SEDENTARY (MINIMAL EXERCISE)')).toBe('sedentary')
  })

  test('should return default "sedentary" for null/undefined', () => {
    expect(normalizePhysicalActivity(null)).toBe('sedentary')
    expect(normalizePhysicalActivity(undefined)).toBe('sedentary')
  })
})

describe('Work-Life Balance Normalization', () => {
  test('should normalize "Perfect integration of work and practice" to "excellent"', () => {
    expect(normalizeWorkLifeBalance('Perfect integration of work and practice')).toBe('excellent')
  })

  test('should normalize "Excellent balance" to "excellent"', () => {
    expect(normalizeWorkLifeBalance('Excellent balance')).toBe('excellent')
  })

  test('should normalize "Good boundaries" to "good"', () => {
    expect(normalizeWorkLifeBalance('Good boundaries')).toBe('good')
  })

  test('should normalize "Sometimes struggle but generally good" to "good"', () => {
    expect(normalizeWorkLifeBalance('Sometimes struggle but generally good')).toBe('good')
  })

  test('should normalize "Work dominates everything" to "struggle"', () => {
    expect(normalizeWorkLifeBalance('Work dominates everything')).toBe('struggle')
  })

  test('should normalize "Struggling to find balance" to "struggle"', () => {
    expect(normalizeWorkLifeBalance('Struggling to find balance')).toBe('struggle')
  })

  test('should return default "good" for unknown values', () => {
    expect(normalizeWorkLifeBalance('Unknown value')).toBe('good')
  })
})

describe('Stress Response Normalization', () => {
  test('should normalize "Observe and let go" to "observe_let_go"', () => {
    expect(normalizeStressResponse('Observe and let go')).toBe('observe_let_go')
  })

  test('should normalize "Usually manage well" to "manage_well"', () => {
    expect(normalizeStressResponse('Usually manage well')).toBe('manage_well')
  })

  test('should normalize "Take deep breaths and calm down" to "usually_manage"', () => {
    expect(normalizeStressResponse('Take deep breaths and calm down')).toBe('usually_manage')
  })

  test('should normalize "Talk to someone" to "usually_manage"', () => {
    expect(normalizeStressResponse('Talk to someone')).toBe('usually_manage')
  })

  test('should normalize "Get overwhelmed easily" to "overwhelmed"', () => {
    expect(normalizeStressResponse('Get overwhelmed easily')).toBe('overwhelmed')
  })

  test('should normalize "React emotionally" to "overwhelmed"', () => {
    expect(normalizeStressResponse('React emotionally')).toBe('overwhelmed')
  })
})

describe('Decision Making Normalization', () => {
  test('should normalize "Intuitive with mindful consideration" to "intuitive_mindful"', () => {
    expect(normalizeDecisionMaking('Intuitive with mindful consideration')).toBe('intuitive_mindful')
  })

  test('should normalize "Balanced approach" to "balanced"', () => {
    expect(normalizeDecisionMaking('Balanced approach')).toBe('balanced')
  })

  test('should normalize "Careful analysis" to "mindful"', () => {
    expect(normalizeDecisionMaking('Careful analysis')).toBe('mindful')
  })

  test('should normalize "Overthink everything" to "overthink"', () => {
    expect(normalizeDecisionMaking('Overthink everything')).toBe('overthink')
  })
})

describe('Thought Patterns Normalization', () => {
  test('should normalize "Peaceful and accepting" to "peaceful"', () => {
    expect(normalizeThoughtPatterns('Peaceful and accepting')).toBe('peaceful')
  })

  test('should normalize "Anxious and scattered" to "anxious"', () => {
    expect(normalizeThoughtPatterns('Anxious and scattered')).toBe('anxious')
  })

  test('should normalize "Negative and pessimistic" to "anxious"', () => {
    expect(normalizeThoughtPatterns('Negative and pessimistic')).toBe('anxious')
  })

  test('should normalize "Generally positive with some worry" to "neutral"', () => {
    expect(normalizeThoughtPatterns('Generally positive with some worry')).toBe('neutral')
  })

  test('should normalize "Mixed emotions" to "neutral"', () => {
    expect(normalizeThoughtPatterns('Mixed emotions')).toBe('neutral')
  })

  test('should normalize "Optimistic and hopeful" to "neutral"', () => {
    expect(normalizeThoughtPatterns('Optimistic and hopeful')).toBe('neutral')
  })
})

describe('Daily Mindfulness Normalization', () => {
  test('should normalize "Constant awareness and presence" to "constant"', () => {
    expect(normalizeMindfulnessInDailyLife('Constant awareness and presence')).toBe('constant')
  })

  test('should normalize "Regular mindful moments" to "try_to_be"', () => {
    expect(normalizeMindfulnessInDailyLife('Regular mindful moments')).toBe('try_to_be')
  })

  test('should normalize "Try to be mindful but forget" to "try_to_be"', () => {
    expect(normalizeMindfulnessInDailyLife('Try to be mindful but forget')).toBe('try_to_be')
  })

  test('should normalize "Occasionally remember to be present" to "try_to_be"', () => {
    expect(normalizeMindfulnessInDailyLife('Occasionally remember to be present')).toBe('try_to_be')
  })

  test('should normalize "Always distracted and multitasking" to "autopilot"', () => {
    expect(normalizeMindfulnessInDailyLife('Always distracted and multitasking')).toBe('autopilot')
  })

  test('should normalize "Live on autopilot" to "autopilot"', () => {
    expect(normalizeMindfulnessInDailyLife('Live on autopilot')).toBe('autopilot')
  })
})

describe('Social Connections Normalization', () => {
  test('should normalize "Deep, meaningful relationships" to "deep_meaningful"', () => {
    expect(normalizeSocialConnections('Deep, meaningful relationships')).toBe('deep_meaningful')
  })

  test('should normalize "Strong support network" to "deep_meaningful"', () => {
    expect(normalizeSocialConnections('Strong support network')).toBe('deep_meaningful')
  })

  test('should normalize "Good friends and family relationships" to "good"', () => {
    expect(normalizeSocialConnections('Good friends and family relationships')).toBe('good')
  })

  test('should normalize "Few but close relationships" to "few_but_close"', () => {
    expect(normalizeSocialConnections('Few but close relationships')).toBe('few_but_close')
  })

  test('should normalize "Superficial social media connections" to "average"', () => {
    expect(normalizeSocialConnections('Superficial social media connections')).toBe('average')
  })

  test('should normalize "Mostly isolated" to "mostly_isolated"', () => {
    expect(normalizeSocialConnections('Mostly isolated')).toBe('mostly_isolated')
  })
})

describe('Master Normalization Function', () => {
  test('should normalize complete questionnaire object', () => {
    const rawQuestionnaire = {
      physicalActivity: 'Sedentary (minimal exercise)',
      workLifeBalance: 'Perfect integration of work and practice',
      stressResponse: 'Observe and let go',
      decisionMaking: 'Intuitive with mindful consideration',
      thoughtPatterns: 'Peaceful and accepting',
      mindfulnessInDailyLife: 'Constant awareness and presence',
      socialConnections: 'Deep, meaningful relationships',
      emotionalAwareness: 7,
      sleepPattern: 8
    }

    const normalized = normalizeQuestionnaire(rawQuestionnaire)

    expect(normalized.physicalActivity).toBe('sedentary')
    expect(normalized.workLifeBalance).toBe('excellent')
    expect(normalized.stressResponse).toBe('observe_let_go')
    expect(normalized.decisionMaking).toBe('intuitive_mindful')
    expect(normalized.thoughtPatterns).toBe('peaceful')
    expect(normalized.mindfulnessInDailyLife).toBe('constant')
    expect(normalized.socialConnections).toBe('deep_meaningful')
    expect(normalized.emotionalAwareness).toBe(7) // Unchanged
    expect(normalized.sleepPattern).toBe(8) // Unchanged
  })

  test('should handle partial questionnaire data', () => {
    const partialQuestionnaire = {
      physicalActivity: 'Moderate (regular exercise)',
      socialConnections: 'Few but close relationships'
    }

    const normalized = normalizeQuestionnaire(partialQuestionnaire)

    expect(normalized.physicalActivity).toBe('moderate')
    expect(normalized.socialConnections).toBe('few_but_close')
  })

  test('should handle null values gracefully', () => {
    const questionnaireWithNulls = {
      physicalActivity: null,
      workLifeBalance: null,
      stressResponse: 'Usually manage well'
    }

    const normalized = normalizeQuestionnaire(questionnaireWithNulls)

    expect(normalized.physicalActivity).toBe(null)
    expect(normalized.workLifeBalance).toBe(null)
    expect(normalized.stressResponse).toBe('manage_well')
  })
})

describe('Validation Helpers', () => {
  test('should validate correct normalized values', () => {
    expect(isValidNormalizedValue('physicalActivity', 'sedentary')).toBe(true)
    expect(isValidNormalizedValue('physicalActivity', 'very_active')).toBe(true)
    expect(isValidNormalizedValue('workLifeBalance', 'excellent')).toBe(true)
    expect(isValidNormalizedValue('socialConnections', 'deep_meaningful')).toBe(true)
  })

  test('should reject invalid normalized values', () => {
    expect(isValidNormalizedValue('physicalActivity', 'invalid')).toBe(false)
    expect(isValidNormalizedValue('workLifeBalance', 'bad')).toBe(false)
    expect(isValidNormalizedValue('socialConnections', 'unknown')).toBe(false)
  })

  test('should return valid values for each field', () => {
    const physicalActivityValues = getValidValues('physicalActivity')
    expect(physicalActivityValues).toContain('sedentary')
    expect(physicalActivityValues).toContain('light')
    expect(physicalActivityValues).toContain('moderate')
    expect(physicalActivityValues).toContain('active')
    expect(physicalActivityValues).toContain('very_active')
    expect(physicalActivityValues).toHaveLength(5)

    const workLifeValues = getValidValues('workLifeBalance')
    expect(workLifeValues).toContain('excellent')
    expect(workLifeValues).toContain('good')
    expect(workLifeValues).toContain('struggle')
    expect(workLifeValues).toHaveLength(3)
  })
})

describe('Edge Cases', () => {
  test('should handle empty strings', () => {
    expect(normalizePhysicalActivity('')).toBe('sedentary')
    expect(normalizeWorkLifeBalance('')).toBe('good')
  })

  test('should handle whitespace', () => {
    expect(normalizePhysicalActivity('  Sedentary (minimal exercise)  ')).toBe('sedentary')
    expect(normalizeStressResponse('  Observe and let go  ')).toBe('observe_let_go')
  })

  test('should handle mixed case', () => {
    expect(normalizePhysicalActivity('MODERATE (REGULAR EXERCISE)')).toBe('moderate')
    expect(normalizeWorkLifeBalance('EXCELLENT BALANCE')).toBe('excellent')
  })

  test('should handle unknown values with safe defaults', () => {
    expect(normalizePhysicalActivity('Unknown activity level')).toBe('sedentary')
    expect(normalizeWorkLifeBalance('Unknown balance')).toBe('good')
    expect(normalizeStressResponse('Unknown response')).toBe('usually_manage')
    expect(normalizeDecisionMaking('Unknown approach')).toBe('balanced')
    expect(normalizeThoughtPatterns('Unknown pattern')).toBe('neutral')
    expect(normalizeMindfulnessInDailyLife('Unknown mindfulness')).toBe('try_to_be')
    expect(normalizeSocialConnections('Unknown connections')).toBe('average')
  })
})
